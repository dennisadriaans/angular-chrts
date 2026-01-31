# Angular Charts Library (`angular-chrts`)

Modern, Signals-first **Angular Charts** powered by Unovis.

## Installation

```bash
npm install angular-chrts @unovis/ts
```

## Features

- **100% AOT Compatible**: Works perfectly in Cloudflare Workers, Vercel Edge, and other edge runtimes
- **No JIT Required**: Built directly on `@unovis/ts` - no Angular-specific wrappers that require JIT compilation
- **SSR Safe**: Browser-specific features (document, window) are safely handled for server-side rendering
- **Tree Shakable**: Only import what you need - unused chart types won't bloat your bundle
- **Signals-based**: Leverages Angular's latest signals API for maximum performance
- **Responsive**: All charts adapt to their container size automatically
- **Customizable**: Full control over axes, tooltips, legends, and styling
- **Typescript Ready**: Robust types for all your data visualization needs

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
    value: { name: 'Performance', color: 'blue' }
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

## Architecture

This library uses `@unovis/ts` directly instead of `@unovis/angular` NgModules. This provides:

1. **AOT-only compilation** - No need for Angular's JIT compiler at runtime
2. **Edge runtime support** - Works in Cloudflare Workers and other edge environments
3. **Smaller bundle size** - Fewer dependencies and no Angular module overhead
4. **Type-safe API** - Full IDE autocomplete and type checking support

All chart components are standalone and use Angular's modern APIs:
- `input()` signals for reactive inputs
- `output()` for event emissions
- `effect()` for reactive chart updates
- `isPlatformBrowser()` checks for SSR safety

## SSR / Edge Runtime Compatibility

The library includes SSR-safe utilities for browser-specific features:

```typescript
import { isBrowser, getDocument, getWindow } from 'angular-chrts';

// Use in your components
if (isBrowser()) {
  // Safe to access window and document
}
```

## Documentation

For full documentation and examples, visit [angularcharts.com/docs](https://angularcharts.com/docs).

For the website, visit [angularcharts.com](https://angularcharts.com/).

For the repository, visit the [main GitHub page](https://github.com/dennisadriaansen/angular-chrts).
