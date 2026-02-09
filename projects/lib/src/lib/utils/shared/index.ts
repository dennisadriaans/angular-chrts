// Color utilities
export {
  normalizeColor,
  extractColors,
  getCategoryColor,
} from './color.utils';

// Legend utilities
export {
  extractLegendItems,
  getLegendAlignment,
  isLegendAtTop,
  type NormalizedLegendItem,
} from './legend.utils';

// Accessor utilities
export {
  createYAccessors,
  createStackedYAccessors,
  createCumulativeYAccessors,
  createYAccessor,
} from './accessor.utils';

// Formatter utilities
export {
  createTickFormatter,
  createDateFormatter,
  createDateTickFormatter,
} from './formatter.utils';

// Signature utilities
export {
  createCategoryKeySignature,
  hasBaseSignatureChanged,
  type BaseStructuralSignature,
} from './signature.utils';
