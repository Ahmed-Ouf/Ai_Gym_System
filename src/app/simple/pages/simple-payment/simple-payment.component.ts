import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { GymDataService } from '../../../services/gym-data.service';
import { Member, Subscription, Payment, PaymentMethod, Game } from '../../../models/gym.models';

@Component({
  selector: 'app-simple-payment',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './simple-payment.component.html',
  styleUrls: ['./simple-payment.component.scss']
})
export class SimplePaymentComponent implements OnInit {
  step: number = 1; // 1: Pick Member & Subscription (if not given), 2: Choose Method (Cash/Visa) & Amount, 3: Confirmation, 4: Done & Receipt

  searchQuery: string = '';
  selectedMember: Member | null = null;
  selectedSubscription: Subscription | null = null;
  selectedGameName: string = '';

  amount: number = 400;
  method: PaymentMethod = 'Cash';
  notes: string = '';

  createdPayment: Payment | null = null;

  constructor(
    public gymService: GymDataService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const memberId = params['memberId'];
      const subId = params['subscriptionId'];

      if (memberId) {
        const m = this.gymService.getMemberById(memberId);
        if (m) {
          this.selectedMember = m;
          const subs = this.gymService.getMemberSubscriptions(memberId);
          if (subId) {
            this.selectedSubscription = subs.find(s => s.id === subId) || (subs.length > 0 ? subs[0] : null);
          } else if (subs.length > 0) {
            this.selectedSubscription = subs[0];
          }

          if (this.selectedSubscription) {
            this.setupSubscriptionDetails(this.selectedSubscription);
            this.step = 2;
          }
        }
      }
    });
  }

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
    const subs = this.gymService.getMemberSubscriptions(m.id);
    if (subs.length > 0) {
      this.selectedSubscription = subs[0];
      this.setupSubscriptionDetails(this.selectedSubscription);
      this.step = 2;
    } else {
      this.selectedSubscription = null;
      this.amount = 400;
      this.step = 2;
    }
  }

  setupSubscriptionDetails(sub: Subscription): void {
    this.amount = sub.price;
    const games: Game[] = this.gymService.games;
    const g = games.find((item: Game) => item.id === sub.gameId);
    this.selectedGameName = g ? g.name : 'نشاط رياضي';
  }

  setMethod(m: PaymentMethod): void {
    this.method = m;
  }

  goToConfirmation(): void {
    this.step = 3;
  }

  savePayment(): void {
    if (!this.selectedMember) return;

    const subId = this.selectedSubscription ? this.selectedSubscription.id : 'DIRECT';

    const p = this.gymService.recordPayment({
      memberId: this.selectedMember.id,
      subscriptionId: subId,
      amount: this.amount,
      date: new Date().toISOString().split('T')[0],
      method: this.method,
      notes: this.notes.trim() || 'سداد اشتراك'
    });

    this.createdPayment = p;
    this.step = 4;
  }

  printReceipt(): void {
    window.print();
  }

  reset(): void {
    this.selectedMember = null;
    this.selectedSubscription = null;
    this.createdPayment = null;
    this.step = 1;
  }
}
