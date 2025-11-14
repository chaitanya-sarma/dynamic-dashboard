// src/app/components/dashboard-header/dashboard-header.component.ts

import { Component, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { APP_CONFIG } from '../../config/app.config';

@Component({
  selector: 'app-dashboard-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-header.component.html',
  styleUrls: ['./dashboard-header.component.css']
})
export class DashboardHeaderComponent {
  // Version from centralized app config
  readonly version = `v${APP_CONFIG.version}`;
  
  @Input() widgetCount = 0;
  @Input() showGrid = false;
  @Input() isLoading = false;
  
  @Output() addWidget = new EventEmitter<void>();
  @Output() toggleGrid = new EventEmitter<void>();
  @Output() refreshWidgets = new EventEmitter<void>();
  @Output() exportLayout = new EventEmitter<void>();
  @Output() importFile = new EventEmitter<Event>();
  @Output() resetLayout = new EventEmitter<void>();
  
  onImportFile(event: Event): void {
    this.importFile.emit(event);
  }
}

