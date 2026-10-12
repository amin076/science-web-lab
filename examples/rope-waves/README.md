# Waves on a rope — review preview

Not published to the experiments catalog or remote MCP discovery.

- Canonical scientific model: `src/esbiko-physics/waves/ropeWave.js`.
- HTML entry imports that model and the approved `createHtmlSimulationRuntime`.
- Three terminations: matched (traveling), free (R=+1), fixed (R=-1).
- Compact single pulse / ramped continuous sine. The left source absorbs returns.
- Analytic d'Alembert solution; no discretization integrator or artificial damping.
- SI state, speed, wavelength, period, travel time, incident average sinusoidal power.
- Linear small-slope approximation; a warning identifies large-slope settings.
- Physical configuration restarts; playback speed alone preserves state.
- 16:9 and 9:16 recording supplied by the existing runtime; canvas only, silent.
- Browser WebMCP and local readonly SDK/action wrapper share the live controller.
- Server control adapter prepared for HTTP/MCP transport; production discovery and
  live ChatGPT attachment remain release gates, not claims of this preview.

Run `python3 -m http.server 4173` and open `/examples/rope-waves/index.html`.
Run `npm run control:prepare`, then `node scripts/test-rope-wave.mjs`,
`node scripts/test-rope-wave-control.mjs`, and `node scripts/test-rope-wave-browser.mjs`.
The browser test needs Playwright + Chromium. Build the in-conversation preview
from the same sources with `node scripts/build-rope-preview.mjs <output.html>`.

Physics tests cover speed/density scaling, travel, inverted vs non-inverted reflection,
endpoint displacement/slope, finite-difference PDE verification, endpoint energy flux,
checkpoint roundtrip, pulse departure, and rejection of invalid values.

Local verification (2026-10-12): physics, runtime contract, shared server adapter,
360/600/900/1280 px browser views and embedded query hydration passed. Actual
16:9 and 9:16 WebM files were recorded and downloaded in Chromium. No GitHub
Actions workflows were run. The branch has not been pushed; production HTTP/MCP
end-to-end deployment is still pending approval and release integration.

## Four-rope beta upgrade
Four independent rows, initially free / fixed / traveling / finite pulse. Each
row has its own physical parameters, playback, camera and recorder. Shared
buttons play, pause or restart all rows. Finite sine bursts last N/f seconds
for N=0.5, 0.75 or 1; a 10% raised-cosine taper at each edge avoids source
displacement discontinuities. Send pulse resets only its row, then launches
one burst. The legacy rounded pulse remains available to existing API callers.
Run `node scripts/build-rope-beta.mjs` then `node scripts/test-rope-comparison.mjs`.
