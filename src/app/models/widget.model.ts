// src/app/models/widget.model.ts

// Widget type definitions - maps to actual widget components
export type WidgetType = 
  | 'widget-1'       // Metrics and charts widget
  | 'widget-2'       // Simple text widget
  | 'pie-chart'      // Online pie chart widget
  | 'bar-chart'      // Online bar chart widget
  | 'line-chart'     // Online line chart widget
  | 'stats-card'     // Online statistics card
  | 'progress-ring'  // Online progress ring widget
  | 'data-table';    // Online data table widget
  // Add more widget types here as you create them

export interface Widget {
  id: string;
  title: string;
  type: WidgetType;                             // Widget type identifier
  gridPosition: { col: number; row: number };   // 0-indexed grid coordinates
  gridSize: { colSpan: number; rowSpan: number }; // Grid units to span
  color: string;                                // Hex color for background
  config?: WidgetConfig;                        // Type-specific configuration
  dataSource?: WidgetDataSource;                // Data fetching configuration (future use)
}

// Type-specific configuration
export interface WidgetConfig {
  refreshInterval?: number;                     // Auto-refresh in seconds (0 = manual only)
  chartType?: 'bar' | 'line' | 'pie' | 'area'; // For chart widgets
  dateRange?: 'day' | 'week' | 'month' | 'year'; // For analytics widgets
  showLegend?: boolean;                         // For chart widgets
  maxItems?: number;                            // For list-based widgets
  [key: string]: any;                           // Allow custom config
}

// Data source configuration for remote widget data
export interface WidgetDataSource {
  endpoint?: string;                            // API endpoint URL
  params?: Record<string, any>;                 // Query parameters for the API call
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';   // HTTP method
  cacheTimeout?: number;                        // Cache duration in seconds
  headers?: Record<string, string>;             // Custom headers for API calls
  lastFetched?: Date;                          // Timestamp of last successful fetch
  isLoading?: boolean;                         // Loading state for this widget's data
  error?: string;                              // Last error message if any
}

export interface DashboardLayout {
  columns: number;
  gap: number;
  widgets: Widget[];
}

export const GRID_CONFIG = {
  columns: 12,           // Total columns in grid
  rowHeight: 100,        // Height per row in pixels
  gap: 16,               // Gap between widgets in pixels
  minWidgetSize: 1,      // Minimum widget size (col/row span)
  maxWidgetCols: 12,     // Max column span
  maxWidgetRows: 8       // Max row span
};

// Widget color palette - nice pastel colors for widgets
export const WIDGET_COLOR_PALETTE = [
  '#e3f2fd', // Light Blue
  '#f3e5f5', // Light Purple
  '#e8f5e9', // Light Green
  '#fff3e0', // Light Orange
  '#fce4ec', // Light Pink
  '#e0f2f1', // Light Teal
  '#f1f8e9', // Light Lime
  '#fff9c4', // Light Yellow
  '#ffeaa7', // Light Peach
  '#dfe6e9', // Light Gray
  '#fab1a0', // Light Coral
  '#74b9ff', // Sky Blue
  '#a29bfe', // Light Lavender
  '#fd79a8', // Light Rose
  '#fdcb6e', // Light Gold
  '#e17055'  // Light Terracotta
];

// Single default color for all widgets (fallback)
export const DEFAULT_WIDGET_COLOR = '#ffffff';  // White

/**
 * Get a random color from the palette
 */
export function getRandomWidgetColor(): string {
  return WIDGET_COLOR_PALETTE[Math.floor(Math.random() * WIDGET_COLOR_PALETTE.length)];
}

// Widget type metadata for UI
export interface WidgetTypeMetadata {
  type: WidgetType;
  label: string;
  description: string;
  icon: string;  // Icon name or path
  defaultSize: { colSpan: number; rowSpan: number };
  defaultConfig?: WidgetConfig;
  /**
   * Whether this widget type is provided by the online service.
   * If false or undefined, it will be treated as a local/create-new widget.
   */
  isOnlineSource?: boolean;
}

// Available widget types with metadata
// Add new widgets here when you create them
export const WIDGET_TYPES: WidgetTypeMetadata[] = [
  // Local / Create New widget types
  {
    type: 'widget-1',
    label: 'Metrics & Charts',
    description: 'Displays metrics and bar charts',
    icon: 'chart-bar',
    defaultSize: { colSpan: 3, rowSpan: 2 }
  },
  {
    type: 'widget-2',
    label: 'Text Widget',
    description: 'Simple static text display',
    icon: 'text',
    defaultSize: { colSpan: 2, rowSpan: 1 }
  },

  // Online widget types (only appear in "From Online" tab)
  {
    type: 'pie-chart',
    label: 'Pie Chart',
    description: 'Interactive pie chart with live data',
    icon: 'pie-chart',
    defaultSize: { colSpan: 2, rowSpan: 2 },
    isOnlineSource: true
  },
  {
    type: 'bar-chart',
    label: 'Bar Chart',
    description: 'Dynamic bar chart visualization',
    icon: 'bar-chart',
    defaultSize: { colSpan: 3, rowSpan: 2 },
    isOnlineSource: true
  },
  {
    type: 'line-chart',
    label: 'Line Chart',
    description: 'Time series line chart',
    icon: 'line-chart',
    defaultSize: { colSpan: 3, rowSpan: 2 },
    isOnlineSource: true
  },
  {
    type: 'stats-card',
    label: 'Statistics Card',
    description: 'Key metrics and statistics',
    icon: 'stats',
    defaultSize: { colSpan: 2, rowSpan: 1 },
    isOnlineSource: true
  },
  {
    type: 'progress-ring',
    label: 'Progress Ring',
    description: 'Circular progress indicator',
    icon: 'progress-ring',
    defaultSize: { colSpan: 1, rowSpan: 1 },
    isOnlineSource: true
  },
  {
    type: 'data-table',
    label: 'Data Table',
    description: 'Tabular data display',
    icon: 'table',
    defaultSize: { colSpan: 4, rowSpan: 3 },
    isOnlineSource: true
  }
];

// Loading states for dashboard operations
export interface DashboardLoadingState {
  isLoadingWidgets: boolean;
  isCreatingWidget: boolean;
  isUpdatingWidget: boolean;
  isDeletingWidget: boolean;
  error: string | null;
}

// Widget synchronization status
export interface WidgetSyncStatus {
  id: string;
  lastSynced: Date | null;
  isPending: boolean;
  error: string | null;
}
