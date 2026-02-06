/**
 * Area Chart Types
 *
 * Central type definitions for the area chart component.
 * Keeping types separate improves:
 * - Reusability across config builders and utilities
 * - Tree-shaking (types are erased at compile time)
 * - Documentation and IntelliSense
 *
 * SOLID: Single Responsibility - only type definitions
 */

import { CurveType } from '@unovis/ts';

/**
 * Describes a single data series in the chart.
 * Used to generate consistent configuration for areas, lines, and SVG defs.
 */
export interface SeriesDescriptor {
  /** The data property key this series represents */
  key: string;
  /** The color for this series */
  color: string;
  /** The gradient ID for area fills */
  gradientId: string;
  /** Optional dash pattern for the line */
  lineDashArray?: number[];
}

/**
 * Signature of structural properties that require a full chart rebuild when changed.
 * Changes to any property in this signature trigger a destroy/recreate cycle
 * rather than an in-place update.
 */
export interface StructuralSignature {
  stacked: boolean;
  categoryKeys: string;
  hideXAxis: boolean;
  hideYAxis: boolean;
  hideTooltip: boolean;
  showLabels: boolean;
}

/**
 * Configuration options for XYLabels component.
 * Typed subset of Unovis XYLabelsConfigInterface.
 */
export interface XYLabelsConfig<T> {
  x: (d: T) => number | undefined;
  y: (d: T) => number;
  label?: (d: T) => string | undefined;
  color?: string | ((d: T) => string);
  backgroundColor?: string | ((d: T) => string);
  attributes?: Record<string, any>;
  events?: Record<string, any>;
}

/**
 * Configuration options for Area component.
 * Typed subset of Unovis AreaConfigInterface.
 */
export interface AreaConfig<T> {
  x: (d: T, i: number) => number;
  y: ((d: T) => number) | Array<(d: T) => number>;
  color: string | string[];
  opacity: number;
  curveType: CurveType;
}

/**
 * Configuration options for Line component.
 * Typed subset of Unovis LineConfigInterface.
 */
export interface LineConfig<T> {
  x: (d: T, i: number) => number;
  y: ((d: T) => number) | Array<(d: T) => number>;
  color: string | string[];
  curveType: CurveType;
  lineWidth: number;
  lineDashArray?: number[];
}

/**
 * Options for building area configuration.
 */
export interface AreaConfigOptions<T> {
  y: ((d: T) => number) | Array<(d: T) => number>;
  color: string | string[];
}

/**
 * Options for building line configuration.
 */
export interface LineConfigOptions<T> {
  y: ((d: T) => number) | Array<(d: T) => number>;
  color: string | string[];
  lineDashArray?: number[];
}

/**
 * Options for building X-axis configuration.
 */
export interface XAxisConfigOptions {
  label?: string;
  numTicks?: number;
  tickFormat?: (value: number | Date, index: number, ticks: (number | Date)[]) => string;
  tickValues?: number[];
  gridLine?: boolean;
  domainLine?: boolean;
  tickLine?: boolean;
  minMaxTicksOnly?: boolean;
}

/**
 * Options for building Y-axis configuration.
 */
export interface YAxisConfigOptions {
  label?: string;
  numTicks?: number;
  tickFormat?: (value: number | Date, index: number, ticks: (number | Date)[]) => string;
  gridLine?: boolean;
  domainLine?: boolean;
  tickLine?: boolean;
}

/**
 * Gradient stop configuration for SVG gradients.
 */
export interface GradientStop {
  offset: string;
  stopOpacity: number;
}
