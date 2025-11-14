// src/app/components/widgets/progress-ring-widget/progress-ring-widget.component.ts

import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Widget } from '../../../models/widget.model';
import { BaseWidgetContent } from '../../../models/widget-content.interface';

@Component({
  selector: 'app-progress-ring-widget',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="progress-ring-widget">
      <div class="widget-header">
        <h4>{{ widget.title }}</h4>
        <span class="status-dot" [class.active]="isActive"></span>
      </div>
      
      <div class="ring-container">
        <svg class="progress-ring" viewBox="0 0 120 120">
          <!-- Background circle -->
          <circle
            cx="60"
            cy="60"
            r="50"
            stroke="#e5e7eb"
            stroke-width="8"
            fill="none"/>
          
          <!-- Progress circle -->
          <circle
            cx="60"
            cy="60"
            r="50"
            stroke="url(#gradient)"
            stroke-width="8"
            fill="none"
            stroke-linecap="round"
            [style.stroke-dasharray]="circumference"
            [style.stroke-dashoffset]="strokeDashoffset"
            class="progress-circle"
            transform="rotate(-90 60 60)"/>
          
          <!-- Gradient definition -->
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" [attr.stop-color]="gradientStart"/>
              <stop offset="100%" [attr.stop-color]="gradientEnd"/>
            </linearGradient>
          </defs>
          
          <!-- Center content -->
          <text x="60" y="55" text-anchor="middle" class="progress-value">
            {{ displayProgress }}%
          </text>
          <text x="60" y="70" text-anchor="middle" class="progress-label">
            {{ progressLabel }}
          </text>
        </svg>
        
        <!-- Progress details -->
        <div class="progress-details">
          <div class="detail-item">
            <span class="detail-label">Current</span>
            <span class="detail-value">{{ currentValue }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Target</span>
            <span class="detail-value">{{ targetValue }}</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .progress-ring-widget {
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

    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #9ca3af;
      transition: all 0.3s ease;
    }

    .status-dot.active {
      background: #10b981;
      box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
    }

    .ring-container {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }

    .progress-ring {
      width: 80px;
      height: 80px;
      margin-bottom: 8px;
    }

    .progress-circle {
      transition: stroke-dashoffset 1s cubic-bezier(0.4, 0.0, 0.2, 1);
      animation: drawCircle 1s ease-out;
    }

    @keyframes drawCircle {
      from {
        stroke-dashoffset: 314;
      }
    }

    .progress-value {
      font-size: 16px;
      font-weight: 700;
      fill: #111827;
      animation: countUp 2s ease-out;
    }

    .progress-label {
      font-size: 8px;
      font-weight: 500;
      fill: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    @keyframes countUp {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .progress-details {
      display: flex;
      justify-content: space-between;
      width: 100%;
      gap: 8px;
    }

    .detail-item {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 4px;
      background: #f8fafc;
      border-radius: 4px;
    }

    .detail-label {
      font-size: 9px;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 2px;
    }

    .detail-value {
      font-size: 11px;
      font-weight: 600;
      color: #111827;
    }
  `]
})
export class ProgressRingWidgetComponent extends BaseWidgetContent implements OnInit {
  @Input() widget!: Widget;

  displayProgress = 0;
  actualProgress = 73;
  currentValue = 146;
  targetValue = 200;
  progressLabel = 'Complete';
  isActive = true;

  radius = 50;
  circumference = 2 * Math.PI * this.radius;

  get strokeDashoffset(): number {
    return this.circumference - (this.displayProgress / 100) * this.circumference;
  }

  get gradientStart(): string {
    return this.actualProgress > 80 ? '#10b981' : 
           this.actualProgress > 50 ? '#f59e0b' : '#ef4444';
  }

  get gradientEnd(): string {
    return this.actualProgress > 80 ? '#059669' : 
           this.actualProgress > 50 ? '#d97706' : '#dc2626';
  }

  ngOnInit() {
    this.animateProgress();
  }

  private animateProgress() {
    const duration = 1000;
    const start = Date.now();
    const startValue = 0;

    const animate = () => {
      const now = Date.now();
      const progress = Math.min((now - start) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      
      this.displayProgress = Math.floor(startValue + (this.actualProgress - startValue) * easeOut);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }

  refresh(): void {
    // Implement refresh logic if needed
    console.log('Refreshing progress ring widget:', this.widget?.title);
  }
}