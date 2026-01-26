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
  VisScatterModule,
  VisAxisModule,
  VisTooltipModule,
  VisBulletLegendModule,
} from '@unovis/angular';
import { Position, Scatter, type NumericAccessor } from '@unovis/ts';
import { LegendPosition, BulletLegendItemInterface, AxisConfig, CrosshairConfig } from '../types';
import { TooltipComponent } from '../tooltip';

@Component({
  selector: 'ngx-bubble-chart',
  standalone: true,
  imports: [
    CommonModule,
    VisXYContainerModule,
    VisScatterModule,
    VisAxisModule,
    VisTooltipModule,
    VisBulletLegendModule,
    TooltipComponent,
  ],
  template: `
    <div
      [style.display]="'flex'"
      [style.flexDirection]="isLegendTop() ? 'column-reverse' : 'column'"
      [style.gap]="'var(--vis-legend-spacing)'"
    >
      <vis-xy-container
        [data]="data()"
        [height]="height()"
        [padding]="padding()"
        [scaleByDomain]="true"
        (click)="onClick($event)"
      >
        @if (!hideTooltip()) {
          <vis-tooltip [triggers]="tooltipTriggers"></vis-tooltip>
        }

        <vis-scatter
          [x]="xAccessor()"
          [y]="yAccessor()"
          [color]="colorAccessor"
          [size]="sizeAccessorFn()"
          [labelPosition]="labelPosition() || Position.Bottom"
          [sizeRange]="sizeRange() || [1, 20]"
          cursor="pointer"
        ></vis-scatter>

        @if (!hideXAxis()) {
          <vis-axis
            type="x"
            [label]="xLabel()"
            [tickFormat]="xFormatterFn"
            [gridLine]="xGridLine()"
            [domainLine]="!!xDomainLine()"
            [tickLine]="xTickLine()"
            [numTicks]="xNumTicks()"
            [tickValues]="$any(xExplicitTicks())"
            [minMaxTicksOnly]="minMaxTicksOnly()"
          ></vis-axis>
        }

        @if (!hideYAxis()) {
          <vis-axis
            type="y"
            [label]="yLabel()"
            [tickFormat]="yFormatterFn"
            [gridLine]="yGridLine()"
            [domainLine]="!!yDomainLine()"
            [tickLine]="yTickLine()"
            [numTicks]="yNumTicks()"
          ></vis-axis>
        }
      </vis-xy-container>

      @if (!hideLegend()) {
        <div
          [style.display]="'flex'"
          [style.justifyContent]="legendAlignment()"
        >
          <vis-bullet-legend
            [items]="legendItems()"
          ></vis-bullet-legend>
        </div>
      }

      <div #tooltipWrapper style="display: none">
        @if (hoverValues()) {
          <ngx-tooltip
            [data]="hoverValues()!"
            [categories]="categories() || {}"
            [titleFormatter]="tooltipTitleFormatter()"
            [yFormatter]="yFormatter()"
          ></ngx-tooltip>
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BubbleChartComponent<T extends Record<string, any>> {
  /** The data to be displayed in the bubble chart. */
  readonly data = input.required<T[]>();
  
  /** The height of the chart in pixels. Default is 600. */
  readonly height = input<number>(600);
  
  /** Padding around the chart area. */
  readonly padding = input<{ top: number; right: number; bottom: number; left: number }>({
    top: 5,
    right: 5,
    bottom: 5,
    left: 5,
  });
  
  /** Configuration for each category mapping to the bubbles. Keyed by category property name. */
  readonly categories = input<Record<string, BulletLegendItemInterface>>({});
  
  /** The data key used to categorize bubbles. */
  readonly categoryKey = input<keyof T>();
  
  /** Accessor function for X-axis values. */
  readonly xAccessor = input<NumericAccessor<T>>();
  
  /** Accessor function for Y-axis values. */
  readonly yAccessor = input<NumericAccessor<T>>();
  
  /** Accessor function for bubble size. */
  readonly sizeAccessor = input<NumericAccessor<T>>();
  
  /** Position of labels relative to bubbles. */
  readonly labelPosition = input<Position>();
  
  /** Range of bubble sizes [min pixels, max pixels]. */
  readonly sizeRange = input<[number, number]>();
  
  /** Label for the X axis. */
  readonly xLabel = input<string>('');
  
  /** Label for the Y axis. */
  readonly yLabel = input<string>('');
  
  /** Formatter function for X axis tick labels. */
  readonly xFormatter = input<(tick: number | Date, i?: number, ticks?: (number | Date)[]) => string>();
  
  /** Formatter function for Y axis tick labels. */
  readonly yFormatter = input<(tick: number | Date, i?: number, ticks?: (number | Date)[]) => string>();
  
  /** Formatter for the tooltip title. */
  readonly tooltipTitleFormatter = input<(data: T) => string | number>();
  
  /** Number of ticks on the X axis. */
  readonly xNumTicks = input<number>();
  
  /** Number of ticks on the Y axis. */
  readonly yNumTicks = input<number>();
  
  /** Specific values to show on the X axis. */
  readonly xExplicitTicks = input<Array<number | string | Date>>();
  
  /** If true, only shows the first and last tick labels on the X axis. */
  readonly minMaxTicksOnly = input<boolean>(false);
  
  /** Whether to hide the X axis entirely. */
  readonly hideXAxis = input<boolean>(false);
  
  /** Whether to hide the Y axis entirely. */
  readonly hideYAxis = input<boolean>(false);
  
  /** Whether to show grid lines for the X axis. */
  readonly xGridLine = input<boolean>(false);
  
  /** Whether to show grid lines for the Y axis. */
  readonly yGridLine = input<boolean>(true);
  
  /** Whether to show the domain line for the X axis. */
  readonly xDomainLine = input<boolean>(true);
  
  /** Whether to show the domain line for the Y axis. */
  readonly yDomainLine = input<boolean>(true);
  
  /** Whether to show tick lines for the X axis. */
  readonly xTickLine = input<boolean>(true);
  
  /** Whether to show tick lines for the Y axis. */
  readonly yTickLine = input<boolean>(true);
  
  /** Whether to hide the tooltip. */
  readonly hideTooltip = input<boolean>(false);
  
  /** Whether to hide the legend. */
  readonly hideLegend = input<boolean>(false);
  readonly legendPosition = input<LegendPosition>(LegendPosition.BottomCenter);
  readonly legendStyle = input<Record<string, string>>();
  readonly crosshairConfig = input<CrosshairConfig>({ color: '#666' });
  readonly xAxisConfig = input<AxisConfig>();
  readonly yAxisConfig = input<AxisConfig>();

  readonly click = output<{ event: MouseEvent; values?: T }>();

  readonly tooltipWrapper = viewChild<ElementRef<HTMLDivElement>>('tooltipWrapper');
  readonly hoverValues = signal<T | undefined>(undefined);

  readonly Position = Position;

  readonly isLegendTop = computed(() => this.legendPosition().startsWith('top'));

  readonly legendAlignment = computed(() => {
    const pos = this.legendPosition();
    if (pos.includes('left')) return 'flex-start';
    if (pos.includes('right')) return 'flex-end';
    return 'center';
  });

  readonly legendItems = computed(() => {
    const cats = this.categories();
    return Object.values(cats).map((item) => ({
      ...item,
      color: Array.isArray(item.color) ? item.color[0] : item.color,
    }));
  });

  readonly sizeAccessorFn = computed(() => {
    const accessor = this.sizeAccessor();
    if (accessor) return accessor;
    return (d: any) => (typeof d.comments === 'number' ? d.comments : 1);
  });

  colorAccessor = (d: T): string | null | undefined => {
    const cats = this.categories();
    const catKey = this.categoryKey();
    if (!cats || !catKey) {
      return '#cccccc';
    }

    const categoryValue = String(d[catKey as keyof T]);
    let categoryColor = cats[categoryValue]?.color;

    // Special case: when only one category is defined, use the categoryKey
    // directly as the category lookup key (matching Vue behavior)
    if (Object.keys(cats).length === 1) {
      categoryColor = cats[catKey as keyof typeof cats]?.color;
    }

    if (!categoryColor) {
      return '#cccccc';
    }

    // Ensure we return a string, not an array
    return Array.isArray(categoryColor) ? categoryColor[0] : categoryColor;
  };

  xFormatterFn = (tick: number | Date, i: number, ticks: (number | Date)[]) => {
    const formatter = this.xFormatter();
    return formatter ? formatter(tick, i, ticks) : String(tick);
  };

  yFormatterFn = (tick: number | Date, i: number, ticks: (number | Date)[]) => {
    const formatter = this.yFormatter();
    return formatter ? formatter(tick, i, ticks) : String(tick);
  };

  tooltipTriggers: Record<string, (d: T) => string> = {
    [Scatter.selectors.point]: (d: T) => {
      this.onCrosshairUpdate(d);
      return d ? this.tooltipWrapper()?.nativeElement.innerHTML ?? '' : '';
    },
  };

  onCrosshairUpdate(d: T): void {
    this.hoverValues.set(d);
    this.cdr.detectChanges();
  }

  onClick(event: MouseEvent): void {
    this.click.emit({ event, values: this.hoverValues() });
  }

  private cdr = inject(ChangeDetectorRef);
}
