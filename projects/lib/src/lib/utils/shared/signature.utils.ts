/**
 * Base structural signature with common properties.
 */
export interface BaseStructuralSignature {
  hideTooltip?: boolean;
  hideLegend?: boolean;
  categoryKeys?: string;
}

/**
 * Creates a category key string for signature comparison.
 *
 * @param categories - Category configuration object
 * @returns Sorted, comma-separated key string
 */
export function createCategoryKeySignature(
  categories: Record<string, any>
): string {
  return Object.keys(categories).sort().join(',');
}

/**
 * Compares two base structural signatures.
 *
 * @param prev - Previous signature (null if first render)
 * @param next - Next signature
 * @returns True if signatures differ (rebuild needed)
 */
export function hasBaseSignatureChanged(
  prev: BaseStructuralSignature | null,
  next: BaseStructuralSignature
): boolean {
  if (!prev) return true;

  return (
    prev.hideTooltip !== next.hideTooltip ||
    prev.hideLegend !== next.hideLegend ||
    prev.categoryKeys !== next.categoryKeys
  );
}
