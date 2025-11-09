// src/app/services/notification.service.ts

import { Injectable, signal } from '@angular/core';

export interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

export interface ConfirmDialog {
  id: string;
  message: string;
  resolver: (value: boolean) => void;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationsSignal = signal<Notification[]>([]);
  private confirmDialogSignal = signal<ConfirmDialog | null>(null);
  
  // Public readonly signals
  notifications = this.notificationsSignal.asReadonly();
  confirmDialog = this.confirmDialogSignal.asReadonly();
  
  /**
   * Show a success notification
   */
  success(message: string, duration: number = 3000): void {
    this.addNotification(message, 'success', duration);
  }
  
  /**
   * Show an error notification
   */
  error(message: string, duration: number = 5000): void {
    this.addNotification(message, 'error', duration);
  }
  
  /**
   * Show an info notification
   */
  info(message: string, duration: number = 3000): void {
    this.addNotification(message, 'info', duration);
  }
  
  /**
   * Show a warning notification
   */
  warning(message: string, duration: number = 4000): void {
    this.addNotification(message, 'warning', duration);
  }
  
  /**
   * Show a confirmation dialog (returns promise)
   */
  confirm(message: string): Promise<boolean> {
    return new Promise((resolve) => {
      const dialog: ConfirmDialog = {
        id: Date.now().toString(),
        message,
        resolver: resolve
      };
      this.confirmDialogSignal.set(dialog);
    });
  }
  
  /**
   * Resolve confirmation dialog
   */
  resolveConfirm(result: boolean): void {
    const dialog = this.confirmDialogSignal();
    if (dialog) {
      dialog.resolver(result);
      this.confirmDialogSignal.set(null);
    }
  }
  
  /**
   * Remove a notification by ID
   */
  remove(id: string): void {
    const notifications = this.notificationsSignal();
    this.notificationsSignal.set(notifications.filter(n => n.id !== id));
  }
  
  /**
   * Add a notification and auto-remove after duration
   */
  private addNotification(message: string, type: Notification['type'], duration: number): void {
    const notification: Notification = {
      id: Date.now().toString(),
      message,
      type,
      duration
    };
    
    const notifications = this.notificationsSignal();
    this.notificationsSignal.set([...notifications, notification]);
    
    // Auto-remove after duration
    if (duration > 0) {
      setTimeout(() => {
        this.remove(notification.id);
      }, duration);
    }
  }
}

