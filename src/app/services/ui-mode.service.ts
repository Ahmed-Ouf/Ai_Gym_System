import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type UiMode = 'simple' | 'standard';

@Injectable({
  providedIn: 'root'
})
export class UiModeService {
  private readonly STORAGE_KEY = 'gym.uiMode';
  private modeSubject: BehaviorSubject<UiMode>;
  public mode$: Observable<UiMode>;

  constructor() {
    let initialMode: UiMode = 'simple'; // Default mode is Simple Mode per requirements
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved === 'standard' || saved === 'simple') {
        initialMode = saved as UiMode;
      } else {
        // Save default choice
        localStorage.setItem(this.STORAGE_KEY, 'simple');
      }
    } catch (e) {
      initialMode = 'simple';
    }

    this.modeSubject = new BehaviorSubject<UiMode>(initialMode);
    this.mode$ = this.modeSubject.asObservable();
  }

  get currentMode(): UiMode {
    return this.modeSubject.value;
  }

  isSimpleMode(): boolean {
    return this.modeSubject.value === 'simple';
  }

  setMode(mode: UiMode): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, mode);
    } catch (e) {
      console.error('Error saving UI mode to localStorage:', e);
    }
    this.modeSubject.next(mode);
  }

  toggleMode(): void {
    const nextMode: UiMode = this.currentMode === 'simple' ? 'standard' : 'simple';
    this.setMode(nextMode);
  }
}

