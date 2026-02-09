import type { BulletLegendItemInterface as UnovisBulletLegendItemInterface } from '@unovis/ts';

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
 *
 * This is a type-only alias to the upstream Unovis type to avoid duplication
 * and keep compatibility with Unovis components.
 */
export type BulletLegendItemInterface = UnovisBulletLegendItemInterface;

/**
 * Alias for BulletLegendItemInterface specifically for area charts.
 * This improves developer experience by providing a more context-specific type name.
 */
export type AreaChartCategory = BulletLegendItemInterface;
