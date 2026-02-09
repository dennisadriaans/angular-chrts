// Re-export shared utilities for bar-specific usage
export {
  createYAccessors,
  extractColors as extractBarColors,
  extractLegendItems as extractBarLegendItems,
  createTickFormatter,
} from '../../utils/shared';

/**
 * Calculates the offset for a bar within a group.
 * Based on Unovis GroupedBar logic (d3 scaleBand).
 *
 * @param index - Index of the series/bar within the group (0 to count-1)
 * @param count - Total number of bars in the group
 * @param groupPadding - Padding between groups (0-1)
 * @param barPadding - Padding between bars (0-1)
 * @returns Offset in data units (relative to the band center)
 */
export function calculateBarOffset(
  index: number,
  count: number,
  groupPadding: number,
  barPadding: number
): number {
  if (count <= 0) return 0;
  
  // Total width available for the group in data units (1 unit = 1 step)
  // Logic matches Unovis calculation where groupWidth = (1 - groupPadding) * step
  const W = 1 - groupPadding;
  
  // Effective step size per bar within the group
  // Denominator (n + p) derived from D3 scaleBand with paddingInner = paddingOuter = p
  const step = W / (count + barPadding);
  
  // Center relative to the start of the group range [-W/2, W/2]
  // Formula: step * (index + 0.5 * barPadding + 0.5) - W/2
  return step * (index + 0.5 * barPadding + 0.5) - W / 2;
}
