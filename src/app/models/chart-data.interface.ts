// src/app/models/chart-data.interface.ts

// Chart data interfaces for dynamic data loading
export interface PieChartData {
  label: string;
  value: number;
  color: string;
}

export interface LineChartDataPoint {
  x: number;
  y: number;
  label: string;
}

export interface BarChartData {
  label: string;
  value: number;
  color: string;
}

export interface StatsData {
  title: string;
  value: number;
  unit: string;
  trend: number; // percentage change
  trendDirection: 'up' | 'down';
}

export interface ProgressData {
  current: number;
  target: number;
  unit: string;
  label: string;
}

export interface TableRowData {
  id: number;
  name: string;
  status: 'active' | 'inactive' | 'warning';
  value: number;
  change: number;
  category: string;
}

// API response interfaces for different data sources
export interface CryptoApiResponse {
  id: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  total_volume: number;
}

export interface WeatherApiResponse {
  name: string;
  main: {
    temp: number;
    humidity: number;
    pressure: number;
  };
  weather: [{
    main: string;
    description: string;
  }];
  wind: {
    speed: number;
  };
}

export interface StockApiResponse {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
}

export interface CountryApiResponse {
  name: {
    common: string;
  };
  population: number;
  area: number;
  region: string;
  subregion: string;
}