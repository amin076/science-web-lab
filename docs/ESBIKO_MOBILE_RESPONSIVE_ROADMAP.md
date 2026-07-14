# ESBIKO MOBILE RESPONSIVE ROADMAP

Version: 0.1

Status: Active Roadmap

Project: Esbiko Science Web Lab

Last Updated: July 2026

---

# 1. Current Status

Esbiko is already a React, Vite, Firebase, and PWA web application. It has a working public site, experiment catalog, dashboards, admin pages, and a shared simulation runtime.

Responsive support is present but uneven.

Current strengths:

* Public pages use several MUI breakpoint patterns.
* Experiment cards and many dashboard cards use responsive grids.
* The simulation run route uses a shared `SimulationLayout`.
* Simulation routes have error boundaries and lazy loading.
* The app has PWA manifest and service worker support.
* Some simulations already include mobile-specific handling.

Current weaknesses:

* No single mobile architecture standard is enforced across pages.
* Some simulation shells use fixed side panels, `100vh`, `100vw`, `h-screen`, or `overflow-hidden`.
* Admin pages use permanent desktop navigation and wide tables.
* Several simulation HUDs and control panels can overlap on narrow screens.
* Safe-area handling is inconsistent.
* Touch-target sizing is not standardized.
* PWA manifest settings are not fully aligned between `public/manifest.json` and the Vite PWA manifest.

---

# 2. Main Mobile Problems

## Global Layout

Observed issues:

* The app shell relies on `100vh` in several places.
* Safe-area variables are not available globally.
* The floating dashboard drawer can cover content on small screens.
* Header spacing is partly responsive, but not yet governed by a shared mobile standard.
* Some reusable cards use minimum widths that can be risky in narrow nested containers.

Impact:

* iOS and Android browser UI can cause clipped content.
* Standalone PWA mode can collide with notches or system gesture areas.
* Floating controls can cover page content.

## Core Pages

Home, About, Contact, Experiments, and Experiment Detail are partially responsive.

Observed issues:

* Home and Experiment Detail have large visual sections that need real device testing.
* Experiment Detail uses large decorative assets and fixed blur backgrounds that may need mobile tuning later.
* Login and Register are narrow and mostly safe, but need safe-area and small-height testing.
* Experiments page has responsive layout patterns, but drawer and filter behavior should be tested on small screens.

## Dashboard Pages

Teacher and Student dashboards are functional and use responsive grids.

Observed issues:

* Some action button rows can become cramped.
* Dashboard floating drawer is desktop-biased.
* Class detail pages need checks for long class names, long emails, and attachment lists.

## Admin Pages

Admin pages are desktop-first.

Observed issues:

* AdminLayout uses a permanent 260px drawer.
* AdminUsers and AdminMessages use wide tables.
* Table actions are not mobile-card based.

Admin should be handled in a later phase because changing admin navigation and tables is higher risk than global foundations.

## Simulation Runtime

All registered simulations run through:

`/experiments/:id/run`

and are wrapped by:

`SimulationLayout`

Observed issues:

* `SimulationLayout` uses hard viewport units.
* Many individual simulations use full-screen fixed layouts, fixed side panels, and hidden overflow.
* Some simulations support portrait poorly or force practical landscape use.
* HUD, graph, and control panel behavior is inconsistent.

Common risk patterns found:

* `h-screen`
* `100vh`
* `100vw`
* fixed-width side panels such as `w-[360px]`, `w-[390px]`, `w-[400px]`
* `overflow-hidden` on root simulation wrappers
* absolute HUDs pinned to corners without safe-area offsets
* non-collapsible control panels

## PWA and Mobile Install

Current PWA support exists.

Observed issues:

* `vite.config.js` sets PWA orientation to `any`.
* `public/manifest.json` sets orientation to `portrait`.
* `index.html` lacks `viewport-fit=cover`.
* Standalone display needs safe-area testing.
* Offline behavior is intentionally limited and should not be expanded in this stage.

---

# 3. Risk Areas

High risk:

* Mass-changing simulation layout internals.
* Replacing admin tables without preserving workflows.
* Changing scroll lock behavior globally without testing modals, drawers, and simulation routes.
* Forcing all simulations into one mobile layout.
* Changing PWA service worker behavior while improving layout.

Medium risk:

* Updating shared layout wrappers.
* Changing dashboard drawer behavior.
* Standardizing touch target sizes globally.
* Updating viewport metadata.

Low risk:

* Adding safe-area CSS variables.
* Adding reusable mobile utility classes.
* Switching shared fullscreen wrappers from `100vh` to `100dvh`.
* Adding responsive width limits to mobile drawers.
* Documenting phased migration rules.

---

# 4. Recommended Responsive Architecture

Esbiko should use layered responsive responsibility:

```text
Global CSS foundation
  -> App layout shell
    -> Page layouts
      -> Simulation runtime shell
        -> Individual simulation mobile adapters or controls
```

The global layer should provide only safe primitives:

* dynamic viewport support
* safe-area variables
* touch target minimums
* horizontal overflow prevention
* utility classes for responsive pages and simulation shells

Page layouts should manage:

* content width
* page padding
* section spacing
* card grids
* drawers and dialogs

Simulation runtime should manage:

* fullscreen bounds
* scroll lock
* orientation guidance
* safe-area offsets
* stable stage sizing

Individual simulations should manage:

* control panel placement
* HUD collapse
* graph visibility
* touch gestures
* portrait and landscape decisions

---

# 5. Breakpoints Strategy

Use the existing MUI and Tailwind breakpoint concepts, but document the platform meanings:

* `xs`: phones, narrow portrait, 0 to 599px
* `sm`: large phones and small tablets, 600 to 899px
* `md`: tablets and small laptops, 900 to 1199px
* `lg`: desktop, 1200px and above

Recommended behavior:

* `xs`: single column, no fixed sidebars, collapsible controls, touch-first.
* `sm`: single or two-column cards, drawer-based secondary controls.
* `md`: allow split views where the stage remains usable.
* `lg`: preserve current desktop behavior.

Do not use viewport width alone for simulations. Also consider:

* available height
* portrait vs landscape
* pointer type
* safe-area insets
* control density

---

# 6. Simulation Mobile Strategy

Do not attempt to fix every simulation at once.

Recommended shared standards:

* Every simulation should fit inside `SimulationLayout`.
* Simulation root should avoid `100vh`; prefer `100dvh` or inherited height.
* Control panels should be scrollable.
* HUDs should have safe-area offsets.
* Mobile controls should collapse into a drawer or bottom sheet.
* Graph-heavy simulations should use tabs or collapsible sections.
* 3D simulations should reduce label density on small screens.
* Landscape-only simulations may show an orientation guide, but should not crash or trap the user.

Recommended pilot candidates:

* Doppler Effect: already has a clear engine boundary, audio, controls, and runtime state.
* Multi-Source Interference: already has a modern control panel and recording flow.

Do not use the most complex astronomy simulations as first pilots unless the goal is specifically 3D mobile UX.

---

# 7. PWA Mobile Strategy

Keep PWA behavior stable in early phases.

Phase 1 PWA work should only include:

* correct viewport handling
* safe-area readiness
* manifest audit
* install display testing

Do not change caching, offline strategy, or service worker behavior until layout work is stable.

Future PWA checks:

* Android Chrome install
* iOS Safari Add to Home Screen
* standalone mode safe area
* orientation behavior
* reload and service worker update behavior
* large simulation asset loading

---

# 8. Step-by-Step Implementation Plan

## Phase 1: Global Responsive Foundation

Goal:

Add safe global foundations without changing page or simulation behavior.

Tasks:

* Add global safe-area CSS variables.
* Add basic horizontal overflow protection.
* Add touch-friendly minimums for coarse pointers.
* Update viewport meta to include `viewport-fit=cover`.
* Use dynamic viewport height in shared fullscreen wrappers.
* Keep desktop behavior unchanged.

## Phase 2: Core Pages Responsive Fixes

Goal:

Improve public pages without changing platform architecture.

Tasks:

* Test Home, About, Contact, Experiments, and Experiment Detail at phone and tablet sizes.
* Fix large heading overflow.
* Tune card spacing and hero section spacing.
* Make experiment filters and drawers easier on phones.

## Phase 3: Simulation Runtime Mobile Shell

Goal:

Improve shared simulation containment.

Tasks:

* Standardize safe-area offsets.
* Add optional mobile control drawer primitives.
* Add runtime utilities for portrait, landscape, and compact height.
* Keep simulation internals unchanged except pilot work.

## Phase 4: Pilot Simulation Mobile Improvements

Goal:

Validate standards on one or two simulations.

Pilot candidates:

* Doppler Effect
* Multi-Source Interference

Tasks:

* Make controls collapse on mobile.
* Prevent HUD overlap.
* Preserve physics and recording.
* Test portrait and landscape.

## Phase 5: Teacher and Student Dashboard Mobile

Goal:

Improve LMS mobile workflows.

Tasks:

* Tune class cards and button rows.
* Improve class detail pages for long text.
* Improve attachment and submission flows.
* Avoid changing permissions or data model.

## Phase 6: Admin Mobile Improvements

Goal:

Make admin usable on tablets and phones.

Tasks:

* Replace permanent drawer with responsive drawer.
* Wrap tables or convert to responsive cards.
* Preserve admin workflows and backend calls.

## Phase 7: PWA Polish and Device Testing

Goal:

Make installed app experience reliable.

Tasks:

* Align manifest orientation policy.
* Test standalone display on Android and iOS.
* Audit icons and theme colors.
* Improve offline fallback only after responsive shell is stable.

---

# 9. What NOT To Do

Do not:

* Rewrite the entire UI.
* Change simulation physics.
* Change simulation behavior as part of responsive foundation work.
* Replace every simulation layout in one PR.
* Force all simulations into one universal layout.
* Break desktop spacing to optimize phone layouts.
* Change Platform API or Firebase Functions for mobile layout work.
* Change service worker caching while working on layout.
* Remove routes.
* Rename simulation IDs.

---

# 10. Testing Checklist

Global:

* Build passes.
* No horizontal page overflow at 320px width.
* Header is usable at 320px, 375px, 390px, and 430px.
* Body scroll works on normal pages.
* Simulation routes still lock page scroll.
* Back button remains reachable in simulation runtime.
* Theme switcher does not cover navigation controls.

Core pages:

* Home
* About
* Contact
* Experiments
* Experiment Detail
* Login
* Register

Dashboard:

* Teacher Dashboard
* Student Dashboard
* Teacher Class Detail
* Student Class Detail

Admin:

* Admin Dashboard
* Admin Users
* Admin Messages

Simulation runtime:

* `/experiments/:id/run`
* portrait phone
* landscape phone
* tablet
* desktop
* fullscreen and back navigation

PWA:

* manifest loads
* icon loads
* standalone mode starts at `/`
* safe-area insets do not hide important controls
* service worker still builds

Accessibility and touch:

* primary controls are at least 44px tall on touch devices
* inputs do not zoom unexpectedly on iOS
* keyboard focus remains visible
* dialogs and drawers can be dismissed
* text remains readable at mobile sizes

---

# 11. Priority Phases

Priority order:

1. Phase 1: Global responsive foundation
2. Phase 1.5: Mobile Design System
3. Phase 2: Core pages responsive fixes
4. Phase 3: Simulation runtime mobile shell
5. Phase 4: Pilot simulation mobile improvements
6. Phase 5: Teacher/student dashboard mobile
7. Phase 6: Admin mobile improvements
8. Phase 7: PWA polish and device testing

The key principle is progressive improvement. Each phase should be buildable, reversible, and small enough to review safely.

---

# 12. Phase 1.5: Mobile Design System

Status:

Started

Goal:

Create one shared responsive primitive layer for pages, dashboards, admin tools, and simulations.

Design document:

`docs/ESBIKO_MOBILE_DESIGN_SYSTEM.md`

Implementation folder:

`src/components/mobile/`

Initial primitives:

* `SafeAreaContainer`
* `ResponsiveContainer`
* `ResponsiveStack`
* `MobileDrawer`
* `MobileBottomSheet`
* `MobileToolbar`
* `MobileFloatingButton`
* `OrientationNotice`

Initial adopters:

* mobile hamburger navigation
* shared simulation layout back/orientation controls

Migration rule:

Future mobile fixes should prefer these primitives before adding page-specific or simulation-specific responsive wrappers.

<!-- JULY_2026_MOBILE_CHECKPOINT -->
## July 2026 Mobile Checkpoint

### Completed

- Responsive `AdminLayout` implemented and production-build verified.
- Dashboard navigation rebuilt for separate mobile and desktop behaviour.
- Shared `MobileDrawer` is used for narrow dashboard viewports.
- Dashboard links were corrected to real application routes.
- Protected Join Class route was added.
- Simulation orientation advice no longer blocks portrait users.
- Dismissal of orientation advice is stored for the browser session.

### Verification

- Production build passed with 15,623 transformed modules.
- Route, drawer, orientation, Git, and build checks passed through verified KAP reports.

### Next Mobile Work

- Login and Register responsive implementation.
- Authenticated dashboard content inspection.
- Public header and hamburger safe-area review.
- Class, assignment, and experiment page responsiveness.
- Simulation-by-simulation mobile readiness classification.
