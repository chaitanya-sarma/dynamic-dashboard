// src/app/components/add-widget-dialog/add-widget-dialog.component.ts

import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WidgetType, WIDGET_TYPES, WIDGET_COLOR_PALETTE, getRandomWidgetColor, WidgetTypeMetadata } from '../../models/widget.model';

export interface AddWidgetConfig {
  title: string;
  type: WidgetType;
  color: string;
}

@Component({
  selector: 'app-add-widget-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-widget-dialog.component.html',
  styleUrls: ['./add-widget-dialog.component.css']
})
export class AddWidgetDialogComponent implements OnInit {
  @Input() show: boolean = false;
  @Output() confirm = new EventEmitter<AddWidgetConfig>();
  @Output() cancel = new EventEmitter<void>();

  // Widget configuration
  widgetTitle = 'New Widget';
  selectedWidgetType: WidgetType = WIDGET_TYPES[0].type;
  selectedColor: string = getRandomWidgetColor();

  // Available options
  availableWidgetTypes: WidgetTypeMetadata[] = WIDGET_TYPES;
  availableColors: string[] = WIDGET_COLOR_PALETTE;

  // Future: Search and filter functionality
  searchQuery = '';
  filteredWidgetTypes: WidgetTypeMetadata[] = WIDGET_TYPES;

  ngOnInit(): void {
    this.resetForm();
  }

  /**
   * Reset form to defaults
   */
  resetForm(): void {
    this.widgetTitle = 'New Widget';
    this.selectedWidgetType = WIDGET_TYPES[0].type;
    this.selectedColor = getRandomWidgetColor();
    this.searchQuery = '';
    this.filteredWidgetTypes = WIDGET_TYPES;
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
   * Handle confirm action
   * Note: Size is determined by widget type's defaultSize from WIDGET_TYPES metadata
   */
  onConfirm(): void {
    const config: AddWidgetConfig = {
      title: this.widgetTitle || 'New Widget',
      type: this.selectedWidgetType,
      color: this.selectedColor
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
}

