// src/app/components/widgets/pie-chart-widget/pie-chart-widget.component.ts

import { Component, Input, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Widget } from '../../../models/widget.model';
import { BaseWidgetContent } from '../../../models/widget-content.interface';
import { WidgetApiService } from '../../../services/widget-api.service';
import { PieChartData } from '../../../models/chart-data.interface';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-pie-chart-widget',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="pie-chart-widget">
      <div class="widget-header">
        <h3>{{ widget.title }}</h3>
        <span class="data-source">Crypto Market Cap</span>
      </div>
      
      <div class="chart-container">
        <div class="pie-chart">
          <svg viewBox="0 0 200 200" class="pie-svg">
            @for (segment of pieSegments; track segment.label; let i = $index) {
              <path 
                [attr.d]="segment.path"
                [attr.fill]="segment.color"
                [attr.stroke]="'white'"
                [attr.stroke-width]="2"
                class="pie-segment"
                [style.animation-delay]="i * 0.1 + 's'">
              </path>
            }
            <circle cx="100" cy="100" r="30" fill="white" class="pie-center"/>
            <text x="100" y="100" text-anchor="middle" dy="0.3em" class="center-text">
              {{ totalValue }}
            </text>
            <text x="100" y="115" text-anchor="middle" dy="0.3em" class="center-label">
              Total
            </text>
          </svg>
        </div>
        
        <div class="legend">
          @if (isLoading()) {
            <div class="loading-indicator">Loading data...</div>
          } @else if (error()) {
            <div class="error-indicator">{{ error() }}</div>
          } @else {
            @for (item of chartData(); track item.label) {
              <div class="legend-item">
                <div class="legend-color" [style.background-color]="item.color"></div>
                <span class="legend-label">{{ item.label }}</span>
                <span class="legend-value">{{ item.value }}B</span>
              </div>
            }
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .pie-chart-widget {
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
      background: #10b981;
      color: white;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 500;
    }

    .chart-container {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .pie-chart {
      flex-shrink: 0;
      width: 120px;
      height: 120px;
    }

    .pie-svg {
      width: 100%;
      height: 100%;
    }

    .pie-segment {
      opacity: 0;
      animation: fadeInSegment 0.3s ease-out forwards;
      transition: opacity 0.2s;
    }

    .pie-segment:hover {
      opacity: 0.8;
    }

    @keyframes fadeInSegment {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    .pie-center {
      filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
    }

    .center-text {
      font-size: 18px;
      font-weight: 700;
      fill: #1f2937;
    }

    .center-label {
      font-size: 10px;
      font-weight: 500;
      fill: #6b7280;
    }

    .legend {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 4px 0;
    }

    .legend-color {
      width: 12px;
      height: 12px;
      border-radius: 2px;
      flex-shrink: 0;
    }

    .legend-label {
      flex: 1;
      font-size: 12px;
      color: #4b5563;
    }

    .legend-value {
      font-size: 12px;
      font-weight: 600;
      color: #111827;
    }

    .loading-indicator {
      padding: 16px;
      text-align: center;
      color: #6b7280;
      font-size: 12px;
    }

    .error-indicator {
      padding: 16px;
      text-align: center;
      color: #ef4444;
      font-size: 12px;
    }
  `]
})
export class PieChartWidgetComponent extends BaseWidgetContent implements OnInit, OnDestroy {
  @Input() widget!: Widget;
  
  private widgetApiService = inject(WidgetApiService);
  private subscription?: Subscription;
  
  chartData = signal<PieChartData[]>([
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
    
    this.subscription = this.widgetApiService.fetchPieChartData().subscribe({
      next: (data) => {
        this.chartData.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load pie chart data:', err);
        this.error.set('Failed to load chart data');
        this.isLoading.set(false);
        // Keep fallback data on error
        this.chartData.set([
          { label: 'Desktop', value: 45, color: '#3b82f6' },
          { label: 'Mobile', value: 35, color: '#10b981' },
          { label: 'Tablet', value: 20, color: '#f59e0b' }
        ]);
      }
    });
  }

  get totalValue(): number {
    return this.chartData().reduce((sum, item) => sum + item.value, 0);
  }

  get pieSegments() {
    let currentAngle = -90; // Start from top
    const radius = 80;
    const centerX = 100;
    const centerY = 100;

    return this.chartData().map(item => {
      const angle = (item.value / this.totalValue) * 360;
      const startAngle = currentAngle;
      const endAngle = currentAngle + angle;
      
      const startAngleRad = (startAngle * Math.PI) / 180;
      const endAngleRad = (endAngle * Math.PI) / 180;
      
      const x1 = centerX + radius * Math.cos(startAngleRad);
      const y1 = centerY + radius * Math.sin(startAngleRad);
      const x2 = centerX + radius * Math.cos(endAngleRad);
      const y2 = centerY + radius * Math.sin(endAngleRad);
      
      const largeArcFlag = angle > 180 ? 1 : 0;
      
      const path = [
        `M ${centerX} ${centerY}`,
        `L ${x1} ${y1}`,
        `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
        'Z'
      ].join(' ');
      
      currentAngle += angle;
      
      return {
        path,
        color: item.color,
        label: item.label
      };
    });
  }

  refresh(): void {
    console.log('Refreshing pie chart widget:', this.widget?.title);
    this.loadChartData();
  }
}