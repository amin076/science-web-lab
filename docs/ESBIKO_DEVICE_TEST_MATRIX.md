# ESBIKO DEVICE TEST MATRIX

Version: 0.1

Status: Active Test Plan

Project: Esbiko Science Web Lab

Last Updated: July 2026

---

# 1. Purpose

This matrix defines the device and viewport targets Esbiko should use while migrating the app toward a mobile-friendly scientific simulation platform.

The goal is not pixel-perfect parity across every device. The goal is stable behavior across common phones, tablets, desktops, PWAs, and simulation capture contexts.

---

# 2. Minimum Support Targets

Esbiko should remain usable from 320 CSS pixels wide upward.

Minimum expectations:

* No horizontal page scrolling on public pages.
* Primary actions remain visible and reachable.
* Tap targets are at least 44 CSS pixels where practical.
* Fullscreen simulations use dynamic viewport units and safe-area-aware controls.
* Desktop and ultrawide layouts keep their existing density and visual identity.

---

# 3. Breakpoint Strategy

Use the existing MUI breakpoint model and Esbiko mobile primitives.

| Class | Width Range | Main Use |
| --- | ---: | --- |
| Narrow phone | 320-374px | Small Android phones, older iPhones, tight portrait testing |
| Standard phone | 375-430px | Current iPhone and Android portrait layouts |
| Phone landscape | 568-932px wide with short height | Simulation controls, drawers, safe-area overlap checks |
| Small tablet | 600-767px | Large phone foldables and compact tablets |
| Tablet | 768-1023px | iPad portrait, Android tablets |
| Desktop entry | 1024-1279px | Laptop and tablet landscape |
| Desktop | 1280-1919px | Primary desktop target |
| Wide desktop | 1920-2559px | Video creation, large monitors |
| Ultrawide | 2560px and above | Wide content centering and simulation capture checks |

---

# 4. Representative Devices

| Device Type | Example Viewports | Notes |
| --- | --- | --- |
| Small Android | 360x640, 360x740 | Check narrow search fields and stacked buttons. |
| iPhone SE class | 375x667 | Check header, cards, dialogs, and short-height scroll. |
| Modern iPhone | 390x844, 393x852, 430x932 | Check safe-area top and bottom spacing. |
| Android large phone | 412x915, 432x960 | Check catalog filters and drawer width. |
| Phone landscape | 667x375, 844x390, 932x430 | Check simulation controls and visible content height. |
| Small tablet | 600x960, 640x1024 | Check grid transitions and drawer behavior. |
| iPad | 768x1024, 820x1180, 1024x1366 | Check tablet density and navigation spacing. |
| Laptop | 1280x720, 1366x768, 1440x900 | Preserve current desktop behavior. |
| Desktop | 1536x864, 1920x1080 | Primary production and recording preview target. |
| Ultrawide | 2560x1080, 3440x1440 | Ensure centered page content does not over-expand. |

---

# 5. Page Expectations

## Home Page

Phone portrait:

* Hero content remains readable without horizontal scroll.
* Section content uses shared responsive containers.
* Cards stack vertically with comfortable spacing.
* Primary buttons remain touch friendly.

Tablet and desktop:

* Existing visual rhythm and section widths remain unchanged.
* Multi-column card grids continue to appear where space allows.

## Experiments Page

Phone portrait:

* Search input uses full available width.
* Topic drawer stays within the viewport and respects safe areas.
* Domain chips wrap instead of overflowing.
* Experiment cards stack or use narrow grids naturally.

Phone landscape:

* Drawer remains scrollable.
* Header and filter controls do not trap the page.

Tablet and desktop:

* Existing catalog density remains unchanged.
* Popular experiments and topic cards keep multi-column layouts.

## Experiment Detail Page

Phone portrait:

* Main content uses the shared responsive container.
* Back/action row can wrap or compress without horizontal overflow.
* Decorative backgrounds do not create scroll width.

Tablet and desktop:

* Existing large-detail layout remains visually consistent.

## RunSimulation Page

Phone portrait:

* Runtime shell uses dynamic viewport height.
* Back controls and overlays should respect safe-area rules through the shared simulation layout.
* Individual simulation internals may still need later pilot work.

Phone landscape:

* Fullscreen simulations should retain maximum visible canvas area.
* Control overlays should remain reachable and scrollable where implemented.

Desktop and video capture:

* Existing fullscreen simulation behavior remains unchanged.
* Capture-safe boundaries are handled by simulation-specific tools, not this shell.

---

# 6. PWA Checks

Test in browser tab and installed PWA mode.

Required checks:

* `viewport-fit=cover` behavior does not clip primary controls.
* Safe-area variables apply in standalone mode.
* Browser address bar collapse does not leave clipped `100vh` layouts.
* Service worker and manifest behavior are not changed by responsive layout work.

---

# 7. Accessibility Checks

For each target page:

* Keyboard focus is visible.
* Dialogs and drawers can close with expected controls.
* Scroll areas remain reachable with touch and wheel input.
* Text does not overlap or clip inside buttons and chips.
* Interactive controls have usable hit targets.

---

# 8. Phase 2A Pilot Checklist

Home:

* Uses shared responsive container.
* No desktop visual regression expected.
* No horizontal scroll at 320px.

Experiments:

* Uses shared responsive container.
* Uses shared safe-area-aware mobile drawer.
* Search, chips, and cards wrap naturally.

Experiment Detail:

* Uses shared responsive container.
* Keeps existing content and visual structure.

RunSimulation:

* Uses shared safe-area container at the runtime shell.
* Does not alter simulation component behavior.

---

# 9. Later Phase Checks

Phase 3 should validate the shared simulation runtime shell before changing individual simulations.

Shared shell checks:

* runtime root uses dynamic viewport height
* stage remains full-bleed and does not resize child simulations
* safe-area back button remains reachable on phones and PWAs
* shared HUD and control primitives use simulation safe-area offsets
* shared control panels scroll internally instead of forcing page scroll
* floating action groups do not cover the back button or orientation notice
* orientation notice respects notches and compact landscape height
* loading, not-found, and crash fallback screens do not clip
* scroll remains locked to the simulation route only
* browser back and in-app back both restore normal page scroll

Pilot simulation checks:

* control panel overflow
* bottom sheets or drawers for dense controls
* HUD overlap with safe-area controls
* portrait usability or clear orientation guidance
* landscape compact-height usability
* fullscreen recording overlays
* no physics, timing, or recording behavior regressions

Phase 5 and Phase 6 should add dashboard and admin-specific checks for:

* tables on phones
* teacher class management
* student assignment flows
* admin navigation
* long names and emails
