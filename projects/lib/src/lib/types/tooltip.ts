/**
 * Configuration for chart tooltips.
 * Controls timing and positioning of tooltip displays.
 */
export interface TooltipConfig {
  /**
   * Hide delay in milliseconds. Default: undefined
   */
  hideDelay?: number;
  /**
   * Show delay in milliseconds. Default: undefined
   */
  showDelay?: number;
  /**
   * If `true`, the tooltip will follow the cursor.
   */
  followCursor?: boolean;
}
