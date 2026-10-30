import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { GymDataService } from '../../../services/gym-data.service';
import { Member, Game, Subscription, PlanType } from '../../../models/gym.models';

interface ExpiringCandidate {
  member: Member;
  subscription: Subscription;
  game: Game;
  daysRemaining: number;
  isExpired: boolean;
}

@Component({
  selector: 'app-simple-renew',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './simple-renew.component.html',
  styleUrls: ['./simple-renew.component.scss']
})
export class SimpleRenewComponent implements OnInit {
  step: number = 1; // 1: Select Candidate, 2: Review pre-filled renewal & dates, 3: Confirmation, 4: Done Success

  searchQuery: string = '';
  candidates: ExpiringCandidate[] = [];

  selectedMember: Member | null = null;
  previousSubscription: Subscription | null = null;
  selectedGame: Game | null = null;
  planType: PlanType = 'Monthly';

  newStartDate: string = '';
  newEndDate: string = '';
  renewPrice: number = 0;

  createdSubscription: Subscription | null = null;
  errorMessage: string | null = null;

  constructor(
    public gymService: GymDataService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadExpiringAndExpiredCandidates();

    // Check query params if coming from home expiring list
    this.route.queryParams.subscribe(params => {
      const memberId = params['memberId'];
      if (memberId) {
        const candidate = this.candidates.find(c => c.member.id === memberId);
        if (candidate) {
          this.pickCandidate(candidate);
        } else {
          // If not in candidates, fetch member and their latest sub
          const m = this.gymService.getMemberById(memberId);
          if (m) {
            const subs = this.gymService.getMemberSubscriptions(memberId);
            if (subs.length > 0) {
              const game = this.gymService.games.find((g: Game) => g.id === subs[0].gameId) || { id: subs[0].gameId, name: 'نشاط رياضي', defaultPrice: 400, isArchived: false };
              this.pickManual(m, subs[0], game);
            }
          }
        }
      }
    });
  }

  loadExpiringAndExpiredCandidates(): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const allSubs: Subscription[] = this.gymService.subscriptions;
    const allMembers: Member[] = this.gymService.members.filter((m: Member) => !m.isArchived);
    const allGames: Game[] = this.gymService.games;

    const list: ExpiringCandidate[] = [];

    allMembers.forEach((m: Member) => {
      const memberSubs = allSubs.filter((s: Subscription) => s.memberId === m.id);
      if (memberSubs.length > 0) {
        // Sort newest first
        memberSubs.sort((a: Subscription, b: Subscription) => b.endDate.localeCompare(a.endDate));
        const latest = memberSubs[0];
        const end = new Date(latest.endDate);
        end.setHours(0, 0, 0, 0);
        const diffTime = end.getTime() - today.getTime();
        const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // Candidate if expired or expiring within 14 days
        if (days <= 14) {
          const game = allGames.find((g: Game) => g.id === latest.gameId) || { id: latest.gameId, name: 'نشاط رياضي', defaultPrice: latest.price, isArchived: false };
          list.push({
            member: m,
            subscription: latest,
            game,
            daysRemaining: days,
            isExpired: days < 0
          });
        }
      }
    });

    // Sort: most urgent first (expired first, then closest to expiration)
    list.sort((a, b) => a.daysRemaining - b.daysRemaining);
    this.candidates = list;
  }

  get filteredCandidates(): ExpiringCandidate[] {
    const q = this.searchQuery.trim().toLowerCase();
    if (!q) return this.candidates;
    return this.candidates.filter(c => 
      c.member.name.toLowerCase().includes(q) || c.member.phone.includes(q)
    );
  }

  pickCandidate(c: ExpiringCandidate): void {
    this.pickManual(c.member, c.subscription, c.game);
  }

  pickManual(m: Member, prevSub: Subscription, g: Game): void {
    this.selectedMember = m;
    this.previousSubscription = prevSub;
    this.selectedGame = g;
    this.planType = prevSub.planType;

    // Calculate new start date: if already expired, start today. If still valid, start the day after it ends!
    const todayStr = new Date().toISOString().split('T')[0];
    if (prevSub.endDate >= todayStr) {
      const nextDay = new Date(prevSub.endDate);
      nextDay.setDate(nextDay.getDate() + 1);
      this.newStartDate = nextDay.toISOString().split('T')[0];
    } else {
      this.newStartDate = todayStr;
    }

    this.recalculateDates();
    this.step = 2;
  }

  onPlanChange(plan: PlanType): void {
    this.planType = plan;
    this.recalculateDates();
  }

  recalculateDates(): void {
    const start = new Date(this.newStartDate || new Date());
    const end = new Date(start);
    const basePrice = this.selectedGame ? this.selectedGame.defaultPrice : 400;

    if (this.planType === 'Monthly') {
      end.setMonth(end.getMonth() + 1);
      this.renewPrice = basePrice;
    } else if (this.planType === 'Quarterly') {
      end.setMonth(end.getMonth() + 3);
      this.renewPrice = Math.round(basePrice * 3 * 0.9);
    } else if (this.planType === 'Yearly') {
      end.setFullYear(end.getFullYear() + 1);
      this.renewPrice = Math.round(basePrice * 12 * 0.75);
    }

    this.newEndDate = end.toISOString().split('T')[0];
  }

  goToConfirmation(): void {
    this.step = 3;
  }

  saveRenewal(): void {
    if (!this.selectedMember || !this.selectedGame) return;

    const res = this.gymService.addSubscription({
      memberId: this.selectedMember.id,
      gameId: this.selectedGame.id,
      planType: this.planType,
      startDate: this.newStartDate,
      endDate: this.newEndDate,
      price: this.renewPrice
    });

    if (res.success && res.subscription) {
      this.createdSubscription = res.subscription;
      this.step = 4;
    } else {
      this.errorMessage = res.message;
    }
  }

  proceedToPayment(): void {
    if (this.selectedMember && this.createdSubscription) {
      this.router.navigate(['/simple/payment'], { 
        queryParams: { 
          memberId: this.selectedMember.id, 
          subscriptionId: this.createdSubscription.id 
        } 
      });
    }
  }

  reset(): void {
    this.selectedMember = null;
    this.previousSubscription = null;
    this.createdSubscription = null;
    this.step = 1;
  }
}
