# MCP, ChatGPT and simulation development guide

Updated 2026-10-10. This guide is the current entry point; earlier v0.1 Doppler descriptions are historical.

## Three separate layers

1. **Remote MCP**: `https://www.esbiko.com/mcp`, Firebase Hosting rewrite to Cloud Functions; `functions/mcp/transport.mjs` provides discovery, tools and UI resources. The legacy `server.js` Doppler implementation is not the full current universal transport.
2. **MCP App**: `simulationWidget.mjs`/`dopplerWidget.mjs` supply host-rendered resources, structured tool results and the embedded simulation bridge. Host messages, trusted origin/source checks, parameter mapping and tool-result state are separate from a plain website link.
3. **Browser WebMCP**: `document.modelContext` and `src/webmcp/useAgentSimulationTools.js` expose actions in a mounted simulation. Actions use live UI state; unmount aborts tool registrations. Browser support is detected, not assumed.

A ChatGPT request discovers a simulation, opens the registered UI resource, sends a supported configuration/action through the bridge, and reads real state. Remote calculation tools can return results without an open browser; browser playback, camera and recording need a mounted supported UI. Never present a parameter echo as proof that a physical model changed.

## Current measured coverage

`node scripts/audit-all-simulation-readiness.mjs --require-all-adapted` on October 10 reports 32 registered simulations, 31 declared advanced contracts and one intentionally quarantined Gearbox & Differential 3D. Its browser WebMCP discovery count is 20. These are different inventory metrics; they do not prove end-to-end ChatGPT control or recording for every simulation. Keep the quarantine until manual repair and acceptance. See `MCP_ADVANCED_32_ROLLOUT.md` and readiness matrices for feature-specific evidence.

The new private 2D reference is outside all these counts. Admin review: https://www.esbiko.com/admin/standards/2d . Its shared UI, playback, camera, measurements, WebMCP registration and browser recording are implemented. Remote discovery of the private reference is intentionally absent.

## Connect and verify ChatGPT

Use the account/workspace's supported developer-mode custom MCP configuration, add the HTTPS `/mcp` endpoint, and refresh discovered tools after a server deployment. Exact Settings labels and availability depend on account/workspace permissions. Follow the official current guide rather than assuming every account has the same menu.

Start with discovery and a supported scientific calculation. Then open a catalog simulation, configure one valid parameter, compare visible controls and measured state, run/pause/reset, reject an invalid value, and exercise only declared recording/export features. Browser recording may require a user gesture. The standard produces silent browser WebM; audio-enabled Doppler has its own existing activation/director flow. A tool response is not a saved file until the recorder reports ready and a download succeeds.

Use MCP Inspector/protocol tests for initialize, tools/list, tools/call and resources. Use browser tests for mounted state and bridge interaction. Use a real ChatGPT session for host integration acceptance. Record host, browser, viewport, feature, expected/actual result and commit; do not convert schema-only results into end-to-end checkmarks.

## Add a simulation

Generate the 2D scaffold, implement pure model logic and explicit SI/display transformations, connect UI and agent to the same actions, declare supported parameters and measurements in the manifest, regenerate catalog, wire embedded parameter/command mapping, and test. Keep video/camera capabilities accurate. Unsupported features must be absent or return an explicit error. Preserve tool names, IDs and backwards compatibility. Register public science simulations, not internal admin demonstrations.

Useful checks: `npm run sim:check`, `npm run test:webmcp`, `npm run test:simulation-agent`, `node scripts/test-standard-2d.mjs`, `node scripts/audit-all-simulation-readiness.mjs --require-all-adapted`, `npm run build`. Hosting and Functions are distinct deploy targets: a UI-only release does not redeploy the server. Inspect the deployed revision and live MCP catalog after server changes.

Admin claims authorize the website reference. Public read-only MCP does not inherit browser admin identity. Future private remote tools require server-side authentication and authorization, scoped sessions, ownership checks and explicit recording/export policy. Do not expose an admin-only function through public discovery.

## Current official references

- OpenAI MCP/UI quickstart: https://developers.openai.com/plugins/build/app-quickstart
- ChatGPT developer-mode availability: https://help.openai.com/en/articles/12584461-developer-mode-and-full-mcp-connectors-in-chatgpt
- MCP Apps overview: https://apps.extensions.modelcontextprotocol.io/api/documents/Overview.html

MCP Apps link tools to UI resources and use a host/view messaging bridge. Prefer the standard MCP Apps flow for new integrations and use host-specific extensions only for missing capabilities. Existing Esbiko bridges must be migrated with compatibility tests, not replaced blindly.

Next milestones: admin UI/media acceptance; feature-by-feature legacy simulation migration; complete host acceptance evidence; scoped sessions if required; shared math/integrator pilot. See the 2D implementation guide for the science-engine boundary.
