/**
 * Area Chart Utils - Public Exports
 *
 * Re-exports all utility functions for tree-shakable imports.
 */

export {
  createStackedYAccessors,
  createCumulativeYAccessors,
  createYAccessor,
} from './accessors';

export {
  getGradientId,
  generateGradientDefs,
  generateMarkerCssVars,
} from './svg-generators';

export {
  createSeriesDescriptors,
  extractColors,
  extractLegendItems,
} from './series.utils';
