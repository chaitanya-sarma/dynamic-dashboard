// src/app/components/widgets/bar-chart-widget/bar-chart-widget.component.ts

import { Component, Input, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Widget } from '../../../models/widget.model';
import { BaseWidgetContent } from '../../../models/widget-content.interface';
import { WidgetApiService } from '../../../services/widget-api.service';
import { BarChartData } from '../../../models/chart-data.interface';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-bar-chart-widget',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bar-chart-widget">
      <div class="widget-header">
        <h3>{{ widget.title }}</h3>
        <span class="data-source">Countries API</span>
      </div>
      
      <div class="chart-container">
        <div class="chart-area">
          <div class="y-axis">
            @for (tick of yAxisTicks; track tick) {
              <div class="y-tick">{{ tick }}</div>
            }
          </div>
          
          <div class="bars-container">
            @for (item of chartData(); track item.label; let i = $index) {
              <div class="bar-column">
                <div 
                  class="bar"
                  [style.height.%]="getBarHeight(item.value)"
                  [style.background-color]="item.color"
                  [style.animation-delay]="i * 0.1 + 's'">
                  <div class="bar-value">{{ item.value }}</div>
                </div>
                <div class="bar-label">{{ item.label }}</div>
              </div>
            }
          </div>
        </div>
        
        <div class="chart-stats">
          <div class="stat-item">
            <span class="stat-label">Max</span>
            <span class="stat-value">{{ maxValue }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Avg</span>
            <span class="stat-value">{{ avgValue }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Total</span>
            <span class="stat-value">{{ totalValue }}</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .bar-chart-widget {
      height: 100%;
      display: flex;
      flex-direction: column;
      padding: 16px;
      background: white;
      border-radius: 8px;
      overflow: hidden;
    }

    .widget-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .widget-header h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: #1f2937;
    }

    .data-source {
      background: #ef4444;
      color: white;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 500;
    }

    .chart-container {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .chart-area {
      flex: 1;
      display: flex;
      align-items: stretch;
      gap: 8px;
    }

    .y-axis {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      width: 30px;
      padding-right: 8px;
    }

    .y-tick {
      font-size: 10px;
      color: #6b7280;
      text-align: right;
    }

    .bars-container {
      flex: 1;
      display: flex;
      align-items: end;
      gap: 8px;
      padding-bottom: 20px;
      border-bottom: 1px solid #e5e7eb;
      border-left: 1px solid #e5e7eb;
      padding-left: 8px;
    }

    .bar-column {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      height: 100%;
    }

    .bar {
      width: 100%;
      min-height: 4px;
      border-radius: 2px 2px 0 0;
      position: relative;
      display: flex;
      align-items: end;
      justify-content: center;
      opacity: 0;
      animation: growBar 0.4s ease-out forwards;
      background: linear-gradient(to top, currentColor, color-mix(in srgb, currentColor 80%, white));
    }

    @keyframes growBar {
      from {
        opacity: 0;
        transform: scaleY(0);
      }
      to {
        opacity: 1;
        transform: scaleY(1);
      }
    }

    .bar-value {
      position: absolute;
      top: -20px;
      font-size: 10px;
      font-weight: 600;
      color: #374151;
      background: white;
      padding: 2px 4px;
      border-radius: 2px;
      box-shadow: 0 1px 2px rgba(0,0,0,0.1);
    }

    .bar-label {
      margin-top: 8px;
      font-size: 11px;
      color: #6b7280;
      text-align: center;
      font-weight: 500;
    }

    .chart-stats {
      display: flex;
      justify-content: space-around;
      padding: 12px;
      background: #f8fafc;
      border-radius: 6px;
    }

    .stat-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
    }

    .stat-label {
      font-size: 10px;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .stat-value {
      font-size: 14px;
      font-weight: 700;
      color: #111827;
    }
  `]
})
export class BarChartWidgetComponent extends BaseWidgetContent implements OnInit, OnDestroy {
  @Input() widget!: Widget;
  
  private widgetApiService = inject(WidgetApiService);
  private subscription?: Subscription;
  
  chartData = signal<BarChartData[]>([
    { label: 'Loading...', value: 100, color: '#e5e7eb' }
  ]);
  isLoading = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadChartData();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  private loadChartData(): void {
    this.isLoading.set(true);
    this.error.set(null);
    
    this.subscription = this.widgetApiService.fetchBarChartData().subscribe({
      next: (data) => {
        this.chartData.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load bar chart data:', err);
        this.error.set('Failed to load chart data');
        this.isLoading.set(false);
        // Use fallback data
        this.chartData.set([
          { label: 'Q1', value: 65, color: '#3b82f6' },
          { label: 'Q2', value: 78, color: '#10b981' },
          { label: 'Q3', value: 52, color: '#f59e0b' },
          { label: 'Q4', value: 91, color: '#ef4444' }
        ]);
      }
    });
  }

  get maxValue(): number {
    return Math.max(...this.chartData().map(item => item.value));
  }

  get avgValue(): number {
    const data = this.chartData();
    const avg = data.reduce((sum, item) => sum + item.value, 0) / data.length;
    return Math.round(avg);
  }

  get totalValue(): number {
    return this.chartData().reduce((sum, item) => sum + item.value, 0);
  }

  get yAxisTicks(): number[] {
    const max = this.maxValue;
    const step = Math.ceil(max / 4);
    return [0, step, step * 2, step * 3, max].reverse();
  }

  getBarHeight(value: number): number {
    return (value / this.maxValue) * 100;
  }

  refresh(): void {
    console.log('Refreshing bar chart widget:', this.widget?.title);
    this.loadChartData();
  }
}