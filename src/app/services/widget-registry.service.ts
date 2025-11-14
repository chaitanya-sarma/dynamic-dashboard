// src/app/services/widget-registry.service.ts

import { Type } from '@angular/core';
import { WidgetType } from '../models/widget.model';
import { BaseWidgetContent } from '../models/widget-content.interface';
import { Widget1Component } from '../components/widgets/widget-1/widget-1.component';
import { Widget2Component } from '../components/widgets/widget-2/widget-2.component';
import { PieChartWidgetComponent } from '../components/widgets/pie-chart-widget/pie-chart-widget.component';
import { BarChartWidgetComponent } from '../components/widgets/bar-chart-widget/bar-chart-widget.component';
import { StatsCardWidgetComponent } from '../components/widgets/stats-card-widget/stats-card-widget.component';
import { ProgressRingWidgetComponent } from '../components/widgets/progress-ring-widget/progress-ring-widget.component';
import { DataTableWidgetComponent } from '../components/widgets/data-table-widget/data-table-widget.component';
import { LineChartWidgetComponent } from '../components/widgets/line-chart-widget/line-chart-widget.component';

/**
 * Widget Registry - Maps widget types to their components
 * 
 * TO ADD A NEW WIDGET:
 * 1. Create your widget component in src/app/components/widgets/
 * 2. Make it extend BaseWidgetContent
 * 3. Import it above
 * 4. Add it to the WIDGET_REGISTRY map below
 * 5. Add the type to widget.model.ts (WidgetType and WIDGET_TYPES array)
 */
export const WIDGET_REGISTRY: Map<WidgetType, Type<any>> = new Map([
  ['widget-1', Widget1Component],
  ['widget-2', Widget2Component],
  ['pie-chart', PieChartWidgetComponent],
  ['bar-chart', BarChartWidgetComponent],
  ['stats-card', StatsCardWidgetComponent],
  ['progress-ring', ProgressRingWidgetComponent],
  ['data-table', DataTableWidgetComponent],
  ['line-chart', LineChartWidgetComponent]
  // Add new widgets here...
] as any);

/**
 * Get widget component by type
 */
export function getWidgetComponent(type: WidgetType): Type<any> | undefined {
  return WIDGET_REGISTRY.get(type);
}
