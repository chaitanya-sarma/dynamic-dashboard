// src/app/components/notification-toast/notification-toast.component.ts

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../services/notification.service';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-notification-toast',
  standalone: true,
  imports: [CommonModule, ConfirmDialogComponent],
  templateUrl: './notification-toast.component.html',
  styleUrls: ['./notification-toast.component.css']
})
export class NotificationToastComponent {
  private notificationService = inject(NotificationService);
  
  notifications = this.notificationService.notifications;
  confirmDialog = this.notificationService.confirmDialog;
  
  close(id: string): void {
    this.notificationService.remove(id);
  }
  
  onConfirmResult(result: boolean): void {
    this.notificationService.resolveConfirm(result);
  }
}

