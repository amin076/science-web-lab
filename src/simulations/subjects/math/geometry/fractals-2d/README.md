# Esbiko Fractal Geometry Lab (2D)
Simulation ID: `math.geometry.fractals-2d`.
Registered under Mathematics > Geometry via `simulation.json` and the standard Esbiko dynamic registry.

## Approved visitor experience
The approved v0.2 offline-capable HTML/Canvas viewer is preserved at `public/fractal-lab/index.html` and displayed by this standard React entry. It contains 19 fractal families, 10 palettes, color gradients, glow, pointer pan, wheel/pinch zoom (0.2–50,000x), iterations, PNG/JSON export and user-initiated WebM capture. Layout is responsive with stage before controls on narrow screens.

## Mathematical model and controls
`src/esbiko-physics/math/fractalModel.js` is the canonical mathematical fractal visitor (pure JavaScript); both local and packaged Cloud Functions use its same formulas.
`functions/api/engine/fractalModel.mjs` is **generated at build time** by `scripts/pack-simulation-control-engine.cjs`, not manually edited.
The browser registers seven WebMCP tools on the same local state as UI controls, when the browser provides `document.modelContext`.
The HTTP/MCP session adapter offers state, schema, configure, advance, step, play/pause/reset, set_camera and read-only empty trajectory; camera bounds are per-model so other labs retain their previous range.
Remote session credentials stay with the outer Esbiko host. The nested same-origin iframe receives only sanitised checkpoints and camera snapshots, and forwards control actions to the existing authenticated session bridge.

## Limits and interpretation
Finite iteration drawings are approximations to their infinite fractal limits. Deep zoom of escape-time fractals is limited by browser numeric precision; 50,000x is an interface bound, not arbitrary precision. Subpixel pruning and node budgets may simplify dense geometry. Similarity dimension is not always the true Hausdorff dimension, especially for overlaps.
Browser recording is silent canvas capture (not a webcam/microphone). It uses browser-supported WebM; unsupported browsers show an error.
MCP time progression is explicit, not a wall-clock server animation. Browser and server models share parameters and iteration laws. The existing HTML prototype uses its own canvas rendering controller, and does not yet inherit the full `createHtmlSimulationRuntime` lifecycle; any future migration should preserve the verified viewer features.

## Tests and release
`node scripts/test-fractals-standard.mjs` (after `npm run platform:catalog`).
`node scripts/test-fractals-browser.mjs` (Playwright/Chromium).
`npm run build` validates registration and bundles the static page.
A push to main triggers the hosting workflow; the MCP functions are released by the existing MCP deployment workflow. Check the live URL and both workflow conclusions before claiming production readiness.
