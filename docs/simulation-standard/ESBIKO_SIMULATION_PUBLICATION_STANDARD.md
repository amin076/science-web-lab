# Esbiko simulation publication standard v0.1

Implemented 2026-10-10. The three-stage development contract is:

1. Use the accepted 2D/3D/timeline presentation composition (or explicitly mark a custom renderer).
2. Use Esbiko Physics where an appropriate validated scientific law/model exists; explicitly declare a domain-specific model or no scientific engine otherwise.
3. Register publication through a colocated `simulation.json`, so categorization, detail card and runtime discovery stay aligned.

## One source for new publications

New standard simulations live under `src/simulations/subjects/<domain>/<topic>/<slug>/` with `index.jsx` and `simulation.json`. The ID must equal `<domain>.<topic>.<slug>`; the metadata domain/topic must match. `scripts/generate-simulation-registrations.cjs` validates supported taxonomy, renderer/UI-standard alignment, scientific engine selection, publication visibility, required title/description and a local `index.jsx` entry. It rejects duplicate manifest IDs and legacy registry collisions before writing output.

Example:

```json
{
  "schemaVersion": "esbiko-simulation-registration.v1",
  "id": "physics.mechanics.simple-projectile",
  "domain": "physics",
  "topic": "mechanics",
  "name": "Simple Projectile",
  "desc": "Explore projectile motion and spherical air resistance.",
  "engine": "canvas2d",
  "uiStandard": "2d-v0.1",
  "scientificEngine": "esbiko-physics",
  "entry": "index.jsx",
  "visibility": "public"
}
```

Extra educational metadata can include difficulty, tags, age/year level, device support, objectives, curriculum links and activity/worksheet content. Existing card/detail components consume these fields. ScienceIcon is the existing fallback when no icon is supplied. A registration does not imply classroom accreditation, verified media capability or scientific validation.

The generated `src/simulations/definitions/generated.js` supplies metadata to `experimentsData` and lazy component loaders to `simulationRegistry`. Existing catalog grouping places items under domain/topic and computes navigation/counts/search. Existing shared routes automatically provide:

- `/experiments`: catalog card under Physics → Mechanics.
- `/experiments/physics.mechanics.simple-projectile`: experiment detail.
- `/experiments/physics.mechanics.simple-projectile/run`: public runtime.

No per-simulation React route or duplicated manual metadata registration is required. Legacy 32 simulations remain registered as before and can migrate individually. `visibility: admin` records are excluded from public output; private preview routes still require explicit AdminRoute registration. The accepted admin 2D/3D references are not public experiments.

## Automation

```sh
npm run gen
npm run sim:register
npm run sim:check
node scripts/test-simulation-registration.cjs
npm run build
```

The existing Plop simulation generator now emits a colocated manifest and generates shared registration rather than independently editing the registry and obsolete `src/data/experiments.js`. Its scaffold defaults scientificEngine to `none`: an author must select the scientific implementation actually used, not automatically claim physics reuse. The registry ID determines categorization. Build and platform catalog generation regenerate definitions before consuming them, and committed generated output supports normal dev startup.

Adding a new domain/topic requires an explicit update to the generator taxonomy and suitable display labels. Existing legacy atypical IDs are not renamed. The generator is deterministic/idempotent for unchanged input and rejects broken entry paths. It does not generate scientific laws or automatically prove them.

## API and MCP boundary

The same new metadata enters the existing Platform catalog and discovery artifacts. Platform metadata includes uiStandard/scientificEngine/registrationSchema. This is discovery, not a new remote session/command service.

Simple Projectile has a declared agent profile using the same parameter schema as its model, browser WebMCP discovery, embedded parameter mapping and the independent mounted-browser SDK. Public and admin routes share one component/model; the admin wrapper retains its private identifier. Browser tools and SDK operate the same live actions. A profile remains a declaration until its specific end-to-end feature is tested. The registration manifest does not manufacture verified capability flags or guarantee a third-party ChatGPT listing.

Future simulations still implement/register their actual agent adapter and verified capabilities separately. The publication generator automates placement/runtime binding, not scientific or external-app acceptance. Existing generation/deployment of backend discovery artifacts is separate from Hosting deployment.

## Acceptance evidence

Registration tests cover taxonomy/ID alignment, renderer mismatch, invalid entry, admin exclusion, duplicate manifests and legacy collisions. Runtime verification reads the real catalog and registry through Vite: Simple Projectile appears exactly once in Physics/Mechanics, its entry exports a component, and admin references remain absent. Existing verification reports 33 registered simulations, 32 declared advanced contracts, and the quarantined Gearbox exception. This count is not proof that every feature is tested.

The public pilot retains Esbiko Physics v0.2, drag, visited-only trajectory, velocity/component arrows, transparent toggleable HUD, camera, responsive canvas-first UI and canvas recording. See [pilot details](ESBIKO_SIMPLE_PROJECTILE_PILOT.md).
