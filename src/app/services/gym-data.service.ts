import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  Member,
  Game,
  TrainingType,
  Subscription,
  Payment,
  Attendance,
  TrainingSchedule,
  MemberMeasurement,
  DatabaseBackup
} from '../models/gym.models';

const STORAGE_KEY = 'el_halawany_gym_db_v1';

@Injectable({
  providedIn: 'root'
})
export class GymDataService {
  private membersList: Member[] = [];
  private gamesList: Game[] = [];
  private trainingTypesList: TrainingType[] = [];
  private subscriptionsList: Subscription[] = [];
  private paymentsList: Payment[] = [];
  private attendancesList: Attendance[] = [];
  private schedulesList: TrainingSchedule[] = [];
  private measurementsList: MemberMeasurement[] = [];

  // Reactive Subjects
  private membersSubject = new BehaviorSubject<Member[]>([]);
  private gamesSubject = new BehaviorSubject<Game[]>([]);
  private trainingTypesSubject = new BehaviorSubject<TrainingType[]>([]);
  private subscriptionsSubject = new BehaviorSubject<Subscription[]>([]);
  private paymentsSubject = new BehaviorSubject<Payment[]>([]);
  private attendancesSubject = new BehaviorSubject<Attendance[]>([]);
  private schedulesSubject = new BehaviorSubject<TrainingSchedule[]>([]);
  private measurementsSubject = new BehaviorSubject<MemberMeasurement[]>([]);

  constructor() {
    this.initDatabase();
  }

  // Observables
  get members$(): Observable<Member[]> { return this.membersSubject.asObservable(); }
  get games$(): Observable<Game[]> { return this.gamesSubject.asObservable(); }
  get trainingTypes$(): Observable<TrainingType[]> { return this.trainingTypesSubject.asObservable(); }
  get subscriptions$(): Observable<Subscription[]> { return this.subscriptionsSubject.asObservable(); }
  get payments$(): Observable<Payment[]> { return this.paymentsSubject.asObservable(); }
  get attendances$(): Observable<Attendance[]> { return this.attendancesSubject.asObservable(); }
  get schedules$(): Observable<TrainingSchedule[]> { return this.schedulesSubject.asObservable(); }
  get measurements$(): Observable<MemberMeasurement[]> { return this.measurementsSubject.asObservable(); }

  // Synchronous Getters
  get members(): Member[] { return this.membersList; }
  get games(): Game[] { return this.gamesList; }
  get trainingTypes(): TrainingType[] { return this.trainingTypesList; }
  get subscriptions(): Subscription[] { return this.subscriptionsList; }
  get payments(): Payment[] { return this.paymentsList; }
  get attendances(): Attendance[] { return this.attendancesList; }
  get schedules(): TrainingSchedule[] { return this.schedulesList; }
  get measurements(): MemberMeasurement[] { return this.measurementsList; }

  // Initialize DB from LocalStorage or Seed Data
  private initDatabase(): void {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        this.membersList = parsed.members || [];
        this.gamesList = parsed.games || [];
        this.trainingTypesList = parsed.trainingTypes || [];
        this.subscriptionsList = parsed.subscriptions || [];
        this.paymentsList = parsed.payments || [];
        this.attendancesList = parsed.attendances || [];
        this.schedulesList = parsed.schedules || [];
        this.measurementsList = parsed.measurements || [];
      } catch (e) {
        console.error('فشل قراءة البيانات المخزنة، جاري استعادة البيانات الأولية:', e);
        this.seedInitialData();
      }
    } else {
      this.seedInitialData();
    }

    // Auto-close stale sessions from previous days!
    this.autoCloseStaleAttendance();
    this.saveAndNotify();
  }

  /**
   * Stale Sessions Logic:
   * If a member checked in yesterday or earlier but forgot to check out,
   * auto-close their session: set checkout to 3 hours after check-in, capped at midnight.
   */
  public autoCloseStaleAttendance(): number {
    const now = new Date();
    const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    let closedCount = 0;

    this.attendancesList = this.attendancesList.map(record => {
      if (!record.checkOut) {
        const inTime = new Date(record.checkIn).getTime();
        // If check-in happened before today's 00:00:00
        if (inTime < todayMidnight) {
          const checkInDate = new Date(record.checkIn);
          // 3 hours later
          const threeHoursLater = new Date(inTime + 3 * 60 * 60 * 1000);
          // Midnight of that check-in day
          const endOfDay = new Date(checkInDate.getFullYear(), checkInDate.getMonth(), checkInDate.getDate(), 23, 59, 59);

          const autoCloseTime = threeHoursLater.getTime() > endOfDay.getTime() ? endOfDay : threeHoursLater;
          closedCount++;
          return {
            ...record,
            checkOut: autoCloseTime.toISOString()
          };
        }
      }
      return record;
    });

    if (closedCount > 0) {
      this.saveAndNotify();
    }
    return closedCount;
  }

  // Persistence Helper
  private saveAndNotify(): void {
    const payload: DatabaseBackup = {
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      gymName: 'جيم الحلواني - EL-Halawany GYM',
      members: this.membersList,
      games: this.gamesList,
      trainingTypes: this.trainingTypesList,
      subscriptions: this.subscriptionsList,
      payments: this.paymentsList,
      attendances: this.attendancesList,
      schedules: this.schedulesList,
      measurements: this.measurementsList
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.error('خطأ في حفظ البيانات محلياً:', e);
    }

    this.membersSubject.next([...this.membersList]);
    this.gamesSubject.next([...this.gamesList]);
    this.trainingTypesSubject.next([...this.trainingTypesList]);
    this.subscriptionsSubject.next([...this.subscriptionsList]);
    this.paymentsSubject.next([...this.paymentsList]);
    this.attendancesSubject.next([...this.attendancesList]);
    this.schedulesSubject.next([...this.schedulesList]);
    this.measurementsSubject.next([...this.measurementsList]);
  }

  // ======================== MEMBERS MANAGEMENT ========================
  getMemberById(id: string): Member | undefined {
    return this.membersList.find(m => m.id === id);
  }

  addMember(data: Omit<Member, 'id'>): Member {
    const id = 'MEM-' + String(this.membersList.length + 1).padStart(3, '0') + '-' + Math.floor(100 + Math.random() * 900);
    const newMember: Member = {
      id,
      name: data.name.trim(),
      phone: data.phone.trim(),
      gender: data.gender,
      birthDate: data.birthDate,
      joinDate: data.joinDate || new Date().toISOString().split('T')[0],
      notes: data.notes || '',
      isArchived: false,
      avatar: data.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${id}`
    };
    this.membersList.unshift(newMember);
    this.saveAndNotify();
    return newMember;
  }

  updateMember(member: Member): boolean {
    const idx = this.membersList.findIndex(m => m.id === member.id);
    if (idx !== -1) {
      this.membersList[idx] = { ...member };
      this.saveAndNotify();
      return true;
    }
    return false;
  }

  toggleArchiveMember(memberId: string): boolean {
    const member = this.membersList.find(m => m.id === memberId);
    if (member) {
      member.isArchived = !member.isArchived;
      this.saveAndNotify();
      return true;
    }
    return false;
  }

  // ======================== SUBSCRIPTION LOGIC ========================
  /**
   * Prevent overlapping subscriptions for the same member and game!
   */
  hasOverlappingSubscription(memberId: string, gameId: string, startDate: string, endDate: string, excludeId?: string): boolean {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();

    return this.subscriptionsList.some(sub => {
      if (sub.memberId !== memberId || sub.gameId !== gameId) return false;
      if (excludeId && sub.id === excludeId) return false;

      const subStart = new Date(sub.startDate).getTime();
      const subEnd = new Date(sub.endDate).getTime();

      // Check overlap: (start <= subEnd) and (end >= subStart)
      return start <= subEnd && end >= subStart;
    });
  }

  addSubscription(data: Omit<Subscription, 'id'>): { success: boolean; message: string; subscription?: Subscription } {
    // Validation: Start Date <= End Date
    if (new Date(data.startDate).getTime() > new Date(data.endDate).getTime()) {
      return { success: false, message: 'تاريخ بداية الاشتراك لا يمكن أن يكون بعد تاريخ الانتهاء!' };
    }

    // Validation: Prevent overlap
    if (this.hasOverlappingSubscription(data.memberId, data.gameId, data.startDate, data.endDate)) {
      const game = this.gamesList.find(g => g.id === data.gameId);
      const gameName = game ? game.name : 'هذه اللعبة';
      return { success: false, message: `يوجد بالفعل اشتراك نشط أو متداخل لهذا العضو في لعبة (${gameName}) خلال هذه الفترة!` };
    }

    const id = 'SUB-' + Date.now().toString().slice(-6);
    const newSub: Subscription = {
      id,
      memberId: data.memberId,
      gameId: data.gameId,
      startDate: data.startDate,
      endDate: data.endDate,
      price: data.price,
      planType: data.planType
    };

    this.subscriptionsList.unshift(newSub);
    this.saveAndNotify();
    return { success: true, message: 'تم إضافة الاشتراك بنجاح!', subscription: newSub };
  }

  getMemberSubscriptions(memberId: string): Subscription[] {
    return this.subscriptionsList.filter(s => s.memberId === memberId);
  }

  getSubscriptionStatus(sub: Subscription): 'Active' | 'ExpiringSoon' | 'Upcoming' | 'Expired' {
    const today = new Date().toISOString().split('T')[0];
    if (sub.startDate > today) {
      return 'Upcoming';
    }
    if (sub.endDate < today) {
      return 'Expired';
    }
    // Check if expires in <= 7 days
    const diffMs = new Date(sub.endDate).getTime() - new Date(today).getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays <= 7 && diffDays >= 0) {
      return 'ExpiringSoon';
    }
    return 'Active';
  }

  getExpiringSubscriptions(withinDays: number = 7): { subscription: Subscription; member: Member; game: Game; daysLeft: number }[] {
    const today = new Date().toISOString().split('T')[0];
    const todayMs = new Date(today).getTime();
    const result: { subscription: Subscription; member: Member; game: Game; daysLeft: number }[] = [];

    for (const sub of this.subscriptionsList) {
      if (sub.startDate <= today && sub.endDate >= today) {
        const diffMs = new Date(sub.endDate).getTime() - todayMs;
        const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        if (daysLeft >= 0 && daysLeft <= withinDays) {
          const member = this.getMemberById(sub.memberId);
          const game = this.gamesList.find(g => g.id === sub.gameId);
          if (member && game) {
            result.push({ subscription: sub, member, game, daysLeft });
          }
        }
      }
    }
    return result.sort((a, b) => a.daysLeft - b.daysLeft);
  }

  // ======================== PAYMENTS ========================
  recordPayment(data: Omit<Payment, 'id'>): Payment {
    const id = 'PAY-' + Date.now().toString().slice(-6);
    const newPay: Payment = {
      id,
      memberId: data.memberId,
      subscriptionId: data.subscriptionId,
      amount: data.amount,
      date: data.date || new Date().toISOString().split('T')[0],
      method: data.method,
      notes: data.notes || ''
    };
    this.paymentsList.unshift(newPay);
    this.saveAndNotify();
    return newPay;
  }

  getMemberPayments(memberId: string): Payment[] {
    return this.paymentsList.filter(p => p.memberId === memberId);
  }

  // ======================== ATTENDANCE LOGIC ========================
  isMemberCurrentlyInGym(memberId: string): boolean {
    return this.attendancesList.some(a => a.memberId === memberId && a.checkOut === null);
  }

  getActiveAttendanceRecord(memberId: string): Attendance | undefined {
    return this.attendancesList.find(a => a.memberId === memberId && a.checkOut === null);
  }

  checkInMember(memberId: string, gameIds: string[] = []): { success: boolean; message: string; record?: Attendance } {
    if (this.isMemberCurrentlyInGym(memberId)) {
      return { success: false, message: 'العضو متواجد بالفعل داخل الصالة حالياً!' };
    }

    const id = 'ATT-' + Date.now().toString().slice(-6);
    const newAtt: Attendance = {
      id,
      memberId,
      checkIn: new Date().toISOString(),
      checkOut: null,
      gameIds: gameIds.length > 0 ? gameIds : undefined
    };

    this.attendancesList.unshift(newAtt);
    this.saveAndNotify();
    return { success: true, message: 'تم تسجيل الدخول بنجاح!', record: newAtt };
  }

  checkOutMember(attendanceId: string): boolean {
    const rec = this.attendancesList.find(a => a.id === attendanceId);
    if (rec && !rec.checkOut) {
      rec.checkOut = new Date().toISOString();
      this.saveAndNotify();
      return true;
    }
    return false;
  }

  getMemberAttendance(memberId: string): Attendance[] {
    return this.attendancesList.filter(a => a.memberId === memberId);
  }

  // ======================== TRAINING SCHEDULE ========================
  getMemberSchedules(memberId: string): TrainingSchedule[] {
    return this.schedulesList.filter(s => s.memberId === memberId);
  }

  /**
   * Safely save/update schedules for a member on a specific day of the week
   * without deleting or impacting other days!
   */
  saveMemberDaySchedule(memberId: string, dayOfWeek: number, gameId: string, trainingTypeId: string | null): void {
    // Remove existing item for this exact member and day
    this.schedulesList = this.schedulesList.filter(s => !(s.memberId === memberId && s.dayOfWeek === dayOfWeek));

    if (gameId) {
      const id = 'SCH-' + Date.now().toString().slice(-6) + '-' + Math.floor(Math.random() * 100);
      this.schedulesList.push({
        id,
        memberId,
        gameId,
        trainingTypeId,
        dayOfWeek
      });
    }

    this.saveAndNotify();
  }

  removeMemberDaySchedule(scheduleId: string): void {
    this.schedulesList = this.schedulesList.filter(s => s.id !== scheduleId);
    this.saveAndNotify();
  }

  // ======================== MEASUREMENTS ========================
  getMemberMeasurements(memberId: string): MemberMeasurement[] {
    return this.measurementsList
      .filter(m => m.memberId === memberId)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  addMeasurement(data: Omit<MemberMeasurement, 'id'>): MemberMeasurement {
    const id = 'MEA-' + Date.now().toString().slice(-6);
    const measurement: MemberMeasurement = {
      id,
      memberId: data.memberId,
      weight: data.weight,
      date: data.date || new Date().toISOString().split('T')[0],
      notes: data.notes || ''
    };
    this.measurementsList.push(measurement);
    this.saveAndNotify();
    return measurement;
  }

  deleteMeasurement(id: string): void {
    this.measurementsList = this.measurementsList.filter(m => m.id !== id);
    this.saveAndNotify();
  }

  // ======================== GAMES & TRAINING TYPES ========================
  addGame(name: string, defaultPrice: number): Game {
    const id = 'GM-' + (this.gamesList.length + 1);
    const newGame: Game = {
      id,
      name: name.trim(),
      defaultPrice,
      isArchived: false
    };
    this.gamesList.push(newGame);
    this.saveAndNotify();
    return newGame;
  }

  updateGame(id: string, name: string, defaultPrice: number): boolean {
    const game = this.gamesList.find(g => g.id === id);
    if (game) {
      game.name = name.trim();
      game.defaultPrice = defaultPrice;
      this.saveAndNotify();
      return true;
    }
    return false;
  }

  toggleArchiveGame(id: string): boolean {
    const game = this.gamesList.find(g => g.id === id);
    if (game) {
      game.isArchived = !game.isArchived;
      this.saveAndNotify();
      return true;
    }
    return false;
  }

  addTrainingType(gameId: string, name: string): TrainingType {
    const id = 'TT-' + Date.now().toString().slice(-5);
    const tt: TrainingType = {
      id,
      gameId,
      name: name.trim()
    };
    this.trainingTypesList.push(tt);
    this.saveAndNotify();
    return tt;
  }

  deleteTrainingType(id: string): void {
    this.trainingTypesList = this.trainingTypesList.filter(t => t.id !== id);
    this.saveAndNotify();
  }

  // ======================== BACKUP & RESTORE ========================
  exportDatabaseToJson(): void {
    const payload: DatabaseBackup = {
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      gymName: 'جيم الحلواني - EL-Halawany GYM',
      members: this.membersList,
      games: this.gamesList,
      trainingTypes: this.trainingTypesList,
      subscriptions: this.subscriptionsList,
      payments: this.paymentsList,
      attendances: this.attendancesList,
      schedules: this.schedulesList,
      measurements: this.measurementsList
    };

    const str = JSON.stringify(payload, null, 2);
    const blob = new Blob([str], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const dateStr = new Date().toISOString().split('T')[0];
    a.download = `el-halawany-gym-backup-${dateStr}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  importDatabaseFromJson(jsonContent: string): { success: boolean; message: string } {
    try {
      const data = JSON.parse(jsonContent);
      if (!data.members || !Array.isArray(data.members) || !data.games || !Array.isArray(data.games)) {
        return { success: false, message: 'ملف النسخة الاحتياطية غير صالح أو تالف!' };
      }

      this.membersList = data.members;
      this.gamesList = data.games;
      this.trainingTypesList = data.trainingTypes || [];
      this.subscriptionsList = data.subscriptions || [];
      this.paymentsList = data.payments || [];
      this.attendancesList = data.attendances || [];
      this.schedulesList = data.schedules || [];
      this.measurementsList = data.measurements || [];

      this.autoCloseStaleAttendance();
      this.saveAndNotify();
      return { success: true, message: 'تم استعادة قاعدة البيانات بنجاح!' };
    } catch (e: any) {
      return { success: false, message: 'حدث خطأ أثناء قراءة الملف: ' + e.message };
    }
  }

  resetToDemoData(): void {
    localStorage.removeItem(STORAGE_KEY);
    this.seedInitialData();
    this.autoCloseStaleAttendance();
    this.saveAndNotify();
  }

  // ======================== SEED INITIAL DATA ========================
  private seedInitialData(): void {
    // 1. Games
    this.gamesList = [
      { id: 'GM-1', name: 'كمال أجسام ورفع أثقال', defaultPrice: 400, isArchived: false },
      { id: 'GM-2', name: 'لياقة بدنية وكارديو', defaultPrice: 350, isArchived: false },
      { id: 'GM-3', name: 'سباحة حرة وتدريب', defaultPrice: 500, isArchived: false },
      { id: 'GM-4', name: 'كيك بوكسينغ وفنون قتالية', defaultPrice: 450, isArchived: false },
      { id: 'GM-5', name: 'كروس فت وتدريب وظيفي', defaultPrice: 400, isArchived: false }
    ];

    // 2. Training Types
    this.trainingTypesList = [
      { id: 'TT-1', gameId: 'GM-1', name: 'عضلة الصدر (Chest)' },
      { id: 'TT-2', gameId: 'GM-1', name: 'عضلة الظهر (Back)' },
      { id: 'TT-3', gameId: 'GM-1', name: 'الأكتاف والترابيس (Shoulders)' },
      { id: 'TT-4', gameId: 'GM-1', name: 'الأرجل والسمانة (Legs)' },
      { id: 'TT-5', gameId: 'GM-1', name: 'الذراعين: باي وتراي (Arms)' },
      { id: 'TT-6', gameId: 'GM-1', name: 'عضلات البطن وكور (Core)' },
      { id: 'TT-7', gameId: 'GM-2', name: 'تمارين هيت وكارديو مكثف (HIIT)' },
      { id: 'TT-8', gameId: 'GM-2', name: 'سويدي وإطالات ومرونة' },
      { id: 'TT-9', gameId: 'GM-3', name: 'تحسين تقنيات السباحة والسرعة' },
      { id: 'TT-10', gameId: 'GM-4', name: 'لكمات وضربات الكيس وركلات' }
    ];

    // 3. Members
    this.membersList = [
      {
        id: 'MEM-001',
        name: 'أحمد محمود الحلواني',
        phone: '01012345678',
        gender: 'Male',
        birthDate: '1995-04-12',
        joinDate: '2025-01-10',
        notes: 'بطل كمال أجسام - متقدم',
        isArchived: false,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
      },
      {
        id: 'MEM-002',
        name: 'محمود إبراهيم الصاوي',
        phone: '01123456789',
        gender: 'Male',
        birthDate: '1998-08-20',
        joinDate: '2025-02-01',
        notes: 'تدريب صباحي مع مدرب شخصي',
        isArchived: false,
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
      },
      {
        id: 'MEM-003',
        name: 'سارة عبد الله الشريف',
        phone: '01234567890',
        gender: 'Female',
        birthDate: '2000-11-15',
        joinDate: '2025-03-05',
        notes: 'برنامج لياقة وتغذية صحية',
        isArchived: false,
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'
      },
      {
        id: 'MEM-004',
        name: 'كريم وائل الشناوي',
        phone: '01598765432',
        gender: 'Male',
        birthDate: '1992-06-30',
        joinDate: '2025-01-15',
        notes: 'مشترك في كمال الأجسام والسباحة',
        isArchived: false,
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'
      },
      {
        id: 'MEM-005',
        name: 'ياسمين محمد عزت',
        phone: '01099887766',
        gender: 'Female',
        birthDate: '1997-02-18',
        joinDate: '2025-04-10',
        notes: 'اشتراك لياقة وكيك بوكسينغ',
        isArchived: false,
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150'
      },
      {
        id: 'MEM-006',
        name: 'عمر فاروق الباز',
        phone: '01155443322',
        gender: 'Male',
        birthDate: '2001-09-05',
        joinDate: '2024-12-01',
        notes: 'اشتراكه منتهي ويحتاج تجديد',
        isArchived: false,
        avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150'
      }
    ];

    // Helper to format dates relative to today
    const now = new Date();
    const toISO = (d: Date) => d.toISOString().split('T')[0];

    const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const daysOffset = (days: number) => {
      const d = new Date(todayDate);
      d.setDate(d.getDate() + days);
      return toISO(d);
    };

    // 4. Subscriptions
    // We include: Active, Expiring soon (e.g. +3 days, +5 days), Expired (-10 days), and Upcoming (+7 to +37 days)
    this.subscriptionsList = [
      {
        id: 'SUB-101',
        memberId: 'MEM-001',
        gameId: 'GM-1',
        startDate: daysOffset(-25),
        endDate: daysOffset(5), // Expiring in 5 days! (Alert trigger)
        price: 400,
        planType: 'Monthly'
      },
      {
        id: 'SUB-102',
        memberId: 'MEM-002',
        gameId: 'GM-1',
        startDate: daysOffset(-28),
        endDate: daysOffset(2), // Expiring in 2 days! (Alert trigger)
        price: 400,
        planType: 'Monthly'
      },
      {
        id: 'SUB-103',
        memberId: 'MEM-003',
        gameId: 'GM-2',
        startDate: daysOffset(-15),
        endDate: daysOffset(15), // Active
        price: 350,
        planType: 'Monthly'
      },
      {
        id: 'SUB-104',
        memberId: 'MEM-004',
        gameId: 'GM-1',
        startDate: daysOffset(-60),
        endDate: daysOffset(30), // Quarterly, Active
        price: 1100,
        planType: 'Quarterly'
      },
      {
        id: 'SUB-105',
        memberId: 'MEM-004',
        gameId: 'GM-3',
        startDate: daysOffset(-20),
        endDate: daysOffset(10), // Active swimming
        price: 500,
        planType: 'Monthly'
      },
      {
        id: 'SUB-106',
        memberId: 'MEM-005',
        gameId: 'GM-4',
        startDate: daysOffset(-10),
        endDate: daysOffset(20), // Active
        price: 450,
        planType: 'Monthly'
      },
      {
        id: 'SUB-107',
        memberId: 'MEM-006',
        gameId: 'GM-1',
        startDate: daysOffset(-40),
        endDate: daysOffset(-10), // Expired!
        price: 400,
        planType: 'Monthly'
      }
    ];

    // 5. Payments
    this.paymentsList = [
      {
        id: 'PAY-101',
        memberId: 'MEM-001',
        subscriptionId: 'SUB-101',
        amount: 400,
        date: daysOffset(-25),
        method: 'Cash',
        notes: 'سداد نقدي عند التجديد'
      },
      {
        id: 'PAY-102',
        memberId: 'MEM-002',
        subscriptionId: 'SUB-102',
        amount: 400,
        date: daysOffset(-28),
        method: 'Visa',
        notes: 'دفع بالفيزا'
      },
      {
        id: 'PAY-103',
        memberId: 'MEM-003',
        subscriptionId: 'SUB-103',
        amount: 350,
        date: daysOffset(-15),
        method: 'Cash',
        notes: 'اشتراك لياقة'
      },
      {
        id: 'PAY-104',
        memberId: 'MEM-004',
        subscriptionId: 'SUB-104',
        amount: 1100,
        date: daysOffset(-60),
        method: 'Visa',
        notes: 'اشتراك ربع سنوي'
      },
      {
        id: 'PAY-105',
        memberId: 'MEM-004',
        subscriptionId: 'SUB-105',
        amount: 500,
        date: daysOffset(-20),
        method: 'Cash',
        notes: 'اشتراك مسبح'
      },
      {
        id: 'PAY-106',
        memberId: 'MEM-005',
        subscriptionId: 'SUB-106',
        amount: 450,
        date: daysOffset(0), // Today payment!
        method: 'Cash',
        notes: 'دفعة اليوم نقداً'
      }
    ];

    // 6. Attendances
    // Includes:
    // a. Stale unclosed check-in from yesterday (to test autoCloseStaleAttendance!)
    // b. Today completed check-ins
    // c. Today currently active in gym
    const yesterday = new Date(todayDate);
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(17, 30, 0, 0);

    const todayCheckin1 = new Date(todayDate);
    todayCheckin1.setHours(9, 15, 0, 0);
    const todayCheckout1 = new Date(todayDate);
    todayCheckout1.setHours(11, 0, 0, 0);

    const todayCheckin2 = new Date(todayDate);
    todayCheckin2.setHours(14, 0, 0, 0);

    this.attendancesList = [
      {
        id: 'ATT-001',
        memberId: 'MEM-001',
        checkIn: todayCheckin1.toISOString(),
        checkOut: todayCheckout1.toISOString(),
        gameIds: ['GM-1']
      },
      {
        id: 'ATT-002',
        memberId: 'MEM-002',
        checkIn: todayCheckin2.toISOString(),
        checkOut: null, // Currently inside gym!
        gameIds: ['GM-1']
      },
      {
        id: 'ATT-003',
        memberId: 'MEM-004',
        checkIn: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        checkOut: null, // Currently inside gym playing Gym + Swimming!
        gameIds: ['GM-1', 'GM-3']
      },
      {
        id: 'ATT-004',
        memberId: 'MEM-003',
        checkIn: yesterday.toISOString(),
        checkOut: null, // Stale! Forgot to check out yesterday!
        gameIds: ['GM-2']
      }
    ];

    // 7. Training Schedules (Weekly: 1=السبت, 2=الأحد, 3=الإثنين, 4=الثلاثاء, 5=الأربعاء, 6=الخميس, 7=الجمعة)
    this.schedulesList = [
      { id: 'SCH-1', memberId: 'MEM-001', gameId: 'GM-1', trainingTypeId: 'TT-1', dayOfWeek: 1 }, // السبت: صدر
      { id: 'SCH-2', memberId: 'MEM-001', gameId: 'GM-1', trainingTypeId: 'TT-2', dayOfWeek: 2 }, // الأحد: ظهر
      { id: 'SCH-3', memberId: 'MEM-001', gameId: 'GM-1', trainingTypeId: 'TT-3', dayOfWeek: 3 }, // الإثنين: أكتاف
      { id: 'SCH-4', memberId: 'MEM-001', gameId: 'GM-1', trainingTypeId: 'TT-4', dayOfWeek: 4 }, // الثلاثاء: أرجل
      { id: 'SCH-5', memberId: 'MEM-001', gameId: 'GM-1', trainingTypeId: 'TT-5', dayOfWeek: 5 }, // الأربعاء: ذراعين
      { id: 'SCH-6', memberId: 'MEM-002', gameId: 'GM-1', trainingTypeId: 'TT-1', dayOfWeek: 1 },
      { id: 'SCH-7', memberId: 'MEM-002', gameId: 'GM-1', trainingTypeId: 'TT-4', dayOfWeek: 3 },
      { id: 'SCH-8', memberId: 'MEM-003', gameId: 'GM-2', trainingTypeId: 'TT-7', dayOfWeek: 2 },
      { id: 'SCH-9', memberId: 'MEM-004', gameId: 'GM-1', trainingTypeId: 'TT-1', dayOfWeek: 1 },
      { id: 'SCH-10', memberId: 'MEM-004', gameId: 'GM-3', trainingTypeId: 'TT-9', dayOfWeek: 3 }
    ];

    // 8. Member Measurements
    this.measurementsList = [
      { id: 'MEA-1', memberId: 'MEM-001', weight: 88.5, date: daysOffset(-60), notes: 'بداية برنامج التضخيم' },
      { id: 'MEA-2', memberId: 'MEM-001', weight: 89.2, date: daysOffset(-30), notes: 'زيادة كتلة عضلية' },
      { id: 'MEA-3', memberId: 'MEM-001', weight: 89.8, date: daysOffset(-5), notes: 'تطور ممتاز في التنشيف' },
      { id: 'MEA-4', memberId: 'MEM-003', weight: 68.0, date: daysOffset(-45), notes: 'بداية دايت اللياقة' },
      { id: 'MEA-5', memberId: 'MEM-003', weight: 65.5, date: daysOffset(-15), notes: 'فقدان 2.5 كجم دهون' },
      { id: 'MEA-6', memberId: 'MEM-004', weight: 82.0, date: daysOffset(-40), notes: 'وزن البداية' },
      { id: 'MEA-7', memberId: 'MEM-004', weight: 80.5, date: daysOffset(-10), notes: 'تحسن اللياقة والتحمل' }
    ];
  }
}
