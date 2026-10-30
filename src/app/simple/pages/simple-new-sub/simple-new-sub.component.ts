import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { GymDataService } from '../../../services/gym-data.service';
import { Member, Game, PlanType, Subscription } from '../../../models/gym.models';

@Component({
  selector: 'app-simple-new-sub',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './simple-new-sub.component.html',
  styleUrls: ['./simple-new-sub.component.scss']
})
export class SimpleNewSubComponent implements OnInit {
  step: number = 1; // 1: Select Member (if not given), 2: Choose Sport & Plan, 3: Confirmation, 4: Done Success

  searchQuery: string = '';
  selectedMember: Member | null = null;
  selectedGameId: string = '';
  selectedPlan: PlanType = 'Monthly';
  startDate: string = '';
  endDate: string = '';
  price: number = 0;

  // Overlap guard explanation
  overlapBlocked: boolean = false;
  overlapMessage: string = '';
  existingSubId: string = '';

  createdSubscription: Subscription | null = null;
  errorMessage: string | null = null;

  constructor(
    public gymService: GymDataService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Default start date = today
    this.startDate = new Date().toISOString().split('T')[0];

    // Check query params if coming from new-member flow
    this.route.queryParams.subscribe(params => {
      const memberId = params['memberId'];
      if (memberId) {
        const found = this.gymService.getMemberById(memberId);
        if (found) {
          this.selectMember(found);
          return;
        }
      }
    });

    // Default sport = first game
    const games = this.gymService.games;
    if (games.length > 0) {
      this.selectedGameId = games[0].id;
      this.recalculate();
    }
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

  get games(): Game[] {
    return this.gymService.games.filter((g: Game) => !g.isArchived);
  }

  get selectedGameName(): string {
    const g = this.games.find(item => item.id === this.selectedGameId);
    return g ? g.name : 'النشاط الرياضي';
  }

  selectMember(m: Member): void {
    this.selectedMember = m;
    this.step = 2;
    this.recalculate();
  }

  onSportSelect(gameId: string): void {
    this.selectedGameId = gameId;
    this.recalculate();
  }

  onPlanSelect(plan: PlanType): void {
    this.selectedPlan = plan;
    this.recalculate();
  }

  recalculate(): void {
    const game = this.games.find((g: Game) => g.id === this.selectedGameId);
    const basePrice = game ? game.defaultPrice : 400;

    // Calculate End Date and Price
    const start = new Date(this.startDate || new Date());
    const end = new Date(start);

    if (this.selectedPlan === 'Monthly') {
      end.setMonth(end.getMonth() + 1);
      this.price = basePrice;
    } else if (this.selectedPlan === 'Quarterly') {
      end.setMonth(end.getMonth() + 3);
      this.price = Math.round(basePrice * 3 * 0.9); // 10% discount
    } else if (this.selectedPlan === 'Yearly') {
      end.setFullYear(end.getFullYear() + 1);
      this.price = Math.round(basePrice * 12 * 0.75); // 25% discount
    }

    this.endDate = end.toISOString().split('T')[0];
    this.checkOverlap();
  }

  checkOverlap(): void {
    if (!this.selectedMember || !this.selectedGameId) {
      this.overlapBlocked = false;
      return;
    }

    const memberSubs = this.gymService.getMemberSubscriptions(this.selectedMember.id);
    const todayStr = new Date().toISOString().split('T')[0];

    // Find any active overlapping subscription for the same sport
    const conflicting = memberSubs.find((s: Subscription) => 
      s.gameId === this.selectedGameId && s.endDate >= todayStr
    );

    if (conflicting) {
      this.overlapBlocked = true;
      this.existingSubId = conflicting.id;
      this.overlapMessage = `البطل (${this.selectedMember.name}) عنده بالفعل اشتراك سارٍ في رياضة (${this.selectedGameName}) حتى تاريخ ${conflicting.endDate}.`;
    } else {
      this.overlapBlocked = false;
      this.overlapMessage = '';
    }
  }

  goToConfirmation(): void {
    if (this.overlapBlocked) return;
    this.step = 3;
  }

  saveSubscription(): void {
    if (!this.selectedMember) return;

    const res = this.gymService.addSubscription({
      memberId: this.selectedMember.id,
      gameId: this.selectedGameId,
      planType: this.selectedPlan,
      startDate: this.startDate,
      endDate: this.endDate,
      price: this.price
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

  goToRenewExisting(): void {
    if (this.selectedMember) {
      this.router.navigate(['/simple/renew'], { queryParams: { memberId: this.selectedMember.id } });
    }
  }

  reset(): void {
    this.searchQuery = '';
    this.selectedMember = null;
    this.createdSubscription = null;
    this.overlapBlocked = false;
    this.step = 1;
  }
}
