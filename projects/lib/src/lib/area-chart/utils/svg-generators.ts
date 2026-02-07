/**
 * SVG Generators
 *
 * Pure functions for generating SVG gradient definitions.
 */

import type { GradientStop } from '../types';

/**
 * Generates a gradient ID from index and color.
 * Sanitizes the color string to ensure a valid SVG ID.
 *
 * @param index - The series index
 * @param color - The color value (hex, rgb, or CSS variable)
 * @returns A unique gradient ID string
 */
export function getGradientId(index: number, color: string): string {
  // Remove special characters that might be invalid in an ID or URL reference
  const sanitizedColor = color
    .replace(/#/g, '')
    .replace(/[()]/g, '')
    .replace(/\s+/g, '-')
    .replace(/,/g, '-');
  return `gradient-${index}-${sanitizedColor}`;
}

/**
 * Generates SVG linear gradient definitions for area fills.
 * Uses explicit x1, y1, x2, y2 coordinates for vertical orientation.
 *
 * @param colors - Array of colors for each series
 * @param stops - Array of gradient stop configurations
 * @returns SVG defs string containing all gradient definitions
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
      
      return `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">${stopElements}</linearGradient>`;
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
  config: { id: string; config: Record<string, any> } | undefined
): Record<string, string> {
  if (!config?.config) return {};

  const vars: Record<string, string> = {};
  for (const key of Object.keys(config.config)) {
    vars[`--vis-marker-${key}`] = `url("#${config.id}-${key}")`;
  }
  return vars;
}
