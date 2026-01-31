import { Component } from '@angular/core';
import { BubbleChartComponent } from 'angular-chrts';
import { bubbleData, bubbleCategories, BubbleData } from '../data';

@Component({
  selector: 'app-bubble-chart-page',
  standalone: true,
  imports: [BubbleChartComponent],
  template: `
    <div style="background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
      <h2 style="margin-bottom: 1rem;">Bubble Chart</h2>
      <ngx-bubble-chart 
        [data]="bubbleData" 
        [categories]="bubbleCategories"
        categoryKey="category"
        [height]="400"
        [xAccessor]="xAccessor"
        [yAccessor]="yAccessor"
        [sizeAccessor]="sizeAccessor"
        xLabel="X Value"
        yLabel="Y Value"
        [xGridLine]="true"
        [yGridLine]="true"
      ></ngx-bubble-chart>
    </div>
  `,
})
export class BubbleChartPageComponent {
  protected readonly bubbleData = bubbleData;
  protected readonly bubbleCategories = bubbleCategories;

  // Bubble chart accessors
  xAccessor = (d: BubbleData) => d.x;
  yAccessor = (d: BubbleData) => d.y;
  sizeAccessor = (d: BubbleData) => d.size;
}
