# ESBIKO MOBILE DESIGN SYSTEM

Version: 0.1

Status: Active Foundation

Project: Esbiko Science Web Lab

Last Updated: July 2026

---

# 1. Purpose

Esbiko needs a shared Mobile Design System so pages, dashboards, and simulations do not solve responsive behavior independently.

This system is not a visual redesign. It is a small set of responsive primitives and rules that make future work consistent across:

* public pages
* dashboards
* admin tools
* simulation runtime
* individual simulations
* PWA standalone mode

The goal is responsive-first development: every new feature should naturally support desktop, tablet, and phone layouts.

---

# 2. Relationship To The Mobile Responsive Roadmap

The responsive roadmap defines phases and priorities.

The Mobile Design System defines reusable implementation tools for those phases.

Current relationship:

* Phase 1 created global responsive foundations.
* Phase 1.5 creates shared mobile primitives.
* Phase 2 and later should reuse these primitives instead of adding new one-off responsive wrappers.

The design system should stay small. New primitives should be added only when repeated responsive behavior appears in more than one page or simulation.

---

# 3. Design Philosophy

Esbiko should be:

* responsive first
* stable on desktop
* touch friendly
* safe-area aware
* simulation friendly
* PWA ready
* modular and incremental

Responsive first does not mean mobile only. It means components should have a natural behavior across desktop, tablet, and phone without separate rewrites.

---

# 4. Folder Structure

The Mobile Design System lives in:

`src/components/mobile/`

Reasoning:

* `src/components/layout/` is for app and page layout shell components.
* `src/components/shared/` already contains broad simulation and utility components.
* `src/components/shared/mobile/OrientationGuard.jsx` already exists and is reused.
* `src/components/mobile/` gives platform-wide responsive primitives a clear home without mixing them into simulation internals.

Public exports are provided through:

`src/components/mobile/index.js`

Import pattern:

```js
import { ResponsiveContainer, MobileDrawer } from "@/components/mobile";
```

---

# 5. Naming Conventions

Use explicit names that describe responsive behavior:

* `SafeAreaContainer`
* `ResponsiveContainer`
* `ResponsiveStack`
* `MobileDrawer`
* `MobileBottomSheet`
* `MobileToolbar`
* `MobileFloatingButton`
* `OrientationNotice`

Avoid vague names such as:

* `Wrapper`
* `Box2`
* `MobileThing`
* `ResponsiveDiv`

---

# 6. Shared Responsive Primitives

## SafeAreaContainer

Purpose:

Apply safe-area padding using global CSS variables.

Use for:

* fullscreen shells
* PWA standalone layouts
* overlays near device notches
* bottom controls near gesture bars

Do not use it as a generic page container when normal page padding is enough.

## ResponsiveContainer

Purpose:

Provide a centered, width-limited content container with responsive horizontal padding.

Use for:

* public pages
* dashboard sections
* admin pages after mobile migration

## ResponsiveStack

Purpose:

Provide a standard responsive flex stack that is column on phones and row on larger screens by default.

Use for:

* headers with actions
* button rows
* summary sections
* card toolbars

## MobileDrawer

Purpose:

Provide a safe-area-aware drawer with responsive width.

Use for:

* mobile navigation
* dashboard navigation
* future responsive admin navigation
* simulation side controls

## MobileBottomSheet

Purpose:

Provide a bottom sheet for phone-friendly secondary panels.

Use for:

* simulation controls
* filters
* graph panels
* compact settings

## MobileToolbar

Purpose:

Provide a touch-friendly toolbar with predictable spacing.

Use for:

* mobile page headers
* drawer headers
* bottom sheet headers
* simulation compact controls

## MobileFloatingButton

Purpose:

Provide a safe-area-aware floating icon button.

Use for:

* simulation back buttons
* mobile settings buttons
* open-control-panel buttons

## OrientationNotice

Purpose:

Expose the existing `OrientationGuard` through the Mobile Design System naming layer.

Use for:

* simulations that strongly prefer landscape
* high-density interactive views

---

# 7. Component Responsibilities

Mobile Design System components should:

* manage safe-area behavior
* provide responsive spacing
* preserve touch targets
* support desktop and mobile
* remain JSON/API independent
* avoid simulation physics
* avoid page-specific business logic

They should not:

* fetch data
* know user roles
* know simulation state
* change physics behavior
* own routing decisions
* include marketing content

---

# 8. Simulation Responsibilities

Simulations should use mobile primitives for layout mechanics but keep simulation behavior inside their own code.

Simulations are responsible for:

* control panel content
* HUD content
* graph content
* gestures and interaction model
* physics and engine state
* deciding whether portrait, landscape, or both are supported

Simulations should avoid:

* fixed side panels on phones
* hard `100vh` root sizing
* non-scrollable control panels
* HUDs pinned under notches
* custom drawer implementations when `MobileDrawer` or `MobileBottomSheet` fits

---

# 9. Page Responsibilities

Pages should use mobile primitives for layout and spacing while keeping their own content structure.

Pages are responsible for:

* headings
* content hierarchy
* navigation actions
* data loading
* empty states
* error states

Pages should avoid:

* hard-coded page widths
* table overflow without a mobile strategy
* action rows that cannot wrap
* custom safe-area math

---

# 10. Migration Strategy

Migration should be incremental.

Recommended order:

1. Use `MobileDrawer` in existing navigation surfaces.
2. Use `MobileFloatingButton` in simulation runtime controls.
3. Use `ResponsiveContainer` and `ResponsiveStack` in public pages.
4. Use `MobileBottomSheet` for one pilot simulation control panel.
5. Convert admin drawer and tables in a later admin-specific phase.

Do not migrate every component in one large change.

---

# 11. Future Expansion

Potential future additions:

* `ResponsiveGrid`
* `MobileTabs`
* `MobileControlDrawer`
* `SimulationControlSheet`
* `ResponsiveDataList`
* `MobileTableFallback`
* `useResponsiveMode`
* `useSafeAreaInsets`

Add these only when a real migration needs them.

---

# 12. Current Implementation

Current files:

* `src/components/mobile/SafeAreaContainer.jsx`
* `src/components/mobile/ResponsiveContainer.jsx`
* `src/components/mobile/ResponsiveStack.jsx`
* `src/components/mobile/MobileDrawer.jsx`
* `src/components/mobile/MobileBottomSheet.jsx`
* `src/components/mobile/MobileToolbar.jsx`
* `src/components/mobile/MobileFloatingButton.jsx`
* `src/components/mobile/OrientationNotice.jsx`
* `src/components/mobile/index.js`

Current adopters:

* `src/components/layout/HamburgerMenu.jsx`
* `src/components/layout/SimulationLayout.jsx`

This proves the primitives can support existing platform UI without rewriting page or simulation behavior.

