/**
 * Re-export enums from @unovis/ts so consumers can import from this library
 * without accidentally using incompatible enum definitions.
 */
export { CurveType, Orientation } from '@unovis/ts';

/**
 * Configuration for custom markers in charts.
 */
export type MarkerConfig = {
  id: string;
  config: {
    [key: string]: {
      type?: "circle" | "square" | "triangle" | "diamond";
      size?: number;
      strokeWidth?: number;
      color?: string;
      strokeColor?: string;
    };
  };
};

/**
 * Configuration for crosshair display in charts.
 */
export interface CrosshairConfig {
  color?: string;
  strokeColor?: string;
  strokeWidth?: number;
  template?: (d: any) => string;
}
