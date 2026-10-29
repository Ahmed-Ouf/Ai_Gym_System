export interface Member {
  id: string;
  name: string;
  phone: string;
  gender: 'Male' | 'Female';
  birthDate: string; // YYYY-MM-DD
  joinDate: string;  // YYYY-MM-DD
  notes: string;
  isArchived: boolean;
  avatar?: string;
}

export interface Game {
  id: string;
  name: string;
  defaultPrice: number;
  isArchived: boolean;
}

export interface TrainingType {
  id: string;
  gameId: string;
  name: string;
}

export type PlanType = 'Monthly' | 'Quarterly' | 'Yearly';

export interface Subscription {
  id: string;
  memberId: string;
  gameId: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  price: number;
  planType: PlanType;
}

export type PaymentMethod = 'Cash' | 'Visa';

export interface Payment {
  id: string;
  memberId: string;
  subscriptionId: string;
  amount: number;
  date: string; // YYYY-MM-DD
  method: PaymentMethod;
  notes: string;
}

export interface Attendance {
  id: string;
  memberId: string;
  checkIn: string; // ISO string
  checkOut: string | null; // ISO string
  gameIds?: string[]; // IDs of games played in this session (AttendanceGame)
}

export interface TrainingSchedule {
  id: string;
  memberId: string;
  gameId: string;
  trainingTypeId: string | null;
  dayOfWeek: number; // 1 to 7 (1: السبت, 2: الأحد, 3: الإثنين, 4: الثلاثاء, 5: الأربعاء, 6: الخميس, 7: الجمعة)
}

export interface MemberMeasurement {
  id: string;
  memberId: string;
  weight: number; // kg
  date: string;   // YYYY-MM-DD
  notes: string;
}

export interface DatabaseBackup {
  version: string;
  exportDate: string;
  gymName: string;
  members: Member[];
  games: Game[];
  trainingTypes: TrainingType[];
  subscriptions: Subscription[];
  payments: Payment[];
  attendances: Attendance[];
  schedules: TrainingSchedule[];
  measurements: MemberMeasurement[];
}
