// src/app/components/widgets/stats-card-widget/stats-card-widget.component.ts

import { Component, Input, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Widget } from '../../../models/widget.model';
import { BaseWidgetContent } from '../../../models/widget-content.interface';
import { WidgetApiService } from '../../../services/widget-api.service';
import { StatsData } from '../../../models/chart-data.interface';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-stats-card-widget',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="stats-card-widget" [style.background]="cardGradient">
      <div class="widget-header">
        <div class="icon-container">
          <svg class="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
          </svg>
        </div>
        <span class="data-source">JSON API</span>
      </div>
      
      <div class="main-stat">
        <div class="stat-value" [class.counting]="isCountingUp">{{ displayValue }}</div>
        <div class="stat-label">{{ widget.title }}</div>
      </div>
      
      <div class="trend-indicator">
        <div class="trend" [class.positive]="trendDirection === 'up'" [class.negative]="trendDirection === 'down'">
          <svg class="trend-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            @if (trendDirection === 'up') {
              <polyline points="23,6 13.5,15.5 8.5,10.5 1,18"/>
              <polyline points="17,6 23,6 23,12"/>
            } @else {
              <polyline points="23,18 13.5,8.5 8.5,13.5 1,6"/>
              <polyline points="17,18 23,18 23,12"/>
            }
          </svg>
          <span class="trend-text">
            {{ Math.abs(trendValue) }}% {{ trendDirection === 'up' ? 'increase' : 'decrease' }}
          </span>
        </div>
        <div class="time-period">vs last month</div>
      </div>
      
      <div class="mini-chart">
        <svg viewBox="0 0 100 20" class="sparkline">
          <polyline
            [attr.points]="sparklinePoints"
            fill="none"
            stroke="rgba(255,255,255,0.8)"
            stroke-width="1.5"/>
        </svg>
      </div>
    </div>
  `,
  styles: [`
    .stats-card-widget {
      height: 100%;
      display: flex;
      flex-direction: column;
      padding: 16px;
      border-radius: 12px;
      color: white;
      position: relative;
      overflow: hidden;
    }

    .stats-card-widget::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%);
      pointer-events: none;
    }

    .widget-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }

    .icon-container {
      width: 24px;
      height: 24px;
      background: rgba(255,255,255,0.2);
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .stat-icon {
      width: 14px;
      height: 14px;
      color: white;
    }

    .data-source {
      background: rgba(255,255,255,0.2);
      color: white;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 10px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .main-stat {
      margin-bottom: 16px;
    }

    .stat-value {
      font-size: 32px;
      font-weight: 800;
      line-height: 1;
      margin-bottom: 4px;
      text-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .stat-value.counting {
      animation: pulse 0.5s ease-in-out;
    }

    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }

    .stat-label {
      font-size: 12px;
      opacity: 0.9;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .trend-indicator {
      margin-bottom: 16px;
    }

    .trend {
      display: flex;
      align-items: center;
      gap: 4px;
      margin-bottom: 2px;
    }

    .trend.positive {
      color: #4ade80;
    }

    .trend.negative {
      color: #f87171;
    }

    .trend-icon {
      width: 12px;
      height: 12px;
    }

    .trend-text {
      font-size: 11px;
      font-weight: 600;
    }

    .time-period {
      font-size: 10px;
      opacity: 0.7;
    }

    .mini-chart {
      flex: 1;
      display: flex;
      align-items: end;
    }

    .sparkline {
      width: 100%;
      height: 20px;
      opacity: 0.8;
    }
  `]
})
export class StatsCardWidgetComponent extends BaseWidgetContent implements OnInit, OnDestroy {
  @Input() widget!: Widget;
  
  private widgetApiService = inject(WidgetApiService);
  private subscription?: Subscription;
  
  displayValue = 0;
  targetValue = 0;
  trendValue = 0;
  trendDirection: 'up' | 'down' = 'up';
  isCountingUp = false;
  statsTitle = 'Metric';
  unit = '';
  
  isLoading = signal(true);
  error = signal<string | null>(null);

  // Protected property to expose Math to template
  protected Math = Math;

  sparklineData = [45, 52, 48, 61, 55, 67, 69, 63, 58, 72, 75, 68];

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  get cardGradient(): string {
    const gradients = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
    ];
    
    const hash = this.widget.id.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    return gradients[Math.abs(hash) % gradients.length];
  }

  get sparklinePoints(): string {
    const width = 100;
    const height = 20;
    const max = Math.max(...this.sparklineData);
    const min = Math.min(...this.sparklineData);
    const range = max - min || 1;

    return this.sparklineData
      .map((value, index) => {
        const x = (index / (this.sparklineData.length - 1)) * width;
        const y = height - ((value - min) / range) * height;
        return `${x},${y}`;
      })
      .join(' ');
  }

  ngOnInit() {
    this.loadStatsData();
  }

  private loadStatsData(): void {
    this.isLoading.set(true);
    this.error.set(null);
    
    this.subscription = this.widgetApiService.fetchStatsData().subscribe({
      next: (data) => {
        this.targetValue = data.value;
        this.trendValue = data.trend;
        this.trendDirection = data.trendDirection;
        this.statsTitle = data.title;
        this.unit = data.unit;
        this.isLoading.set(false);
        this.animateValue();
      },
      error: (err) => {
        console.error('Failed to load stats data:', err);
        this.error.set('Failed to load stats data');
        this.isLoading.set(false);
        // Use fallback data
        this.targetValue = 1234;
        this.trendValue = 5.2;
        this.trendDirection = 'up';
        this.statsTitle = 'Sample Metric';
        this.unit = 'units';
        this.animateValue();
      }
    });
  }

  private animateValue() {
    this.isCountingUp = true;
    const duration = 1500;
    const start = Date.now();
    const startValue = 0;

    const animate = () => {
      const now = Date.now();
      const progress = Math.min((now - start) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      
      this.displayValue = Math.floor(startValue + (this.targetValue - startValue) * easeOut);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        this.isCountingUp = false;
      }
    };

    requestAnimationFrame(animate);
  }

  refresh(): void {
    console.log('Refreshing stats card widget:', this.widget?.title);
    this.loadStatsData();
  }
}