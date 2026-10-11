# Esbiko Advanced Simulation Control API v1 — compound pendulum reference

**State:** experimental first adapter / awaiting live ChatGPT acceptance.

## Design principle

**Scientific API first, transports second.** The control service is independent
of ChatGPT, MCP and HTML. HTTP, MCP, a classroom agent or another AI provider
all dispatch the same typed commands to a simulation **adapter**. Rendering
and media capture remain browser-specific adapters, never embedded into physics.

```text
               Client / external agent / Gemini
                  |     HTTP Control API v1
               ChatGPT MCP transport
                  |     same service methods
        Firestore short-lived scientific session
                  |
         Simulation adapter / versioned schema
                  |
   Esbiko Physics -> N-rod Compound Pendulum
                  |
     independent snapshot and measurements
                  |
 Optional MCP App frame sync via protected bearer token
           HTML/Canvas presentation + video
```

Every future simulation contributes an adapter with these dimensions (not
an identical panel UI): parameter schema, capabilities/command schema, a
serializable scientific checkpoint, measurement schema, and command handlers.
Features like `add_source`, `wire_component`, `focus_planet` or
`configure_fluid` can be domain-specific. Generic control commands remain
`configure`, `get_state`, `advance`, `play`, `pause`, `reset`.

## Canonical implementation

- Scientific model:
  `src/esbiko-physics/mechanics/compoundPendulum.js`
- Multiple experiments:
  `src/simulations/subjects/physics/mechanics/compound-pendulum/comparisonModel.js`
- Server adapter:
  `functions/control/controlCore.mjs`
- Persisted sessions:
  `functions/control/controlService.mjs` (Firebase Admin / Firestore)
- Independent HTTP adapter: `functions/control/http.mjs`
- MCP tools: `functions/mcp/transport.mjs`
- Optional embedded UI bridge: `functions/mcp/simulationWidget.mjs` and
  `ComparisonView.js`
- Bundling only, **not a second scientific implementation**:
  `scripts/pack-simulation-control-engine.cjs` copies the canonical sources
  into `functions/api/engine/*.mjs` during build / Functions deployment.

## HTTP API (without MCP)

Base: `https://www.esbiko.com/api/v1/control`

| HTTP | Route | Function |
|---|---|---|
| GET | `/schema` | versioned parameters/actions/capabilities |
| POST | `/sessions` | create private 30-minute session |
| GET | `/sessions/:id` | read live scientific state |
| GET | `/sessions/:id?since=revision` | delta polling; unchanged signal |
| GET | `/sessions/:id?checkpoint=1` | authorized UI checkpoint transfer |
| POST | `/sessions/:id/commands` | apply one atomic command |
| DELETE | `/sessions/:id` | revoke capability and close session |

Create JSON:
```json
{"parameters":{"paneCount":2,"p1_rodCount":3,"p2_rodCount":3,
"p2_initialAngleDeg1":155.1}}
```
Returns a random session ID and **secret capability token**. A caller **must**
send the token via header `X-Esbiko-Control-Token` for all subsequent
session operations. Do not put it in query strings, publish it, cache it,
or include it in screenshots.

Examples:
```bash
curl -X POST 'https://www.esbiko.com/api/v1/control/sessions' \
 -H 'Content-Type: application/json' \
 -d '{"parameters":{"paneCount":2,"p1_rodCount":3,"p2_rodCount":3}}'

curl -X POST 'https://www.esbiko.com/api/v1/control/sessions/SESSION_ID/commands' \
 -H 'Content-Type: application/json' \
 -H 'X-Esbiko-Control-Token: YOUR_PRIVATE_TOKEN' \
 -d '{"action":"advance","seconds":1.5}'

curl 'https://www.esbiko.com/api/v1/control/sessions/SESSION_ID' \
 -H 'X-Esbiko-Control-Token: YOUR_PRIVATE_TOKEN'
```

All commands are validated against the adapter's parameter schema. Remote
simulation time is **explicit**: `play` changes the play state, but Cloud
Functions do **not** advance in wall-clock background time. `advance` steps
the shared model by up to 2 simulated seconds per call; repeat in a loop.
`step` advances 1/240 simulated second. This is intentional for deterministic,
auditable scientific analysis and to bound compute cost.

Supported actions:
`get_state`, `get_capabilities`, `configure`, `advance`,
`step`, `play`, `pause`, `reset`, `get_trajectory`,
`clear_trails`, `set_camera`.

States include physical angles, velocities, joint positions, energies,
time and inter-experiment tip distances. `get_trajectory` returns bounded
path points in metres. Camera values are stored as display state, not physics.

Concurrency: optional `expectedRevision` rejects stale updates with HTTP 409.
Firestore transactions serialize mutations across Cloud Functions instances.

## MCP tool mapping

- `get_simulation_control_schema` -> descriptor
- `create_simulation_session` -> creates same HTTP-compatible session and
  launches an MCP App UI bound to that session
- `control_simulation_session` -> configure / advance / playback / measure
- `read_simulation_session` -> read exact scientific state
- `close_simulation_session` -> revoke access

MCP is simply one of several supported transports. The simulation core knows
nothing about the MCP SDK or OpenAI.

The MCP App widget delivers its token by scoped `postMessage` to the
embedded Esbiko frame and never places it in the iframe URL. The frame
polls the authorized HTTP API for revisions, restoring the *same*
physical checkpoint and rendering the shared state. When attached, UI
parameter actions also call the server-side API. Browser recording still uses
the existing browser MediaRecorder; it requires browser support and may require
a user click.

## Security and lifecycle

- Cryptographically random 256-bit session capability; only SHA-256 digest
  stored in Firestore; constant-time token comparisons.
- 30-minute expiry, explicit revocation, Firestore TTL-compatible expiresAt.
- Bounded to 80 modifications/session, 120 simulated seconds, 2 simulated
  seconds per advance, 4 experiments × 4 rods, bounded trajectory histories.
- Maximum anonymous session creates 40/hour globally and 1200 mutations/hour.
  This is only initial cost protection. Production scale should add Firebase
  App Check, authenticated user ownership or per-client quota.
- No remotely executable code, arbitrary imports, or functions derived from
  request bodies; only allowlisted, schema-validated numeric/boolean settings.
- Browser CORS restricts `www.esbiko.com` and `esbiko.com`.
  CLI / server-to-server clients can use the API independently of browsers.
- Media APIs cannot capture a user webcam, microphone, desktop or tabs.
- The new beta API runs **separate headless scientific sessions**, not shared
  mutable state with arbitrary public, unbound Esbiko tabs.
- The MCP session secret appears in the tool output so the agent can use it.
  Treat that output as sensitive session access.

## Limitations before labeling 'fully verified'

- Headless `play` is not autonomous background wall-clock execution.
- Remote server cannot directly start a browser's MediaRecorder without an
  attached browser UI and required user gesture.
- No multi-user classroom session ownership policy yet.
- Browser + server synchronization and live ChatGPT host MUST pass real
  end-to-end smoke, separately from Node contract and build tests.

## Release gates

- `npm run test:control`
- `npm run test:compound-pendulum`
- `npm run test:compound-comparison`
- `npm run test:html-standard`
- `node scripts/test-mcp-runtime.mjs`
- Production Vite build and Firebase Functions packaging
- Live HTTP create / configure / advance / read / revoke
- Live MCP create / command / read using same session
- MCP App iframe revision sync, token leak audit, responsive/video regression
- Reject NaN/Infinity, unknown params, invalid token, expired sessions and
  concurrent stale updates. Include numerical conservation/damping tests.

Only after these gates pass should the adapter be advertised as full
`remote-session-controlled`; until then, declare each verified capability
separately.
