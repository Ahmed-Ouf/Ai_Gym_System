import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { UiModeService } from '../../services/ui-mode.service';

@Component({
  selector: 'app-simple-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink],
  templateUrl: './simple-layout.component.html',
  styleUrls: ['./simple-layout.component.scss']
})
export class SimpleLayoutComponent implements OnInit, OnDestroy {
  currentTime: string = '';
  private timer: any;
  showProfileMenu: boolean = false;

  constructor(
    public uiModeService: UiModeService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.updateClock();
    this.timer = setInterval(() => this.updateClock(), 30000);
  }

  ngOnDestroy(): void {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  updateClock(): void {
    try {
      const options: Intl.DateTimeFormatOptions = { 
        weekday: 'short', 
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

  toggleProfileMenu(): void {
    this.showProfileMenu = !this.showProfileMenu;
  }

  switchToStandardMode(): void {
    this.showProfileMenu = false;
    this.uiModeService.setMode('standard');
    this.router.navigate(['/dashboard']);
  }
}

