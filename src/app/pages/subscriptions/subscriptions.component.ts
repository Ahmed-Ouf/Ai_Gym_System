import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GymDataService } from '../../services/gym-data.service';
import {
  Member,
  Game,
  Subscription,
  Payment,
  PlanType,
  PaymentMethod
} from '../../models/gym.models';

import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';

@Component({
  selector: 'app-subscriptions',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    DialogModule,
    InputTextModule,
    ButtonModule,
    DropdownModule
  ],
  templateUrl: './subscriptions.component.html',
  styleUrls: ['./subscriptions.component.scss']
})
export class SubscriptionsComponent implements OnInit {
  members: Member[] = [];
  games: Game[] = [];
  subscriptions: Subscription[] = [];
  filteredSubscriptions: Subscription[] = [];
  payments: Payment[] = [];
  filteredPayments: Payment[] = [];

  activeTab: 'subscriptions' | 'payments' = 'subscriptions';

  // Filters: Subscriptions
  subSearchQuery = '';
  subStatusFilter: 'ALL' | 'Active' | 'ExpiringSoon' | 'Upcoming' | 'Expired' = 'ALL';

  // Filters: Payments
  paySearchQuery = '';
  payMethodFilter: 'ALL' | 'Cash' | 'Visa' = 'ALL';

  // Add Subscription Dialog & Searchable Member State
  showAddSubDialog = false;
  memberSearchTermForSub = '';
  selectedMemberIdForSub = '';
  selectedGameIdForSub = '';
  newSubPlanType: PlanType = 'Monthly';
  newSubStartDate = '';
  newSubEndDate = '';
  newSubPrice = 400;

  // Add Payment Dialog & Searchable Member State
  showAddPayDialog = false;
  memberSearchTermForPay = '';
  selectedMemberIdForPay = '';
  selectedSubIdForPay = '';
  newPayAmount = 400;
  newPayMethod: PaymentMethod = 'Cash';
  newPayDate = '';
  newPayNotes = '';

  // Feedback Notification
  alertMsg: string | null = null;
  alertSuccess = true;

  constructor(public gymService: GymDataService) {}

  ngOnInit(): void {
    const todayStr = new Date().toISOString().split('T')[0];
    this.newSubStartDate = todayStr;
    this.newPayDate = todayStr;
    this.calculateEndDate();

    this.gymService.members$.subscribe(data => {
      this.members = data;
    });

    this.gymService.games$.subscribe(data => {
      this.games = data;
      if (this.games.length > 0 && !this.selectedGameIdForSub) {
        this.selectedGameIdForSub = this.games[0].id;
        this.newSubPrice = this.games[0].defaultPrice;
      }
    });

    this.gymService.subscriptions$.subscribe(data => {
      this.subscriptions = data;
      this.applySubFilter();
    });

    this.gymService.payments$.subscribe(data => {
      this.payments = data;
      this.applyPayFilter();
    });
  }

  // Searchable Member Filtering for Dropdowns
  get searchedMembersForSub(): Member[] {
    if (!this.memberSearchTermForSub.trim()) {
      return this.members.filter(m => !m.isArchived);
    }
    const q = this.memberSearchTermForSub.toLowerCase().trim();
    return this.members.filter(m => 
      !m.isArchived && (m.name.toLowerCase().includes(q) || m.phone.includes(q) || m.id.toLowerCase().includes(q))
    );
  }

  get searchedMembersForPay(): Member[] {
    if (!this.memberSearchTermForPay.trim()) {
      return this.members.filter(m => !m.isArchived);
    }
    const q = this.memberSearchTermForPay.toLowerCase().trim();
    return this.members.filter(m => 
      !m.isArchived && (m.name.toLowerCase().includes(q) || m.phone.includes(q) || m.id.toLowerCase().includes(q))
    );
  }

  // Filter Subscriptions
  applySubFilter(): void {
    let list = [...this.subscriptions];

    if (this.subStatusFilter !== 'ALL') {
      list = list.filter(s => this.gymService.getSubscriptionStatus(s) === this.subStatusFilter);
    }

    if (this.subSearchQuery.trim()) {
      const q = this.subSearchQuery.toLowerCase().trim();
      list = list.filter(s => {
        const m = this.gymService.getMemberById(s.memberId);
        const g = this.getGameName(s.gameId);
        return (
          (m && (m.name.toLowerCase().includes(q) || m.phone.includes(q))) ||
          g.toLowerCase().includes(q) ||
          s.id.toLowerCase().includes(q)
        );
      });
    }

    this.filteredSubscriptions = list;
  }

  // Filter Payments
  applyPayFilter(): void {
    let list = [...this.payments];

    if (this.payMethodFilter !== 'ALL') {
      list = list.filter(p => p.method === this.payMethodFilter);
    }

    if (this.paySearchQuery.trim()) {
      const q = this.paySearchQuery.toLowerCase().trim();
      list = list.filter(p => {
        const m = this.gymService.getMemberById(p.memberId);
        return (
          (m && (m.name.toLowerCase().includes(q) || m.phone.includes(q))) ||
          p.id.toLowerCase().includes(q) ||
          (p.notes && p.notes.toLowerCase().includes(q))
        );
      });
    }

    this.filteredPayments = list;
  }

  // Open Add Subscription Dialog
  openAddSubscription(): void {
    this.memberSearchTermForSub = '';
    this.selectedMemberIdForSub = this.members.length > 0 ? this.members[0].id : '';
    this.selectedGameIdForSub = this.games.length > 0 ? this.games[0].id : '';
    this.onGameChange();
    this.newSubPlanType = 'Monthly';
    this.newSubStartDate = new Date().toISOString().split('T')[0];
    this.calculateEndDate();
    this.showAddSubDialog = true;
  }

  onGameChange(): void {
    const g = this.games.find(item => item.id === this.selectedGameIdForSub);
    if (g) {
      this.newSubPrice = g.defaultPrice;
    }
  }

  calculateEndDate(): void {
    const start = new Date(this.newSubStartDate || new Date());
    const end = new Date(start);
    if (this.newSubPlanType === 'Monthly') end.setMonth(end.getMonth() + 1);
    else if (this.newSubPlanType === 'Quarterly') end.setMonth(end.getMonth() + 3);
    else if (this.newSubPlanType === 'Yearly') end.setFullYear(end.getFullYear() + 1);
    this.newSubEndDate = end.toISOString().split('T')[0];
  }

  saveSubscription(): void {
    if (!this.selectedMemberIdForSub) {
      this.notify('يرجى اختيار العضو', false);
      return;
    }
    if (!this.selectedGameIdForSub) {
      this.notify('يرجى اختيار النشاط الرياضي', false);
      return;
    }

    const res = this.gymService.addSubscription({
      memberId: this.selectedMemberIdForSub,
      gameId: this.selectedGameIdForSub,
      startDate: this.newSubStartDate,
      endDate: this.newSubEndDate,
      price: this.newSubPrice,
      planType: this.newSubPlanType
    });

    if (res.success) {
      this.notify(res.message, true);
      this.showAddSubDialog = false;
    } else {
      this.notify(res.message, false);
    }
  }

  // Open Add Payment Dialog
  openAddPayment(memberId?: string, subId?: string): void {
    this.memberSearchTermForPay = '';
    this.selectedMemberIdForPay = memberId || (this.members.length > 0 ? this.members[0].id : '');
    this.onMemberChangeForPay();
    if (subId) {
      this.selectedSubIdForPay = subId;
    }
    this.newPayMethod = 'Cash';
    this.newPayDate = new Date().toISOString().split('T')[0];
    this.newPayNotes = '';
    this.showAddPayDialog = true;
  }

  onMemberChangeForPay(): void {
    const subs = this.gymService.getMemberSubscriptions(this.selectedMemberIdForPay);
    if (subs.length > 0) {
      this.selectedSubIdForPay = subs[0].id;
      this.newPayAmount = subs[0].price;
    } else {
      this.selectedSubIdForPay = '';
      this.newPayAmount = 400;
    }
  }

  onSubChangeForPay(): void {
    const sub = this.subscriptions.find(s => s.id === this.selectedSubIdForPay);
    if (sub) {
      this.newPayAmount = sub.price;
    }
  }

  getMemberSubscriptionsForPay(): Subscription[] {
    return this.gymService.getMemberSubscriptions(this.selectedMemberIdForPay);
  }

  savePayment(): void {
    if (!this.selectedMemberIdForPay || !this.selectedSubIdForPay) {
      this.notify('يرجى اختيار العضو والاشتراك المراد سداد قيمته', false);
      return;
    }

    this.gymService.recordPayment({
      memberId: this.selectedMemberIdForPay,
      subscriptionId: this.selectedSubIdForPay,
      amount: this.newPayAmount,
      date: this.newPayDate,
      method: this.newPayMethod,
      notes: this.newPayNotes
    });

    this.notify('تم تسجيل الدفعة بنجاح في سجل الإيرادات!', true);
    this.showAddPayDialog = false;
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

  getGameName(gameId: string): string {
    const g = this.games.find(item => item.id === gameId);
    return g ? g.name : 'نشاط';
  }

  getSubscriptionStatus(sub: Subscription): string {
    const s = this.gymService.getSubscriptionStatus(sub);
    switch (s) {
      case 'Active': return 'نشط';
      case 'ExpiringSoon': return 'ينتهي قريباً';
      case 'Upcoming': return 'قادم';
      case 'Expired': return 'منتهي';
      default: return 'نشط';
    }
  }

  getSubscriptionStatusClass(sub: Subscription): string {
    const s = this.gymService.getSubscriptionStatus(sub);
    switch (s) {
      case 'Active': return 'active';
      case 'ExpiringSoon': return 'expiring';
      case 'Upcoming': return 'upcoming';
      case 'Expired': return 'expired';
      default: return 'active';
    }
  }

  getPlanTypeName(type: PlanType): string {
    switch (type) {
      case 'Monthly': return 'شهري';
      case 'Quarterly': return 'ربع سنوي';
      case 'Yearly': return 'سنوي';
      default: return type;
    }
  }

  getTotalRevenue(): number {
    return this.filteredPayments.reduce((acc, curr) => acc + curr.amount, 0);
  }

  private notify(msg: string, success: boolean): void {
    this.alertMsg = msg;
    this.alertSuccess = success;
    setTimeout(() => {
      this.alertMsg = null;
    }, 4500);
  }
}
