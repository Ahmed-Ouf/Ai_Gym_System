import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GymDataService } from '../../services/gym-data.service';
import { Game, TrainingType } from '../../models/gym.models';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    DialogModule,
    InputTextModule,
    ButtonModule,
    DropdownModule
  ],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {
  games: Game[] = [];
  trainingTypes: TrainingType[] = [];

  // Game Dialog
  showGameDialog = false;
  editingGame: Game | null = null;
  gameName = '';
  gamePrice = 400;

  // Training Type Dialog
  showTypeDialog = false;
  selectedGameIdForType = '';
  trainingTypeName = '';

  // Filter for training types
  filterGameId = 'ALL';

  // Notification message
  feedbackMessage: string | null = null;
  feedbackType: 'success' | 'error' = 'success';

  constructor(public gymService: GymDataService) {}

  ngOnInit(): void {
    this.gymService.games$.subscribe(data => (this.games = data));
    this.gymService.trainingTypes$.subscribe(data => (this.trainingTypes = data));
  }

  get filteredTrainingTypes(): TrainingType[] {
    if (this.filterGameId === 'ALL') {
      return this.trainingTypes;
    }
    return this.trainingTypes.filter(t => t.gameId === this.filterGameId);
  }

  getGameName(gameId: string): string {
    const g = this.games.find(item => item.id === gameId);
    return g ? g.name : 'غير محدد';
  }

  // Game Operations
  openAddGame(): void {
    this.editingGame = null;
    this.gameName = '';
    this.gamePrice = 400;
    this.showGameDialog = true;
  }

  openEditGame(game: Game): void {
    this.editingGame = game;
    this.gameName = game.name;
    this.gamePrice = game.defaultPrice;
    this.showGameDialog = true;
  }

  saveGame(): void {
    if (!this.gameName.trim()) {
      this.showFeedback('يرجى كتابة اسم اللعبة أو النشاط', 'error');
      return;
    }

    if (this.editingGame) {
      this.gymService.updateGame(this.editingGame.id, this.gameName, this.gamePrice);
      this.showFeedback('تم تحديث بيانات اللعبة بنجاح!', 'success');
    } else {
      this.gymService.addGame(this.gameName, this.gamePrice);
      this.showFeedback('تم إضافة اللعبة بنجاح!', 'success');
    }
    this.showGameDialog = false;
  }

  toggleArchiveGame(gameId: string): void {
    this.gymService.toggleArchiveGame(gameId);
    this.showFeedback('تم تغيير حالة أرشفة اللعبة!', 'success');
  }

  // Training Type Operations
  openAddTrainingType(): void {
    this.selectedGameIdForType = this.games.length > 0 ? this.games[0].id : '';
    this.trainingTypeName = '';
    this.showTypeDialog = true;
  }

  saveTrainingType(): void {
    if (!this.trainingTypeName.trim() || !this.selectedGameIdForType) {
      this.showFeedback('يرجى إدخال اسم التمرين واختيار اللعبة', 'error');
      return;
    }

    this.gymService.addTrainingType(this.selectedGameIdForType, this.trainingTypeName);
    this.showFeedback('تم إضافة نوع التمرين بنجاح!', 'success');
    this.showTypeDialog = false;
  }

  deleteTrainingType(typeId: string): void {
    if (confirm('هل أنت متأكد من حذف هذا التمرين؟')) {
      this.gymService.deleteTrainingType(typeId);
      this.showFeedback('تم حذف نوع التمرين بنجاح!', 'success');
    }
  }

  // Backup & Restore
  exportBackup(): void {
    this.gymService.exportDatabaseToJson();
    this.showFeedback('تم تحميل ملف النسخة الاحتياطية بنجاح!', 'success');
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        const content = reader.result as string;
        const result = this.gymService.importDatabaseFromJson(content);
        if (result.success) {
          this.showFeedback(result.message, 'success');
        } else {
          this.showFeedback(result.message, 'error');
        }
      };
      reader.readAsText(file);
    }
  }

  resetDemo(): void {
    if (confirm('تحذير: سيتم استبدال جميع البيانات الحالية بالبيانات التجريبية الافتراضية. هل تريد المتابعة؟')) {
      this.gymService.resetToDemoData();
      this.showFeedback('تم إعادة تعيين قاعدة البيانات بنجاح!', 'success');
    }
  }

  private showFeedback(msg: string, type: 'success' | 'error'): void {
    this.feedbackMessage = msg;
    this.feedbackType = type;
    setTimeout(() => {
      this.feedbackMessage = null;
    }, 4000);
  }
}
