# Refactor Plan: AreaChartComponent

**Date:** 2026-01-31
**Author:** Gemini (Preview)
**Target File:** `projects/lib/src/lib/area-chart/area-chart.component.ts`

## 1. Analysis

The `AreaChartComponent` is currently responsible for:
- Managing Angular inputs (Signals).
- Initializing the Unovis `XYContainer`.
- Managing Unovis components (`Area`, `Line`, `Axis`, `Tooltip`, `Crosshair`, `BulletLegend`).
- Handling updates to data and configuration.
- Managing DOM elements for tooltips and legends.

**Current State Metrics:**
- ~627 lines of code.
- heavy usage of `input()` and `computed()`.
- Two distinct lifecycles: `initializeChart` and `updateChart`.

## 2. Identified Issues

1.  **Code Duplication (DRY Violation):** 
    - Configuration logic for `Area` and `Line` components is duplicated between `create...Components` and `update...Components` methods.
    - Configuration logic uses the same inputs but constructs objects in two places.

2.  **State Management & Robustness:**
    - **Stacked vs. Non-Stacked Transition Bug:** The current `updateChart` method assumes the existing arrays (`this.areas`, `this.lines`) match the current `stacked()` state. If `stacked` changes at runtime:
        - `createStackedComponents` creates 1 Area and 1 Line.
        - `createNonStackedComponents` creates N Areas and N Lines.
        - Switching modes without re-initializing will cause `updateStackedComponents` to try and update index 0 of an array that might have N items, or `updateNonStackedComponents` to try and update index K of an array that has 1 item. This often leads to runtime errors or incorrect rendering.

3.  **Complexity:**
    - The class combines high-level Angular integration with low-level property mapping for Unovis.
    - `svgDefs` and `markerSvgDefs` generation logic is mixed into the component.

## 3. Refactoring Goals

1.  **Extract Configuration Logic:** Move property mapping (Angular Input -> Unovis Config) into pure helper functions or a separate config factory.
2.  **Unify Initialization and Updates:** Use a "reconciliation" approach where we generate the *desired* configuration and then apply it.
3.  **Fix Structural Update Issues:** Ensure that if `stacked` mode or the number of categories changes, the internal components are properly rebuilt instead of incorrectly updated.
4.  **Reduce Component Size:** Aim to reduce the file size by delegating logic.

## 4. Implementation Plan

### Phase 1: Utils Extraction
Move pure logic helpers to a utility file (e.g., `projects/lib/src/lib/area-chart/utils/chart-config.ts` or similar, or just private methods if preferring to keep file count low, but separate file is cleaner).

- **Extract Axis Config:** Move `buildXAxisConfig` and `buildYAxisConfig` usage patterns.
- **Extract Component Config:** Create `getAreaConfig(..., stacked: boolean)` and `getLineConfig(...)`.
- **Extract Helper Logic:** Move `createStackedYAccessors`, `createCumulativeYAccessors` to `projects/lib/src/lib/utils/chart-utils.ts` or local utils.

### Phase 2: Structural Reconciliation Strategy
Modify `updateChart` to detect "Structural Changes".

- **Concept:**
    - *Data Update:* Only updating `data` prop -> Call `container.setData()`.
    - *Config Update:* Updating colors, curve type -> Call component `.setConfig()`.
    - *Structural Update:* Changing `stacked` prop or `categories` keys -> Requires destroying and recreating specific `Area`/`Line` components (or clearing the arrays and rebuilding).

- **Refactor Logic:**
    Check if `stacked` mode or `categoryKeys` length changed since last render. If so, rebuild components. Else, update configs.

### Phase 3: Refactoring `AreaChartComponent`

1.  **Imports:** Clean up.
2.  **Properties:** Keep Signals.
3.  **Logic:**
    - Rewrite `initializeChart`:
        - Use new helper functions to generate configs.
        - Set up the container.
    - Rewrite `updateChart`:
        - Determine modification type (Data vs Config vs Structure).
        - If Structure changed: Clear `areas`/`lines`, re-run creation logic, update Container components list.
        - If Config changed: Generate new configs using helpers, apply to existing components.
        - Always update Container data.

### Phase 4: Verification
- Verify Stacked -> Non-Stacked switching works.
- Verify Non-Stacked -> Stacked switching works.
- Verify Axis toggling works.

## 5. Artifacts

- **New File:** `projects/lib/src/lib/area-chart/dom-utils.ts` (Optional, for gradient/marker defs if needed).
- **Modified File:** `projects/lib/src/lib/area-chart/area-chart.component.ts`.
