# Angular Charts (`angular-chrts`)

[![NPM Version](https://img.shields.io/npm/v/angular-chrts.svg)](https://www.npmjs.com/package/angular-chrts)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Angular Charts** is a high-performance, developer-friendly data visualization library for modern Angular applications. Based on [Unovis](https://unovis.dev/), it provides a suite of pre-built, Signals-powered components that make creating beautiful, responsive charts effortless.


## 📖 Resources

- [**Website**](https://nuxtcharts.com/)
- [**Documentation**](https://nuxtcharts.com/docs)

## Why Choose Angular Charts?

- 🚀 **Performance First**: Built with Angular Signals for efficient, fine-grained reactivity.
- 🎨 **Beautiful by Default**: Clean, modern design with easy customization via CSS variables.
- 📦 **Declarative API**: Easy-to-use components that feel native to Angular.
- 📊 **Versatile Data Visualization**: Support for Bar, Line, Area, Donut, Bubble, and Gantt charts.
- 🛠 **Powered by Unovis**: Leverages the power of the battle-tested Unovis visualization framework for robust Angular charts.
- ♿ **WCAG 2.1 AA Compliant**: Built-in accessibility features for screen readers and keyboard navigation.

## Installation

Install the package via npm or pnpm:

```bash
# Using npm
npm install angular-chrts @unovis/angular @unovis/ts

# Using pnpm
pnpm add angular-chrts @unovis/angular @unovis/ts
```

## Quick Start: Build your first Angular Chart

Simply import the chart component you need and start visualizing your data.

### 📊 Bar Chart Example

```typescript
import { Component } from '@angular/core';
import { BarChartComponent } from 'angular-chrts';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [BarChartComponent],
  template: `
    <ngx-bar-chart
      [data]="chartData"
      [categories]="categories"
      [height]="400"
      xLabel="Month"
      yLabel="Revenue ($)"
    />
  `
})
export class AppComponent {
  chartData = [
    { month: 'Jan', revenue: 4500 },
    { month: 'Feb', revenue: 5200 },
    { month: 'Mar', revenue: 4800 },
  ];

  categories = {
    revenue: {
      label: 'Monthly Revenue',
      color: '#3b82f6'
    }
  };
}
```

## Supported Chart Types

| Chart Type | Key Features |
| :--- | :--- |
| **Line Chart** | Smooth curves, markers, multi-category support. |
| **Bar Chart** | Grouped or stacked bars, horizontal/vertical orientation. |
| **Area Chart** | Stacked or overlay areas, custom gradients. |
| **Donut Chart** | Highly customizable central labels, legend integration. |
| **Bubble Chart** | 3D data visualization with customizable point sizing. |
| **Gantt Chart** | Specialized timeline visualization for project management. |

## Customization & Styling

Angular Charts icons support extensive styling through inputs and global CSS variables. You can easily control:
- Colors and Gradients
- Axis formatting and labels
- Tooltip content and styling
- Legend positioning (Top, Bottom, Left, Right)

## Accessibility

All charts meet **WCAG 2.1 AA accessibility standards** with built-in support for:
- Screen readers via ARIA attributes
- Keyboard navigation
- Descriptive labels and semantics
- High contrast color schemes

Example:
```typescript
<ngx-bar-chart
  [data]="chartData"
  [categories]="categories"
  ariaLabel="Monthly revenue chart showing sales trends"
  ariaDescribedBy="revenue-description"
/>

<p id="revenue-description" class="sr-only">
  Bar chart displaying monthly revenue from January to March,
  with values ranging from $4,500 to $5,200.
</p>
```

See the [library README](./projects/lib/README.md) for comprehensive accessibility documentation.


## Development

If you want to contribute or build the project locally:

```bash
# Install dependencies
pnpm install

# Start the example app
ng serve

# Build the library
ng build lib
```

## Support

<div style="display: flex; align-items: center; gap: 20px;">
  <a href="https://analogjs.org/">
    <img src="https://analogjs.org/img/logos/analog-logo.svg" alt="Analog" width="60" height="60">
  </a>
  <a href="https://spartan.ng/">
    <img src="https://raw.githubusercontent.com/spartan-ng/spartan/main/spartan.svg" alt="spartan logo" width="90" height="90">
  </a>
</div>

## License

MIT © [Dennis Adriaansen](https://github.com/dennisadriaansen)
