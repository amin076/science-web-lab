# Esbiko — 32 Simulation Delivery Matrix

Snapshot: 2026-10-09. Source: live production `list_science_simulations`, `src/webmcp/siteTools.js`, existing regression scripts and GitHub Actions. Conservative evidence-based states; never confuse declared with verified.

## Four acceptance gates

1. **MCP discovery:** must appear in production `list_science_simulations` with a valid route.
2. **Full MCP control:** live ChatGPT MCP App must operate *every* applicable UI control, playback and state; WebMCP test at source plus production end-to-end evidence. An `adapted` manifest is only a declaration, and `open_science_simulation` only configures/open the embedded UI; neither alone verifies live remote control. If video/export is an existing feature, test that too.
3. **Architecture, science and bug audit:** assess numerical correctness, lifecycle, accessibility, error handling, regression tests; close all identified blocking issues. A targeted fix is **not** full audit signoff.
4. **Responsive/device friendly:** embedded and standalone layouts at 360×500, 600×600, 900×650, 1280×720, portrait/landscape, touch, no stage overlap or horizontal clipping. Automated browser passes are **provisional** pending real-device review.

## Snapshot counts

- MCP discoverable **32/32** (17 `adapted`, 15 `universal`).
- Site WebMCP registry explicitly enables **6/32**, a **different** surface from server MCP discovery.
- Strict **full remote control proven 0/32**; **2/32** have direct browser WebMCP core-action and WebM recording tests (pendulum, spring) but no proof of every feature through hosted ChatGPT.
- Explicit responsive browser regression evidence for **7/32** (provisional); 25 require equivalent proof. Fixes to collision and circular motion lack dedicated responsive viewport tests.
- Targeted architecture/UX bug fix changes for **4/32** in the recent cycle. **0/32** has an evidence-backed complete science/architecture/bugs signoff in this matrix.

## Detailed tracker

Legend: Discovery Y=yes; Adapter A=adapted contract/U=universal; Site = listed on website WebMCP registry; Core = browser-tested core controls; Responsive = automated viewport coverage; Bug = targeted fix; `—` = not yet verified, not necessarily broken.

| # | Simulation | MCP | Adapter | Site WebMCP | Core tested | Responsive CI | Bug fix | Full MCP | Full audit |
|---:|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| 1 | Archimedes' Principle | Y | A | — | — | Y | Y | — | — |
| 2 | Block and Tackle | Y | A | — | — | — | — | — | — |
| 3 | Collision Simulator | Y | A | — | — | — | Y | — | — |
| 4 | Coulomb's Law (2D) | Y | A | — | — | — | — | — | — |
| 5 | Doppler Effect | Y | A | Y | — | — | — | — | — |
| 6 | Earth Orbit Lab (3D) | Y | A | Y | — | Y | — | — | — |
| 7 | Gravity Comparison | Y | A | — | — | — | — | — | — |
| 8 | Gyroscope Motion | Y | A | — | — | Y | — | — | — |
| 9 | Multi-Source Interference | Y | A | Y | — | Y | — | — | — |
| 10 | Projectile Motion | Y | A | — | — | — | — | — | — |
| 11 | Seesaw Balance | Y | A | — | — | — | — | — | — |
| 12 | Simple Pendulum | Y | A | Y | Y | Y | — | — | — |
| 13 | Solar System (3D) | Y | A | Y | — | Y | — | — | — |
| 14 | Sound Waves Lab | Y | A | — | — | — | — | — | — |
| 15 | Spring-Mass Oscillator | Y | A | Y | Y | Y | Y | — | — |
| 16 | Two-Body Gravity | Y | A | — | — | — | — | — | — |
| 17 | Uniform Circular Motion | Y | A | — | — | — | Y | — | — |
| 18 | Ambient Pattern Studio | Y | U | — | — | — | — | — | — |
| 19 | Coulomb's Law (3D) | Y | U | — | — | — | — | — | — |
| 20 | Electric Circuits Lab | Y | U | — | — | — | — | — | — |
| 21 | Evolution of Life | Y | U | — | — | — | — | — | — |
| 22 | Gearbox & Differential (3D) | Y | U | — | — | — | — | — | — |
| 23 | Ideal Gas Law Simulation | Y | U | — | — | — | — | — | — |
| 24 | Kepler's Laws Lab | Y | U | — | — | — | — | — | — |
| 25 | Moon Lander Challenge | Y | U | — | — | — | — | — | — |
| 26 | Optics Bench (2D) | Y | U | — | — | — | — | — | — |
| 27 | Optics Bench (3D) | Y | U | — | — | — | — | — | — |
| 28 | Plate Tectonics (3D) | Y | U | — | — | — | — | — | — |
| 29 | Ripple Tank | Y | U | — | — | — | — | — | — |
| 30 | Satellites & Tracking | Y | U | — | — | — | — | — | — |
| 31 | Spatial Audio Lab | Y | U | — | — | — | — | — | — |
| 32 | Virtual Microscope | Y | U | — | — | — | — | — | — |

## Exit checklist per simulation

- [ ] Actual production MCP discovery and opening
- [ ] Agent parameter/schema matches UI and scientific units
- [ ] All real UI controls can be operated through agent actions, with state readback and rejected invalid inputs
- [ ] Play/pause/reset + physics state consistency, including after resize
- [ ] Video/record/export tested if supported by that simulation
- [ ] Science model and edge cases audited; discovered defects fixed with regression tests
- [ ] 4-size screenshot/layout assertions pass in embedded and standalone modes
- [ ] Touch and at least one real mobile-device/manual review passes
- [ ] Production deployment and ChatGPT end-to-end retested

## Evidence index

- `scripts/audit-all-simulation-readiness.mjs` for registry/manifest inventory; it **does not** verify remote control or deployment.
- `scripts/test-mechanics-agent-browser.mjs` for pendulum and spring controls and video.
- `scripts/test-openai-showcases-responsive.mjs` for Solar and Earth Orbit.
- `scripts/test-gyroscope-responsive.mjs`, `scripts/test-archimedes-responsive.mjs`, `scripts/test-multi-source-responsive.mjs` for their subjects.
- Collision change PR #136, Archimedes PR #137, mechanics PR #134.

Treat this as an initial governance register, not an assertion that all affected devices already work. Update counts only with reproducible evidence links.
