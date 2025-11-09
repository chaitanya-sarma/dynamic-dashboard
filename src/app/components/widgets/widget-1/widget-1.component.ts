// src/app/components/widgets/widget-1/widget-1.component.ts

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseWidgetContent } from '../../../models/widget-content.interface';

@Component({
  selector: 'app-widget-1',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './widget-1.component.html',
  styleUrls: ['./widget-1.component.css']
})
export class Widget1Component extends BaseWidgetContent {
  // Simple data - no network calls
  metrics = [
    { label: 'Users', value: '1,234', change: '+12%', positive: true },
    { label: 'Revenue', value: '$45.6K', change: '+8%', positive: true },
    { label: 'Sessions', value: '8,921', change: '-3%', positive: false }
  ];

  chartBars = [
    { height: 60, label: 'Mon' },
    { height: 80, label: 'Tue' },
    { height: 45, label: 'Wed' },
    { height: 90, label: 'Thu' },
    { height: 70, label: 'Fri' }
  ];
  
  /**
   * Refresh widget - generate new random data
   */
  refresh(): void {
    // Simulate refresh by generating new random data
    this.metrics = this.metrics.map(m => ({
      ...m,
      value: this.randomValue(m.label),
      change: this.randomChange(),
      positive: Math.random() > 0.3
    }));
    
    this.chartBars = this.chartBars.map(bar => ({
      ...bar,
      height: Math.floor(Math.random() * 60) + 30
    }));
  }
  
  private randomValue(label: string): string {
    if (label === 'Users') return Math.floor(Math.random() * 9000 + 1000).toLocaleString();
    if (label === 'Revenue') return `$${Math.floor(Math.random() * 90 + 10)}K`;
    return Math.floor(Math.random() * 15000 + 5000).toLocaleString();
  }
  
  private randomChange(): string {
    const change = Math.floor(Math.random() * 50) - 20;
    return `${change > 0 ? '+' : ''}${change}%`;
  }
}

