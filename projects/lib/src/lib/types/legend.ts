/**
 * Legend-related types and configurations.
 * These types define how legends are displayed and positioned in charts.
 */

/**
 * Available positions for chart legends.
 */
export enum LegendPosition {
  TopLeft = "top-left",
  TopCenter = "top-center",
  TopRight = "top-right",
  BottomLeft = "bottom-left",
  BottomCenter = "bottom-center",
  BottomRight = "bottom-right",
}

/**
 * Configuration for individual legend items.
 * Defines the appearance and behavior of each item in the chart legend.
 */
export interface BulletLegendItemInterface {
  /**
   * Display name for the legend item
   */
  name: string | number;
  /**
   * Color(s) for the legend item. Can be a single color or gradient.
   */
  color?: string | Array<string>;
  /**
   * Optional CSS class name for custom styling
   */
  className?: string;
  /**
   * Whether the legend item is in an inactive state
   */
  inactive?: boolean;
  /**
   * Whether the legend item is hidden
   */
  hidden?: boolean;
  /**
   * Whether the cursor should change to pointer on hover
   */
  pointer?: boolean;
}

/**
 * Alias for BulletLegendItemInterface specifically for area charts.
 * This improves developer experience by providing a more context-specific type name.
 */
export type AreaChartCategory = BulletLegendItemInterface;
