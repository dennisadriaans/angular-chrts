# Angular Charts Library (`angular-chrts`)

Modern, Signals-first **Angular Charts** powered by Unovis.

## Installation

```bash
npm install angular-chrts @unovis/angular @unovis/ts
```

## Features

- **Signals-based**: Leverages the latest Angular features for maximum performance.
- **Responsive**: All charts adapt to their container size automatically.
- **Customizable**: Full control over axes, tooltips, legends, and styling.
- **Typescript Ready**: Robust types for all your data visualization needs.

## Quick Start

```typescript
import { LineChartComponent } from 'angular-chrts';

@Component({
  standalone: true,
  imports: [LineChartComponent],
  template: `
    <ngx-line-chart
      [data]="data"
      [categories]="categories"
      xLabel="Time"
    />
  `
})
export class MyDataComponent {
  data = [/* indexable objects */];
  categories = {
    value: { label: 'Performance', color: 'blue' }
  };
}
```

## Available Components

- `LineChartComponent`
- `BarChartComponent`
- `AreaChartComponent`
- `DonutChartComponent`
- `BubbleChartComponent`
- `GanttChartComponent`

## Documentation

For full documentation and examples, visit [angularcharts.com/docs](https://angularcharts.com/docs).

For the website, visit [angularcharts.com](https://angularcharts.com/).

For the repository, visit the [main GitHub page](https://github.com/dennisadriaansen/angular-chrts).
