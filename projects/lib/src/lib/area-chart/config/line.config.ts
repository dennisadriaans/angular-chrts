import { CurveType } from '@unovis/ts';
import type { LineConfig, LineConfigOptions } from '../types';

/**
 * Default line width.
 */
export const DEFAULT_LINE_WIDTH = 2;

/**
 * Default curve type for lines.
 */
export const DEFAULT_LINE_CURVE_TYPE = CurveType.MonotoneX;

/**
 * Builds configuration for an Unovis Line component.
 *
 * @param options - The y-accessor, color, and dash configuration
 * @param params - Additional styling parameters
 * @returns Complete Line configuration object
 *
 * @example
 * ```typescript
 * const config = buildLineConfig(
 *   { y: (d) => d.value, color: '#3b82f6', lineDashArray: [5, 5] },
 *   { lineWidth: 2, curveType: CurveType.Linear }
 * );
 * ```
 */
export function buildLineConfig<T>(
  options: LineConfigOptions<T>,
  params: {
    lineWidth?: number;
    curveType?: CurveType;
  }
): LineConfig<T> {
  return {
    x: (_: T, i: number) => i,
    y: options.y,
    color: options.color,
    curveType: params.curveType ?? DEFAULT_LINE_CURVE_TYPE,
    lineWidth: params.lineWidth ?? DEFAULT_LINE_WIDTH,
    lineDashArray: options.lineDashArray,
  };
}
