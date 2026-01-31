/**
 * Bar Chart Structural Signature Utilities
 *
 * Pure functions for comparing structural signatures to determine rebuild needs.
 *
 * SOLID Principles:
 * - SRP: Only responsible for signature comparison
 */

import { Orientation } from '@unovis/ts';
import type { BarStructuralSignature } from '../types';

/**
 * Creates a structural signature from component inputs.
 *
 * @param params - The structural parameters
 * @returns A signature object
 */
export function createBarStructuralSignature(params: {
  stacked: boolean;
  categoryKeys: string[];
  yAxisKeys: string[];
  hideXAxis: boolean;
  hideYAxis: boolean;
  hideTooltip: boolean;
  orientation: Orientation;
}): BarStructuralSignature {
  return {
    stacked: params.stacked,
    categoryKeys: params.categoryKeys.join(','),
    yAxisKeys: params.yAxisKeys.join(','),
    hideXAxis: params.hideXAxis,
    hideYAxis: params.hideYAxis,
    hideTooltip: params.hideTooltip,
    orientation: params.orientation,
  };
}

/**
 * Compares two structural signatures for equality.
 *
 * @param current - The current signature
 * @param previous - The previous signature (or null if first render)
 * @returns true if signatures are different (rebuild needed)
 */
export function hasBarSignatureChanged(
  current: BarStructuralSignature,
  previous: BarStructuralSignature | null
): boolean {
  if (!previous) return false;

  return (
    previous.stacked !== current.stacked ||
    previous.categoryKeys !== current.categoryKeys ||
    previous.yAxisKeys !== current.yAxisKeys ||
    previous.hideXAxis !== current.hideXAxis ||
    previous.hideYAxis !== current.hideYAxis ||
    previous.hideTooltip !== current.hideTooltip ||
    previous.orientation !== current.orientation
  );
}
