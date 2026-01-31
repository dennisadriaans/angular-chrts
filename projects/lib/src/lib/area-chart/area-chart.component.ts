import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  VisXYContainerModule,
  VisAreaModule,
  VisAxisModule,
  VisLineModule,
  VisTooltipModule,
  VisCrosshairModule,
  VisBulletLegendModule,
} from '@unovis/angular';
import { CurveType, Position } from '@unovis/ts';
import {
  BulletLegendItemInterface,
} from '../types/legend';
import { LegendPosition } from '../types/legend';
import { MarkerConfig } from '../types/common';
import { AxisFormatter as axisFormatter } from '../types/axis';
import { TooltipComponent } from '../tooltip/tooltip.component';
import { createMarkers } from '../utils';

@Component({
  selector: 'ngx-area-chart',
  standalone: true,
  imports: [
    CommonModule,
    VisXYContainerModule,
    VisAreaModule,
    VisAxisModule,
    VisLineModule,
    VisTooltipModule,
    VisCrosshairModule,
    VisBulletLegendModule,
    TooltipComponent,
  ],
  template: `
    <div
      [style.display]="'flex'"
      [style.flexDirection]="isLegendTop() ? 'column-reverse' : 'column'"
      [style.gap]="'var(--vis-legend-spacing)'"
      [style]="markerCssVars()"
      [class.stacked-area-chart]="stacked()"
      [id]="markerConfig()?.id"
      (click)="onClick($event)"
    >
      <svg width="0" height="0" style="position: absolute" aria-hidden="true">
        <defs [innerHTML]="svgDefs()"></defs>
        <defs [innerHTML]="markerSvgDefs()"></defs>
      </svg>
      <vis-xy-container
        [data]="data()"
        [height]="height()"
        [padding]="padding()"
        [yDomain]="yDomain()"
        [xDomain]="xDomain()"
      >
        @if (!hideTooltip()) {
          <vis-tooltip
            [horizontalPlacement]="Position.Right"
            [verticalPlacement]="Position.Top"
          ></vis-tooltip>
        }

        @if (stacked()) {
          <vis-area
            [x]="_x"
            [y]="stackedYAccessors()"
            [color]="stackedColorAccessor"
            [opacity]="hideArea() ? 0 : DEFAULT_OPACITY"
            [curveType]="curveType() || CurveType.MonotoneX"
          ></vis-area>
          <vis-line
            [x]="_x"
            [y]="stackedLineYAccessors()"
            [color]="stackedColorAccessor"
            [curveType]="curveType() || CurveType.MonotoneX"
            [lineWidth]="lineWidth()"
          ></vis-line>
        } @else {
          @for (categoryId of categoryKeys(); track categoryId; let i = $index) {
            <vis-area
              [x]="_x"
              [y]="getYAccessor(categoryId)"
              [color]="getGradientSelector(i)"
              [opacity]="hideArea() ? 0 : DEFAULT_OPACITY"
              [curveType]="curveType() || CurveType.MonotoneX"
            ></vis-area>
            <vis-line
              [x]="_x"
              [y]="getYAccessor(categoryId)"
              [color]="colors()[i]"
              [curveType]="curveType() || CurveType.MonotoneX"
              [lineWidth]="lineWidth()"
              [lineDashArray]="lineDashArray() ? lineDashArray()![i] : undefined"
            ></vis-line>
          }
        }

        @if (!hideXAxis()) {
          <vis-axis
            type="x"
            [label]="xLabel()"
            [labelMargin]="8"
            [numTicks]="xNumTicks()"
            [tickFormat]="xFormatter()"
            [tickValues]="xExplicitTicksValues()"
            [gridLine]="xGridLine()"
            [domainLine]="xDomainLine()"
            [tickLine]="xTickLine()"
            [minMaxTicksOnly]="minMaxTicksOnly()"
          ></vis-axis>
        }

        @if (!hideYAxis()) {
          <vis-axis
            type="y"
            [label]="yLabel()"
            [numTicks]="yNumTicks()"
            [tickFormat]="yFormatter()"
            [gridLine]="yGridLine()"
            [domainLine]="yDomainLine()"
            [tickLine]="yTickLine()"
          ></vis-axis>
        }

        @if (!hideTooltip()) {
          <vis-crosshair
            [template]="onCrosshairUpdate"
          ></vis-crosshair>
        }
      </vis-xy-container>

      @if (!hideLegend()) {
        <div
          [style.display]="'flex'"
          [style.justifyContent]="legendAlignment()"
        >
          <vis-bullet-legend
            [style]="legendStyle()"
            [items]="legendItems()"
          ></vis-bullet-legend>
        </div>
      }

      <div #tooltipWrapper style="display: none">
        @if (hoverValues()) {
            <ngx-tooltip
              [data]="hoverValues()!"
              [categories]="categories()"
              [titleFormatter]="tooltipTitleFormatter()"
              [yFormatter]="yFormatter()"
            ></ngx-tooltip>
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AreaChartComponent<T extends Record<string, any>> {
  /** The data to be displayed in the chart. */
  readonly data = input.required<T[]>();
  
  /** The height of the chart in pixels. Default is 400. */
  readonly height = input<number>(400);
  
  /** Padding around the chart area. */
  readonly padding = input<{ top: number; right: number; bottom: number; left: number }>({
    top: 5,
    right: 5,
    bottom: 5,
    left: 5,
  });
  
  /** Configuration for each category (line/area) in the chart. Keyed by category property name. */
  readonly categories = input.required<Record<string, BulletLegendItemInterface>>();
  
  /** Whether to stack the areas on top of each other. */
  readonly stacked = input<boolean>(false);
  
  /** Whether to hide the filled area and only show lines. */
  readonly hideArea = input<boolean>(false);
  
  /** The type of curve to use for the lines/areas. */
  readonly curveType = input<CurveType>();
  
  /** Thickness of the lines. Default is 2. */
  readonly lineWidth = input<number>(2);
  /** Array of dash patterns for each line. */
  readonly lineDashArray = input<number[][]>();
  
  /** Label for the X axis. */
  readonly xLabel = input<string>();
  
  /** Label for the Y axis. */
  readonly yLabel = input<string>();
  
  /** Formatter function for X axis tick labels. */
  readonly xFormatter = input<axisFormatter>();
  
  /** Formatter function for Y axis tick labels. */
  readonly yFormatter = input<axisFormatter>();
  
  /** Number of ticks to show on the X axis. */
  readonly xNumTicks = input<number>();
  
  /** Specific values to show on the X axis. */
  readonly xExplicitTicks = input<Array<number | string | Date>>();
  readonly xExplicitTicksValues = computed(() => this.xExplicitTicks() as any);
  
  /** If true, only shows the first and last tick labels on the X axis. */
  readonly minMaxTicksOnly = input<boolean>(false);
  
  /** Number of ticks to show on the Y axis. */
  readonly yNumTicks = input<number>();
  
  /** Whether to hide the X axis entirely. */
  readonly hideXAxis = input<boolean>(false);
  
  /** Whether to hide the Y axis entirely. */
  readonly hideYAxis = input<boolean>(false);
  /** Whether to show grid lines for the X axis. */
  readonly xGridLine = input<boolean>(false);
  
  /** Whether to show grid lines for the Y axis. */
  readonly yGridLine = input<boolean>(false);
  
  /** Whether to show the domain line for the X axis. */
  readonly xDomainLine = input<boolean>(false);
  
  /** Whether to show the domain line for the Y axis. */
  readonly yDomainLine = input<boolean>(false);
  
  /** Whether to show tick lines for the X axis. */
  readonly xTickLine = input<boolean>(false);
  
  /** Whether to show tick lines for the Y axis. */
  readonly yTickLine = input<boolean>(false);
  
  /** Whether to hide the tooltip. */
  readonly hideTooltip = input<boolean>(false);
  
  /** Whether to hide the legend. */
  readonly hideLegend = input<boolean>(false);
  
  /** Position of the legend relative to the chart. */
  readonly legendPosition = input<LegendPosition>(LegendPosition.BottomCenter);
  
  /** Custom styles for the legend. */
  readonly legendStyle = input<Record<string, string>>();
  
  /** Custom styles for the tooltip. */
  readonly tooltipStyle = input<Record<string, string>>({});
  
  /** Formatter for the tooltip title. */
  readonly tooltipTitleFormatter = input<(data: T) => string | number>();
  
  /** Configuration for svg markers (dots) on the lines. */
  readonly markerConfig = input<MarkerConfig>();
  
  /** Gradient stop configuration for area charts. */
  readonly gradientStops = input<Array<{ offset: string; stopOpacity: number }>>([
    { offset: '0%', stopOpacity: 1 },
    { offset: '75%', stopOpacity: 0 },
  ]);
  
  /** Manual Y domain [min, max]. */
  readonly yDomain = input<[number, number]>();
  
  /** Manual X domain [min, max]. */
  readonly xDomain = input<[number, number]>();

  /** Event emitted when the chart or a segment is clicked. */
  readonly click = output<{ event: MouseEvent; values?: T }>();

  readonly tooltipWrapper = viewChild<ElementRef<HTMLDivElement>>('tooltipWrapper');
  readonly hoverValues = signal<T | undefined>(undefined);

  readonly DEFAULT_OPACITY = 0.5;
  readonly DEFAULT_COLOR = '#3b82f6';
  readonly Position = Position;
  readonly CurveType = CurveType;

  readonly categoryKeys = computed(() => Object.keys(this.categories()));
  
  readonly colors = computed(() => {
    const cats = this.categories();
    return Object.keys(cats).map((key, index) => {
      const color = cats[key].color;
      if (Array.isArray(color)) return color[0] ?? `var(--vis-color${index})`;
      return color ?? `var(--vis-color${index})`;
    });
  });

  readonly isLegendTop = computed(() => this.legendPosition().startsWith('top'));
  
  readonly legendAlignment = computed(() => {
    const pos = this.legendPosition();
    if (pos.includes('left')) return 'flex-start';
    if (pos.includes('right')) return 'flex-end';
    return 'center';
  });

  readonly legendItems = computed(() => {
    return Object.values(this.categories()).map((item) => ({
      ...item,
      color: Array.isArray(item.color) ? item.color[0] : item.color,
    }));
  });

  readonly svgDefs = computed(() => {
    const stops = this.gradientStops();
    const colors = this.colors();
    
    return colors.map((color, index) => {
      const id = `gradient-${index}-${color.replace(/#/g, '')}`;
      return `
        <linearGradient id="${id}" gradientTransform="rotate(90)">
          ${stops.map(stop => `
            <stop offset="${stop.offset}" stop-color="${color}" stop-opacity="${stop.stopOpacity}" />
          `).join('')}
          <stop offset="100%" stop-color="${color}" stop-opacity="0" />
        </linearGradient>
      `;
    }).join('');
  });

  readonly stackedYAccessors = computed(() => {
    const keys = this.categoryKeys();
    return keys.map(key => (d: T) => Number(d[key]));
  });

  readonly stackedLineYAccessors = computed(() => {
    const keys = this.categoryKeys();
    return keys.map((_, index) => {
      return (d: T) => {
        let sum = 0;
        for (let i = 0; i <= index; i++) {
          sum += Number(d[keys[i]]) || 0;
        }
        return sum;
      };
    });
  });

  readonly markerSvgDefs = computed(() => {
    const config = this.markerConfig();
    if (!config?.config) return '';
    return createMarkers(config);
  });

  readonly markerCssVars = computed(() => {
    const config = this.markerConfig();
    if (!config?.config) return {};

    const vars: Record<string, string> = {};
    for (const key of Object.keys(config.config)) {
      vars[`--vis-marker-${key}`] = `url("#${config.id}-${key}")`;
    }
    return vars;
  });

  readonly stackedColorAccessor: any = (_d: any, i: number) => this.colors()[i] ?? this.DEFAULT_COLOR;

  _x: any = (_: any, i: number) => i;

  getYAccessor(categoryId: string): any {
    return (d: T) => Number(d[categoryId]);
  }

  getGradientSelector(index: number): any {
    const color = this.colors()[index];
    const id = `gradient-${index}-${color.replace(/#/g, '')}`;
    return `url(#${id})`;
  }

  onCrosshairUpdate = (d: T): string => {
    this.hoverValues.set(d);
    this.cdr.detectChanges();
    return this.tooltipWrapper()?.nativeElement.innerHTML || '';
  };

  onClick(event: MouseEvent) {
    this.click.emit({ event, values: this.hoverValues() });
  }

  private cdr = inject(ChangeDetectorRef);
}
