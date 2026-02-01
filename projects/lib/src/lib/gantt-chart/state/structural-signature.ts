/**
 * Gantt Chart Structural Signature
 *
 * Functions for tracking structural changes that require chart rebuild.
 */

import { createCategoryKeySignature, hasBaseSignatureChanged } from '../../utils/shared';
import type { GanttStructuralSignature } from '../types';

/**
 * Creates a structural signature for the current gantt chart state.
 *
 * @param categories - Category configuration object
 * @param hideTooltip - Whether tooltip is hidden
 * @param hideLegend - Whether legend is hidden
 * @returns Structural signature object
 */
export function createGanttStructuralSignature(
  categories: Record<string, any>,
  hideTooltip: boolean,
  hideLegend: boolean
): GanttStructuralSignature {
  return {
    hideTooltip,
    hideLegend,
    categoryKeys: createCategoryKeySignature(categories),
  };
}

/**
 * Compares two structural signatures to detect changes requiring rebuild.
 *
 * @param prev - Previous signature
 * @param next - Next signature
 * @returns True if signatures differ (rebuild needed)
 */
export function hasGanttSignatureChanged(
  prev: GanttStructuralSignature | null,
  next: GanttStructuralSignature
): boolean {
  return hasBaseSignatureChanged(prev, next);
}
