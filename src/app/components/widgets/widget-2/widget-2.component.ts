// src/app/components/widgets/widget-2/widget-2.component.ts

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseWidgetContent } from '../../../models/widget-content.interface';

@Component({
  selector: 'app-widget-2',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './widget-2.component.html',
  styleUrls: ['./widget-2.component.css']
})
export class Widget2Component extends BaseWidgetContent {
  // Simple static content
  title = 'Welcome to Widget 2';
  description = 'This is a simple text widget that displays static content.';
  lastRefreshed = new Date();
  refreshCount = 0;
  
  features = [
    'Easy to understand',
    'No complex logic',
    'Just displays text',
    'Perfect for announcements'
  ];
  
  /**
   * Refresh widget - update timestamp and count
   */
  refresh(): void {
    this.lastRefreshed = new Date();
    this.refreshCount++;
  }
}

