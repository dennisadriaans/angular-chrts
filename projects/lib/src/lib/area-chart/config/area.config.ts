/**
 * Area Config Builder
 *
 * Pure function for building Unovis Area component configuration.
 */

import { CurveType } from '@unovis/ts';
import type { AreaConfig, AreaConfigOptions } from '../types';

/**
 * Default opacity for area fills.
 */
export const DEFAULT_AREA_OPACITY = 0.5;

/**
 * Default curve type for areas.
 */
export const DEFAULT_CURVE_TYPE = CurveType.MonotoneX;

/**
 * Builds configuration for an Unovis Area component.
 *
 * @param options - The y-accessor and color configuration
 * @param params - Additional styling parameters
 * @returns Complete Area configuration object
 *
 * @example
 * ```typescript
 * const config = buildAreaConfig(
 *   { y: (d) => d.value, color: 'url(#gradient-0)' },
 *   { hideArea: false, curveType: CurveType.Linear }
 * );
 * ```
 */
export function buildAreaConfig<T>(
  options: AreaConfigOptions<T>,
  params: {
    hideArea: boolean;
    curveType?: CurveType;
    opacity?: number;
  }
): AreaConfig<T> {
  return {
    x: (_: T, i: number) => i,
    y: options.y,
    color: options.color,
    opacity: params.hideArea ? 0 : (params.opacity ?? DEFAULT_AREA_OPACITY),
    curveType: params.curveType ?? DEFAULT_CURVE_TYPE,
  };
}
