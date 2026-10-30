import { Routes } from '@angular/router';
import { LayoutComponent } from './components/layout/layout.component';
import { SimpleLayoutComponent } from './simple/layout/simple-layout.component';
import { rootModeGuard } from './guards/mode.guard';

export const routes: Routes = [
  // 1. Root redirect based on active UI Mode (defaults to Simple Mode)
  {
    path: '',
    pathMatch: 'full',
    canActivate: [rootModeGuard],
    children: []
  },

  // 2. Simple Mode Layout & Guided Pages
  {
    path: 'simple',
    component: SimpleLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () => import('./simple/pages/simple-home/simple-home.component').then(m => m.SimpleHomeComponent)
      },
      {
        path: 'checkin',
        loadComponent: () => import('./simple/pages/simple-checkin/simple-checkin.component').then(m => m.SimpleCheckinComponent)
      },
      {
        path: 'new-member',
        loadComponent: () => import('./simple/pages/simple-new-member/simple-new-member.component').then(m => m.SimpleNewMemberComponent)
      },
      {
        path: 'new-subscription',
        loadComponent: () => import('./simple/pages/simple-new-sub/simple-new-sub.component').then(m => m.SimpleNewSubComponent)
      },
      {
        path: 'renew',
        loadComponent: () => import('./simple/pages/simple-renew/simple-renew.component').then(m => m.SimpleRenewComponent)
      },
      {
        path: 'payment',
        loadComponent: () => import('./simple/pages/simple-payment/simple-payment.component').then(m => m.SimplePaymentComponent)
      }
    ]
  },

  // 3. Standard Mode Layout & Comprehensive Views
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'members',
        loadComponent: () => import('./pages/members/members.component').then(m => m.MembersComponent)
      },
      {
        path: 'subscriptions',
        loadComponent: () => import('./pages/subscriptions/subscriptions.component').then(m => m.SubscriptionsComponent)
      },
      {
        path: 'payments',
        loadComponent: () => import('./pages/payments/payments.component').then(m => m.PaymentsComponent)
      },
      {
        path: 'attendance',
        loadComponent: () => import('./pages/attendance/attendance.component').then(m => m.AttendanceComponent)
      },
      {
        path: 'admin',
        loadComponent: () => import('./pages/admin/admin.component').then(m => m.AdminComponent)
      }
    ]
  },

  // 4. Wildcard fallback
  {
    path: '**',
    redirectTo: ''
  }
];
