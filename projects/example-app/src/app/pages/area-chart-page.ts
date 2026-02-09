import { Component } from '@angular/core';
import { AreaChartComponent, CurveType, LegendPosition } from 'angular-chrts';
import { data, stackedData, categories, formatX, formatStackedX, ChartData } from '../data';

@Component({
  selector: 'app-area-chart-page',
  standalone: true,
  imports: [AreaChartComponent],
  template: `
    <div style="background: white; padding: 1.5rem; margin-bottom: 2rem; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
      <h2 style="margin-bottom: 1rem;">Area Chart - Overlapping</h2>
      <ngx-area-chart 
        [data]="data" 
        [categories]="categories"
        [height]="400"
        [xFormatter]="formatX"
        xLabel="Month"
        yLabel="Value"
        [curveType]="CurveType.MonotoneX"
        [xGridLine]="true"
        [yGridLine]="true"
        [stacked]="false"
        [legendPosition]="LegendPosition.BottomCenter"
        (click)="handleChartClick($event)"
      ></ngx-area-chart>
    </div>

    <div style="background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
      <h2 style="margin-bottom: 1rem;">Area Chart - Stacked</h2>
      <ngx-area-chart 
        [data]="stackedData" 
        [categories]="categories"
        [height]="400"
        [xFormatter]="formatStackedX"
        xLabel="Day"
        yLabel="Total Value"
        [stacked]="true"
        [curveType]="CurveType.MonotoneX"
        [xGridLine]="true"
        [yGridLine]="true"
        (click)="handleChartClick($event)"
      ></ngx-area-chart>
    </div>
  `,
})
export class AreaChartPageComponent {
  protected readonly data = data;
  protected readonly stackedData = stackedData;
  protected readonly categories = categories;
  protected readonly CurveType = CurveType;
  protected readonly LegendPosition = LegendPosition;
  protected readonly formatX = formatX;
  protected readonly formatStackedX = formatStackedX;


  handleChartClick(event: { event: MouseEvent; values?: ChartData }): void {
    console.log('Chart clicked:', event);
  }
}
