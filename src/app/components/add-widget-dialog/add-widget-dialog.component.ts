// src/app/components/add-widget-dialog/add-widget-dialog.component.ts

import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, finalize } from 'rxjs';
import { WidgetType, WIDGET_TYPES, WIDGET_COLOR_PALETTE, getRandomWidgetColor, WidgetTypeMetadata, Widget } from '../../models/widget.model';
import { WidgetApiService } from '../../services/widget-api.service';

export interface AddWidgetConfig {
  title: string;
  type: WidgetType;
  color: string;
  fromOnline?: boolean;
  onlineWidget?: Widget;
}

export type DialogTab = 'create' | 'preview';

@Component({
  selector: 'app-add-widget-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-widget-dialog.component.html',
  styleUrls: ['./add-widget-dialog.component.css']
})
export class AddWidgetDialogComponent implements OnInit, OnDestroy {
  @Input() show: boolean = false;
  @Output() confirm = new EventEmitter<AddWidgetConfig>();
  @Output() cancel = new EventEmitter<void>();

  private destroy$ = new Subject<void>();
  private widgetApiService = inject(WidgetApiService);

  // Tab management
  activeTab: DialogTab = 'create';

  // Widget configuration
  widgetTitle = 'New Widget';
  selectedWidgetType: WidgetType = WIDGET_TYPES[0].type;
  selectedColor: string = getRandomWidgetColor();

  // Available options
  // Only non-online (local/create-new) widget types should appear in the Create tab
  availableWidgetTypes: WidgetTypeMetadata[] = WIDGET_TYPES.filter(w => !w.isOnlineSource);
  availableColors: string[] = WIDGET_COLOR_PALETTE;

  // Search and filter functionality
  searchQuery = '';
  filteredWidgetTypes: WidgetTypeMetadata[] = this.availableWidgetTypes;

  // Online widgets preview
  onlineWidgets: Widget[] = [];
  isLoadingOnlineWidgets = false;
  onlineWidgetsError: string | null = null;
  selectedOnlineWidget: Widget | null = null;

  ngOnInit(): void {
    this.resetForm();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Switch between tabs
   */
  switchTab(tab: DialogTab): void {
    this.activeTab = tab;
    
    // Load online widgets when switching to preview tab
    if (tab === 'preview' && this.onlineWidgets.length === 0 && !this.isLoadingOnlineWidgets) {
      this.loadOnlineWidgets();
    }
  }

  /**
   * Load widgets from online service for preview
   */
  loadOnlineWidgets(): void {
    this.isLoadingOnlineWidgets = true;
    this.onlineWidgetsError = null;

    this.widgetApiService.fetchWidgets()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoadingOnlineWidgets = false)
      )
      .subscribe({
        next: (widgets) => {
          this.onlineWidgets = widgets;
        },
        error: (error) => {
          this.onlineWidgetsError = error.message || 'Failed to load online widgets';
          console.error('Failed to load online widgets:', error);
        }
      });
  }

  /**
   * Retry loading online widgets
   */
  retryLoadOnlineWidgets(): void {
    this.onlineWidgets = [];
    this.loadOnlineWidgets();
  }

  /**
   * Select an online widget for adding
   */
  selectOnlineWidget(widget: Widget): void {
    this.selectedOnlineWidget = widget;
  }

  /**
   * Add selected online widget
   */
  addOnlineWidget(): void {
    if (!this.selectedOnlineWidget) return;

    const config: AddWidgetConfig = {
      title: this.selectedOnlineWidget.title,
      type: this.selectedOnlineWidget.type,
      color: this.selectedOnlineWidget.color,
      fromOnline: true,
      onlineWidget: { ...this.selectedOnlineWidget }
    };

    this.confirm.emit(config);
    this.resetForm();
  }

  /**
   * Reset form to defaults
   */
  resetForm(): void {
    this.widgetTitle = 'New Widget';
    this.selectedWidgetType = this.availableWidgetTypes.length ? this.availableWidgetTypes[0].type : WIDGET_TYPES[0].type;
    this.selectedColor = getRandomWidgetColor();
    this.searchQuery = '';
  this.filteredWidgetTypes = this.availableWidgetTypes;
    this.activeTab = 'create';
    this.selectedOnlineWidget = null;
    this.onlineWidgetsError = null;
  }

  /**
   * Handle search input (Future functionality)
   */
  onSearchChange(): void {
    if (!this.searchQuery.trim()) {
      this.filteredWidgetTypes = this.availableWidgetTypes;
      return;
    }

    const query = this.searchQuery.toLowerCase();
    this.filteredWidgetTypes = this.availableWidgetTypes.filter(type =>
      type.label.toLowerCase().includes(query) ||
      type.description.toLowerCase().includes(query)
    );
  }

  /**
   * Handle overlay click (close dialog)
   */
  onOverlayClick(): void {
    this.onCancel();
  }

  /**
   * Prevent dialog content clicks from closing dialog
   */
  onContentClick(event: Event): void {
    event.stopPropagation();
  }

  /**
   * Handle cancel action
   */
  onCancel(): void {
    this.resetForm();
    this.cancel.emit();
  }

  /**
   * Handle confirm action for creating new widget
   * Note: Size is determined by widget type's defaultSize from WIDGET_TYPES metadata
   */
  onConfirm(): void {
    const config: AddWidgetConfig = {
      title: this.widgetTitle || 'New Widget',
      type: this.selectedWidgetType,
      color: this.selectedColor,
      fromOnline: false
    };

    this.confirm.emit(config);
    this.resetForm();
  }

  /**
   * Handle Enter key in title input
   */
  onTitleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.onConfirm();
    }
  }

  /**
   * Get widget type metadata by type
   */
  getWidgetTypeMetadata(type: WidgetType): WidgetTypeMetadata | undefined {
    return WIDGET_TYPES.find(wt => wt.type === type);
  }
}

