// src/app/components/widget-template/widget-template.component.ts

import { Component, Input, Output, EventEmitter, ViewChild, AfterViewInit, OnDestroy, ComponentRef, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Widget } from '../../models/widget.model';
import { WidgetContentHostDirective } from '../../directives/widget-content-host.directive';
import { BaseWidgetContent } from '../../models/widget-content.interface';
import { getWidgetComponent } from '../../services/widget-registry.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-widget-template',
  standalone: true,
  imports: [CommonModule, WidgetContentHostDirective],
  templateUrl: './widget-template.component.html',
  styleUrls: ['./widget-template.component.css']
})
export class WidgetTemplateComponent implements AfterViewInit, OnDestroy {
  @Input() widget!: Widget;
  @Output() delete = new EventEmitter<Widget>();
  @Output() titleChange = new EventEmitter<{ id: string; title: string }>();
  @Output() resizeStart = new EventEmitter<Widget>();
  @Output() refresh = new EventEmitter<Widget>();

  @ViewChild(WidgetContentHostDirective, { static: false }) 
  widgetContentHost!: WidgetContentHostDirective;

  isDragging = false;
  isResizing = false;
  isEditingTitle = false;
  
  private widgetComponentRef?: ComponentRef<BaseWidgetContent>;
  private notificationService = inject(NotificationService);

  constructor(private elementRef: ElementRef) {}

  ngAfterViewInit(): void {
    this.loadWidgetContent();
  }

  ngOnDestroy(): void {
    // Clean up dynamically created component to prevent memory leaks
    if (this.widgetComponentRef) {
      this.widgetComponentRef.destroy();
    }
  }

  /**
   * Dynamically load the appropriate widget component based on widget type
   */
  private loadWidgetContent(): void {
    const widgetComponent = getWidgetComponent(this.widget.type);
    
    if (!widgetComponent) {
      console.error(`No component found for widget type: ${this.widget.type}`);
      return;
    }

    const viewContainerRef = this.widgetContentHost.viewContainerRef;
    viewContainerRef.clear();
    
    this.widgetComponentRef = viewContainerRef.createComponent(widgetComponent);
  }

  onRefresh(event: Event): void {
    event.stopPropagation();
    
    // Call refresh on the loaded widget component
    if (this.widgetComponentRef?.instance) {
      this.widgetComponentRef.instance.refresh();
    }
    
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
