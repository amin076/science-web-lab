# Agent-Ready Simulation Checklist

Use this checklist for every new or migrated Esbiko simulation.

## Identity

- [ ] Permanent simulation ID exists
- [ ] Registry key matches the permanent ID
- [ ] Experiment metadata uses the same ID
- [ ] Standard run route works

## Agent contract

- [ ] Canonical agent manifest entry exists
- [ ] Adapter version is declared
- [ ] Supported actions use the standard vocabulary
- [ ] Parameter schema exists
- [ ] State schema exists
- [ ] Video/export flags are accurate

## Parameters

- [ ] Names are explicit and stable
- [ ] Types are declared
- [ ] Units are documented
- [ ] Defaults are sensible
- [ ] Numeric ranges are declared
- [ ] Enum values are declared where applicable
- [ ] Unknown parameters are rejected
- [ ] Shared `readEmbeddedMcpParameters(...)` helper is used

## Controls

- [ ] Play uses semantic action `play`
- [ ] Pause uses semantic action `pause`
- [ ] Reset uses semantic action `reset`
- [ ] Primary controls have accessible labels
- [ ] Primary controls have stable `data-agent-action` or `data-agent-param` identity
- [ ] Control semantics do not depend on DOM position or color

## Embedded / iframe

- [ ] `?embed=mcp-app` is supported
- [ ] Redundant website navigation is not required
- [ ] No essential control is hidden
- [ ] No control panel overlaps critical visualization content
- [ ] No horizontal scroll is required for primary controls

## Responsive viewport matrix

Verify at:

- [ ] 360 x 500
- [ ] 600 x 600
- [ ] 900 x 650
- [ ] 1280 x 720

For each size:

- [ ] route loads
- [ ] visualization has non-zero size
- [ ] primary controls are visible/reachable
- [ ] no uncaught console error
- [ ] no horizontal body overflow
- [ ] no unusable overlapping controls

## Canvas / 3D

- [ ] Canvas sizes from its container
- [ ] Resize is handled
- [ ] Iframe resize does not break the scene
- [ ] Overlays do not block unintended pointer interaction
- [ ] Mobile/touch interaction is reasonable

## Audio / video

If applicable:

- [ ] Browser user gesture requirement is explicit
- [ ] MCP only prepares restricted browser operations
- [ ] UI distinguishes prepared/running/recording/ready/failed
- [ ] No false claim that a file exists before recording/export completes

## Tests

- [ ] `npm run sim:check`
- [ ] simulation-agent contract test
- [ ] MCP runtime test
- [ ] Platform API test
- [ ] WebMCP test
- [ ] full frontend build
- [ ] official MCP live smoke
- [ ] responsive viewport automation (when available)

## Merge rule

A simulation should not be marked agent-ready if any required item above is knowingly broken.

Temporary exceptions must be documented in the simulation README with:

- reason
- affected viewport/capability
- planned fix
- issue/PR reference
