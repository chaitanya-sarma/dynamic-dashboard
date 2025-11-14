// src/app/services/widget-api.service.ts

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError, delay, map, catchError, timeout, forkJoin } from 'rxjs';
import { Widget, WidgetType, getRandomWidgetColor, WIDGET_TYPES } from '../models/widget.model';
import { PieChartData, LineChartDataPoint, BarChartData, StatsData, TableRowData, CryptoApiResponse, WeatherApiResponse, CountryApiResponse } from '../models/chart-data.interface';

// Interface for the API response structure
export interface WidgetApiResponse {
  id: number;
  title: string;
  body?: string;
  userId?: number;
  type?: WidgetType;
}

// API Configuration
const API_CONFIG = {
  // Using JSONPlaceholder as a mock API service
  BASE_URL: 'https://jsonplaceholder.typicode.com',
  ENDPOINTS: {
    POSTS: '/posts', // We'll use posts as widget data source
    USERS: '/users'  // Additional endpoint for user data
  },
  // Fallback to local data if API fails
  USE_FALLBACK: true,
  TIMEOUT: 5000
};

// Real data APIs for dynamic charts
const CHART_DATA_APIS = {
  CRYPTO: 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=5&page=1',
  COUNTRIES: 'https://restcountries.com/v3.1/region/europe?fields=name,population,area',
  RANDOM_DATA: 'https://jsonplaceholder.typicode.com/users',
  STATS_DATA: 'https://jsonplaceholder.typicode.com/posts?_limit=10'
};

@Injectable({
  providedIn: 'root'
})
export class WidgetApiService {
  private http = inject(HttpClient);

  /**
   * Fetch widgets from the online service
   * Transforms API response into Widget objects
   */
  fetchWidgets(): Observable<Widget[]> {
    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.POSTS}`;
    
    return this.http.get<WidgetApiResponse[]>(url).pipe(
      map(apiData => this.transformApiDataToWidgets(apiData)),
      catchError(error => this.handleApiError(error))
    );
  }

  /**
   * Fetch a single widget by ID from the online service
   */
  fetchWidgetById(id: string): Observable<Widget> {
    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.POSTS}/${id}`;
    
    return this.http.get<WidgetApiResponse>(url).pipe(
      map(apiData => this.transformSingleApiDataToWidget(apiData)),
      catchError(error => this.handleApiError(error))
    );
  }

  /**
   * Create a new widget on the server
   * In a real implementation, this would POST to your API
   */
  createWidget(widget: Partial<Widget>): Observable<Widget> {
    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.POSTS}`;
    
    // Transform widget back to API format
    const apiPayload = {
      title: widget.title || 'New Widget',
      body: `Widget of type ${widget.type}`,
      userId: 1
    };

    return this.http.post<WidgetApiResponse>(url, apiPayload).pipe(
      map(apiData => this.transformSingleApiDataToWidget(apiData, widget)),
      catchError(error => this.handleApiError(error))
    );
  }

  /**
   * Update a widget on the server
   * In a real implementation, this would PUT/PATCH to your API
   */
  updateWidget(widget: Widget): Observable<Widget> {
    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.POSTS}/${widget.id}`;
    
    const apiPayload = {
      id: parseInt(widget.id),
      title: widget.title,
      body: `Updated widget of type ${widget.type}`,
      userId: 1
    };

    return this.http.put<WidgetApiResponse>(url, apiPayload).pipe(
      map(() => widget), // Return the original widget since JSONPlaceholder just echoes back
      catchError(error => this.handleApiError(error))
    );
  }

  /**
   * Delete a widget on the server
   */
  deleteWidget(widgetId: string): Observable<void> {
    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.POSTS}/${widgetId}`;
    
    return this.http.delete<void>(url).pipe(
      catchError(error => this.handleApiError(error))
    );
  }

  /**
   * Transform API response data into Widget objects
   * This is where we map external API data to our internal Widget model
   */
  private transformApiDataToWidgets(apiData: WidgetApiResponse[]): Widget[] {
    // Create diverse widget types for variety
    const widgetTypes: WidgetType[] = [
      'pie-chart', 'bar-chart', 'line-chart', 'stats-card', 
      'progress-ring', 'data-table', 'widget-1', 'widget-2'
    ];
    
    // Take only 8 posts to match our widget types
    return apiData.slice(0, 8).map((item, index) => {
      const widgetType = widgetTypes[index % widgetTypes.length];
      return this.transformSingleApiDataToWidget(item, { type: widgetType }, index);
    });
  }

  /**
   * Transform a single API response item into a Widget object
   */
  private transformSingleApiDataToWidget(
    apiData: WidgetApiResponse, 
    overrides: Partial<Widget> = {}, 
    index: number = 0
  ): Widget {
    const widgetType: WidgetType = overrides.type || 'widget-1';
    
    // Get default size from widget metadata
    const widgetMetadata = WIDGET_TYPES.find(w => w.type === widgetType);
    const defaultSize = widgetMetadata?.defaultSize || { colSpan: 2, rowSpan: 1 };
    
    // Calculate grid position in a flowing layout
    const positions = this.calculateGridPosition(index, defaultSize);
    
    // Generate diverse titles based on widget type
    const title = this.generateWidgetTitle(widgetType, apiData.title, index);

    return {
      id: overrides.id || `online-${apiData.id}`,
      title: overrides.title || title,
      type: widgetType,
      gridPosition: overrides.gridPosition || positions,
      gridSize: overrides.gridSize || defaultSize,
      color: overrides.color || getRandomWidgetColor(),
      dataSource: {
        endpoint: `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.POSTS}/${apiData.id}`,
        method: 'GET',
        cacheTimeout: 300 // 5 minutes cache
      },
      config: {
        refreshInterval: 0, // Manual refresh only by default
        ...overrides.config
      }
    };
  }

  /**
   * Calculate grid position for widget based on index and size
   */
  private calculateGridPosition(index: number, size: { colSpan: number; rowSpan: number }): { col: number; row: number } {
    // Simple flow layout - try to fit widgets efficiently
    const positions = [
      { col: 0, row: 0 },   // Top left
      { col: 3, row: 0 },   // Top center
      { col: 6, row: 0 },   // Top right
      { col: 9, row: 0 },   // Top far right
      { col: 0, row: 2 },   // Second row left
      { col: 4, row: 2 },   // Second row center
      { col: 0, row: 4 },   // Third row left
      { col: 3, row: 4 }    // Third row center
    ];
    
    return positions[index] || { col: (index % 3) * 3, row: Math.floor(index / 3) * 2 };
  }

  /**
   * Generate appropriate titles for different widget types
   */
  private generateWidgetTitle(type: WidgetType, originalTitle: string, index: number): string {
    const titleMap: Record<WidgetType, string[]> = {
      'pie-chart': ['Market Share', 'Budget Distribution', 'Revenue Breakdown', 'Category Split'],
      'bar-chart': ['Monthly Sales', 'Performance Metrics', 'Growth Statistics', 'Comparison Chart'],
      'line-chart': ['Trend Analysis', 'Time Series', 'Growth Trajectory', 'Performance Over Time'],
      'stats-card': ['Key Metrics', 'Performance Stats', 'Summary Card', 'KPI Overview'],
      'progress-ring': ['Goal Progress', 'Completion Rate', 'Target Achievement', 'Progress Tracker'],
      'data-table': ['Data Overview', 'Records Table', 'Information Grid', 'Data Summary'],
      'widget-1': ['Analytics Dashboard', 'Metrics Overview'],
      'widget-2': ['Quick Info', 'Status Update']
    };
    
    const titles = titleMap[type] || [originalTitle];
    return titles[index % titles.length];
  }

  /**
   * Handle API errors with fallback to local data if enabled
   */
  private handleApiError(error: HttpErrorResponse): Observable<any> {
    console.error('Widget API Error:', error);
    
    if (API_CONFIG.USE_FALLBACK) {
      console.log('Falling back to sample data...');
      return this.getFallbackWidgets();
    }
    
    // Transform HTTP errors into user-friendly messages
    let errorMessage = 'Failed to load widgets';
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Network error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Server error (${error.status}): ${error.message}`;
    }
    
    return throwError(() => new Error(errorMessage));
  }

  /**
   * Fallback sample data when API is unavailable
   * Matches the original sample data structure
   */
  private getFallbackWidgets(): Observable<Widget[]> {
    const fallbackWidgets: Widget[] = [
      {
        id: 'fallback-1',
        title: 'Sample Metrics (Offline)',
        type: 'widget-1',
        gridPosition: { col: 0, row: 0 },
        gridSize: { colSpan: 3, rowSpan: 2 },
        color: '#e3f2fd',
        config: { refreshInterval: 0 }
      },
      {
        id: 'fallback-2',
        title: 'Welcome Message (Offline)',
        type: 'widget-2',
        gridPosition: { col: 3, row: 0 },
        gridSize: { colSpan: 2, rowSpan: 2 },
        color: '#f3e5f5',
        config: { refreshInterval: 0 }
      }
    ];

    // Simulate network delay even for fallback data
    return of(fallbackWidgets).pipe(delay(500));
  }

  /**
   * Test API connectivity
   */
  testConnection(): Observable<boolean> {
    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.POSTS}/1`;
    
    return this.http.get(url).pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }

  /**
   * Fetch pie chart data from cryptocurrency API
   */
  fetchPieChartData(): Observable<PieChartData[]> {
    return this.http.get<CryptoApiResponse[]>(CHART_DATA_APIS.CRYPTO)
      .pipe(
        timeout(API_CONFIG.TIMEOUT),
        map(cryptos => cryptos.slice(0, 5).map((crypto, index) => ({
          label: crypto.name,
          value: Math.round(crypto.market_cap / 1000000000), // Convert to billions
          color: this.getChartColor(index)
        }))),
        catchError(() => of(this.getFallbackPieData()))
      );
  }

  /**
   * Fetch line chart data from user activity simulation
   */
  fetchLineChartData(): Observable<LineChartDataPoint[]> {
    return this.http.get<any[]>(CHART_DATA_APIS.RANDOM_DATA)
      .pipe(
        timeout(API_CONFIG.TIMEOUT),
        map(users => {
          const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
          return months.map((month, index) => ({
            x: index,
            y: Math.floor(Math.random() * 50) + (users[index]?.id || 0) * 5,
            label: month
          }));
        }),
        catchError(() => of(this.getFallbackLineData()))
      );
  }

  /**
   * Fetch bar chart data from countries API
   */
  fetchBarChartData(): Observable<BarChartData[]> {
    return this.http.get<CountryApiResponse[]>(CHART_DATA_APIS.COUNTRIES)
      .pipe(
        timeout(API_CONFIG.TIMEOUT),
        map(countries => countries.slice(0, 6).map((country, index) => ({
          label: country.name.common,
          value: Math.round(country.population / 1000000), // Convert to millions
          color: this.getChartColor(index)
        }))),
        catchError(() => of(this.getFallbackBarData()))
      );
  }

  /**
   * Fetch stats data from posts API
   */
  fetchStatsData(): Observable<StatsData> {
    return this.http.get<any[]>(CHART_DATA_APIS.STATS_DATA)
      .pipe(
        timeout(API_CONFIG.TIMEOUT),
        map(posts => ({
          title: 'Total Posts',
          value: posts.length,
          unit: 'posts',
          trend: Math.floor(Math.random() * 20) - 10, // Random trend between -10 and +10
          trendDirection: (Math.random() > 0.5 ? 'up' : 'down') as 'up' | 'down'
        })),
        catchError(() => of(this.getFallbackStatsData()))
      );
  }

  /**
   * Fetch table data from users API
   */
  fetchTableData(): Observable<TableRowData[]> {
    return this.http.get<any[]>(CHART_DATA_APIS.RANDOM_DATA)
      .pipe(
        timeout(API_CONFIG.TIMEOUT),
        map(users => users.slice(0, 7).map((user, index) => ({
          id: user.id,
          name: user.name,
          status: ['active', 'inactive', 'warning'][index % 3] as 'active' | 'inactive' | 'warning',
          value: Math.floor(Math.random() * 5000) + 500,
          change: Math.floor(Math.random() * 20) - 10,
          category: user.company?.name || 'General'
        }))),
        catchError(() => of(this.getFallbackTableData()))
      );
  }

  // Fallback data methods
  private getFallbackPieData(): PieChartData[] {
    return [
      { label: 'Desktop', value: 45, color: '#3b82f6' },
      { label: 'Mobile', value: 35, color: '#10b981' },
      { label: 'Tablet', value: 20, color: '#f59e0b' }
    ];
  }

  private getFallbackLineData(): LineChartDataPoint[] {
    return [
      { x: 0, y: 45, label: 'Jan' },
      { x: 1, y: 52, label: 'Feb' },
      { x: 2, y: 38, label: 'Mar' },
      { x: 3, y: 61, label: 'Apr' },
      { x: 4, y: 73, label: 'May' },
      { x: 5, y: 69, label: 'Jun' },
      { x: 6, y: 84, label: 'Jul' }
    ];
  }

  private getFallbackBarData(): BarChartData[] {
    return [
      { label: 'Q1', value: 65, color: '#3b82f6' },
      { label: 'Q2', value: 78, color: '#10b981' },
      { label: 'Q3', value: 52, color: '#f59e0b' },
      { label: 'Q4', value: 91, color: '#ef4444' }
    ];
  }

  private getFallbackStatsData(): StatsData {
    return {
      title: 'Sample Metric',
      value: 1234,
      unit: 'units',
      trend: 5.2,
      trendDirection: 'up'
    };
  }

  private getFallbackTableData(): TableRowData[] {
    return [
      { id: 1, name: 'Product Alpha', status: 'active', value: 1250, change: 5.2, category: 'Electronics' },
      { id: 2, name: 'Service Beta', status: 'warning', value: 890, change: -2.1, category: 'Services' },
      { id: 3, name: 'Widget Gamma', status: 'active', value: 2100, change: 12.5, category: 'Hardware' },
      { id: 4, name: 'Tool Delta', status: 'inactive', value: 450, change: 0, category: 'Tools' }
    ];
  }

  private getChartColor(index: number): string {
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
    return colors[index % colors.length];
  }

  /**
   * Get API configuration (useful for debugging)
   */
  getApiConfig() {
    return { ...API_CONFIG };
  }
}