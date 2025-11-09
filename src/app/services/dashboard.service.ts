// src/app/services/dashboard.service.ts

import { Injectable, signal, computed } from '@angular/core';
import { Widget, DashboardLayout, GRID_CONFIG, DEFAULT_WIDGET_COLOR, WidgetType, WIDGET_TYPES, WidgetTypeMetadata } from '../models/widget.model';
import { AddWidgetConfig } from '../components/add-widget-dialog/add-widget-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  // Using Angular 18 signals for reactive state management
  private widgetsSignal = signal<Widget[]>([]);
  private layoutSignal = signal<DashboardLayout>({
    columns: GRID_CONFIG.columns,
    gap: GRID_CONFIG.gap,
    widgets: []
  });

  // Public readonly signals
  widgets = this.widgetsSignal.asReadonly();
  layout = this.layoutSignal.asReadonly();

  // Computed values
  widgetCount = computed(() => this.widgetsSignal().length);

  constructor() {
    this.loadFromStorage();
  }

  // Initialize with sample data demonstrating both widget types
  initializeSampleData(): void {
    const sampleWidgets: Widget[] = [
      {
        id: '1',
        title: 'Metrics Dashboard',
        type: 'widget-1',
        gridPosition: { col: 0, row: 0 },
        gridSize: { colSpan: 3, rowSpan: 2 },
        color: '#e3f2fd'
      },
      {
        id: '2',
        title: 'Welcome',
        type: 'widget-2',
        gridPosition: { col: 3, row: 0 },
        gridSize: { colSpan: 2, rowSpan: 2 },
        color: '#f3e5f5'
      }
    ];

    this.widgetsSignal.set(sampleWidgets);
    this.saveToStorage();
  }

  // Add a new widget
  addWidget(widget: Widget): void {
    const currentWidgets = this.widgetsSignal();
    this.widgetsSignal.set([...currentWidgets, widget]);
    this.saveToStorage();
  }

  // Create and add a new widget from configuration (Business Logic)
  // This centralizes widget creation, ID generation, and position finding
  createAndAddWidget(config: AddWidgetConfig): void {
    // Get default size from widget type metadata
    const widgetTypeMetadata = this.getWidgetTypeMetadata(config.type);
    const defaultSize = widgetTypeMetadata?.defaultSize || { colSpan: 2, rowSpan: 2 };
    
    // Find available position
    const position = this.findAvailablePosition(defaultSize);
    
    // Create widget with generated ID
    const newWidget: Widget = {
      id: this.generateWidgetId(),
      title: config.title,
      type: config.type,
      gridPosition: position,
      gridSize: { colSpan: defaultSize.colSpan, rowSpan: defaultSize.rowSpan },
      color: config.color
    };
    
    // Add to collection
    this.addWidget(newWidget);
  }

  // Generate unique widget ID
  private generateWidgetId(): string {
    return `widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Delete widget
  deleteWidget(widgetId: string): void {
    const widgets = this.widgetsSignal();
    this.widgetsSignal.set(widgets.filter(w => w.id !== widgetId));
    this.saveToStorage();
  }

  // Update widget title
  updateWidgetTitle(widgetId: string, newTitle: string): void {
    const widgets = this.widgetsSignal();
    const updatedWidgets = widgets.map(widget =>
      widget.id === widgetId
        ? { ...widget, title: newTitle }
        : { ...widget, gridSize: { ...widget.gridSize }, gridPosition: { ...widget.gridPosition } } // Clone all widgets to prevent mutation
    );
    this.widgetsSignal.set(updatedWidgets);
    this.saveToStorage();
  }

  // Move widget to a new position
  moveWidget(widgetId: string, newPosition: { col: number; row: number }): void {
    const widgets = this.widgetsSignal();
    const updatedWidgets = widgets.map(w =>
      w.id === widgetId
        ? { ...w, gridPosition: { ...newPosition } } // Deep clone the position object
        : { ...w, gridSize: { ...w.gridSize }, gridPosition: { ...w.gridPosition } } // Clone all widgets to prevent mutation
    );
    this.widgetsSignal.set(updatedWidgets);
    this.saveToStorage();
  }

  // Resize widget
  resizeWidget(widgetId: string, newSize: { colSpan: number; rowSpan: number }): void {
    const widgets = this.widgetsSignal();
    
    // Deep clone to prevent reference mutations across widgets
    const updatedWidgets = widgets.map(w => {
      if (w.id === widgetId) {
        return { ...w, gridSize: { ...newSize } };
      } else {
        return { ...w, gridSize: { ...w.gridSize }, gridPosition: { ...w.gridPosition } };
      }
    });
    
    this.widgetsSignal.set(updatedWidgets);
    this.saveToStorage();
  }

  // Check if a widget at given position/size would collide with existing widgets
  checkCollision(
    position: { col: number; row: number },
    size: { colSpan: number; rowSpan: number },
    excludeId?: string
  ): boolean {
    return this.widgetsSignal().some(widget => {
      if (widget.id === excludeId) return false;
      
      const noOverlap = 
        position.col + size.colSpan <= widget.gridPosition.col ||
        position.col >= widget.gridPosition.col + widget.gridSize.colSpan ||
        position.row + size.rowSpan <= widget.gridPosition.row ||
        position.row >= widget.gridPosition.row + widget.gridSize.rowSpan;
      
      return !noOverlap;
    });
  }

  // Find available position for new widget
  findAvailablePosition(widgetSize: { colSpan: number; rowSpan: number }): { col: number; row: number } {
    const widgets = this.widgetsSignal();
    const maxCols = GRID_CONFIG.columns;
    const MAX_SEARCH_ROWS = 50; // Reasonable safety limit
    
    // Try to find space row by row
    for (let row = 0; row < MAX_SEARCH_ROWS; row++) {
      for (let col = 0; col <= maxCols - widgetSize.colSpan; col++) {
        const testPos = { col, row };
        
        // Check if this position is available
        if (!this.checkCollision(testPos, widgetSize)) {
          return testPos;
        }
      }
    }
    
    // If no space found, place at bottom
    const maxRow = widgets.length > 0 
      ? Math.max(...widgets.map(w => w.gridPosition.row + w.gridSize.rowSpan))
      : 0;
    return { col: 0, row: maxRow };
  }

  // Persistence
  private saveToStorage(): void {
    localStorage.setItem('dashboard-widgets-v2', JSON.stringify(this.widgetsSignal()));
  }

  private loadFromStorage(): void {
    const saved = localStorage.getItem('dashboard-widgets-v2');
    if (saved) {
      try {
        const widgets = JSON.parse(saved);
        this.widgetsSignal.set(widgets);
      } catch (e) {
        console.error('Failed to load dashboard from storage', e);
        this.initializeSampleData();
      }
    } else {
      this.initializeSampleData();
    }
  }

  // Export/Import configuration
  exportConfiguration(): string {
    return JSON.stringify({
      version: '2.0',
      timestamp: new Date().toISOString(),
      widgets: this.widgetsSignal(),
      layout: this.layoutSignal()
    }, null, 2);
  }

  importConfiguration(jsonConfig: string): void {
    try {
      const config = JSON.parse(jsonConfig);
      if (config.widgets && Array.isArray(config.widgets)) {
        this.widgetsSignal.set(config.widgets);
        if (config.layout) {
          this.layoutSignal.set(config.layout);
        }
        this.saveToStorage();
      } else {
        throw new Error('Invalid widgets data');
      }
    } catch (e) {
      console.error('Failed to import configuration', e);
      throw new Error('Invalid configuration format');
    }
  }

  // Get widget type metadata
  getWidgetTypeMetadata(type: WidgetType): WidgetTypeMetadata | undefined {
    return WIDGET_TYPES.find(wt => wt.type === type);
  }
}
