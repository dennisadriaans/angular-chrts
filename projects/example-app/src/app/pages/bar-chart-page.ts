import { Component } from '@angular/core';
import { BarChartComponent, Orientation } from 'angular-chrts';
import { data, stackedData, categories, formatX, formatStackedX } from '../data';

@Component({
  selector: 'app-bar-chart-page',
  standalone: true,
  imports: [BarChartComponent],
  template: `
    <div style="background: white; padding: 1.5rem; margin-bottom: 2rem; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
      <h2 style="margin-bottom: 1rem;">Bar Chart - Grouped</h2>
      <ngx-bar-chart 
        [data]="data" 
        [categories]="categories"
        [yAxis]="['sales', 'profit']"
        [height]="400"
        [xFormatter]="formatX"
        xLabel="Month"
        yLabel="Value"
        [stacked]=true
        [yGridLine]="true"
        [radius]="4"
        [showLabels]="true"
        labelVerticalOffset="-12px"
      ></ngx-bar-chart>
    </div>

    <div style="background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
      <h2 style="margin-bottom: 1rem;">Bar Chart - Stacked (Horizontal)</h2>
      <ngx-bar-chart 
        [data]="stackedData" 
        [categories]="categories"
        [orientation]="Orientation.Horizontal"
        [yAxis]="['sales', 'profit']"
        [height]="400"
        [xFormatter]="formatStackedX"
        xLabel="Day"
        yLabel="Total Value"
        [stacked]="true"
        [yGridLine]="true"
        [radius]="4"
      ></ngx-bar-chart>
    </div>
  `,
})
export class BarChartPageComponent {
  protected readonly data = data;
  protected readonly stackedData = stackedData;
  protected readonly categories = categories;
  protected readonly Orientation = Orientation;
  protected readonly formatX = formatX;
  protected readonly formatStackedX = formatStackedX;
}
