import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Member {
  id: string;
  name: string;
  avatar: string;
  email: string;
  phone: string;
  status: 'Active' | 'Inactive';
  plan: string;
  joinDate: string;
  gender: string;
  age: number;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  billingPeriod: string;
  features: string[];
  totalSubscribed: number;
  color: string;
}

export interface Payment {
  id: string;
  memberName: string;
  amount: number;
  date: string;
  status: 'Paid' | 'Pending' | 'Failed';
  paymentMethod: string;
}

export interface AttendanceRecord {
  id: string;
  memberId: string;
  memberName: string;
  avatar: string;
  timeIn: string;
  timeOut?: string;
  status: 'In-Gym' | 'Checked-Out';
  date: string;
}

@Injectable({
  providedIn: 'root'
})
export class GymMockService {
  // Members Mock Database
  private membersList: Member[] = [
    { id: 'MEM-001', name: 'Alexander Wright', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', email: 'alexander.w@fitpulse.com', phone: '+1 (555) 234-5678', status: 'Active', plan: 'VIP Elite', joinDate: '2025-01-15', gender: 'Male', age: 29 },
    { id: 'MEM-002', name: 'Sophia Martinez', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', email: 'sophia.m@fitpulse.com', phone: '+1 (555) 876-5432', status: 'Active', plan: 'Premium Flex', joinDate: '2025-03-10', gender: 'Female', age: 26 },
    { id: 'MEM-003', name: 'Marcus Sterling', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', email: 'marcus.s@fitpulse.com', phone: '+1 (555) 345-6789', status: 'Active', plan: 'VIP Elite', joinDate: '2024-11-05', gender: 'Male', age: 34 },
    { id: 'MEM-004', name: 'Elena Rostova', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150', email: 'elena.r@fitpulse.com', phone: '+1 (555) 901-2345', status: 'Inactive', plan: 'Basic Core', joinDate: '2025-02-18', gender: 'Female', age: 31 },
    { id: 'MEM-005', name: 'Jordan Hayes', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', email: 'jordan.h@fitpulse.com', phone: '+1 (555) 456-7890', status: 'Active', plan: 'Premium Flex', joinDate: '2025-04-01', gender: 'Male', age: 24 },
    { id: 'MEM-006', name: 'Chloe Anderson', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150', email: 'chloe.a@fitpulse.com', phone: '+1 (555) 789-0123', status: 'Active', plan: 'Basic Core', joinDate: '2025-05-12', gender: 'Female', age: 27 },
  ];

  // Subscription Tiers Mock Database
  private plansList: SubscriptionPlan[] = [
    { id: 'PLAN-01', name: 'Basic Core', price: 29.99, billingPeriod: 'Monthly', features: ['Standard gym access', 'Locker access', '1 Fitness evaluation/mo', 'Free Wi-Fi'], totalSubscribed: 34, color: 'blue' },
    { id: 'PLAN-02', name: 'Premium Flex', price: 49.99, billingPeriod: 'Monthly', features: ['Unlimited gym access', 'All group fitness classes', '2 Trainer sessions/mo', 'Steam room & Sauna access'], totalSubscribed: 89, color: 'purple' },
    { id: 'PLAN-03', name: 'VIP Elite', price: 89.99, billingPeriod: 'Monthly', features: ['24/7 Unlimited access', 'Personalized nutrition plans', 'Unlimited 1-on-1 trainer', 'Access to recovery lounge', '1 Guest pass per visit'], totalSubscribed: 42, color: 'orange' },
  ];

  // Payments History Mock Database
  private paymentsList: Payment[] = [
    { id: 'INV-1024', memberName: 'Alexander Wright', amount: 89.99, date: '2026-05-18', status: 'Paid', paymentMethod: 'Credit Card' },
    { id: 'INV-1023', memberName: 'Sophia Martinez', amount: 49.99, date: '2026-05-17', status: 'Paid', paymentMethod: 'PayPal' },
    { id: 'INV-1022', memberName: 'Marcus Sterling', amount: 89.99, date: '2026-05-15', status: 'Paid', paymentMethod: 'Apple Pay' },
    { id: 'INV-1021', memberName: 'Elena Rostova', amount: 29.99, date: '2026-05-12', status: 'Failed', paymentMethod: 'Credit Card' },
    { id: 'INV-1020', memberName: 'Jordan Hayes', amount: 49.99, date: '2026-05-01', status: 'Paid', paymentMethod: 'Credit Card' },
    { id: 'INV-1019', memberName: 'Chloe Anderson', amount: 29.99, date: '2026-05-12', status: 'Pending', paymentMethod: 'Bank Transfer' },
    { id: 'INV-1018', memberName: 'Marcus Sterling', amount: 89.99, date: '2026-04-15', status: 'Paid', paymentMethod: 'Apple Pay' },
    { id: 'INV-1017', memberName: 'Alexander Wright', amount: 89.99, date: '2026-04-18', status: 'Paid', paymentMethod: 'Credit Card' },
  ];

  // Attendance Check-in Logs Mock Database
  private attendanceList: AttendanceRecord[] = [
    { id: 'ATT-201', memberId: 'MEM-001', memberName: 'Alexander Wright', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', timeIn: '08:15 AM', timeOut: '09:45 AM', status: 'Checked-Out', date: '2026-05-20' },
    { id: 'ATT-202', memberId: 'MEM-003', memberName: 'Marcus Sterling', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', timeIn: '09:30 AM', timeOut: '11:00 AM', status: 'Checked-Out', date: '2026-05-20' },
    { id: 'ATT-203', memberId: 'MEM-002', memberName: 'Sophia Martinez', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', timeIn: '04:10 PM', status: 'In-Gym', date: '2026-05-20' },
    { id: 'ATT-204', memberId: 'MEM-005', memberName: 'Jordan Hayes', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', timeIn: '05:00 PM', status: 'In-Gym', date: '2026-05-20' }
  ];

  // Subjects for reactive updates
  private membersSubject = new BehaviorSubject<Member[]>(this.membersList);
  private plansSubject = new BehaviorSubject<SubscriptionPlan[]>(this.plansList);
  private paymentsSubject = new BehaviorSubject<Payment[]>(this.paymentsList);
  private attendanceSubject = new BehaviorSubject<AttendanceRecord[]>(this.attendanceList);

  constructor() {}

  // Observable Hooks
  getMembers(): Observable<Member[]> {
    return this.membersSubject.asObservable();
  }

  getSubscriptionPlans(): Observable<SubscriptionPlan[]> {
    return this.plansSubject.asObservable();
  }

  getPayments(): Observable<Payment[]> {
    return this.paymentsSubject.asObservable();
  }

  getAttendance(): Observable<AttendanceRecord[]> {
    return this.attendanceSubject.asObservable();
  }

  // --- ACTIONS ---

  // Add Member
  addMember(newMember: Omit<Member, 'id' | 'joinDate' | 'avatar'>): void {
    const id = `MEM-00${this.membersList.length + 1}`;
    const joinDate = new Date().toISOString().split('T')[0];
    const avatar = newMember.gender === 'Female' 
      ? `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 999999)}?w=150`
      : `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 999999)}?w=150`;

    const member: Member = {
      ...newMember,
      id,
      joinDate,
      avatar: avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'
    };

    this.membersList = [member, ...this.membersList];
    this.membersSubject.next(this.membersList);

    // Automatically create a matching first payment record for them
    const matchingPlan = this.plansList.find(p => p.name === member.plan);
    this.addPayment({
      memberName: member.name,
      amount: matchingPlan ? matchingPlan.price : 29.99,
      status: 'Paid',
      paymentMethod: 'Credit Card'
    });

    // Update Plan Stats counter
    if (matchingPlan) {
      this.plansList = this.plansList.map(p => 
        p.id === matchingPlan.id ? { ...p, totalSubscribed: p.totalSubscribed + 1 } : p
      );
      this.plansSubject.next(this.plansList);
    }
  }

  // Edit Subscription Plan Price
  updatePlanPrice(planId: string, newPrice: number): void {
    this.plansList = this.plansList.map(p => 
      p.id === planId ? { ...p, price: newPrice } : p
    );
    this.plansSubject.next(this.plansList);
  }

  // Add Payment transaction
  addPayment(payment: Omit<Payment, 'id' | 'date'>): void {
    const id = `INV-${1025 + this.paymentsList.length}`;
    const date = new Date().toISOString().split('T')[0];
    
    const newPayment: Payment = {
      ...payment,
      id,
      date
    };

    this.paymentsList = [newPayment, ...this.paymentsList];
    this.paymentsSubject.next(this.paymentsList);
  }

  // Attendance check-in
  checkInMember(memberId: string): boolean {
    const member = this.membersList.find(m => m.id === memberId);
    if (!member) return false;

    // Check if already in-gym today
    const inGymRecord = this.attendanceList.find(a => a.memberId === memberId && a.status === 'In-Gym');
    if (inGymRecord) return false; // Already inside

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const date = new Date().toISOString().split('T')[0];

    const record: AttendanceRecord = {
      id: `ATT-${205 + this.attendanceList.length}`,
      memberId: member.id,
      memberName: member.name,
      avatar: member.avatar,
      timeIn: time,
      status: 'In-Gym',
      date
    };

    this.attendanceList = [record, ...this.attendanceList];
    this.attendanceSubject.next(this.attendanceList);
    return true;
  }

  // Attendance check-out
  checkOutMember(recordId: string): void {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    this.attendanceList = this.attendanceList.map(r => 
      r.id === recordId ? { ...r, timeOut: time, status: 'Checked-Out' as const } : r
    );
    this.attendanceSubject.next(this.attendanceList);
  }

  // Delete Member (in-memory)
  deleteMember(id: string): void {
    const member = this.membersList.find(m => m.id === id);
    if (member) {
      const plan = this.plansList.find(p => p.name === member.plan);
      if (plan && plan.totalSubscribed > 0) {
        this.plansList = this.plansList.map(p => 
          p.id === plan.id ? { ...p, totalSubscribed: p.totalSubscribed - 1 } : p
        );
        this.plansSubject.next(this.plansList);
      }
    }
    this.membersList = this.membersList.filter(m => m.id !== id);
    this.membersSubject.next(this.membersList);
  }
}
