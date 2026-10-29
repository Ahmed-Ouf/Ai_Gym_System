import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface NavItem {
  label: string;
  route: string;
  icon: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  @Input() collapsed: boolean = false;
  @Input() mobileActive: boolean = false;
  @Output() closeMobile = new EventEmitter<void>();

  navItems: NavItem[] = [
    { label: 'لوحة التحكم', route: '/dashboard', icon: 'pi pi-th-large' },
    { label: 'إدارة الأعضاء', route: '/members', icon: 'pi pi-users' },
    { label: 'الاشتراكات والمدفوعات', route: '/subscriptions', icon: 'pi pi-ticket' },
    { label: 'تسجيل الحضور', route: '/attendance', icon: 'pi pi-clock' },
    { label: 'الإدارة والإعدادات', route: '/admin', icon: 'pi pi-cog' }
  ];

  onMobileClose(): void {
    this.closeMobile.emit();
  }
}
