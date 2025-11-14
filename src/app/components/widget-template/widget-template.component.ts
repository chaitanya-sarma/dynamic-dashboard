// src/app/components/widget-template/widget-template.component.ts

import { Component, Input, Output, EventEmitter, ElementRef, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Widget } from '../../models/widget.model';
import { NotificationService } from '../../services/notification.service';
import { Widget1Component } from '../widgets/widget-1/widget-1.component';
import { Widget2Component } from '../widgets/widget-2/widget-2.component';
import { PieChartWidgetComponent } from '../widgets/pie-chart-widget/pie-chart-widget.component';
import { BarChartWidgetComponent } from '../widgets/bar-chart-widget/bar-chart-widget.component';
import { StatsCardWidgetComponent } from '../widgets/stats-card-widget/stats-card-widget.component';
import { ProgressRingWidgetComponent } from '../widgets/progress-ring-widget/progress-ring-widget.component';
import { DataTableWidgetComponent } from '../widgets/data-table-widget/data-table-widget.component';
import { LineChartWidgetComponent } from '../widgets/line-chart-widget/line-chart-widget.component';

@Component({
  selector: 'app-widget-template',
  standalone: true,
  imports: [
    CommonModule, 
    Widget1Component, 
    Widget2Component,
    PieChartWidgetComponent,
    BarChartWidgetComponent,
    StatsCardWidgetComponent,
    ProgressRingWidgetComponent,
    DataTableWidgetComponent,
    LineChartWidgetComponent
  ],
  templateUrl: './widget-template.component.html',
  styleUrls: ['./widget-template.component.css']
})
export class WidgetTemplateComponent {
  @Input() widget!: Widget;
  @Output() delete = new EventEmitter<Widget>();
  @Output() titleChange = new EventEmitter<{ id: string; title: string }>();
  @Output() resizeStart = new EventEmitter<Widget>();
  @Output() refresh = new EventEmitter<Widget>();

  isDragging = false;
  isResizing = false;
  isEditingTitle = false;
  
  private notificationService = inject(NotificationService);

  constructor(private elementRef: ElementRef) {}

  @ViewChild(PieChartWidgetComponent) pieChartWidget?: PieChartWidgetComponent;
  @ViewChild(BarChartWidgetComponent) barChartWidget?: BarChartWidgetComponent;
  @ViewChild(LineChartWidgetComponent) lineChartWidget?: LineChartWidgetComponent;
  @ViewChild(StatsCardWidgetComponent) statsCardWidget?: StatsCardWidgetComponent;
  @ViewChild(DataTableWidgetComponent) dataTableWidget?: DataTableWidgetComponent;
  @ViewChild(ProgressRingWidgetComponent) progressRingWidget?: ProgressRingWidgetComponent;
  @ViewChild(Widget1Component) widget1?: Widget1Component;
  @ViewChild(Widget2Component) widget2?: Widget2Component;

  onRefresh(event: Event): void {
    event.stopPropagation();
    
    // Call the individual widget's refresh method based on widget type
    switch (this.widget.type) {
      case 'pie-chart':
        this.pieChartWidget?.refresh();
        break;
      case 'bar-chart':
        this.barChartWidget?.refresh();
        break;
      case 'line-chart':
        this.lineChartWidget?.refresh();
        break;
      case 'stats-card':
        this.statsCardWidget?.refresh();
        break;
      case 'data-table':
        this.dataTableWidget?.refresh();
        break;
      case 'progress-ring':
        this.progressRingWidget?.refresh();
        break;
      case 'widget-1':
        this.widget1?.refresh();
        break;
      case 'widget-2':
        this.widget2?.refresh();
        break;
      default:
        console.log('No refresh method available for widget type:', this.widget.type);
    }
    
    // Also emit to parent for any dashboard-level handling
    this.refresh.emit(this.widget);
  }

  async onDelete(event: Event): Promise<void> {
    event.stopPropagation();
    const confirmed = await this.notificationService.confirm(`Remove "${this.widget.title}"?`);
    if (confirmed) {
      this.delete.emit(this.widget);
    }
  }

  onTitleMouseDown(event: MouseEvent): void {
    if (this.isEditingTitle) {
      event.stopPropagation();
    }
  }

  startEditTitle(): void {
    this.isEditingTitle = true;
    setTimeout(() => {
      const el = this.elementRef.nativeElement.querySelector('.widget-title');
      if (el) {
        el.focus();
        // Select all text
        const range = document.createRange();
        range.selectNodeContents(el);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
      }
    });
  }

  finishEditTitle(event: any): void {
    if (event.type === 'keydown') {
      event.preventDefault();
      event.target.blur();
      return;
    }
    
    this.isEditingTitle = false;
    const newTitle = event.target.textContent.trim();
    if (newTitle && newTitle !== this.widget.title) {
      this.titleChange.emit({ id: this.widget.id, title: newTitle });
    } else {
      // Restore original
      event.target.textContent = this.widget.title;
    }
  }

  cancelEditTitle(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    const target = event.target as HTMLElement;
    // Restore original title
    target.textContent = this.widget.title;
    this.isEditingTitle = false;
    target.blur();
  }

  onResizeStart(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isResizing = true;
    this.resizeStart.emit(this.widget);
  }
}
