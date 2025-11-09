// src/app/directives/widget-content-host.directive.ts

import { Directive, ViewContainerRef } from '@angular/core';

/**
 * Directive to mark the insertion point for dynamic widget content
 */
@Directive({
  selector: '[appWidgetContentHost]',
  standalone: true
})
export class WidgetContentHostDirective {
  constructor(public viewContainerRef: ViewContainerRef) {}
}

