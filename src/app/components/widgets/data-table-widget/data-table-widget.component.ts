// src/app/components/widgets/data-table-widget/data-table-widget.component.ts

import { Component, Input, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Widget } from '../../../models/widget.model';
import { BaseWidgetContent } from '../../../models/widget-content.interface';
import { WidgetApiService } from '../../../services/widget-api.service';
import { TableRowData } from '../../../models/chart-data.interface';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-data-table-widget',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="data-table-widget">
      <div class="widget-header">
        <h4>{{ widget.title }}</h4>
        <div class="controls">
          <button class="filter-btn" [class.active]="sortBy === 'name'" (click)="sortBy = 'name'; sortData()">
            Name
          </button>
          <button class="filter-btn" [class.active]="sortBy === 'value'" (click)="sortBy = 'value'; sortData()">
            Value
          </button>
        </div>
      </div>
      
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Status</th>
              <th>Value</th>
              <th>Change</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let row of displayData; let i = index; trackBy: trackByFn" 
                class="table-row"
                [style.animation-delay]="(i * 0.1) + 's'">
              <td class="name-cell">
                <div class="name-content">
                  <div class="name-primary">{{ row.name }}</div>
                  <div class="name-secondary">{{ row.category }}</div>
                </div>
              </td>
              <td class="status-cell">
                <span class="status-badge" [ngClass]="'status-' + row.status">
                  {{ row.status }}
                </span>
              </td>
              <td class="value-cell">
                <span class="value">{{ formatValue(row.value) }}</span>
              </td>
              <td class="change-cell">
                <span class="change" [ngClass]="getChangeClass(row.change)">
                  <span class="change-icon">{{ getChangeIcon(row.change) }}</span>
                  {{ getAbsoluteChange(row.change) }}%
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div class="table-footer">
        <div class="summary">
          Total: {{ displayData.length }} items
        </div>
        <div class="pagination">
          <button class="page-btn" [disabled]="currentPage === 1" (click)="previousPage()">‹</button>
          <span class="page-info">{{ currentPage }}</span>
          <button class="page-btn" [disabled]="currentPage >= totalPages" (click)="nextPage()">›</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .data-table-widget {
      height: 100%;
      display: flex;
      flex-direction: column;
      background: white;
      border-radius: 8px;
      overflow: hidden;
    }

    .widget-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px;
      border-bottom: 1px solid #e5e7eb;
    }

    .widget-header h4 {
      margin: 0;
      font-size: 13px;
      font-weight: 600;
      color: #1f2937;
    }

    .controls {
      display: flex;
      gap: 4px;
    }

    .filter-btn {
      padding: 2px 6px;
      font-size: 10px;
      border: 1px solid #d1d5db;
      background: white;
      border-radius: 3px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .filter-btn:hover {
      background: #f3f4f6;
    }

    .filter-btn.active {
      background: #3b82f6;
      color: white;
      border-color: #3b82f6;
    }

    .table-container {
      flex: 1;
      overflow-y: auto;
    }

    .data-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 11px;
    }

    .data-table th {
      background: #f8fafc;
      padding: 6px 8px;
      text-align: left;
      font-weight: 600;
      color: #374151;
      border-bottom: 1px solid #e5e7eb;
      position: sticky;
      top: 0;
    }

    .table-row {
      animation: slideInUp 0.2s ease-out both;
      transition: background-color 0.2s ease;
    }

    .table-row:hover {
      background: #f8fafc;
    }

    @keyframes slideInUp {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .data-table td {
      padding: 6px 8px;
      border-bottom: 1px solid #f1f5f9;
    }

    .name-cell {
      max-width: 80px;
    }

    .name-content {
      display: flex;
      flex-direction: column;
    }

    .name-primary {
      font-weight: 500;
      color: #111827;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .name-secondary {
      font-size: 9px;
      color: #6b7280;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .status-badge {
      padding: 2px 6px;
      border-radius: 10px;
      font-size: 9px;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .status-active {
      background: #dcfce7;
      color: #166534;
    }

    .status-inactive {
      background: #f1f5f9;
      color: #475569;
    }

    .status-warning {
      background: #fef3c7;
      color: #92400e;
    }

    .value {
      font-weight: 600;
      color: #111827;
    }

    .change {
      display: flex;
      align-items: center;
      gap: 2px;
      font-weight: 500;
    }

    .change.positive {
      color: #059669;
    }

    .change.negative {
      color: #dc2626;
    }

    .change.neutral {
      color: #6b7280;
    }

    .change-icon {
      font-size: 10px;
    }

    .table-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 12px;
      border-top: 1px solid #e5e7eb;
      background: #f8fafc;
    }

    .summary {
      font-size: 10px;
      color: #6b7280;
    }

    .pagination {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .page-btn {
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid #d1d5db;
      background: white;
      border-radius: 3px;
      cursor: pointer;
      font-size: 12px;
      transition: all 0.2s ease;
    }

    .page-btn:hover:not(:disabled) {
      background: #f3f4f6;
    }

    .page-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .page-info {
      font-size: 10px;
      color: #6b7280;
      padding: 0 4px;
    }
  `]
})
export class DataTableWidgetComponent extends BaseWidgetContent implements OnInit, OnDestroy {
  @Input() widget!: Widget;
  
  private widgetApiService = inject(WidgetApiService);
  private subscription?: Subscription;

  sortBy: 'name' | 'value' = 'name';
  currentPage = 1;
  itemsPerPage = 5;
  
  originalData = signal<TableRowData[]>([]);
  displayData: TableRowData[] = [];
  isLoading = signal(true);
  error = signal<string | null>(null);

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  get totalPages(): number {
    return Math.ceil(this.originalData().length / this.itemsPerPage);
  }

  ngOnInit() {
    this.loadTableData();
  }

  private loadTableData(): void {
    this.isLoading.set(true);
    this.error.set(null);
    
    this.subscription = this.widgetApiService.fetchTableData().subscribe({
      next: (data) => {
        this.originalData.set(data);
        this.isLoading.set(false);
        this.sortData();
      },
      error: (err) => {
        console.error('Failed to load table data:', err);
        this.error.set('Failed to load table data');
        this.isLoading.set(false);
        // Use fallback data
        const fallbackData = [
          { id: 1, name: 'Product Alpha', status: 'active' as const, value: 1250, change: 5.2, category: 'Electronics' },
          { id: 2, name: 'Service Beta', status: 'warning' as const, value: 890, change: -2.1, category: 'Services' },
          { id: 3, name: 'Widget Gamma', status: 'active' as const, value: 2100, change: 12.5, category: 'Hardware' },
          { id: 4, name: 'Tool Delta', status: 'inactive' as const, value: 450, change: 0, category: 'Tools' }
        ];
        this.originalData.set(fallbackData);
        this.sortData();
      }
    });
  }

  sortData() {
    const sorted = [...this.originalData()].sort((a, b) => {
      if (this.sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else {
        return b.value - a.value;
      }
    });

    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.displayData = sorted.slice(startIndex, endIndex);
  }

  trackByFn(index: number, item: TableRowData): number {
    return item.id;
  }

  formatValue(value: number): string {
    if (value >= 1000) {
      return (value / 1000).toFixed(1) + 'K';
    }
    return value.toString();
  }

  getChangeClass(change: number): string {
    if (change > 0) return 'positive';
    if (change < 0) return 'negative';
    return 'neutral';
  }

  getChangeIcon(change: number): string {
    if (change > 0) return '↗';
    if (change < 0) return '↘';
    return '→';
  }

  getAbsoluteChange(change: number): number {
    return Math.abs(change);
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.sortData();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.sortData();
    }
  }

  refresh(): void {
    console.log('Refreshing data table widget:', this.widget?.title);
    this.loadTableData();
  }
}