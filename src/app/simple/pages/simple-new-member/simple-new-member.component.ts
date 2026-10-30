import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { GymDataService } from '../../../services/gym-data.service';
import { Member } from '../../../models/gym.models';

@Component({
  selector: 'app-simple-new-member',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './simple-new-member.component.html',
  styleUrls: ['./simple-new-member.component.scss']
})
export class SimpleNewMemberComponent {
  step: number = 1; // 1: Form, 2: Confirmation sentence, 3: Success state

  name: string = '';
  phone: string = '';
  gender: 'Male' | 'Female' = 'Male';
  birthDate: string = '1998-01-01';
  notes: string = '';

  errorMessage: string | null = null;
  createdMember: Member | null = null;

  constructor(
    private gymService: GymDataService,
    private router: Router
  ) {}

  goToConfirmation(): void {
    if (!this.name.trim()) {
      this.errorMessage = 'من فضلك اكتب اسم اللاعب كاملاً';
      return;
    }
    if (!this.phone.trim() || this.phone.trim().length < 8) {
      this.errorMessage = 'من فضلك أدخل رقم هاتف صحيح للتواصل';
      return;
    }
    this.errorMessage = null;
    this.step = 2;
  }

  saveMember(): void {
    const newMember = this.gymService.addMember({
      name: this.name.trim(),
      phone: this.phone.trim(),
      gender: this.gender,
      birthDate: this.birthDate,
      joinDate: new Date().toISOString().split('T')[0],
      notes: this.notes.trim(),
      isArchived: false
    });

    this.createdMember = newMember;
    this.step = 3;
  }

  proceedToSubscription(): void {
    if (this.createdMember) {
      this.router.navigate(['/simple/new-subscription'], { queryParams: { memberId: this.createdMember.id } });
    }
  }

  reset(): void {
    this.name = '';
    this.phone = '';
    this.gender = 'Male';
    this.birthDate = '1998-01-01';
    this.notes = '';
    this.errorMessage = null;
    this.createdMember = null;
    this.step = 1;
  }
}

