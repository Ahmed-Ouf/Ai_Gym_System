import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { GymDataService } from '../../../services/gym-data.service';
import { Member, Game, Subscription, Attendance } from '../../../models/gym.models';

interface SimpleAttendee {
  attendanceId: string;
  memberId: string;
  memberName: string;
  memberAvatar: string;
  gameNames: string[];
  checkInTime: string;
}

interface SimpleExpiringItem {
  member: Member;
  game: Game;
  subscription: Subscription;
  daysLeft: number;
}

@Component({
  selector: 'app-simple-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './simple-home.component.html',
  styleUrls: ['./simple-home.component.scss']
})
export class SimpleHomeComponent implements OnInit {
  attendees: SimpleAttendee[] = [];
  expiringSubscriptions: SimpleExpiringItem[] = [];
  actionMessage: string | null = null;
  actionSuccess: boolean = true;

  constructor(
    public gymService: GymDataService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadData();

    // Subscribe to attendance and subscription updates
    this.gymService.attendances$.subscribe(() => this.loadData());
    this.gymService.subscriptions$.subscribe(() => this.loadData());
    this.gymService.members$.subscribe(() => this.loadData());
  }

  loadData(): void {
    // 1. Members inside gym now
    const activeRecords = this.gymService.attendances.filter((a: Attendance) => a.checkOut === null);
    const games = this.gymService.games;

    this.attendees = activeRecords.map((rec: Attendance) => {
      const member = this.gymService.getMemberById(rec.memberId);
      const checkInDate = new Date(rec.checkIn);
      const timeFormatted = checkInDate.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
      const gameNames = (rec.gameIds || [])
        .map((gid: string) => games.find((g: Game) => g.id === gid)?.name)
        .filter(Boolean) as string[];

      return {
        attendanceId: rec.id,
        memberId: rec.memberId,
        memberName: member?.name || 'عضو الصالة',
        memberAvatar: member?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${rec.memberId}`,
        gameNames: gameNames.length > 0 ? gameNames : ['نشاط عام'],
        checkInTime: timeFormatted
      };
    });

    // 2. Subscriptions expiring soon (within 7 days)
    this.expiringSubscriptions = this.gymService.getExpiringSubscriptions(7);
  }

  quickCheckOut(attendanceId: string, memberName: string): void {
    this.gymService.checkOutMember(attendanceId);
    this.notify(`تم تسجيل خروج (${memberName}) بنجاح! 👋`, true);
  }

  goToRenew(memberId: string): void {
    this.router.navigate(['/simple/renew'], { queryParams: { memberId } });
  }

  private notify(msg: string, success: boolean): void {
    this.actionMessage = msg;
    this.actionSuccess = success;
    setTimeout(() => {
      this.actionMessage = null;
    }, 4000);
  }
}
