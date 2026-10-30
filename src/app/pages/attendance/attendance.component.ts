import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GymDataService } from '../../services/gym-data.service';
import { Member, Game, Attendance, Subscription } from '../../models/gym.models';

import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    DialogModule,
    DropdownModule
  ],
  templateUrl: './attendance.component.html',
  styleUrls: ['./attendance.component.scss']
})
export class AttendanceComponent implements OnInit {
  members: Member[] = [];
  games: Game[] = [];
  attendanceRecords: Attendance[] = [];

  // Currently in-gym list
  activeGymAttendees: {
    record: Attendance;
    member?: Member;
    gameNames: string[];
    timeFormatted: string;
    durationMinutes: number;
  }[] = [];

  // Searchable member for check-in
  memberSearchTerm = '';
  selectedMemberId = '';
  selectedGameIds: string[] = [];

  // Attendance History Filter
  historyFilterDate: string = '';
  historySearchQuery = '';
  activePreset: 'today' | 'yesterday' | 'week' | 'all' = 'today';

  // Stale sessions closed notice
  staleSessionsClosedCount = 0;

  // Alerts
  alertMsg: string | null = null;
  alertSuccess = true;

  constructor(public gymService: GymDataService) {}

  ngOnInit(): void {
    // 1. Check & close stale sessions upon page load!
    this.staleSessionsClosedCount = this.gymService.autoCloseStaleAttendance();
    if (this.staleSessionsClosedCount > 0) {
      this.notify(`تم إغلاق ${this.staleSessionsClosedCount} جلسة حضور معلقة من أيام سابقة تلقائياً (3 ساعات كحد أقصى)!`, true);
    }

    this.historyFilterDate = new Date().toISOString().split('T')[0];

    // Reactive subscriptions
    this.gymService.members$.subscribe(data => {
      this.members = data;
      this.activeMembers = data.filter(m => !m.isArchived);
    });

    this.gymService.games$.subscribe(data => {
      this.games = data;
      if (this.games.length > 0 && this.selectedGameIds.length === 0) {
        this.selectedGameIds = [this.games[0].id];
      }
    });

    this.gymService.attendances$.subscribe(data => {
      this.attendanceRecords = data;
      this.calculateActiveAttendees();
    });
  }

  // Active attendees inside gym
  calculateActiveAttendees(): void {
    const now = Date.now();
    this.activeGymAttendees = this.attendanceRecords
      .filter(a => a.checkOut === null)
      .map(rec => {
        const member = this.gymService.getMemberById(rec.memberId);
        const gameNames = (rec.gameIds || []).map(gid => {
          const g = this.games.find(item => item.id === gid);
          return g ? g.name : '';
        }).filter(Boolean);

        const inTime = new Date(rec.checkIn).getTime();
        const durationMinutes = Math.max(0, Math.floor((now - inTime) / 60000));
        const timeFormatted = new Date(rec.checkIn).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });

        return {
          record: rec,
          member,
          gameNames: gameNames.length > 0 ? gameNames : ['نشاط عام'],
          timeFormatted,
          durationMinutes
        };
      });
  }

  activeMembers: Member[] = [];

  // Filterable member list for check-in
  get searchedMembers(): Member[] {
    if (!this.memberSearchTerm.trim()) {
      return this.members.filter(m => !m.isArchived);
    }
    const q = this.memberSearchTerm.toLowerCase().trim();
    return this.members.filter(m => 
      !m.isArchived && (m.name.toLowerCase().includes(q) || m.phone.includes(q) || m.id.toLowerCase().includes(q))
    );
  }

  get selectedMemberObj(): Member | undefined {
    if (!this.selectedMemberId) return undefined;
    return this.gymService.getMemberById(this.selectedMemberId);
  }

  get selectedMemberSubscriptions(): Subscription[] {
    if (!this.selectedMemberId) return [];
    return this.gymService.getMemberSubscriptions(this.selectedMemberId);
  }

  get isSelectedMemberInGym(): boolean {
    if (!this.selectedMemberId) return false;
    return this.isMemberAlreadyInGym(this.selectedMemberId);
  }

  isMemberAlreadyInGym(memberId: string): boolean {
    return this.activeGymAttendees.some(a => a.record.memberId === memberId);
  }

  // Quick stats getters
  get todayTotalCheckIns(): number {
    const today = new Date().toISOString().split('T')[0];
    return this.attendanceRecords.filter(a => a.checkIn.startsWith(today)).length;
  }

  get todayCompletedCheckIns(): number {
    const today = new Date().toISOString().split('T')[0];
    return this.attendanceRecords.filter(a => a.checkIn.startsWith(today) && a.checkOut !== null).length;
  }

  get averageWorkoutDurationMinutes(): number {
    const today = new Date().toISOString().split('T')[0];
    const completedToday = this.attendanceRecords.filter(a => a.checkIn.startsWith(today) && a.checkOut !== null);
    if (completedToday.length === 0) return 0;

    const totalMins = completedToday.reduce((sum, item) => {
      const inTime = new Date(item.checkIn).getTime();
      const outTime = new Date(item.checkOut!).getTime();
      return sum + Math.max(0, Math.floor((outTime - inTime) / 60000));
    }, 0);

    return Math.round(totalMins / completedToday.length);
  }

  toggleGameSelection(gameId: string): void {
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

  quickSelectMember(member: Member): void {
    this.selectedMemberId = member.id;
    this.memberSearchTerm = member.name;
  }

  // Check In Member
  onLogCheckIn(): void {
    if (!this.selectedMemberId) {
      this.notify('يرجى اختيار العضو المراد تسجيل حضوره', false);
      return;
    }

    if (this.selectedGameIds.length === 0) {
      this.notify('يرجى تحديد نشاط رياضي واحد على الأقل للعضو اليوم', false);
      return;
    }

    // Attempt check-in
    const res = this.gymService.checkInMember(this.selectedMemberId, this.selectedGameIds);
    if (res.success) {
      const member = this.gymService.getMemberById(this.selectedMemberId);
      this.notify(`تم تسجيل حضور البطل (${member?.name}) بنجاح! 💪 تمرين موفق`, true);
      this.selectedMemberId = '';
      this.memberSearchTerm = '';
    } else {
      // Double check-in blocked message!
      this.notify(`تنبيه: ${res.message}`, false);
    }
  }

  // Check Out Member
  onLogCheckOut(recordId: string): void {
    const record = this.attendanceRecords.find(r => r.id === recordId);
    const memberName = record ? this.getMemberName(record.memberId) : 'العضو';
    const success = this.gymService.checkOutMember(recordId);
    if (success) {
      this.notify(`تم تسجيل خروج (${memberName}) بنجاح، عاش يا بطل! 🔥`, true);
    }
  }

  // Date Filter Presets
  setFilterPreset(preset: 'today' | 'yesterday' | 'week' | 'all'): void {
    this.activePreset = preset;
    const now = new Date();
    
    if (preset === 'today') {
      this.historyFilterDate = now.toISOString().split('T')[0];
    } else if (preset === 'yesterday') {
      const y = new Date(now);
      y.setDate(y.getDate() - 1);
      this.historyFilterDate = y.toISOString().split('T')[0];
    } else if (preset === 'week') {
      // Clear specific single date, filteredHistory will handle week or empty
      this.historyFilterDate = '';
    } else {
      this.historyFilterDate = '';
    }
  }

  // Filtered Attendance History
  get filteredHistory(): Attendance[] {
    let list = [...this.attendanceRecords];

    if (this.activePreset === 'week') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const limitIso = oneWeekAgo.toISOString();
      list = list.filter(a => a.checkIn >= limitIso);
    } else if (this.historyFilterDate) {
      list = list.filter(a => a.checkIn.startsWith(this.historyFilterDate));
    }

    if (this.historySearchQuery.trim()) {
      const q = this.historySearchQuery.toLowerCase().trim();
      list = list.filter(a => {
        const m = this.gymService.getMemberById(a.memberId);
        return (m && (m.name.toLowerCase().includes(q) || m.phone.includes(q))) || a.id.toLowerCase().includes(q);
      });
    }

    return list;
  }

  // Helpers
  getMemberName(memberId: string): string {
    const m = this.gymService.getMemberById(memberId);
    return m ? m.name : memberId;
  }

  getMemberPhone(memberId: string): string {
    const m = this.gymService.getMemberById(memberId);
    return m ? m.phone : '';
  }

  getMemberAvatar(memberId: string): string {
    const m = this.gymService.getMemberById(memberId);
    return m?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${memberId}`;
  }

  getGamesNames(gameIds?: string[]): string {
    if (!gameIds || gameIds.length === 0) return 'نشاط عام';
    return gameIds.map(gid => {
      const g = this.games.find(item => item.id === gid);
      return g ? g.name : '';
    }).filter(Boolean).join(' + ');
  }

  getGameIcon(gameName: string): string {
    const lower = gameName.toLowerCase();
    if (lower.includes('أجسام') || lower.includes('حديد') || lower.includes('body')) return 'pi-bolt';
    if (lower.includes('كارديو') || lower.includes('cardio') || lower.includes('فتنس')) return 'pi-heart-fill';
    if (lower.includes('ملاكمة') || lower.includes('boxing') || lower.includes('قتال')) return 'pi-shield';
    if (lower.includes('سباحة') || lower.includes('swim')) return 'pi-compass';
    if (lower.includes('كروس') || lower.includes('crossfit')) return 'pi-sun';
    return 'pi-check-circle';
  }

  formatDate(isoStr: string): string {
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return isoStr;
    }
  }

  formatTime(isoStr: string | null): string {
    if (!isoStr) return '--:--';
    try {
      const d = new Date(isoStr);
      return d.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return isoStr;
    }
  }

  calculateDuration(checkIn: string, checkOut: string | null): string {
    const start = new Date(checkIn).getTime();
    const end = checkOut ? new Date(checkOut).getTime() : Date.now();
    const mins = Math.max(0, Math.floor((end - start) / 60000));
    const hours = Math.floor(mins / 60);
    const remMins = mins % 60;
    if (hours > 0) {
      return `${hours} ساعة و ${remMins} دقيقة`;
    }
    return `${remMins} دقيقة`;
  }

  private notify(msg: string, success: boolean): void {
    this.alertMsg = msg;
    this.alertSuccess = success;
    setTimeout(() => {
      this.alertMsg = null;
    }, 4500);
  }
}
