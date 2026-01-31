/**
 * SVG Generators
 *
 * Pure functions for generating SVG gradient definitions.
 *
 * SOLID Principles:
 * - SRP: Only responsible for SVG generation
 * - OCP: New SVG elements can be added without modifying existing code
 */

import type { GradientStop } from '../types';

/**
 * Generates a gradient ID from index and color.
 *
 * @param index - The series index
 * @param color - The color value (hex or CSS variable)
 * @returns A unique gradient ID string
 *
 * @example
 * ```typescript
 * const id = getGradientId(0, '#3b82f6');
 * // Returns: 'gradient-0-3b82f6'
 * ```
 */
export function getGradientId(index: number, color: string): string {
  return `gradient-${index}-${color.replace(/#/g, '')}`;
}

/**
 * Generates SVG linear gradient definitions for area fills.
 *
 * @param colors - Array of colors for each series
 * @param stops - Array of gradient stop configurations
 * @returns SVG defs string containing all gradient definitions
 *
 * @example
 * ```typescript
 * const defs = generateGradientDefs(
 *   ['#3b82f6', '#ef4444'],
 *   [{ offset: '0%', stopOpacity: 1 }, { offset: '75%', stopOpacity: 0 }]
 * );
 * ```
 */
export function generateGradientDefs(
  colors: string[],
  stops: GradientStop[]
): string {
  return colors
    .map((color, index) => {
      const id = getGradientId(index, color);
      const stopElements = stops
        .map((stop) => `<stop offset="${stop.offset}" stop-color="${color}" stop-opacity="${stop.stopOpacity}" />`)
        .join('');
      
      return `
        <linearGradient id="${id}" gradientTransform="rotate(90)">
          ${stopElements}
          <stop offset="100%" stop-color="${color}" stop-opacity="0" />
        </linearGradient>
      `;
    })
    .join('');
}

/**
 * Generates CSS custom properties for marker URLs.
 *
 * @param config - Marker configuration object
 * @returns Object of CSS variable names to URL values
 *
 * @example
 * ```typescript
 * const vars = generateMarkerCssVars({
 *   id: 'chart-markers',
 *   config: { series1: { type: 'circle' } }
 * });
 * // Returns: { '--vis-marker-series1': 'url("#chart-markers-series1")' }
 * ```
 */
export function generateMarkerCssVars(
  config: { id: string; config: Record<string, unknown> } | undefined
): Record<string, string> {
  if (!config?.config) return {};

  const vars: Record<string, string> = {};
  for (const key of Object.keys(config.config)) {
    vars[`--vis-marker-${key}`] = `url("#${config.id}-${key}")`;
  }
  return vars;
}
