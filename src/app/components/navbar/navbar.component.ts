import { Component, Output, EventEmitter, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { GymDataService } from '../../services/gym-data.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit, OnDestroy {
  @Input() sidebarCollapsed: boolean = false;
  @Output() toggleSidebar = new EventEmitter<void>();
  @Output() toggleMobileSidebar = new EventEmitter<void>();

  currentTime: string = '';
  private timeInterval: any;
  showProfileMenu: boolean = false;
  expiringCount: number = 0;

  constructor(public gymService: GymDataService) {}

  ngOnInit(): void {
    this.updateTime();
    this.timeInterval = setInterval(() => this.updateTime(), 30000);

    // Watch subscriptions for expiring alert count
    this.gymService.subscriptions$.subscribe(() => {
      this.expiringCount = this.gymService.getExpiringSubscriptions(7).length;
    });
  }

  ngOnDestroy(): void {
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
    }
  }

  updateTime(): void {
    try {
      const options: Intl.DateTimeFormatOptions = { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'short', 
        hour: '2-digit', 
        minute: '2-digit' 
      };
      this.currentTime = new Intl.DateTimeFormat('ar-EG', options).format(new Date());
    } catch {
      this.currentTime = new Date().toLocaleTimeString('ar-EG');
    }
  }

  onToggleSidebar(): void {
    this.toggleSidebar.emit();
  }

  onToggleMobileSidebar(): void {
    this.toggleMobileSidebar.emit();
  }

  toggleProfileDropdown(): void {
    this.showProfileMenu = !this.showProfileMenu;
  }
}
