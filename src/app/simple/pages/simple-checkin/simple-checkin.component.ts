import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { GymDataService } from '../../../services/gym-data.service';
import { Member, Game, Subscription, Attendance } from '../../../models/gym.models';

@Component({
  selector: 'app-simple-checkin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './simple-checkin.component.html',
  styleUrls: ['./simple-checkin.component.scss']
})
export class SimpleCheckinComponent implements OnInit {
  // Search query
  searchQuery: string = '';
  selectedMember: Member | null = null;
  selectedGameIds: string[] = [];
  
  // State
  step: number = 1; // 1: Search & Pick, 2: Status & Action, 3: Done Success
  successMessage: string = '';
  isInside: boolean = false;
  activeSubscription: Subscription | null = null;
  expiredSubscription: Subscription | null = null;
  statusType: 'valid' | 'inside' | 'expired' | 'no-sub' = 'no-sub';
  statusText: string = '';
  activeGames: Game[] = [];

  constructor(
    public gymService: GymDataService,
    private router: Router
  ) {}

  ngOnInit(): void {}

  get filteredMembers(): Member[] {
    const q = this.searchQuery.trim().toLowerCase();
    const allMembers: Member[] = this.gymService.members;
    if (!q) {
      return allMembers.filter((m: Member) => !m.isArchived).slice(0, 8);
    }
    return allMembers
      .filter((m: Member) => !m.isArchived && (m.name.toLowerCase().includes(q) || m.phone.includes(q)))
      .slice(0, 10);
  }

  selectMember(m: Member): void {
    this.selectedMember = m;
    this.evaluateMemberStatus(m.id);
    this.step = 2;
  }

  evaluateMemberStatus(memberId: string): void {
    this.isInside = this.gymService.isMemberCurrentlyInGym(memberId);
    if (this.isInside) {
      this.statusType = 'inside';
      this.statusText = 'البطل متواجد حالياً داخل الصالة الرياضية!';
      return;
    }

    const subs = this.gymService.getMemberSubscriptions(memberId);
    if (subs.length === 0) {
      this.statusType = 'no-sub';
      this.statusText = 'لا يوجد أي اشتراك مسجل لهذا العضو، يجب تفعيل اشتراك أولاً.';
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const validSubs = subs.filter((s: Subscription) => s.endDate >= todayStr && s.startDate <= todayStr);
    
    if (validSubs.length > 0) {
      this.activeSubscription = validSubs[0];
      this.statusType = 'valid';
      
      const allGames: Game[] = this.gymService.games;
      this.activeGames = validSubs.map((s: Subscription) => allGames.find((g: Game) => g.id === s.gameId)!).filter(Boolean);
      
      // Auto select the sport from active sub
      this.selectedGameIds = [this.activeSubscription.gameId];
      const gameNames = this.activeGames.map((g: Game) => g.name).join(' + ');
      this.statusText = `اشتراك ساري في (${gameNames}) حتى تاريخ ${this.activeSubscription.endDate}`;
    } else {
      this.expiredSubscription = subs[0];
      this.statusType = 'expired';
      this.statusText = `الاشتراك منتهٍ منذ ${this.expiredSubscription.endDate}، بحاجة لتجديد.`;
    }
  }

  toggleGame(gameId: string): void {
    const idx = this.selectedGameIds.indexOf(gameId);
    if (idx > -1) {
      this.selectedGameIds.splice(idx, 1);
    } else {
      this.selectedGameIds.push(gameId);
    }
  }

  isGameSelected(gameId: string): boolean {
    return this.selectedGameIds.includes(gameId);
  }

  executeCheckIn(): void {
    if (!this.selectedMember) return;
    const res = this.gymService.checkInMember(this.selectedMember.id, this.selectedGameIds);
    if (res.success) {
      this.successMessage = `تم تسجيل دخول (${this.selectedMember.name}) بنجاح! تدريب موفق يا بطل 💪`;
      this.step = 3;
    } else {
      alert(res.message);
    }
  }

  executeCheckOut(): void {
    if (!this.selectedMember) return;
    const activeAtt = this.gymService.getActiveAttendanceRecord(this.selectedMember.id);
    if (activeAtt) {
      this.gymService.checkOutMember(activeAtt.id);
      this.successMessage = `تم تسجيل خروج (${this.selectedMember.name}) بنجاح! نراك قريباً 👋`;
      this.step = 3;
    }
  }

  goToRenew(): void {
    if (this.selectedMember) {
      this.router.navigate(['/simple/renew'], { queryParams: { memberId: this.selectedMember.id } });
    }
  }

  goToNewSub(): void {
    if (this.selectedMember) {
      this.router.navigate(['/simple/new-subscription'], { queryParams: { memberId: this.selectedMember.id } });
    }
  }

  reset(): void {
    this.searchQuery = '';
    this.selectedMember = null;
    this.selectedGameIds = [];
    this.step = 1;
    this.successMessage = '';
  }
}
