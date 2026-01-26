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
  VisAxisModule,
  VisTooltipModule,
  VisBulletLegendModule,
  VisGroupedBarModule,
  VisStackedBarModule,
} from '@unovis/angular';
import { GroupedBar, Orientation, StackedBar } from '@unovis/ts';
import { LegendPosition, BulletLegendItemInterface, AxisConfig } from '../types';
import { TooltipComponent } from '../tooltip';
import { ValueLabel } from './types';

@Component({
  selector: 'ngx-bar-chart',
  standalone: true,
  imports: [
    CommonModule,
    VisXYContainerModule,
    VisAxisModule,
    VisTooltipModule,
    VisBulletLegendModule,
    VisGroupedBarModule,
    VisStackedBarModule,
    TooltipComponent,
  ],
  template: `
    <div
      [style.display]="'flex'"
      [style.flexDirection]="isLegendTop() ? 'column-reverse' : 'column'"
      [style.gap]="'var(--vis-legend-spacing)'"
      (click)="onClick($event)"
    >
      <vis-xy-container
        [data]="data()"
        [height]="height()"
        [padding]="padding()"
      >
        <vis-tooltip
          [triggers]="tooltipTriggers"
        ></vis-tooltip>

        @if (!stacked()) {
          <vis-grouped-bar
            [data]="data()"
            [x]="_x"
            [y]="yAccessors()"
            [color]="colorAccessor"
            [roundedCorners]="radius() ?? 0"
            [groupPadding]="groupPadding()"
            [barPadding]="barPadding()"
            [orientation]="orientation()"
          ></vis-grouped-bar>
        } @else {
          <vis-stacked-bar
            [data]="data()"
            [x]="_x"
            [y]="yAccessors()"
            [color]="colorAccessor"
            [roundedCorners]="radius() ?? 0"
            [barPadding]="barPadding()"
            [orientation]="orientation()"
          ></vis-stacked-bar>
        }

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
            [gridLine]="orientation() !== Orientation.Horizontal && yGridLine()"
            [domainLine]="!!yDomainLine()"
            [numTicks]="yNumTicks()"
            [tickLine]="yTickLine()"
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
            [categories]="categories()"
            [titleFormatter]="tooltipTitleFormatter()"
            [yFormatter]="orientation() === Orientation.Horizontal ? xFormatter() : yFormatter()"
          ></ngx-tooltip>
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BarChartComponent<T extends Record<string, any>> {
  /** The data to be displayed in the bar chart. */
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
  
  /** Configuration for each category mapping to the axes. Keyed by category property name. */
  readonly categories = input.required<Record<string, BulletLegendItemInterface>>();
  
  /** The data keys to use for the Y-axis (or X-axis if horizontal). */
  readonly yAxis = input.required<(keyof T)[]>();
  
  /** Whether to stack the bars on top of each other. */
  readonly stacked = input<boolean>(false);
  
  /** The orientation of the bars (Vertical or Horizontal). */
  readonly orientation = input<Orientation>(Orientation.Vertical);
  
  /** Corner radius for the bars. */
  readonly radius = input<number>();
  
  /** Padding between bar groups. Value between 0 and 1. */
  readonly groupPadding = input<number>(0);
  
  /** Padding between individual bars. Value between 0 and 1. */
  readonly barPadding = input<number>(0.2);
  /** Label for the X axis. */
  readonly xLabel = input<string>();
  
  /** Label for the Y axis. */
  readonly yLabel = input<string>();
  
  /** Formatter function for X axis tick labels. */
  readonly xFormatter = input<(tick: number | Date, i?: number, ticks?: (number | Date)[]) => string>();
  
  /** Formatter function for Y axis tick labels. */
  readonly yFormatter = input<(tick: number | Date, i?: number, ticks?: (number | Date)[]) => string>();
  
  /** Formatter for the tooltip title. */
  readonly tooltipTitleFormatter = input<(data: T) => string | number>();
  
  /** Number of ticks to show on the X axis. */
  readonly xNumTicks = input<number>();
  
  /** Specific values to show on the X axis. */
  readonly xExplicitTicks = input<Array<number | string | Date>>();
  
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
  readonly yGridLine = input<boolean>(true);
  
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
  
  /** Configuration for value labels on bars. */
  readonly valueLabel = input<ValueLabel>();
  
  /** Advanced configuration for the X axis. */
  readonly xAxisConfig = input<AxisConfig>();
  
  /** Advanced configuration for the Y axis. */
  readonly yAxisConfig = input<AxisConfig>();

  /** Event emitted when a bar is clicked. */
  readonly click = output<{ event: MouseEvent; values?: T }>();

  readonly tooltipWrapper = viewChild<ElementRef<HTMLDivElement>>('tooltipWrapper');
  readonly hoverValues = signal<T | undefined>(undefined);

  readonly Orientation = Orientation;

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

  readonly yAccessors = computed(() => {
    return this.yAxis().map((key) => (d: T) => d[key]);
  });

  colorAccessor: any = (_: T, i: number) => {
    const cats = Object.values(this.categories());
    return cats[i]?.color;
  };

  _x: any = (_: T, i: number) => i;

  xFormatterFn = (tick: number | Date, i: number, ticks: (number | Date)[]) => {
    const formatter = this.xFormatter();
    return formatter ? formatter(tick, i, ticks) : String(tick);
  };

  yFormatterFn = (tick: number | Date, i: number, ticks: (number | Date)[]) => {
    const formatter = this.yFormatter();
    return formatter ? formatter(tick, i, ticks) : String(tick);
  };

  tooltipTriggers: Record<string, (d: T) => string> = {
    [GroupedBar.selectors.bar]: (d: T) => {
      this.onCrosshairUpdate(d);
      return d ? this.tooltipWrapper()?.nativeElement.innerHTML ?? '' : '';
    },
    [StackedBar.selectors.bar]: (d: T) => {
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
