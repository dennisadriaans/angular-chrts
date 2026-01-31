# AreaChartComponent refactor plan

Target: [projects/lib/src/lib/area-chart/area-chart.component.ts](../area-chart.component.ts)

Date: 2026-01-31

## Why this refactor
The current component works, but it mixes several responsibilities (Unovis instance lifecycle, Angular signal/effect orchestration, SVG defs/markers, legend management, tooltip rendering). This makes it easy to introduce subtle state bugs when configuration changes.

This plan focuses on improving correctness on configuration changes, simplifying the update path, and making the code easier to extend (e.g. x-accessors, per-series options) without rewriting the component.

## Current observations (from the code)

### Responsibilities currently combined
- Input parsing + derived state (`computed` for colors, keys, legend items, svg defs, marker vars)
- Unovis object creation and updates (`XYContainer`, `Area`, `Line`, `Axis`, `Crosshair`, `Tooltip`, `BulletLegend`)
- DOM template concerns (inline SVG defs, hidden tooltip wrapper)
- Change detection bridging (manual `cdr.detectChanges()` in crosshair callback)

### High-risk correctness gaps
These are the main issues a refactor should fix first because they can produce incorrect charts at runtime:

1. **Structural option changes are not safely handled**
   - Switching `stacked()` at runtime can leave incompatible component arrays in place.
   - Changing `categories()` (keys count/order) can desync the `areas[]`/`lines[]` arrays.
   - Toggling `hideXAxis()` / `hideYAxis()` / `hideTooltip()` after initialization does not rebuild the required Unovis instances (axes, tooltip/crosshair).

2. **Legend lifecycle is incomplete**
   - The legend effect early-returns when `hideLegend()` is true; it does not destroy the existing `BulletLegend` instance.

3. **Duplicate config assembly and drift risk**
   - Many config fragments are repeated across create and update methods (e.g. x/y accessors, curve type, opacity).

4. **Type safety is very loose**
   - `T extends Record<string, any>` plus `Record<string, BulletLegendItemInterface>` means “category keys” are not tied to `T`.
   - A large class of mistakes (e.g. category key typo) cannot be caught at compile time.

5. **Minor: unused or underused inputs**
   - `tooltipStyle`, `legendStyle` exist but are not applied.
   - `DEFAULT_COLOR` is unused.

## Goals
- Correctness: changing inputs should result in a consistent chart without stale Unovis instances.
- Maintainability: single “sync” flow for create/update, with minimal duplicated config.
- Testability: chart lifecycle decisions should be unit-testable without needing to render full SVG charts.
- Minimal API breaking: prefer internal refactors; any API changes should be additive.

## Non-goals
- Replacing Unovis.
- Rewriting the tooltip/legend UI.
- Large behavior changes (unless required to fix incorrect runtime state).

## Proposed refactor strategy

### 1) Introduce an explicit lifecycle/sync model
Add a single method (conceptually `syncChart()`) that:
- Determines whether a **rebuild is required** (destroy + initialize) vs an **in-place update**.
- Ensures Unovis objects match the latest inputs.

Recommended approach:
- Compute a “structural signature” string/object from inputs that require different Unovis instance shapes.
  - Examples: `stacked`, `categoryKeys`, `hideXAxis`, `hideYAxis`, `hideTooltip` (and possibly `markerConfig` if it changes defs ids).
- Store `lastSignature`.
- On each effect run:
  - If no container → initialize.
  - Else if signature changed → destroy + initialize.
  - Else → update in place.

This eliminates fragile assumptions about what changed.

### 2) Normalize derived series data
Create small pure helpers (internal to the component at first) that return stable “series descriptors”:
- `series = [{ key, color, gradientId, lineDashArray }]`

Use these descriptors to build both:
- SVG defs (`svgDefs()`)
- non-stacked areas/lines creation and update

This removes the repeated `keys.forEach((key, index) => ...)` logic.

### 3) Unify create/update config generation
Consolidate duplicated config by generating configs from a single source:
- `buildAreaConfig(series, mode)`
- `buildLineConfig(series, mode)`
- `buildXAxisConfig()` / `buildYAxisConfig()` already exist; keep and tighten typing.
- `buildContainerConfig()` already exists; keep it, but ensure its fields reflect the current “enabled” state (including removing tooltip/crosshair/axes when toggled off).

### 4) Make “enable/disable” options actually toggle
Handle these toggles explicitly:
- **Axes**: when `hideXAxis()` becomes true, set `xAxis = null` and update container; when false, create axis instance.
- **Tooltip/Crosshair**: when `hideTooltip()` becomes true, set `tooltip = null` and `crosshair = null`; when false, create them.
- **Legend**: when `hideLegend()` becomes true, call `legend?.destroy()` and set `legend = null`.

This can be done as part of the signature rebuild logic (simple and safe), or as separate “ensure instance” helpers if you want fewer rebuilds.

### 5) Tighten typing without breaking consumers
Incrementally improve types while keeping current API compatible:
- Introduce a new generic for category keys:
  - `K extends Extract<keyof T, string>`
- Move towards:
  - `categories: Record<K, BulletLegendItemInterface>`
- Keep the public input accepting `Record<string, ...>` initially (non-breaking), but internally compute `const keys = Object.keys(categories) as K[]`.

Optional (additive) improvement:
- Add `xAccessor` input to stop hard-coding `x: (_, i) => i`.

### 6) Apply or remove unused inputs
Decide one of the following for `tooltipStyle` and `legendStyle`:
- Apply them in the template (e.g. `[ngStyle]`) or pass to child components, OR
- Remove them if they are not intended to be supported.

Likewise, remove the unused constant `DEFAULT_COLOR`.

## Suggested implementation steps (safe increments)

1. **Add signature-based rebuild** (biggest correctness win)
   - Implement `getSignature()` and `syncChart()`
   - Replace current `initializeChartEffect` body with `syncChart()`

2. **Fix legend hide/show lifecycle**
   - On `hideLegend() === true`, destroy legend instance.
   - On show, recreate/update.

3. **Refactor series descriptor**
   - Extract `getSeries()` computed.
   - Use it to drive create/update for non-stacked mode and svg defs ids.

4. **Consolidate create/update paths**
   - Reduce duplicated config fragments.
   - Ensure stacked/non-stacked logic uses the same config builders.

5. **Type tightening**
   - Add internal key typing and avoid `any` where possible.

6. **Address unused inputs**
   - Apply `legendStyle`/`tooltipStyle` (or remove them).

## Testing plan
Even without deep Unovis rendering tests, we can validate correctness by testing lifecycle decisions.

Recommended unit tests:
- “Rebuild required” cases:
  - toggling `stacked`
  - changing `categories` keys count/order
  - toggling `hideXAxis` / `hideYAxis` / `hideTooltip`
- “Update only” cases:
  - data changes
  - style changes that should not rebuild (e.g. `lineWidth`, `curveType`, `gradientStops`)

Test strategy options:
- Spy on `destroyChart` and `initializeChart` methods and assert call counts.
- Keep Unovis types behind small adapter methods so they can be stubbed.

## Acceptance criteria
- Switching `stacked` at runtime always yields a correct chart (no missing series, no stale series).
- Changing `categories` dynamically updates series reliably.
- Toggling axes/tooltip/legend reliably creates/destroys the relevant Unovis instances.
- No memory leaks: `destroyChart()` cleans up all instances and is invoked appropriately.
- The code has a single clear sync flow and significantly less duplication.

## Notes / follow-ups
- The same structural-toggle issues exist in other chart components (e.g. bar chart). Once the approach is validated here, consider extracting a small shared internal helper for “signature + rebuild” behavior.
