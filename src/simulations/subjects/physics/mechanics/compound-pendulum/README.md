# Compound Pendulum — public mechanics laboratory

Implementation: HTML/Canvas runtime hosted inside the platform's registered React
entry point; **physics lives only in** `src/esbiko-physics/mechanics/compoundPendulum.js`.

Compare up to 4 independent experiments, each with 1–4 rods.
Use the "Editing" selector to adjust independent initial angles, lengths, angular
speeds, friction, gravity, trail colors and toggles. Selecting another pane does
not reset physical time; changing physical parameters restarts ALL pendulums from
time zero so comparisons share one time origin. Four samples are capped to avoid
unlimited simulation cost. Mouse/touch tap selects a pane; wheel zooms view only.
One canvas contains all panels so 16:9 / 9:16 WebM recording captures comparison.

MCP: the canonical frontend manifest publishes per-pane flattened parameter keys
(`p1_lengthM1` etc.), allowing the remote MCP tool to hydrate configurations
through `?embed=mcp-app&mcp.<key>=...`; browser WebMCP exposes live state,
configure, trajectory, camera and video. Server-side remote **live state
mutation** is not implemented; no claim of multi-user remote session control.

Tests:
- `npm run test:compound-pendulum`
- `npm run test:compound-comparison`
- `npm run test:html-standard`
- `node scripts/test-compound-comparison-browser.mjs` in Chromium.
