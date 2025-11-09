// src/app/app.component.ts

import { Component, inject } from '@angular/core';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { DashboardService } from './services/dashboard.service';
import { NotificationService } from './services/notification.service';
import { NotificationToastComponent } from './components/notification-toast/notification-toast.component';
import { APP_CONFIG } from './config/app.config';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [DashboardComponent, NotificationToastComponent],
  template: `
    <app-dashboard
      (exportLayout)="handleExportLayout()"
      (importLayout)="handleImportLayout($event)"
      (resetLayout)="handleResetLayout()">
    </app-dashboard>
    <app-notification-toast></app-notification-toast>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class AppComponent {
  title = APP_CONFIG.name;
  
  private dashboardService = inject(DashboardService);
  private notificationService = inject(NotificationService);
  
  /**
   * Global Action: Export Layout
   * Handles file download operation
   */
  handleExportLayout(): void {
    const config = this.dashboardService.exportConfiguration();
    const blob = new Blob([config], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dashboard-layout-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
  
  /**
   * Global Action: Import Layout
   * Handles file upload and parsing
   */
  handleImportLayout(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    
    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      this.notificationService.error('File too large. Maximum size is 5MB.');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const config = e.target?.result as string;
        this.dashboardService.importConfiguration(config);
        this.notificationService.success('Layout imported successfully!');
      } catch (error) {
        this.notificationService.error('Failed to import layout. Invalid file format.');
      }
    };
    reader.readAsText(file);
    
    // Reset input
    input.value = '';
  }
  
  /**
   * Global Action: Reset Layout
   * Shows confirmation and resets to default
   */
  async handleResetLayout(): Promise<void> {
    const confirmed = await this.notificationService.confirm('Are you sure you want to reset the dashboard to default?');
    if (confirmed) {
      this.dashboardService.initializeSampleData();
      this.notificationService.success('Dashboard reset to default layout');
    }
  }
}
