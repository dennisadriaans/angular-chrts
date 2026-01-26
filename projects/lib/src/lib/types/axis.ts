/**
 * Axis-related types and configurations.
 * These types define how chart axes are formatted and displayed.
 */

/**
 * Formatter function for axis tick labels.
 * Supports both numeric and date-based axes.
 */
export type AxisFormatter =
  | ((tick: number, i?: number, ticks?: number[]) => string)
  | ((tick: Date, i?: number, ticks?: Date[]) => string);

/**
 * Configuration for chart axes (X and Y).
 * Controls the appearance and behavior of axis ticks, labels, and grid lines.
 */
export interface AxisConfig {
  /**
   * Whether to display tick lines
   */
  tickLine?: boolean;
  /**
   * Font size for tick text
   */
  tickTextFontSize?: string;
  /**
   * Color for tick text
   */
  tickTextColor?: string;
  /**
   * Custom formatter for tick labels
   */
  tickFormat?: AxisFormatter;
  /**
   * Text alignment for tick labels
   */
  tickTextAlign?: "left" | "right" | "center";
  /**
   * Rotation angle for tick text in degrees
   */
  tickTextAngle?: number;
  /**
   * Maximum width for tick text before wrapping/trimming
   */
  tickTextWidth?: number;
  /**
   * How to handle text overflow
   */
  tickTextFitMode?: "wrap" | "trim";
  /**
   * Where to trim text if using trim mode
   */
  tickTextTrimType?: "start" | "middle" | "end";
  /**
   * Force word breaks for long text
   */
  tickTextForceWordBreak?: boolean;
  /**
   * Separator character(s) for text wrapping
   */
  tickTextSeparator?: string | readonly string[];
  /**
   * Only show minimum and maximum tick values
   */
  minMaxTicksOnly?: boolean;
  /**
   * Show grid lines only for min/max ticks
   */
  minMaxTicksOnlyShowGridLines?: boolean;
  /**
   * Explicit tick values to display
   */
  tickValues?: readonly number[] | readonly Date[];
}
