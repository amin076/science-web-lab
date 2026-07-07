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

---

# 10. Browser Compatibility Matrix

Browser testing should cover both normal browser tabs and installed app behavior where supported.

| Browser / Surface | Primary Devices | Required Checks | Expected Behavior |
| --- | --- | --- | --- |
| Chrome Desktop | Windows, macOS, ChromeOS | Public pages, dashboards, simulations, recording, PWA install prompt | Primary reference browser. Desktop layout and simulation runtime should be stable. |
| Chrome Android | Android phones and tablets | safe area, dynamic viewport, address bar collapse, touch controls, recording controls | No horizontal scroll on pages. Simulation shell should stay full height after browser UI changes. |
| Safari iPhone | iPhone portrait and landscape | notch safe area, Add to Home Screen, orientation notice, touch targets | Content should avoid the notch and home indicator. Orientation guidance should remain readable. |
| Safari iPad | iPad portrait, landscape, split view | tablet breakpoints, pointer/touch hybrid behavior, PWA-like installed mode | Tablet should use comfortable spacing without forcing phone-only layouts. |
| Edge | Windows desktop and Android | desktop parity, PWA install, recording permission behavior | Should match Chrome behavior for app shell and simulations. |
| Firefox | Windows, Android where available | public pages, catalog, simulation loading, fallback screens | Core app should work. Browser-specific recording limitations should be documented if found. |
| Samsung Internet | Samsung Android phones/tablets | address bar behavior, viewport height, touch gestures, recording controls | No clipped controls after toolbar collapse or rotation. |
| Installed PWA | Android, iOS, desktop | standalone display, safe area, reload, service worker update, offline fallback | App should not clip behind system UI. Service worker changes are not part of this phase. |

Priority order for manual checks:

* Chrome Desktop
* Chrome Android
* Safari iPhone
* Safari iPad
* Installed PWA
* Edge
* Firefox
* Samsung Internet

---

# 11. Orientation Matrix

| Mode | Applies To | Required Checks | Expected Behavior |
| --- | --- | --- | --- |
| Portrait | Phones, tablets | public pages, experiment catalog, detail pages, simulation shell | Pages should be naturally usable. Simulations may show guidance if controls require landscape. |
| Landscape | Phones, tablets | compact height, safe-area sides, control overlap, recording overlays | Simulation stage should maximize visible area and keep controls reachable. |
| Auto Rotation | Phones, tablets | rotate while simulation is running, rotate while drawer/panel is open | Layout should reflow without stuck scroll lock, clipped panels, or lost controls. |
| Orientation Notice | Simulation runtime | readability, fullscreen button, safe-area padding, compact height | Notice should not overlap notches or home indicators and should remain dismissible by rotating. |
| Expected Behavior | All orientations | route changes, browser back, in-app back | Normal page scroll should restore after leaving the simulation route. |

Manual orientation checklist:

* rotate from portrait to landscape while a simulation is running
* rotate from landscape to portrait while controls are open
* verify orientation notice appears only where appropriate
* verify fixed HUDs and floating actions remain inside safe areas
* verify scroll lock releases after leaving the simulation

---

# 12. Performance Targets

These targets define acceptable platform behavior for responsive testing. Individual simulations may need lower targets if they are heavy 3D scenes, but regressions should be documented.

| Target Area | Desktop | Tablet | Phone |
| --- | ---: | ---: | ---: |
| Public page interaction | 60 FPS | 60 FPS | 50-60 FPS |
| 2D simulations | 60 FPS | 45-60 FPS | 30-60 FPS |
| 3D simulations | 45-60 FPS | 30-60 FPS | 24-45 FPS |
| Recording preview | 30-60 FPS | 30 FPS | 24-30 FPS |
| Initial route interaction | under 3s on warm load | under 4s | under 5s |

Resource targets:

| Resource | Target | Notes |
| --- | --- | --- |
| CPU | Avoid sustained 100% CPU outside recording or heavy simulation scenes | Long-running educational sessions should not overheat devices. |
| Memory | Avoid unbounded growth during 10-minute simulation runs | Long video capture should be chunked when needed. |
| Battery | Avoid unnecessary animation when paused or hidden | Prefer pausing loops when route is inactive where possible. |
| Thermal | No severe throttling during a 5-minute mobile test | If throttling occurs, record simulation, browser, and device. |
| Network | Simulation route should not repeatedly reload large assets | Check lazy-loaded chunks and repeated retries. |

Performance testing notes:

* use browser performance tools for frame timing
* record device model and browser version
* test at least one 2D simulation and one 3D simulation
* test with recording controls visible and hidden
* compare portrait and landscape on the same device

---

# 13. Recording Test Matrix

| Recording Mode | Required Checks | Expected Behavior |
| --- | --- | --- |
| Landscape recording | 16:9 safe area, stage fill, HUD visibility, controls hidden or intentional | Output should not include unintended black bars or clipped simulation content. |
| Portrait recording | 9:16 safe area, stage centering, mobile controls, source/HUD placement | Output should be usable for shorts without covering key visual content. |
| Square recording | 1:1 crop/preview, centered simulation content, safe-area label behavior | Important content should remain centered and not be hidden by controls. |
| HUD visibility | capture labels, overlays, measurement readouts, status chips | HUDs should be intentional for educational videos and removable for clean artistic video. |
| Safe-area | capture boundary, notch/home indicator avoidance, browser/PWA mode | Safe-area UI should not appear in recorded output unless intentionally shown. |
| Recorder controls | start, stop, chunking, save folder, long capture behavior | Controls should remain reachable and not be captured unless designed to be visible. |

Recording test durations:

| Duration | Purpose | Notes |
| --- | --- | --- |
| 10 seconds | quick layout verification | Use before every recording-related UI change. |
| 60 seconds | chunk save and smoothness verification | Check frame pacing and file size. |
| 10 minutes | long-form stability | Watch memory, browser crash risk, and chunk handling. |
| 1 hour or longer | production workflow | Prefer chunking and external video assembly. |

Recording acceptance criteria:

* no accidental black margins in the intended capture area
* no unwanted UI labels in final capture mode
* frame pacing remains visually smooth
* long recordings do not require browser memory to grow without limit
* generated files can be combined externally without visible seams

---

# 14. Simulation Migration Matrix

This table tracks mobile readiness for simulations registered in `src/simulations/registry/index.js`.

Status meanings:

* `Shell Ready`: runs inside the shared simulation runtime shell.
* `Needs Audit`: individual controls, HUDs, or canvas behavior still need mobile review.
* `Pilot Candidate`: good target for the next simulation-level mobile migration.
* `Not Certified`: no device-specific pass has been recorded yet.

| Simulation | Desktop | Tablet | Phone | Migration Status | Notes |
| --- | --- | --- | --- | --- | --- |
| Ambient Pattern Studio (`creative.patterns.ambient-pattern-studio`) | Shell Ready | Needs Audit | Needs Audit | Needs Audit | Recording and creative controls need dedicated mobile capture tests. |
| Projectile Motion (`physics.mechanics.projectile`) | Shell Ready | Needs Audit | Needs Audit | Not Certified | Check graph/control layout and launch controls on narrow screens. |
| Gravity Comparison (`physics.mechanics.gravity-comparison`) | Shell Ready | Needs Audit | Needs Audit | Not Certified | Check body selectors and comparison labels. |
| Coulomb's Law 2D (`physics.electricity.coulomb-law-2d`) | Shell Ready | Needs Audit | Needs Audit | Not Certified | Check draggable charges and field visualization touch behavior. |
| Coulomb's Law 3D (`physics.electricity.coulomb-law-3d`) | Shell Ready | Needs Audit | Needs Audit | Not Certified | 3D labels and camera controls need mobile validation. |
| Plate Tectonics 3D (`earth-science.geology.plate-tectonics`) | Shell Ready | Needs Audit | Needs Audit | Not Certified | Heavy 3D scene; test camera, labels, and compact controls. |
| Solar System 3D (`astronomy.space.solar-system`) | Shell Ready | Needs Audit | Needs Audit | Not Certified | Test planet labels, orbit controls, and 3D performance. |
| Spring-Mass Oscillator (`physics.mechanics.spring-mass`) | Shell Ready | Needs Audit | Needs Audit | Not Certified | Check sliders and graph readability. |
| Ripple Tank (`physics.waves.surface-waves-double-slit`) | Shell Ready | Needs Audit | Needs Audit | Not Certified | Check stage scaling and control-panel overflow. |
| Satellites & Tracking (`astronomy.space.satellites-telescopes`) | Shell Ready | Needs Audit | Needs Audit | Not Certified | 3D tracking panels and labels need tablet/phone review. |
| Earth Orbit Lab 3D (`astronomy.space.earth-orbit-lab`) | Shell Ready | Needs Audit | Needs Audit | Not Certified | Existing build warning is unrelated but should be fixed before deeper migration. |
| Optics Bench 2D (`physics.optics.lens-mirror-2d`) | Shell Ready | Needs Audit | Needs Audit | Not Certified | Check ray diagram touch placement and object controls. |
| Optics Bench 3D (`physics.optics.lens-mirror-3d`) | Shell Ready | Needs Audit | Needs Audit | Not Certified | Check 3D controls, labels, and compact height. |
| Seesaw Balance (`physics.mechanics.seesaw`) | Shell Ready | Needs Audit | Needs Audit | Not Certified | Check drag targets and force labels. |
| Electric Circuits Lab (`physics.electricity.circuits`) | Shell Ready | Needs Audit | Needs Audit | Not Certified | Circuit editors need careful touch and zoom testing. |
| Collision Simulator (`physics.mechanics.collision`) | Shell Ready | Needs Audit | Needs Audit | Not Certified | Check timeline controls, graph panels, and collision object handles. |
| Doppler Effect (`physics.acoustics.doppler`) | Shell Ready | Needs Audit | Needs Audit | Pilot Candidate | Good Phase 4 candidate because it has audio, controls, recording, and engine state. |
| Simple Pendulum (`physics.mechanics.simple-pendulum`) | Shell Ready | Needs Audit | Needs Audit | Not Certified | Check graph/controls and small-screen labels. |
| Ideal Gas Law Simulation (`physics.thermodynamics.gas`) | Shell Ready | Needs Audit | Needs Audit | Not Certified | Check particle canvas performance and sliders. |
| Multi-Source Interference (`physics.waves.multi-source-interference`) | Shell Ready | Needs Audit | Needs Audit | Pilot Candidate | Good Phase 4 candidate because it has dense controls, HUD, recording, and artistic output. |
| Archimedes Principle (`physics.fluid-mechanics.archimedes-principle`) | Shell Ready | Needs Audit | Needs Audit | Not Certified | Check object dragging and water-level labels. |
| Sound Waves Lab (`physics.acoustics.sound-waves`) | Shell Ready | Needs Audit | Needs Audit | Not Certified | Check oscillator controls and graph readability. |
| Spatial Audio Lab (`physics.acoustics.spatial-audio`) | Shell Ready | Needs Audit | Needs Audit | Not Certified | Requires audio permission and mobile gesture testing. |
| Kepler's Laws Lab (`astronomy.kepler-lab`) | Shell Ready | Needs Audit | Needs Audit | Not Certified | Check orbit controls and graph panels. |
| Uniform Circular Motion (`physics.mechanics.circular-motion`) | Shell Ready | Needs Audit | Needs Audit | Not Certified | Check rotating object controls and labels. |
| Two-Body Gravity (`physics.mechanics.two-body-gravity`) | Shell Ready | Needs Audit | Needs Audit | Not Certified | Check touch gestures and orbit trails. |
| Block and Tackle (`physics.mechanics.pulley-system`) | Shell Ready | Needs Audit | Needs Audit | Not Certified | Check pulley controls and labels on narrow screens. |
| Gearbox & Differential 3D (`physics.mechanics.gearbox-differential-3d`) | Shell Ready | Needs Audit | Needs Audit | Not Certified | Heavy 3D mechanical scene; test camera and labels first. |
| Virtual Microscope (`physics.optics.microscope`) | Shell Ready | Needs Audit | Needs Audit | Not Certified | Check pinch/zoom behavior and focus controls. |
| Gyroscope Motion (`physics.mechanics.gyroscope`) | Shell Ready | Needs Audit | Needs Audit | Not Certified | Check 3D camera, labels, and performance. |

Migration rules:

* do not migrate all simulations at once
* migrate one pilot simulation per phase
* preserve physics, recording, and existing desktop behavior
* add mobile primitives only where repeated control or HUD behavior exists
* record device results in this matrix after each migration

---

# 15. Accessibility Matrix

| Area | Required Checks | Expected Behavior |
| --- | --- | --- |
| Keyboard | tab order, focus ring, escape behavior, enter/space activation | Public pages and dialogs should be keyboard usable. Simulation shortcuts should not trap focus. |
| Touch | 44px targets, drag gestures, sliders, canvas gestures | Controls should be reachable with thumb input and not conflict with browser gestures. |
| Reduced Motion | OS reduced-motion preference, animation-heavy pages, simulation pause states | Decorative motion should reduce where practical. Scientific animation may continue when essential. |
| Zoom | browser zoom 125%, 150%, 200%; mobile pinch zoom where allowed | Text and controls should not overlap or become unreachable. |
| High Contrast | Windows high contrast, forced colors where possible, dark mode contrast | Text, buttons, and focus rings should remain visible. |
| Screen Reader | page landmarks, button labels, dialog labels, simulation fallback text | Nonvisual users should understand the route and available controls, even when canvas content is visual. |

Simulation accessibility notes:

* canvas-heavy simulations need textual context outside the canvas
* icon-only buttons must have labels
* drag-only controls should eventually have numeric input alternatives
* recording controls must remain keyboard reachable where practical
* focus should return predictably after closing drawers or bottom sheets

---

# 16. Future Automation

Automated responsive testing should start with stable shell behavior before individual simulation assertions.

## Playwright

Recommended coverage:

* open Home, Experiments, Experiment Detail, and RunSimulation
* test core viewport widths: 320, 375, 390, 430, 768, 1024, 1440, 1920
* verify no horizontal document overflow on public pages
* verify simulation shell uses full viewport bounds
* verify back button restores normal page scroll after simulation exit

## Visual Regression

Recommended snapshots:

* Home page hero and first content band
* Experiments page search/filter area
* Experiment Detail hero and sidebar
* RunSimulation loading state
* orientation notice overlay
* selected pilot simulations after migration

## Responsive Screenshot Tests

Recommended screenshot matrix:

| Route | 320x640 | 390x844 | 844x390 | 768x1024 | 1440x900 |
| --- | --- | --- | --- | --- | --- |
| `/` | Required | Required | Optional | Required | Required |
| `/experiments` | Required | Required | Required | Required | Required |
| `/experiments/:id` | Required | Required | Optional | Required | Required |
| `/experiments/:id/run` | Required | Required | Required | Required | Required |

## Regression Checklist

Before merging mobile changes:

* targeted ESLint passes for changed files
* production build passes
* public pages have no unintended horizontal scroll
* simulation route still locks and restores scroll
* desktop layout remains visually unchanged
* PWA manifest/service worker behavior is not changed unless intentionally scoped
* recording workflows are not modified unless explicitly tested
