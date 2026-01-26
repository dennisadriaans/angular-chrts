/**
 * Central export point for shared chart types and configurations.
 * 
 * These types are used across multiple chart components for:
 * - Legend configuration (LegendPosition, BulletLegendItemInterface)
 * - Axis configuration (AxisFormatter, AxisConfig)
 * - Common chart settings (CurveType, Orientation from @unovis/ts, MarkerConfig, CrosshairConfig)
 * - Tooltip configuration (TooltipConfig)
 * 
 * For better tree-shaking, import directly from specific files:
 * - './common' for CurveType, Orientation, MarkerConfig, CrosshairConfig
 * - './legend' for LegendPosition, BulletLegendItemInterface
 * - './axis' for AxisFormatter, AxisConfig
 * - './tooltip' for TooltipConfig
 */

// Re-export all shared types
export * from './common';
export * from './legend';
export * from './axis';
export * from './tooltip';

// Maintain backwards compatibility with camelCase naming
export type { AxisFormatter as axisFormatter } from './axis';


