import { Component } from '@angular/core';
import { GanttChartComponent } from 'angular-chrts';
import { ganttData, ganttCategories, GanttData } from '../data';

@Component({
  selector: 'app-gantt-chart-page',
  standalone: true,
  imports: [GanttChartComponent],
  template: `
    <div style="background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
      <h2 style="margin-bottom: 1rem;">Gantt Chart</h2>
      <ngx-gantt-chart 
        [data]="ganttData" 
        [categories]="ganttCategories"
        [height]="300"
        [x]="ganttX"
        [length]="ganttLength"
        [type]="ganttType"
        [lineWidth]="30"
        [rowHeight]="60"
      ></ngx-gantt-chart>
    </div>
  `,
})
export class GanttChartPageComponent {
  protected readonly ganttData = ganttData;
  protected readonly ganttCategories = ganttCategories;

  // Gantt chart accessors
  ganttX = (d: GanttData) => d.start;
  ganttLength = (d: GanttData) => d.end - d.start;
  ganttType = (d: GanttData) => d.type;
}
