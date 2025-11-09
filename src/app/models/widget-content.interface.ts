// src/app/models/widget-content.interface.ts

/**
 * Simple base interface that all widget components must implement
 * This ensures widgets can be refreshed
 */
export abstract class BaseWidgetContent {
  /**
   * Refresh the widget data/content
   * Called when user clicks the refresh button
   */
  abstract refresh(): void;
}

