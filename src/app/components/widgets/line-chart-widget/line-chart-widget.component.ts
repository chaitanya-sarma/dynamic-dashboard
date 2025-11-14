// src/app/components/widgets/line-chart-widget/line-chart-widget.component.ts

import { Component, Input, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Widget } from '../../../models/widget.model';
import { BaseWidgetContent } from '../../../models/widget-content.interface';
import { WidgetApiService } from '../../../services/widget-api.service';
import { LineChartDataPoint } from '../../../models/chart-data.interface';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-line-chart-widget',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="line-chart-widget">
      <div class="widget-header">
        <h4>{{ widget.title }}</h4>
        <div class="chart-controls">
          <span class="trend" [ngClass]="trendClass">
            <span class="trend-icon">{{ trendIcon }}</span>
            {{ trendValue }}%
          </span>
        </div>
      </div>
      
      <div class="chart-container">
        <svg class="line-chart" viewBox="0 0 200 80">
          <!-- Grid lines -->
          <g class="grid">
            <line *ngFor="let line of gridLines" 
                  [attr.x1]="line.x1" 
                  [attr.y1]="line.y1" 
                  [attr.x2]="line.x2" 
                  [attr.y2]="line.y2" 
                  stroke="#f1f5f9" 
                  stroke-width="0.5"/>
          </g>
          
          <!-- Data area fill -->
          <path [attr.d]="areaPath" 
                fill="url(#areaGradient)" 
                opacity="0.3"
                class="area-path"/>
          
          <!-- Data line -->
          <path [attr.d]="linePath" 
                stroke="url(#lineGradient)" 
                stroke-width="2" 
                fill="none" 
                stroke-linecap="round"
                stroke-linejoin="round"
                class="line-path"/>
          
          <!-- Data points -->
          <circle *ngFor="let point of chartPoints; let i = index" 
                  [attr.cx]="point.x" 
                  [attr.cy]="point.y" 
                  r="2" 
                  fill="white" 
                  stroke="#3b82f6" 
                  stroke-width="2"
                  class="data-point"
                  [style.animation-delay]="(i * 0.1) + 's'"/>
          
          <!-- Gradients -->
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#3b82f6"/>
              <stop offset="100%" stop-color="#8b5cf6"/>
            </linearGradient>
            <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.3"/>
              <stop offset="100%" stop-color="#3b82f6" stop-opacity="0"/>
            </linearGradient>
          </defs>
        </svg>
        
        <!-- Chart labels -->
        <div class="chart-labels">
          <div class="x-labels">
            <span *ngFor="let label of xLabels" class="x-label">{{ label }}</span>
          </div>
        </div>
      </div>
      
      <!-- Chart stats -->
      <div class="chart-stats">
        <div class="stat-item">
          <span class="stat-label">Min</span>
          <span class="stat-value">{{ minValue }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Avg</span>
          <span class="stat-value">{{ avgValue }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Max</span>
          <span class="stat-value">{{ maxValue }}</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .line-chart-widget {
      height: 100%;
      display: flex;
      flex-direction: column;
      padding: 12px;
      background: white;
      border-radius: 8px;
      overflow: hidden;
    }

    .widget-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .widget-header h4 {
      margin: 0;
      font-size: 13px;
      font-weight: 600;
      color: #1f2937;
    }

    .trend {
      display: flex;
      align-items: center;
      gap: 2px;
      font-size: 10px;
      font-weight: 500;
      padding: 2px 6px;
      border-radius: 10px;
    }

    .trend.positive {
      color: #059669;
      background: #dcfce7;
    }

    .trend.negative {
      color: #dc2626;
      background: #fee2e2;
    }

    .trend-icon {
      font-size: 8px;
    }

    .chart-container {
      flex: 1;
      position: relative;
      display: flex;
      flex-direction: column;
    }

    .line-chart {
      width: 100%;
      height: 60px;
      margin-bottom: 4px;
    }

    .line-path {
      stroke-dasharray: 300;
      stroke-dashoffset: 300;
      animation: drawLine 1s ease-out forwards;
    }

    @keyframes drawLine {
      to {
        stroke-dashoffset: 0;
      }
    }

    .area-path {
      opacity: 0;
      animation: fadeInArea 0.5s ease-out 0.5s forwards;
    }

    @keyframes fadeInArea {
      to {
        opacity: 0.3;
      }
    }

    .data-point {
      opacity: 0;
      animation: fadeInPoint 0.3s ease-out 0.8s forwards;
    }

    @keyframes fadeInPoint {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    .chart-labels {
      margin-top: 2px;
    }

    .x-labels {
      display: flex;
      justify-content: space-between;
    }

    .x-label {
      font-size: 9px;
      color: #6b7280;
    }

    .chart-stats {
      display: flex;
      justify-content: space-between;
      padding-top: 8px;
      border-top: 1px solid #f1f5f9;
      margin-top: 8px;
    }

    .stat-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      flex: 1;
    }

    .stat-label {
      font-size: 9px;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 2px;
    }

    .stat-value {
      font-size: 11px;
      font-weight: 600;
      color: #111827;
    }
  `]
})
export class LineChartWidgetComponent extends BaseWidgetContent implements OnInit, OnDestroy {
  @Input() widget!: Widget;
  
  private widgetApiService = inject(WidgetApiService);
  private subscription?: Subscription;
  
  dataPoints = signal<LineChartDataPoint[]>([
    { x: 0, y: 0, label: 'Loading...' }
  ]);
  isLoading = signal(true);
  error = signal<string | null>(null);

  chartPoints: { x: number; y: number }[] = [];
  linePath = '';
  areaPath = '';
  gridLines: { x1: number; y1: number; x2: number; y2: number }[] = [];
  xLabels: string[] = [];
  
  minValue = 0;
  maxValue = 0;
  avgValue = 0;
  trendValue = 0;
  trendClass = '';
  trendIcon = '';

  ngOnInit() {
    this.loadChartData();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  private loadChartData(): void {
    this.isLoading.set(true);
    this.error.set(null);
    
    this.subscription = this.widgetApiService.fetchLineChartData().subscribe({
      next: (data) => {
        this.dataPoints.set(data);
        this.isLoading.set(false);
        this.calculateStats();
        this.generateChartData();
        this.generatePaths();
        this.generateGridLines();
      },
      error: (err) => {
        console.error('Failed to load line chart data:', err);
        this.error.set('Failed to load chart data');
        this.isLoading.set(false);
        // Use fallback data
        const fallbackData = [
          { x: 0, y: 45, label: 'Jan' },
          { x: 1, y: 52, label: 'Feb' },
          { x: 2, y: 38, label: 'Mar' },
          { x: 3, y: 61, label: 'Apr' },
          { x: 4, y: 73, label: 'May' },
          { x: 5, y: 69, label: 'Jun' },
          { x: 6, y: 84, label: 'Jul' }
        ];
        this.dataPoints.set(fallbackData);
        this.calculateStats();
        this.generateChartData();
        this.generatePaths();
        this.generateGridLines();
      }
    });
  }

  private calculateStats() {
    const values = this.dataPoints().map(p => p.y);
    this.minValue = Math.min(...values);
    this.maxValue = Math.max(...values);
    this.avgValue = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
    
    // Calculate trend
    const firstValue = values[0];
    const lastValue = values[values.length - 1];
    this.trendValue = Math.round(((lastValue - firstValue) / firstValue) * 100);
    
    if (this.trendValue > 0) {
      this.trendClass = 'positive';
      this.trendIcon = '↗';
    } else {
      this.trendClass = 'negative';
      this.trendIcon = '↘';
    }
    
    this.xLabels = this.dataPoints().map(p => p.label);
  }

  private generateChartData() {
    const width = 200;
    const height = 80;
    const padding = 10;
    
    const dataPoints = this.dataPoints();
    const xStep = (width - 2 * padding) / (dataPoints.length - 1);
    const yMin = Math.min(...dataPoints.map(p => p.y));
    const yMax = Math.max(...dataPoints.map(p => p.y));
    const yRange = yMax - yMin || 1;
    
    this.chartPoints = dataPoints.map((point, index) => ({
      x: padding + index * xStep,
      y: height - padding - ((point.y - yMin) / yRange) * (height - 2 * padding)
    }));
  }

  private generatePaths() {
    if (this.chartPoints.length === 0) return;
    
    // Line path
    this.linePath = `M ${this.chartPoints[0].x} ${this.chartPoints[0].y}`;
    for (let i = 1; i < this.chartPoints.length; i++) {
      this.linePath += ` L ${this.chartPoints[i].x} ${this.chartPoints[i].y}`;
    }
    
    // Area path
    this.areaPath = this.linePath;
    this.areaPath += ` L ${this.chartPoints[this.chartPoints.length - 1].x} 70`;
    this.areaPath += ` L ${this.chartPoints[0].x} 70 Z`;
  }

  private generateGridLines() {
    // Horizontal grid lines
    for (let i = 1; i < 4; i++) {
      const y = (80 / 4) * i;
      this.gridLines.push({
        x1: 10,
        y1: y,
        x2: 190,
        y2: y
      });
    }
  }

  refresh(): void {
    console.log('Refreshing line chart widget:', this.widget?.title);
    this.loadChartData();
  }
}