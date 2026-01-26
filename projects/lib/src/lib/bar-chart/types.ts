/**
 * Defined types for the Bar Chart component.
 */

/**
 * Configuration for value labels displayed on bars.
 */
export interface ValueLabel {
  /** Whether to show labels on bars */
  show?: boolean;
  /** Color of the label text */
  color?: string;
  /** Font size of the label text */
  fontSize?: string;
  /** Alignment of the label */
  alignment?: 'left' | 'right' | 'center';
  /** Margin of the label from the bar edge */
  margin?: number;
}
