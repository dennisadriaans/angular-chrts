# Combined Refactor Plan: AreaChartComponent

**Date:** 2026-01-31  
**Target File:** `projects/lib/src/lib/area-chart/area-chart.component.ts`  
**Based on:** Claude, Gemini, and GPT refactor plans + SOLID principles

---

## Executive Summary

This plan synthesizes insights from three AI-generated refactor plans to create a comprehensive, SOLID-compliant refactoring strategy for the AreaChartComponent. The focus is on **correctness first**, then **maintainability**, and finally **performance**.

**Current State:**
- 627 lines of code
- 34 inputs, 1 output
- Mixed responsibilities (lifecycle, config, rendering, events)
- Critical bugs when toggling `stacked` mode or changing categories at runtime

**Target State:**
- ~400 lines of code (35% reduction)
- Clear separation of concerns following SOLID
- Correct behavior for all runtime configuration changes
- Improved testability without breaking existing API

---

## Critical Issues to Fix (Priority Order)

### 1. Structural Update Bug (HIGH PRIORITY)
**Problem:** When `stacked` mode or `categories` keys change at runtime:
- The existing `areas[]`/`lines[]` arrays may have incorrect length
- `updateStackedComponents` expects 1 item; `updateNonStackedComponents` expects N items
- This causes runtime errors or incorrect rendering

**SOLID Violation:** Single Responsibility Principle - the update logic handles both in-place updates AND structural changes incorrectly.

### 2. Legend Lifecycle Incomplete (MEDIUM PRIORITY)
**Problem:** When `hideLegend()` becomes true, the legend effect early-returns without destroying the existing `BulletLegend` instance.

### 3. Axis/Tooltip Toggle Broken (MEDIUM PRIORITY)
**Problem:** Toggling `hideXAxis()`, `hideYAxis()`, or `hideTooltip()` after initialization doesn't recreate/destroy the Unovis instances.

### 4. Code Duplication (MEDIUM PRIORITY)
**Problem:** Configuration logic for Area/Line is duplicated between `create...` and `update...` methods.

### 5. Unused Inputs (LOW PRIORITY)
**Problem:** `tooltipStyle`, `legendStyle`, and `DEFAULT_COLOR` are unused.

---

## SOLID Principles Application

### Single Responsibility Principle (SRP)
**Current:** Component handles config building, lifecycle management, DOM rendering, event handling.
**After:** Extract pure config builder functions. Keep component focused on Angular integration.

### Open/Closed Principle (OCP)
**Current:** Adding new chart features requires modifying the main component.
**After:** Use composition with configuration objects. New features extend via config, not code modification.

### Liskov Substitution Principle (LSP)
**Current:** N/A (no inheritance used).
**After:** Keep it that way - favor composition over inheritance.

### Interface Segregation Principle (ISP)
**Current:** Single large component API with 34+ inputs.
**After:** Keep external API unchanged, but internally organize into focused interfaces/types.

### Dependency Inversion Principle (DIP)
**Current:** Component directly instantiates Unovis classes.
**After:** Keep direct instantiation for now (full DI abstraction would be over-engineering), but extract config creation to pure functions.

---

## Refactoring Strategy

### Phase 1: Introduce Signature-Based Rebuild (CORRECTNESS)

**Goal:** Fix structural update bugs by detecting when a full rebuild is required.

**Implementation:**

1. Create a "structural signature" computed signal that tracks inputs requiring different Unovis instances:
```typescript
readonly structuralSignature = computed(() => ({
  stacked: this.stacked(),
  categoryKeys: this.categoryKeys().join(','),
  hideXAxis: this.hideXAxis(),
  hideYAxis: this.hideYAxis(),
  hideTooltip: this.hideTooltip(),
}));
```

2. Store `lastSignature` as a private property.

3. Create `syncChart()` method that:
   - If no container → initialize
   - If signature changed → destroy + initialize (full rebuild)
   - Else → update in place

**Benefit:** Eliminates all structural update bugs with one pattern.

### Phase 2: Extract Configuration Builders (SRP)

**Goal:** Reduce duplication, improve testability.

**Extract to utility functions:**
- `buildAreaConfig(options)` - unified Area config builder
- `buildLineConfig(options)` - unified Line config builder
- Keep existing `buildXAxisConfig()` and `buildYAxisConfig()` but tighten types

**Create Series Descriptor Pattern:**
```typescript
interface SeriesDescriptor {
  key: string;
  color: string;
  gradientId: string;
  lineDashArray?: number[];
}

// Computed signal that generates series descriptors
readonly series = computed((): SeriesDescriptor[] => {
  const keys = this.categoryKeys();
  const colors = this.colors();
  const lineDashArray = this.lineDashArray();
  
  return keys.map((key, index) => ({
    key,
    color: colors[index],
    gradientId: this.getGradientId(index, colors[index]),
    lineDashArray: lineDashArray?.[index],
  }));
});
```

**Benefit:** Single source of truth for series configuration. Used for SVG defs, area/line creation, and updates.

### Phase 3: Consolidate Create/Update Paths (DRY)

**Goal:** Single config generation used for both create and update.

**Pattern:**
```typescript
private createOrUpdateNonStackedComponents(
  mode: 'create' | 'update',
  series: SeriesDescriptor[]
): void {
  const configs = series.map((s, i) => ({
    area: this.buildAreaConfig(s, false),
    line: this.buildLineConfig(s),
  }));
  
  if (mode === 'create') {
    this.areas = configs.map(c => new Area<T>(c.area));
    this.lines = configs.map(c => new Line<T>(c.line));
  } else {
    configs.forEach((c, i) => {
      this.areas[i]?.setConfig(c.area);
      this.lines[i]?.setConfig(c.line);
    });
  }
}
```

### Phase 4: Fix Legend Lifecycle (CORRECTNESS)

**Current problem:** Legend is never destroyed when hidden.

**Solution:**
```typescript
private initializeLegendEffect(): void {
  effect(() => {
    const legendContainer = this.legendContainer();
    const items = this.legendItems();
    const hideLegend = this.hideLegend();

    if (!isPlatformBrowser(this.platformId)) return;

    if (hideLegend) {
      // Destroy existing legend when hidden
      this.legend?.destroy();
      this.legend = null;
      return;
    }

    if (!legendContainer?.nativeElement) return;
    this.updateLegend(legendContainer.nativeElement, items);
  });
}
```

### Phase 5: Type Safety Improvements

**Tighten return types:**
```typescript
// Before
private buildXAxisConfig(): Record<string, unknown>

// After  
private buildXAxisConfig(): AxisConfigOptions<T>
```

**Add interface for series descriptors and config options.**

### Phase 6: Cleanup

**Remove:**
- `DEFAULT_COLOR` constant (unused)
- Duplicate logic

**Consider for future:**
- Apply `tooltipStyle` and `legendStyle` or mark as deprecated

---

## Implementation Steps

### Step 1: Add Series Descriptor (non-breaking)
- Create `SeriesDescriptor` interface
- Add `series` computed signal
- Refactor `svgDefs` to use `series()`

### Step 2: Add Structural Signature (non-breaking)
- Add `structuralSignature` computed
- Add `lastSignature` property
- Create `syncChart()` method

### Step 3: Refactor initializeChartEffect (behavior fix)
- Replace direct logic with `syncChart()` call
- This fixes structural update bugs

### Step 4: Consolidate Config Builders (internal refactor)
- Create unified `buildAreaConfig()` and `buildLineConfig()` methods
- Refactor create/update methods to use them

### Step 5: Fix Legend Lifecycle (behavior fix)
- Update legend effect to destroy on hide

### Step 6: Cleanup (internal refactor)
- Remove unused constants
- Clean up comments and organization

---

## Files Changed

Only one file is modified:
- `projects/lib/src/lib/area-chart/area-chart.component.ts`

No new files created (keeping it simple for now; service extraction can be Phase 2).

---

## Testing Checklist

After refactoring, verify:
- [ ] Initial render works (stacked and non-stacked)
- [ ] Data updates work
- [ ] Toggling `stacked` at runtime works correctly
- [ ] Changing `categories` at runtime works correctly  
- [ ] Toggling `hideXAxis`/`hideYAxis` works
- [ ] Toggling `hideTooltip` works
- [ ] Toggling `hideLegend` creates/destroys legend
- [ ] Tooltip displays correct data on hover
- [ ] Click events emit correctly
- [ ] SSR compatibility (isPlatformBrowser checks)
- [ ] Component cleanup on destroy

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Breaking existing consumers | Keep public API unchanged |
| Visual regression | Test all chart variants before/after |
| Performance regression | Signature comparison is cheap (string comparison) |
| Incomplete refactor | Incremental steps, each independently testable |

---

## Success Criteria

1. **Correctness:** All structural toggle bugs fixed
2. **Maintainability:** Config logic not duplicated
3. **Size:** ~35% reduction in code
4. **API:** Zero breaking changes
5. **SOLID:** Clear single responsibility for each method

---

## Estimated Effort

- Phase 1 (Signature rebuild): 1-2 hours
- Phase 2 (Config builders): 1 hour
- Phase 3 (Consolidate paths): 1 hour
- Phase 4 (Legend fix): 30 minutes
- Phase 5 (Types): 30 minutes
- Phase 6 (Cleanup): 30 minutes

**Total: ~5-6 hours**
