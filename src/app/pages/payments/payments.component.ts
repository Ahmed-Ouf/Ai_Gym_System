import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { GymDataService } from '../../services/gym-data.service';
import { Payment } from '../../models/gym.models';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-payments',
  standalone: true,
  imports: [CommonModule, FormsModule, TableModule, InputTextModule],
  templateUrl: './payments.component.html',
  styleUrls: ['./payments.component.scss']
})
export class PaymentsComponent implements OnInit {
  payments: Payment[] = [];
  filteredPayments: Payment[] = [];
  searchQuery = '';
  selectedMethod: 'ALL' | 'Cash' | 'Visa' = 'ALL';

  constructor(public gymService: GymDataService, private router: Router) {}

  ngOnInit(): void {
    // Redirect to subscriptions payments tab or render here
    this.gymService.payments$.subscribe(data => {
      this.payments = data;
      this.applyFilter();
    });
  }

  applyFilter(): void {
    let list = [...this.payments];

    if (this.selectedMethod !== 'ALL') {
      list = list.filter(p => p.method === this.selectedMethod);
    }

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase().trim();
      list = list.filter(p => {
        const m = this.gymService.getMemberById(p.memberId);
        return (
          (m && (m.name.toLowerCase().includes(q) || m.phone.includes(q))) ||
          p.id.toLowerCase().includes(q) ||
          p.notes.toLowerCase().includes(q)
        );
      });
    }

    this.filteredPayments = list;
  }

  getMemberName(id: string): string {
    const m = this.gymService.getMemberById(id);
    return m ? m.name : id;
  }

  getMemberPhone(id: string): string {
    const m = this.gymService.getMemberById(id);
    return m ? m.phone : '';
  }

  getMemberAvatar(id: string): string {
    const m = this.gymService.getMemberById(id);
    return m?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${id}`;
  }

  goToSubscriptions(): void {
    this.router.navigate(['/subscriptions']);
  }
}
