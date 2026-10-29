import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { GymDataService } from '../../services/gym-data.service';
import { Member, Game, Subscription, Payment, Attendance, PlanType, PaymentMethod } from '../../models/gym.models';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    DialogModule,
    InputTextModule,
    ButtonModule,
    DropdownModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  members: Member[] = [];
  games: Game[] = [];
  subscriptions: Subscription[] = [];
  payments: Payment[] = [];
  attendances: Attendance[] = [];

  // Summary Metrics
  totalMembersCount = 0;
  activeMembersCount = 0;
  todayAttendanceCount = 0;
  todayRevenue = 0;

  // Subscription Breakdown
  activeSubCount = 0;
  expiringSubCount = 0;
  upcomingSubCount = 0;
  expiredSubCount = 0;

  // Expiring Subscriptions List
  expiringSubscriptionsList: { subscription: Subscription; member: Member; game: Game; daysLeft: number }[] = [];

  // Recent Check-in Activity
  recentAttendanceActivity: {
    record: Attendance;
    member?: Member;
    gameNames: string[];
    timeFormatted: string;
    isInside: boolean;
  }[] = [];

  // Quick Action Dialogs
  showAddMemberDialog = false;
  showAddSubDialog = false;
  showAddPaymentDialog = false;
  showQuickCheckInDialog = false;

  // Form Models: Add Member
  newMemberName = '';
  newMemberPhone = '';
  newMemberGender: 'Male' | 'Female' = 'Male';
  newMemberBirthDate = '1998-01-01';
  newMemberNotes = '';

  // Form Models: Add Subscription
  selectedMemberIdForSub = '';
  selectedGameIdForSub = '';
  newSubPlanType: PlanType = 'Monthly';
  newSubStartDate = '';
  newSubEndDate = '';
  newSubPrice = 400;

  // Form Models: Add Payment
  selectedMemberIdForPay = '';
  selectedSubIdForPay = '';
  newPayAmount = 400;
  newPayMethod: PaymentMethod = 'Cash';
  newPayNotes = '';

  // Form Models: Quick Check-in
  quickCheckInMemberId = '';
  quickCheckInGameIds: string[] = [];

  // Feedback Notification
  actionMessage: string | null = null;
  actionSuccess: boolean = true;

  constructor(public gymService: GymDataService) {}

  ngOnInit(): void {
    const todayStr = new Date().toISOString().split('T')[0];
    this.newSubStartDate = todayStr;
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    this.newSubEndDate = nextMonth.toISOString().split('T')[0];

    // Reactive subscriptions
    this.gymService.members$.subscribe(data => {
      this.members = data;
      this.recalculateDashboard();
    });

    this.gymService.games$.subscribe(data => {
      this.games = data;
      this.recalculateDashboard();
    });

    this.gymService.subscriptions$.subscribe(data => {
      this.subscriptions = data;
      this.recalculateDashboard();
    });

    this.gymService.payments$.subscribe(data => {
      this.payments = data;
      this.recalculateDashboard();
    });

    this.gymService.attendances$.subscribe(data => {
      this.attendances = data;
      this.recalculateDashboard();
    });
  }

  recalculateDashboard(): void {
    const todayStr = new Date().toISOString().split('T')[0];

    // 1. Members count
    this.totalMembersCount = this.members.filter(m => !m.isArchived).length;

    // Active members: have at least one active subscription
    const activeMemberIds = new Set(
      this.subscriptions
        .filter(s => s.startDate <= todayStr && s.endDate >= todayStr)
        .map(s => s.memberId)
    );
    this.activeMembersCount = this.members.filter(m => !m.isArchived && activeMemberIds.has(m.id)).length;

    // 2. Today check-ins
    const todayMidnight = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()).getTime();
    this.todayAttendanceCount = this.attendances.filter(a => new Date(a.checkIn).getTime() >= todayMidnight).length;

    // 3. Today payments revenue
    this.todayRevenue = this.payments
      .filter(p => p.date === todayStr)
      .reduce((acc, curr) => acc + curr.amount, 0);

    // 4. Subscriptions Breakdown
    this.activeSubCount = 0;
    this.expiringSubCount = 0;
    this.upcomingSubCount = 0;
    this.expiredSubCount = 0;

    for (const sub of this.subscriptions) {
      const status = this.gymService.getSubscriptionStatus(sub);
      if (status === 'Active') this.activeSubCount++;
      else if (status === 'ExpiringSoon') this.expiringSubCount++;
      else if (status === 'Upcoming') this.upcomingSubCount++;
      else if (status === 'Expired') this.expiredSubCount++;
    }

    // 5. Expiring in <= 7 days
    this.expiringSubscriptionsList = this.gymService.getExpiringSubscriptions(7);

    // 6. Recent Activity
    this.recentAttendanceActivity = this.attendances
      .filter(a => new Date(a.checkIn).getTime() >= todayMidnight)
      .slice(0, 7)
      .map(rec => {
        const member = this.gymService.getMemberById(rec.memberId);
        const gameNames = (rec.gameIds || []).map(gid => {
          const g = this.games.find(item => item.id === gid);
          return g ? g.name : '';
        }).filter(Boolean);

        const checkInDate = new Date(rec.checkIn);
        const timeFormatted = checkInDate.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });

        return {
          record: rec,
          member,
          gameNames: gameNames.length > 0 ? gameNames : ['نشاط عام'],
          timeFormatted,
          isInside: rec.checkOut === null
        };
      });
  }

  // Quick Action: Register Member
  openAddMember(): void {
    this.newMemberName = '';
    this.newMemberPhone = '';
    this.newMemberGender = 'Male';
    this.newMemberBirthDate = '1998-01-01';
    this.newMemberNotes = '';
    this.showAddMemberDialog = true;
  }

  saveNewMember(): void {
    if (!this.newMemberName.trim() || !this.newMemberPhone.trim()) {
      this.notify('يرجى ملء اسم العضو ورقم الهاتف', false);
      return;
    }

    const created = this.gymService.addMember({
      name: this.newMemberName,
      phone: this.newMemberPhone,
      gender: this.newMemberGender,
      birthDate: this.newMemberBirthDate,
      joinDate: new Date().toISOString().split('T')[0],
      notes: this.newMemberNotes,
      isArchived: false
    });

    this.notify(`تم تسجيل العضو (${created.name}) بنجاح!`, true);
    this.showAddMemberDialog = false;
  }

  // Quick Action: Add Subscription
  openAddSubscription(memberId?: string): void {
    this.selectedMemberIdForSub = memberId || (this.members.length > 0 ? this.members[0].id : '');
    this.selectedGameIdForSub = this.games.length > 0 ? this.games[0].id : '';
    this.onGameChangeForSub();
    this.newSubPlanType = 'Monthly';
    this.onPlanTypeChange();
    this.showAddSubDialog = true;
  }

  onGameChangeForSub(): void {
    const game = this.games.find(g => g.id === this.selectedGameIdForSub);
    if (game) {
      this.newSubPrice = game.defaultPrice;
    }
  }

  onPlanTypeChange(): void {
    const start = new Date(this.newSubStartDate || new Date());
    const end = new Date(start);
    if (this.newSubPlanType === 'Monthly') {
      end.setMonth(end.getMonth() + 1);
    } else if (this.newSubPlanType === 'Quarterly') {
      end.setMonth(end.getMonth() + 3);
    } else if (this.newSubPlanType === 'Yearly') {
      end.setFullYear(end.getFullYear() + 1);
    }
    this.newSubEndDate = end.toISOString().split('T')[0];
  }

  saveNewSubscription(): void {
    if (!this.selectedMemberIdForSub || !this.selectedGameIdForSub) {
      this.notify('يرجى اختيار العضو واللعبة الرياضية', false);
      return;
    }

    const result = this.gymService.addSubscription({
      memberId: this.selectedMemberIdForSub,
      gameId: this.selectedGameIdForSub,
      startDate: this.newSubStartDate,
      endDate: this.newSubEndDate,
      price: this.newSubPrice,
      planType: this.newSubPlanType
    });

    if (result.success) {
      this.notify(result.message, true);
      this.showAddSubDialog = false;
    } else {
      this.notify(result.message, false);
    }
  }

  // Quick Action: Record Payment
  openAddPayment(memberId?: string): void {
    this.selectedMemberIdForPay = memberId || (this.members.length > 0 ? this.members[0].id : '');
    this.onMemberChangeForPay();
    this.newPayAmount = 400;
    this.newPayMethod = 'Cash';
    this.newPayNotes = '';
    this.showAddPaymentDialog = true;
  }

  onMemberChangeForPay(): void {
    const memberSubs = this.gymService.getMemberSubscriptions(this.selectedMemberIdForPay);
    if (memberSubs.length > 0) {
      this.selectedSubIdForPay = memberSubs[0].id;
      this.newPayAmount = memberSubs[0].price;
    } else {
      this.selectedSubIdForPay = '';
    }
  }

  getMemberSubscriptionsForPayment(): Subscription[] {
    return this.gymService.getMemberSubscriptions(this.selectedMemberIdForPay);
  }

  getGameName(gameId: string): string {
    const g = this.games.find(item => item.id === gameId);
    return g ? g.name : 'نشاط';
  }

  savePayment(): void {
    if (!this.selectedMemberIdForPay || !this.selectedSubIdForPay) {
      this.notify('يرجى اختيار العضو والاشتراك التابع له', false);
      return;
    }

    this.gymService.recordPayment({
      memberId: this.selectedMemberIdForPay,
      subscriptionId: this.selectedSubIdForPay,
      amount: this.newPayAmount,
      date: new Date().toISOString().split('T')[0],
      method: this.newPayMethod,
      notes: this.newPayNotes
    });

    this.notify('تم تسجيل الدفعة بنجاح!', true);
    this.showAddPaymentDialog = false;
  }

  // Quick Action: Check-in
  openQuickCheckIn(): void {
    this.quickCheckInMemberId = '';
    this.quickCheckInGameIds = this.games.length > 0 ? [this.games[0].id] : [];
    this.showQuickCheckInDialog = true;
  }

  toggleCheckInGame(gameId: string): void {
    const idx = this.quickCheckInGameIds.indexOf(gameId);
    if (idx > -1) {
      this.quickCheckInGameIds.splice(idx, 1);
    } else {
      this.quickCheckInGameIds.push(gameId);
    }
  }

  isCheckInGameSelected(gameId: string): boolean {
    return this.quickCheckInGameIds.includes(gameId);
  }

  executeQuickCheckIn(): void {
    if (!this.quickCheckInMemberId) {
      this.notify('يرجى اختيار العضو لتسجيل حضوره', false);
      return;
    }

    const result = this.gymService.checkInMember(this.quickCheckInMemberId, this.quickCheckInGameIds);
    if (result.success) {
      const member = this.gymService.getMemberById(this.quickCheckInMemberId);
      this.notify(`تم تسجيل دخول (${member?.name}) بنجاح!`, true);
      this.showQuickCheckInDialog = false;
    } else {
      this.notify(result.message, false);
    }
  }

  checkOutMember(attendanceId: string): void {
    this.gymService.checkOutMember(attendanceId);
    this.notify('تم تسجيل الخروج بنجاح!', true);
  }

  private notify(msg: string, success: boolean): void {
    this.actionMessage = msg;
    this.actionSuccess = success;
    setTimeout(() => {
      this.actionMessage = null;
    }, 4500);
  }
}
