// src/app/services/dashboard.service.ts

import { Injectable, signal, computed, inject } from '@angular/core';
import { Widget, DashboardLayout, GRID_CONFIG, DEFAULT_WIDGET_COLOR, WidgetType, WIDGET_TYPES, WidgetTypeMetadata, DashboardLoadingState } from '../models/widget.model';
import { AddWidgetConfig } from '../components/add-widget-dialog/add-widget-dialog.component';
import { WidgetApiService } from './widget-api.service';
import { firstValueFrom, catchError, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private widgetApiService = inject(WidgetApiService);

  // Using Angular 18 signals for reactive state management
  private widgetsSignal = signal<Widget[]>([]);
  private layoutSignal = signal<DashboardLayout>({
    columns: GRID_CONFIG.columns,
    gap: GRID_CONFIG.gap,
    widgets: []
  });

  // Loading state management
  private loadingStateSignal = signal<DashboardLoadingState>({
    isLoadingWidgets: false,
    isCreatingWidget: false,
    isUpdatingWidget: false,
    isDeletingWidget: false,
    error: null
  });

  // Public readonly signals
  widgets = this.widgetsSignal.asReadonly();
  layout = this.layoutSignal.asReadonly();
  loadingState = this.loadingStateSignal.asReadonly();

  // Computed values
  widgetCount = computed(() => this.widgetsSignal().length);
  isLoading = computed(() => {
    const state = this.loadingStateSignal();
    return state.isLoadingWidgets || state.isCreatingWidget || 
           state.isUpdatingWidget || state.isDeletingWidget;
  });

  // Helper method to update loading state
  private setLoadingState(partialState: Partial<DashboardLoadingState>): void {
    this.loadingStateSignal.update(current => ({ ...current, ...partialState }));
  }

  constructor() {
    this.initializeDashboard();
  }

  // Initialize dashboard by first trying to load from API, then storage, then sample data
  private async initializeDashboard(): Promise<void> {
    try {
      // First, try to load from local storage (for cached/offline data)
      const hasLocalData = this.loadFromStorage();
      
      // Then attempt to load fresh data from API
      await this.loadFromApi();
    } catch (error) {
      console.error('Failed to initialize dashboard from API:', error);
      
      // If API fails and no local data, use sample data
      if (this.widgetsSignal().length === 0) {
        this.initializeSampleData();
      }
    }
  }

  // Load widgets from online API service
  async loadFromApi(): Promise<void> {
    this.setLoadingState({ isLoadingWidgets: true, error: null });
    
    try {
      const widgets = await firstValueFrom(
        this.widgetApiService.fetchWidgets().pipe(
          catchError(error => {
            console.error('API fetch failed:', error);
            throw error;
          })
        )
      );
      
      this.widgetsSignal.set(widgets);
      this.saveToStorage(); // Cache the API data locally
      this.setLoadingState({ isLoadingWidgets: false });
      
      console.log(`Loaded ${widgets.length} widgets from API`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load widgets from API';
      this.setLoadingState({ 
        isLoadingWidgets: false, 
        error: errorMessage 
      });
      throw error;
    }
  }

  // Refresh widgets from API (manual refresh)
  async refreshWidgets(): Promise<void> {
    try {
      await this.loadFromApi();
    } catch (error) {
      // Error is already handled in loadFromApi, just propagate
      throw error;
    }
  }

  // Initialize with sample data (fallback when API is unavailable)
  initializeSampleData(): void {
    const sampleWidgets: Widget[] = [
      {
        id: '1',
        title: 'Metrics Dashboard (Local)',
        type: 'widget-1',
        gridPosition: { col: 0, row: 0 },
        gridSize: { colSpan: 3, rowSpan: 2 },
        color: '#e3f2fd'
      },
      {
        id: '2',
        title: 'Welcome (Local)',
        type: 'widget-2',
        gridPosition: { col: 3, row: 0 },
        gridSize: { colSpan: 2, rowSpan: 2 },
        color: '#f3e5f5'
      }
    ];

    this.widgetsSignal.set(sampleWidgets);
    this.saveToStorage();
  }

  // Add a new widget (local only - for immediate UI updates)
  addWidget(widget: Widget): void {
    const currentWidgets = this.widgetsSignal();
    this.widgetsSignal.set([...currentWidgets, widget]);
    this.saveToStorage();
  }

  // Create and add a new widget from configuration (Business Logic)
  // This centralizes widget creation, ID generation, and position finding
  async createAndAddWidget(config: AddWidgetConfig): Promise<void> {
    this.setLoadingState({ isCreatingWidget: true, error: null });

    try {
      let widgetToAdd: Widget;

      if (config.fromOnline && config.onlineWidget) {
        // Use online widget data but find new position
        const position = this.findAvailablePosition(config.onlineWidget.gridSize);
        widgetToAdd = {
          ...config.onlineWidget,
          id: this.generateWidgetId(), // Generate new ID for local use
          gridPosition: position
        };
      } else {
        // Create new widget locally
        const widgetTypeMetadata = this.getWidgetTypeMetadata(config.type);
        const defaultSize = widgetTypeMetadata?.defaultSize || { colSpan: 2, rowSpan: 2 };
        const position = this.findAvailablePosition(defaultSize);
        
        const newWidgetData: Partial<Widget> = {
          title: config.title,
          type: config.type,
          gridPosition: position,
          gridSize: { colSpan: defaultSize.colSpan, rowSpan: defaultSize.rowSpan },
          color: config.color
        };

        // Create widget via API service
        widgetToAdd = await firstValueFrom(
          this.widgetApiService.createWidget(newWidgetData).pipe(
            catchError(error => {
              console.error('Failed to create widget via API:', error);
              // Fallback to local creation
              const localWidget: Widget = {
                ...newWidgetData,
                id: this.generateWidgetId()
              } as Widget;
              return of(localWidget);
            })
          )
        );
      }
      
      // Add to local collection
      this.addWidget(widgetToAdd);
      this.setLoadingState({ isCreatingWidget: false });
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create widget';
      this.setLoadingState({ 
        isCreatingWidget: false, 
        error: errorMessage 
      });
      throw error;
    }
  }

  // Generate unique widget ID
  private generateWidgetId(): string {
    return `widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Delete widget
  async deleteWidget(widgetId: string): Promise<void> {
    this.setLoadingState({ isDeletingWidget: true, error: null });

    try {
      // First remove from local state for immediate UI feedback
      const widgets = this.widgetsSignal();
      const updatedWidgets = widgets.filter(w => w.id !== widgetId);
      this.widgetsSignal.set(updatedWidgets);
      this.saveToStorage();

      // Then delete from API (fire and forget, with error logging)
      firstValueFrom(
        this.widgetApiService.deleteWidget(widgetId).pipe(
          catchError(error => {
            console.error('Failed to delete widget via API:', error);
            // Don't restore widget since local deletion succeeded
            return of(null);
          })
        )
      ).catch(() => {
        // Silently handle API deletion failures
      });

      this.setLoadingState({ isDeletingWidget: false });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete widget';
      this.setLoadingState({ 
        isDeletingWidget: false, 
        error: errorMessage 
      });
      throw error;
    }
  }

  // Update widget title
  async updateWidgetTitle(widgetId: string, newTitle: string): Promise<void> {
    this.setLoadingState({ isUpdatingWidget: true, error: null });

    try {
      const widgets = this.widgetsSignal();
      const updatedWidgets = widgets.map(widget =>
        widget.id === widgetId
          ? { ...widget, title: newTitle }
          : { ...widget, gridSize: { ...widget.gridSize }, gridPosition: { ...widget.gridPosition } } // Clone all widgets to prevent mutation
      );
      this.widgetsSignal.set(updatedWidgets);
      this.saveToStorage();

      // Update via API
      const widgetToUpdate = updatedWidgets.find(w => w.id === widgetId);
      if (widgetToUpdate) {
        await firstValueFrom(
          this.widgetApiService.updateWidget(widgetToUpdate).pipe(
            catchError(error => {
              console.error('Failed to update widget via API:', error);
              // Local update already succeeded, so don't throw
              return of(widgetToUpdate);
            })
          )
        );
      }

      this.setLoadingState({ isUpdatingWidget: false });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update widget';
      this.setLoadingState({ 
        isUpdatingWidget: false, 
        error: errorMessage 
      });
      throw error;
    }
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

  private loadFromStorage(): boolean {
    const saved = localStorage.getItem('dashboard-widgets-v2');
    if (saved) {
      try {
        const widgets = JSON.parse(saved);
        this.widgetsSignal.set(widgets);
        return true; // Successfully loaded from storage
      } catch (e) {
        console.error('Failed to load dashboard from storage', e);
        return false;
      }
    }
    return false; // No data in storage
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

  // Clear error state
  clearError(): void {
    this.setLoadingState({ error: null });
  }

  // Get API connection status
  async testApiConnection(): Promise<boolean> {
    try {
      return await firstValueFrom(this.widgetApiService.testConnection());
    } catch {
      return false;
    }
  }

  // Get API configuration
  getApiConfig() {
    return this.widgetApiService.getApiConfig();
  }
}
