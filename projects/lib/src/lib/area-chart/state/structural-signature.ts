/**
 * Structural Signature Utilities
 *
 * Pure functions for comparing structural signatures to determine rebuild needs.
 *
 * SOLID Principles:
 * - SRP: Only responsible for signature comparison
 * - OCP: New signature properties can be added without modifying comparison logic
 */

import type { StructuralSignature } from '../types';

/**
 * Creates a structural signature from component inputs.
 *
 * @param params - The structural parameters
 * @returns A signature object
 *
 * @example
 * ```typescript
 * const signature = createStructuralSignature({
 *   stacked: false,
 *   categoryKeys: ['revenue', 'expenses'],
 *   hideXAxis: false,
 *   hideYAxis: false,
 *   hideTooltip: false,
 * });
 * ```
 */
export function createStructuralSignature(params: {
  stacked: boolean;
  categoryKeys: string[];
  hideXAxis: boolean;
  hideYAxis: boolean;
  hideTooltip: boolean;
  showLabels: boolean;
}): StructuralSignature {
  return {
    stacked: params.stacked,
    categoryKeys: params.categoryKeys.join(','),
    hideXAxis: params.hideXAxis,
    hideYAxis: params.hideYAxis,
    hideTooltip: params.hideTooltip,
    showLabels: params.showLabels,
  };
}

/**
 * Compares two structural signatures for equality.
 *
 * @param current - The current signature
 * @param previous - The previous signature (or null if first render)
 * @returns true if signatures are different (rebuild needed)
 *
 * @example
 * ```typescript
 * const needsRebuild = hasSignatureChanged(currentSig, previousSig);
 * if (needsRebuild) {
 *   destroyChart();
 *   initializeChart();
 * }
 * ```
 */
export function hasSignatureChanged(
  current: StructuralSignature,
  previous: StructuralSignature | null
): boolean {
  if (!previous) return false;

  return (
    previous.stacked !== current.stacked ||
    previous.categoryKeys !== current.categoryKeys ||
    previous.hideXAxis !== current.hideXAxis ||
    previous.hideYAxis !== current.hideYAxis ||
    previous.hideTooltip !== current.hideTooltip ||
    previous.showLabels !== current.showLabels
  );
}

/**
 * Creates a signature key string for caching purposes.
 *
 * @param signature - The structural signature
 * @returns A unique string key
 */
export function getSignatureKey(signature: StructuralSignature): string {
  return `${signature.stacked}-${signature.categoryKeys}-${signature.hideXAxis}-${signature.hideYAxis}-${signature.hideTooltip}-${signature.showLabels}`;
}
