/**
 * Donut Chart Structural Signature
 *
 * Functions for tracking structural changes that require chart rebuild.
 *
 * SOLID Principles:
 * - SRP: Only responsible for signature management
 */

import { hasBaseSignatureChanged } from '../../utils/shared';
import { DonutType, type DonutStructuralSignature } from '../types';

/**
 * Creates a structural signature for the current donut chart state.
 *
 * @param type - Donut type (Full or Half)
 * @param hideTooltip - Whether tooltip is hidden
 * @param hideLegend - Whether legend is hidden
 * @returns Structural signature object
 */
export function createDonutStructuralSignature(
  type: DonutType,
  hideTooltip: boolean,
  hideLegend: boolean
): DonutStructuralSignature {
  return {
    type,
    hideTooltip,
    hideLegend,
  };
}

/**
 * Compares two structural signatures to detect changes requiring rebuild.
 *
 * @param prev - Previous signature
 * @param next - Next signature
 * @returns True if signatures differ (rebuild needed)
 */
export function hasDonutSignatureChanged(
  prev: DonutStructuralSignature | null,
  next: DonutStructuralSignature
): boolean {
  const baseChanged = hasBaseSignatureChanged(
    prev
      ? {
          hideTooltip: prev.hideTooltip,
          hideLegend: prev.hideLegend,
        }
      : null,
    {
      hideTooltip: next.hideTooltip,
      hideLegend: next.hideLegend,
    }
  );

  return baseChanged || prev?.type !== next.type;
}
