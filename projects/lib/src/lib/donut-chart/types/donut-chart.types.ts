// Re-export shared types
export type { NormalizedLegendItem } from '../../utils/shared';

/**
 * Available display types for the donut chart.
 */
export enum DonutType {
  /** Full circle donut chart */
  Full = 'full',
  /** Half circle (semi-circle) donut chart */
  Half = 'half',
}

/**
 * Signature of structural properties that require a full chart rebuild when changed.
 * For donut charts, the type (full/half) affects the angle range and requires rebuild.
 */
export interface DonutStructuralSignature {
  type: DonutType;
  hideTooltip: boolean;
  hideLegend: boolean;
}

/**
 * Configuration options for the donut component.
 */
export interface DonutConfig {
  cornerRadius: number;
  arcWidth: number;
  colors: string[];
  angleRange: [number, number] | undefined;
  padAngle: number;
}

/**
 * Configuration options for building donut config.
 */
export interface DonutConfigOptions {
  radius: number;
  arcWidth: number;
  colors: string[];
  type: DonutType;
  padAngle: number;
}

/**
 * Configuration options for the donut container.
 */
export interface DonutContainerConfigOptions {
  height: number;
}
