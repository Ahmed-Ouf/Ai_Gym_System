import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GymDataService } from '../../services/gym-data.service';
import {
  Member,
  Game,
  Subscription,
  Attendance,
  TrainingSchedule,
  MemberMeasurement,
  TrainingType,
  PlanType
} from '../../models/gym.models';

import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';

interface DayScheduleItem {
  dayOfWeek: number;
  dayName: string;
  gameId: string;
  gameName: string;
  trainingTypeId: string | null;
  trainingTypeName: string;
}

@Component({
  selector: 'app-members',
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
  templateUrl: './members.component.html',
  styleUrls: ['./members.component.scss']
})
export class MembersComponent implements OnInit {
  members: Member[] = [];
  filteredMembers: Member[] = [];
  games: Game[] = [];
  trainingTypes: TrainingType[] = [];

  searchQuery = '';
  showArchived = false;

  // Modals & Panels
  showAddDialog = false;
  showDetailDialog = false;
  selectedMember: Member | null = null;
  activeDetailTab: 'profile' | 'subscriptions' | 'schedule' | 'attendance' | 'measurements' = 'profile';

  // Add Member Form
  newMemberName = '';
  newMemberPhone = '';
  newMemberGender: 'Male' | 'Female' = 'Male';
  newMemberBirthDate = '1998-05-15';
  newMemberJoinDate = '';
  newMemberNotes = '';

  // Member Subscriptions Tab
  memberSubscriptions: Subscription[] = [];
  showAddMemberSubDialog = false;
  subGameId = '';
  subPlanType: PlanType = 'Monthly';
  subStartDate = '';
  subEndDate = '';
  subPrice = 400;

  // Member Schedule Tab
  weekDays = [
    { id: 1, name: 'السبت' },
    { id: 2, name: 'الأحد' },
    { id: 3, name: 'الإثنين' },
    { id: 4, name: 'الثلاثاء' },
    { id: 5, name: 'الأربعاء' },
    { id: 6, name: 'الخميس' },
    { id: 7, name: 'الجمعة' }
  ];
  memberSchedules: TrainingSchedule[] = [];
  todaySchedule: DayScheduleItem | null = null;
  tomorrowSchedule: DayScheduleItem | null = null;
  
  // Safe schedule editor form
  editScheduleDay = 1;
  editScheduleGameId = '';
  editScheduleTypeId: string | null = null;

  // Member Attendance Tab
  memberAttendances: Attendance[] = [];

  // Member Measurements Tab
  memberMeasurements: MemberMeasurement[] = [];
  newWeight = 75;
  newMeasurementDate = '';
  newMeasurementNotes = '';

  // Feedback Notification
  alertMsg: string | null = null;
  alertSuccess = true;

  constructor(public gymService: GymDataService) {}

  ngOnInit(): void {
    const todayStr = new Date().toISOString().split('T')[0];
    this.newMemberJoinDate = todayStr;
    this.subStartDate = todayStr;
    this.newMeasurementDate = todayStr;

    this.gymService.members$.subscribe(data => {
      this.members = data;
      this.applyFilter();
    });

    this.gymService.games$.subscribe(data => {
      this.games = data;
    });

    this.gymService.trainingTypes$.subscribe(data => {
      this.trainingTypes = data;
    });

    this.gymService.subscriptions$.subscribe(() => {
      if (this.selectedMember) {
        this.loadMemberDetails(this.selectedMember);
      }
    });

    this.gymService.attendances$.subscribe(() => {
      if (this.selectedMember) {
        this.loadMemberDetails(this.selectedMember);
      }
    });

    this.gymService.schedules$.subscribe(() => {
      if (this.selectedMember) {
        this.loadMemberDetails(this.selectedMember);
      }
    });

    this.gymService.measurements$.subscribe(() => {
      if (this.selectedMember) {
        this.loadMemberDetails(this.selectedMember);
      }
    });
  }

  applyFilter(): void {
    let list = this.members.filter(m => (this.showArchived ? true : !m.isArchived));

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase().trim();
      list = list.filter(m => 
        m.name.toLowerCase().includes(q) ||
        m.phone.includes(q) ||
        m.id.toLowerCase().includes(q)
      );
    }

    this.filteredMembers = list;
  }

  // Add Member
  openAddMember(): void {
    this.newMemberName = '';
    this.newMemberPhone = '';
    this.newMemberGender = 'Male';
    this.newMemberBirthDate = '1998-05-15';
    this.newMemberJoinDate = new Date().toISOString().split('T')[0];
    this.newMemberNotes = '';
    this.showAddDialog = true;
  }

  saveNewMember(): void {
    if (!this.newMemberName.trim() || !this.newMemberPhone.trim()) {
      this.notify('يرجى إدخال اسم العضو ورقم هاتفه', false);
      return;
    }

    const created = this.gymService.addMember({
      name: this.newMemberName,
      phone: this.newMemberPhone,
      gender: this.newMemberGender,
      birthDate: this.newMemberBirthDate,
      joinDate: this.newMemberJoinDate,
      notes: this.newMemberNotes,
      isArchived: false
    });

    this.notify(`تم تسجيل العضو (${created.name}) بنجاح!`, true);
    this.showAddDialog = false;
  }

  toggleArchive(member: Member): void {
    this.gymService.toggleArchiveMember(member.id);
    this.notify(member.isArchived ? 'تم إلغاء أرشفة العضو!' : 'تم أرشفة العضو بنجاح!', true);
  }

  // Member Details Hub
  openMemberDetails(member: Member, initialTab: 'profile' | 'subscriptions' | 'schedule' | 'attendance' | 'measurements' = 'profile'): void {
    this.selectedMember = member;
    this.activeDetailTab = initialTab;
    this.loadMemberDetails(member);
    this.showDetailDialog = true;
  }

  loadMemberDetails(member: Member): void {
    this.memberSubscriptions = this.gymService.getMemberSubscriptions(member.id);
    this.memberAttendances = this.gymService.getMemberAttendance(member.id);
    this.memberMeasurements = this.gymService.getMemberMeasurements(member.id);
    this.memberSchedules = this.gymService.getMemberSchedules(member.id);

    // Compute Today's and Tomorrow's schedules
    // JS: 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
    // Our DayOfWeek: 1=Sat, 2=Sun, 3=Mon, 4=Tue, 5=Wed, 6=Thu, 7=Fri
    const jsDayToOurDay = (jsDay: number) => {
      // 6 (Sat) -> 1, 0 (Sun) -> 2, 1 (Mon) -> 3, 2 (Tue) -> 4, 3 (Wed) -> 5, 4 (Thu) -> 6, 5 (Fri) -> 7
      return jsDay === 6 ? 1 : jsDay + 2;
    };

    const todayJs = new Date().getDay();
    const todayOur = jsDayToOurDay(todayJs);
    const tomorrowOur = todayOur === 7 ? 1 : todayOur + 1;

    this.todaySchedule = this.buildScheduleItem(todayOur);
    this.tomorrowSchedule = this.buildScheduleItem(tomorrowOur);

    // Pre-populate schedule edit dropdowns
    this.editScheduleDay = todayOur;
    const existing = this.memberSchedules.find(s => s.dayOfWeek === this.editScheduleDay);
    if (existing) {
      this.editScheduleGameId = existing.gameId;
      this.editScheduleTypeId = existing.trainingTypeId;
    } else {
      this.editScheduleGameId = this.games.length > 0 ? this.games[0].id : '';
      this.editScheduleTypeId = null;
    }
  }

  buildScheduleItem(dayNumber: number): DayScheduleItem | null {
    const s = this.memberSchedules.find(item => item.dayOfWeek === dayNumber);
    if (!s) return null;
    const game = this.games.find(g => g.id === s.gameId);
    const type = this.trainingTypes.find(t => t.id === s.trainingTypeId);
    const dayObj = this.weekDays.find(d => d.id === dayNumber);

    return {
      dayOfWeek: dayNumber,
      dayName: dayObj ? dayObj.name : '',
      gameId: s.gameId,
      gameName: game ? game.name : 'نشاط عام',
      trainingTypeId: s.trainingTypeId,
      trainingTypeName: type ? type.name : 'تمارين عامة'
    };
  }

  // Safe Schedule Editor: edit one day without deleting other days!
  onScheduleDayChange(): void {
    const existing = this.memberSchedules.find(s => s.dayOfWeek === this.editScheduleDay);
    if (existing) {
      this.editScheduleGameId = existing.gameId;
      this.editScheduleTypeId = existing.trainingTypeId;
    } else {
      this.editScheduleGameId = this.games.length > 0 ? this.games[0].id : '';
      this.editScheduleTypeId = null;
    }
  }

  saveDaySchedule(): void {
    if (!this.selectedMember || !this.editScheduleGameId) return;

    this.gymService.saveMemberDaySchedule(
      this.selectedMember.id,
      this.editScheduleDay,
      this.editScheduleGameId,
      this.editScheduleTypeId
    );
    this.notify('تم تحديث جدول تمرين اليوم بأمان دون المساس بباقي الأيام!', true);
    this.loadMemberDetails(this.selectedMember);
  }

  clearDaySchedule(dayOfWeek: number): void {
    if (!this.selectedMember) return;
    const existing = this.memberSchedules.find(s => s.dayOfWeek === dayOfWeek);
    if (existing) {
      this.gymService.removeMemberDaySchedule(existing.id);
      this.notify('تم إلغاء جدول هذا اليوم', true);
      this.loadMemberDetails(this.selectedMember);
    }
  }

  getTrainingTypesForGame(gameId: string): TrainingType[] {
    return this.trainingTypes.filter(t => t.gameId === gameId);
  }

  // Member Subscriptions
  openAddMemberSubscription(): void {
    if (!this.selectedMember) return;
    this.subGameId = this.games.length > 0 ? this.games[0].id : '';
    this.onSubGameChange();
    this.subPlanType = 'Monthly';
    this.subStartDate = new Date().toISOString().split('T')[0];
    this.calculateSubEndDate();
    this.showAddMemberSubDialog = true;
  }

  onSubGameChange(): void {
    const g = this.games.find(item => item.id === this.subGameId);
    if (g) {
      this.subPrice = g.defaultPrice;
    }
  }

  calculateSubEndDate(): void {
    const start = new Date(this.subStartDate || new Date());
    const end = new Date(start);
    if (this.subPlanType === 'Monthly') end.setMonth(end.getMonth() + 1);
    else if (this.subPlanType === 'Quarterly') end.setMonth(end.getMonth() + 3);
    else if (this.subPlanType === 'Yearly') end.setFullYear(end.getFullYear() + 1);
    this.subEndDate = end.toISOString().split('T')[0];
  }

  saveMemberSubscription(): void {
    if (!this.selectedMember || !this.subGameId) return;

    const res = this.gymService.addSubscription({
      memberId: this.selectedMember.id,
      gameId: this.subGameId,
      startDate: this.subStartDate,
      endDate: this.subEndDate,
      price: this.subPrice,
      planType: this.subPlanType
    });

    if (res.success) {
      this.notify(res.message, true);
      this.showAddMemberSubDialog = false;
      this.loadMemberDetails(this.selectedMember);
    } else {
      this.notify(res.message, false);
    }
  }

  // Member Measurements
  saveMeasurement(): void {
    if (!this.selectedMember || !this.newWeight) {
      this.notify('يرجى إدخال وزن صحيح', false);
      return;
    }

    this.gymService.addMeasurement({
      memberId: this.selectedMember.id,
      weight: this.newWeight,
      date: this.newMeasurementDate || new Date().toISOString().split('T')[0],
      notes: this.newMeasurementNotes
    });

    this.newMeasurementNotes = '';
    this.notify('تم تسجيل القياس والوزن بنجاح!', true);
    this.loadMemberDetails(this.selectedMember);
  }

  deleteMeasurement(id: string): void {
    this.gymService.deleteMeasurement(id);
    this.notify('تم حذف القياس بنجاح', true);
    if (this.selectedMember) {
      this.loadMemberDetails(this.selectedMember);
    }
  }

  // Helpers
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
      default: return 'ساري';
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

  formatDate(isoStr: string): string {
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return isoStr;
    }
  }

  formatTime(isoStr: string | null): string {
    if (!isoStr) return '--';
    try {
      const d = new Date(isoStr);
      return d.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return isoStr;
    }
  }

  calculateAge(birthDate: string): number {
    if (!birthDate) return 25;
    const diff = Date.now() - new Date(birthDate).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  }

  private notify(msg: string, success: boolean): void {
    this.alertMsg = msg;
    this.alertSuccess = success;
    setTimeout(() => {
      this.alertMsg = null;
    }, 4500);
  }
}
