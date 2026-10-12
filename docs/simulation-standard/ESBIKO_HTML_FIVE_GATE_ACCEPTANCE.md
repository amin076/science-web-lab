# HTML Standard v1.1 — Five-Gate Acceptance

Reference simulation ID: `physics.mechanics.html-reference-projectile`.

The HTML reference is a **standard implementation**, not a general projectile collision model and not a claim that every HTML simulation has been migrated.

## Gate contracts

1. **Responsive/mobile/device friendly:** served as a real Vite multi-page production entrypoint at `/examples/html-simulation/index.html`. One stage above controls on narrow screens; automated Chromium viewport checks at 360, 600, 900 and 1280 px; desktop and embedded iframe flows; no horizontal overflow.
2. **MCP:** `list_science_simulations` discovers the reference and `open_science_simulation` can open its responsive embedded page. Browser WebMCP operates on the same runtime as manual controls.
3. **Advanced MCP:** `get_simulation_control_schema`, `create_simulation_session`, `control_simulation_session`, `read_simulation_session` and `close_simulation_session` use the shared `functions/control/adapterRegistry.mjs`. A capability-token session has revision checks, time and command limits and explicit simulated-time advances; no shadow simulation is allowed in the iframe.
4. **Independent HTTP API:** `GET /api/v1/control/schema?simulationId=physics.mechanics.html-reference-projectile`; `POST /api/v1/control/sessions` with `simulationId`; `GET /api/v1/control/sessions/{sessionId}?checkpoint=1`, `POST .../commands`, and `DELETE .../sessions/{sessionId}` authenticated with `X-Esbiko-Control-Token`. Same controller/model as MCP and UI.
5. **Video:** 16:9 and 9:16 real browser-generated silent WebM through `MediaRecorder` and `canvas.captureStream` with download, errors, lifecycle cleanup and no webcam. Browser user activation and format support still govern recording; the server does **not** produce video.

The pure model lives in `src/esbiko-physics/mechanics/htmlReferenceProjectile.js` and is bundled, not rewritten, into Cloud Functions. The standalone HTML reference restores its identical scientific model from the server's checkpoint and forwards all controls to the authoritative API while attached. If disconnected, it reports this state visibly.

## Tests and limitations

- `node scripts/test-html-standard-control.mjs`: schema, deterministic physics, replay, command validation, state, revisions, transport independence.
- `node scripts/test-html-simulation-standard.mjs`: DOM-less runtime, WebMCP schema and recorder lifecycle.
- `node scripts/test-html-standard-browser.mjs`: real Chromium viewport and WebM test in both aspect ratios; mocked live HTTP route to test bidirectional shared-session iframe behavior. The HTTP route mock exercises the same production control adapter but is not a substitute for live deployment.
- Production verification after merge: check deployed static HTML page, public HTTP API, full MCP tools/list and tools/call, and a new ChatGPT session to confirm embedded UI itself.

Passing the CI suite plus **production HTTP/MCP acceptance** is required before declaring the server integration complete. Browser HTML UI embedded *inside the ChatGPT product* requires a separate user-visible acceptance because CI cannot observe the ChatGPT host UI.
