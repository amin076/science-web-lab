# Esbiko OpenAI Plugin Submission Readiness

## Target

Publish **Esbiko Science Lab** as a public plugin in the universal OpenAI Plugin Directory shared by ChatGPT and Codex.

Official references:

- https://developers.openai.com/plugins/deploy/submission
- https://developers.openai.com/plugins/deploy/app-review
- https://developers.openai.com/plugins/plugin-guidelines
- https://developers.openai.com/plugins/build/plugins

## Public product identity

- Display name: **Esbiko Science Lab**
- Package name: `esbiko-science-lab`
- Website: https://www.esbiko.com
- Support: https://www.esbiko.com/contact
- Privacy: https://www.esbiko.com/privacy
- Terms: https://www.esbiko.com/terms
- Repository: https://github.com/amin076/science-web-lab
- Production MCP URL for submission: https://www.esbiko.com/mcp
- Authentication: none for the initial public science tools
- Commerce: none

## Submission package

Location:

```text
openai-plugin/esbiko-science-lab/
  plugin.json
  mcp.json
  assets/
    logo.svg
    icon.svg
```

The package uses the portable Agent Plugins format.

## Automated readiness status

### MCP server

- [x] Public HTTPS deployment exists
- [x] Streamable HTTP transport
- [x] Official MCP SDK transport
- [x] Stable server instructions
- [x] Tool names/descriptions/schemas
- [x] Output schemas for structured tools
- [x] Tool annotations
- [x] MCP App resources and CSP
- [x] Official MCP-client live smoke tests
- [x] Serialized production deployments
- [x] Runtime startup test before deployment
- [x] Parameter validation from the canonical agent manifest

### Plugin package

- [x] Portable `plugin.json`
- [x] Portable `mcp.json`
- [x] Square logo/icon assets
- [x] Listing name and description
- [x] Website/support/privacy/terms URLs
- [x] Default prompts
- [x] Release notes
- [x] Commerce declaration
- [x] Exactly five positive MCP review cases
- [x] Exactly three negative MCP review cases
- [x] Package validator in CI

### Public website

- [x] Product website
- [x] Contact/support route
- [x] Privacy-policy route
- [x] Terms-of-service route
- [x] Public simulation routes
- [x] Responsive MCP App embedding

### Flagship review experiences

#### Solar System

Target ID:

```text
astronomy.space.solar-system
```

Submission goal:

- [x] canonical agent contract
- [x] shared MCP parameter hydration
- [x] semantic play/pause/reset controls
- [x] semantic parameter/focus controls
- [x] embedded-mode status
- [ ] flagship multi-viewport Chromium test must pass before merge
- [ ] final production MCP round trip after merge

#### 3D Orbit Lab

Target ID:

```text
astronomy.space.earth-orbit-lab
```

Submission goal:

- [x] canonical agent contract
- [x] shared MCP parameter hydration
- [x] semantic play/pause/reset controls
- [x] semantic view/mode/time controls
- [x] embedded-mode status
- [ ] flagship multi-viewport Chromium test must pass before merge
- [ ] final production MCP round trip after merge

## Required manual OpenAI Dashboard steps

These cannot be completed safely from repository automation because they require the publisher's OpenAI account or a portal-generated secret/challenge.

### 1. Developer identity verification

Required before public review.

Choose one publisher identity:

- individual identity; or
- verified business identity for **Esbiko**

Preferred for the directory: verified Esbiko business identity if available.

### 2. Organization/project permissions

The selected OpenAI organization/project must allow plugin submission.

Required permissions documented by OpenAI:

```text
api.apps.read
api.apps.write
```

Organization owners have these automatically.

### 3. Upload plugin ZIP

Use the artifact produced from:

```text
openai-plugin/esbiko-science-lab/
```

Upload through the OpenAI Plugins submission portal.

### 4. Connect MCP and domain verification

Connect:

```text
https://www.esbiko.com/mcp
```

The portal will provide an exact challenge token.

Write it using:

```text
node scripts/set-openai-apps-challenge.cjs "<token>"
```

This generates:

```text
public/.well-known/openai-apps-challenge
```

Deploy Hosting, verify that the URL returns only the exact token, then complete the dashboard challenge.

Do not commit a guessed or placeholder token.

### 5. Scan Tools

Use **Scan Tools** in the portal after the MCP connection succeeds.

Review the imported:

- tool names/titles/descriptions
- input/output schemas
- annotations
- `_meta`
- UI resource metadata
- CSP
- server instructions

Any scan issue must be fixed server-side and rescanned.

### 6. Demo recording

OpenAI requires a reviewer-accessible demo recording URL for MCP review.

The recording should demonstrate, at minimum:

1. installing/invoking Esbiko Science Lab
2. Solar System flagship prompt
3. 3D Orbit Lab flagship prompt
4. deterministic Doppler calculation
5. one responsive inline MCP App interaction
6. a negative/invalid request and safe handling

Do not put a placeholder URL in the package.

### 7. Review cases

The ZIP already contains exactly:

```text
5 positive
3 negative
```

Before submission, rerun all eight against the final production plugin and record the observed behavior.

### 8. Submit and publish

After all automated findings are resolved:

1. complete required confirmation boxes
2. submit for review
3. wait for review result
4. address findings if rejected
5. after approval, select **Publish**

Approval alone does not publish the plugin.

## Known launch blockers

The following items intentionally remain incomplete until the appropriate human/dashboard step:

- [ ] verified OpenAI publisher identity
- [ ] dashboard permission confirmation
- [ ] portal-generated domain challenge token
- [ ] successful portal domain verification
- [ ] successful current Scan Tools result
- [ ] final demo recording URL
- [ ] final reviewer rerun of all 8 test cases
- [ ] Submit for review
- [ ] Publish after approval

## Privacy launch check

Before final submission, confirm operational settings match the public privacy policy, especially:

- public MCP tools do not require unnecessary personal information
- tool responses do not expose internal IDs/debug telemetry
- server/diagnostic log retention does not exceed the documented policy without a documented legal/security exception
- account/support retention behavior remains accurately described

## Submission positioning

Esbiko should be presented as an interactive science/education product, not as a generic MCP demo.

Core value:

> ChatGPT can open, configure, and explain real interactive science simulations rather than only describing the concepts in text.

Flagship demonstrations:

1. Solar System
2. 3D Orbit Lab
3. Doppler Lab
4. Simple Pendulum
5. Gyroscope

The first two should lead the demo video and review narrative because they best communicate the visual and interactive value of the plugin.

## Release policy after publication

MCP server changes may be discovered after publication and can be eligible for automated checks without uploading a new ZIP.

Changes to plugin listing metadata, packaged assets, or skills should be made through a new package version and uploaded again.

Keep the package version semantic and record release notes for every public submission.
