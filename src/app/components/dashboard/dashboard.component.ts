// src/app/components/dashboard/dashboard.component.ts

import { Component, ViewChild, ElementRef, HostListener, Output, EventEmitter, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WidgetTemplateComponent } from '../widget-template/widget-template.component';
import { DashboardHeaderComponent } from '../dashboard-header/dashboard-header.component';
import { AddWidgetDialogComponent, AddWidgetConfig } from '../add-widget-dialog/add-widget-dialog.component';
import { DashboardService } from '../../services/dashboard.service';
import { Widget, GRID_CONFIG } from '../../models/widget.model';

interface DragState {
  isDragging: boolean;
  widget: Widget | null;
  previewPosition: { col: number; row: number } | null;
  hasCollision: boolean;
}

interface ResizeState {
  isResizing: boolean;
  widget: Widget | null;
  previewSize: { colSpan: number; rowSpan: number } | null;
  hasCollision: boolean;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, WidgetTemplateComponent, DashboardHeaderComponent, AddWidgetDialogComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  @ViewChild('gridContainer') gridContainer!: ElementRef<HTMLDivElement>;

  dashboardService = inject(DashboardService);
  
  // Output events for global actions (handled by App Component)
  @Output() exportLayout = new EventEmitter<void>();
  @Output() importLayout = new EventEmitter<Event>();
  @Output() resetLayout = new EventEmitter<void>();
  
  // Grid configuration
  readonly GRID_CONFIG = GRID_CONFIG;
  private readonly GRID_PADDING = 20;
  
  // Signals
  widgets = this.dashboardService.widgets;
  showGrid = signal(false);
  showAddDialog = signal(false);
  
  // Drag state
  dragState: DragState = {
    isDragging: false,
    widget: null,
    previewPosition: null,
    hasCollision: false
  };
  
  // Resize state
  resizeState: ResizeState = {
    isResizing: false,
    widget: null,
    previewSize: null,
    hasCollision: false
  };
  
  // Computed values
  // Using minmax to allow columns to grow while maintaining minimum width
  // minmax(100px, 1fr) ensures columns are at least 100px but can expand to fill container
  // This allows responsive behavior while preventing widgets from becoming too small
  gridColumns = computed(() => {
    return `repeat(${GRID_CONFIG.columns}, minmax(100px, 1fr))`;
  });
  
  // Grid helper methods
  private getGridPositionStyle(col: number, row: number, colSpan: number, rowSpan: number): { column: string; row: string } {
    return {
      column: `${col + 1} / span ${colSpan}`,
      row: `${row + 1} / span ${rowSpan}`
    };
  }
  
  getGridColumn(widget: Widget): string {
    return this.getGridPositionStyle(
      widget.gridPosition.col,
      widget.gridPosition.row,
      widget.gridSize.colSpan,
      widget.gridSize.rowSpan
    ).column;
  }
  
  getGridRow(widget: Widget): string {
    return this.getGridPositionStyle(
      widget.gridPosition.col,
      widget.gridPosition.row,
      widget.gridSize.colSpan,
      widget.gridSize.rowSpan
    ).row;
  }
  
  getPreviewGridColumn(): string {
    if (!this.dragState.previewPosition || !this.dragState.widget) return '1';
    return this.getGridPositionStyle(
      this.dragState.previewPosition.col,
      this.dragState.previewPosition.row,
      this.dragState.widget.gridSize.colSpan,
      this.dragState.widget.gridSize.rowSpan
    ).column;
  }
  
  getPreviewGridRow(): string {
    if (!this.dragState.previewPosition || !this.dragState.widget) return '1';
    return this.getGridPositionStyle(
      this.dragState.previewPosition.col,
      this.dragState.previewPosition.row,
      this.dragState.widget.gridSize.colSpan,
      this.dragState.widget.gridSize.rowSpan
    ).row;
  }
  
  getResizePreviewColumn(): string {
    if (!this.resizeState.widget) return '1';
    return this.getGridPositionStyle(
      this.resizeState.widget.gridPosition.col,
      this.resizeState.widget.gridPosition.row,
      this.resizeState.previewSize?.colSpan || 1,
      this.resizeState.previewSize?.rowSpan || 1
    ).column;
  }
  
  getResizePreviewRow(): string {
    if (!this.resizeState.widget) return '1';
    return this.getGridPositionStyle(
      this.resizeState.widget.gridPosition.col,
      this.resizeState.widget.gridPosition.row,
      this.resizeState.previewSize?.colSpan || 1,
      this.resizeState.previewSize?.rowSpan || 1
    ).row;
  }
  
  // Drag and drop implementation
  onWidgetMouseDown(event: MouseEvent, widget: Widget): void {
    if (!this.shouldAllowDrag(event.target as HTMLElement)) {
      return;
    }
    
    event.preventDefault();
    this.dragState.isDragging = true;
    // Deep clone to prevent reference mutations
    this.dragState.widget = { 
      ...widget, 
      gridSize: { ...widget.gridSize }, 
      gridPosition: { ...widget.gridPosition } 
    };
    document.body.style.cursor = 'grabbing';
    document.body.style.userSelect = 'none';
  }
  
  private shouldAllowDrag(target: HTMLElement): boolean {
    const dragHandle = target.closest('[data-drag-handle]');
    return dragHandle !== null;
  }
  
  @HostListener('document:mousemove', ['$event'])
  onDocumentMouseMove(event: MouseEvent): void {
    if (this.dragState.isDragging) {
      this.onDragMove(event);
    } else if (this.resizeState.isResizing) {
      this.onResizeMove(event);
    }
  }
  
  @HostListener('document:mouseup', ['$event'])
  onDocumentMouseUp(event: MouseEvent): void {
    if (this.dragState.isDragging) {
      this.onDragEnd(event);
    } else if (this.resizeState.isResizing) {
      this.onResizeEnd(event);
    }
  }
  
  private onDragMove(event: MouseEvent): void {
    if (!this.dragState.widget) return;
    
    const gridPos = this.calculateGridPosition(event);
    if (!gridPos) return;
    
    // Clamp to grid bounds
    const maxCol = GRID_CONFIG.columns - this.dragState.widget.gridSize.colSpan;
    gridPos.col = Math.max(0, Math.min(gridPos.col, maxCol));
    gridPos.row = Math.max(0, gridPos.row);
    
    this.dragState.previewPosition = gridPos;
    
    // Check collision
    this.dragState.hasCollision = this.dashboardService.checkCollision(
      gridPos,
      this.dragState.widget.gridSize,
      this.dragState.widget.id
    );
  }
  
  private onDragEnd(event: MouseEvent): void {
    if (!this.dragState.widget) return;
    
    if (this.dragState.previewPosition && !this.dragState.hasCollision) {
      this.dashboardService.moveWidget(
        this.dragState.widget.id,
        this.dragState.previewPosition
      );
    }
    
    this.dragState.isDragging = false;
    this.dragState.widget = null;
    this.dragState.previewPosition = null;
    this.dragState.hasCollision = false;
    
    this.cleanupInteraction();
  }
  
  // Resize implementation
  onResizeStart(widget: Widget): void {
    this.resizeState.isResizing = true;
    // Deep clone to prevent reference mutations
    this.resizeState.widget = { 
      ...widget, 
      gridSize: { ...widget.gridSize }, 
      gridPosition: { ...widget.gridPosition } 
    };
    this.resizeState.previewSize = { ...widget.gridSize };
    document.body.style.cursor = 'nwse-resize';
    document.body.style.userSelect = 'none';
  }
  
  private onResizeMove(event: MouseEvent): void {
    if (!this.resizeState.widget) return;
    
    const gridRect = this.gridContainer.nativeElement.getBoundingClientRect();
    const colWidth = (gridRect.width - (this.GRID_PADDING * 2) - (GRID_CONFIG.columns - 1) * GRID_CONFIG.gap) / GRID_CONFIG.columns;
    const rowHeight = GRID_CONFIG.rowHeight;
    
    const widget = this.resizeState.widget;
    const widgetStartX = this.GRID_PADDING + widget.gridPosition.col * (colWidth + GRID_CONFIG.gap);
    const widgetStartY = this.GRID_PADDING + widget.gridPosition.row * (rowHeight + GRID_CONFIG.gap);
    
    const mouseX = event.clientX - gridRect.left;
    const mouseY = event.clientY - gridRect.top;
    
    const newWidth = mouseX - widgetStartX;
    const newHeight = mouseY - widgetStartY;
    
    // Convert to grid units
    let newColSpan = Math.round(newWidth / (colWidth + GRID_CONFIG.gap));
    let newRowSpan = Math.round(newHeight / (rowHeight + GRID_CONFIG.gap));
    
    // Apply constraints
    newColSpan = Math.max(1, Math.min(newColSpan, GRID_CONFIG.columns - widget.gridPosition.col));
    newRowSpan = Math.max(1, Math.min(newRowSpan, GRID_CONFIG.maxWidgetRows));
    
    this.resizeState.previewSize = { colSpan: newColSpan, rowSpan: newRowSpan };
    
    // Check collision
    this.resizeState.hasCollision = this.dashboardService.checkCollision(
      widget.gridPosition,
      this.resizeState.previewSize,
      widget.id
    );
  }
  
  private onResizeEnd(event: MouseEvent): void {
    if (!this.resizeState.widget) return;
    
    if (this.resizeState.previewSize && !this.resizeState.hasCollision) {
      this.dashboardService.resizeWidget(
        this.resizeState.widget.id,
        this.resizeState.previewSize
      );
    }
    
    this.resizeState.isResizing = false;
    this.resizeState.widget = null;
    this.resizeState.previewSize = null;
    this.resizeState.hasCollision = false;
    
    this.cleanupInteraction();
  }
  
  private cleanupInteraction(): void {
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }
  
  // Calculate grid position from mouse coordinates
  private calculateGridPosition(event: MouseEvent): { col: number; row: number } | null {
    if (!this.gridContainer) return null;
    
    const gridRect = this.gridContainer.nativeElement.getBoundingClientRect();
    const mouseX = event.clientX - gridRect.left - this.GRID_PADDING;
    const mouseY = event.clientY - gridRect.top - this.GRID_PADDING;
    
    const colWidth = (gridRect.width - (this.GRID_PADDING * 2) - (GRID_CONFIG.columns - 1) * GRID_CONFIG.gap) / GRID_CONFIG.columns;
    const rowHeight = GRID_CONFIG.rowHeight;
    
    const col = Math.floor(mouseX / (colWidth + GRID_CONFIG.gap));
    const row = Math.floor(mouseY / (rowHeight + GRID_CONFIG.gap));
    
    return { col, row };
  }
  
  // Widget event handlers
  onWidgetDelete(widget: Widget): void {
    this.dashboardService.deleteWidget(widget.id);
  }
  
  onWidgetTitleChange(event: { id: string; title: string }): void {
    this.dashboardService.updateWidgetTitle(event.id, event.title);
  }
  
  // Toolbar actions
  toggleGrid(): void {
    this.showGrid.update(v => !v);
  }
  
  // Global actions - emit events to App Component for coordination
  onExportLayout(): void {
    this.exportLayout.emit();
  }
  
  onImportFile(event: Event): void {
    this.importLayout.emit(event);
  }
  
  onResetLayout(): void {
    this.resetLayout.emit();
  }
  
  // Add widget dialog
  showAddWidgetDialog(): void {
    this.showAddDialog.set(true);
  }
  
  closeAddDialog(): void {
    this.showAddDialog.set(false);
  }
  
  onAddWidgetConfirm(config: AddWidgetConfig): void {
    // Delegate widget creation to service (business logic)
    this.dashboardService.createAndAddWidget(config);
    this.closeAddDialog();
  }
  
  // Keyboard shortcuts
  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    // Ignore if typing in input
    if ((event.target as HTMLElement).tagName === 'INPUT' ||
        (event.target as HTMLElement).contentEditable === 'true') {
      return;
    }
    
    // Toggle grid: G
    if (event.key === 'g' || event.key === 'G') {
      this.toggleGrid();
    }
    
    // Add widget: A
    if (event.key === 'a' || event.key === 'A') {
      this.showAddWidgetDialog();
    }
  }
}
