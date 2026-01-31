/**
 * Bar Chart Types
 *
 * Central type definitions for the bar chart component.
 *
 * SOLID: Single Responsibility - only type definitions
 */

import type { NumericAccessor } from '@unovis/ts';
import { Orientation } from '@unovis/ts';

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

/**
 * Signature of structural properties that require a full chart rebuild when changed.
 * Changes to any property in this signature trigger a destroy/recreate cycle.
 */
export interface BarStructuralSignature {
  stacked: boolean;
  categoryKeys: string;
  yAxisKeys: string;
  hideXAxis: boolean;
  hideYAxis: boolean;
  hideTooltip: boolean;
  orientation: Orientation;
}

/**
 * Configuration options for bar components (grouped or stacked).
 */
export interface BarConfig<T> {
  x: (d: T, i: number) => number;
  y: NumericAccessor<T>[];
  color: string[];
  roundedCorners: number;
  barPadding: number;
  orientation: Orientation;
  groupPadding?: number;
}

/**
 * Options for building bar configuration.
 */
export interface BarConfigOptions<T> {
  yAccessors: NumericAccessor<T>[];
  colors: string[];
  radius?: number;
  barPadding: number;
  groupPadding?: number;
  orientation: Orientation;
}

/**
 * Options for building X-axis configuration.
 */
export interface BarXAxisConfigOptions {
  label?: string;
  numTicks?: number;
  tickFormat?: (tick: number | Date, i: number, ticks: (number | Date)[]) => string;
  tickValues?: number[];
  gridLine?: boolean;
  domainLine?: boolean;
  tickLine?: boolean;
  minMaxTicksOnly?: boolean;
}

/**
 * Options for building Y-axis configuration.
 */
export interface BarYAxisConfigOptions {
  label?: string;
  numTicks?: number;
  tickFormat?: (tick: number | Date, i: number, ticks: (number | Date)[]) => string;
  gridLine?: boolean;
  domainLine?: boolean;
  tickLine?: boolean;
  orientation?: Orientation;
}
