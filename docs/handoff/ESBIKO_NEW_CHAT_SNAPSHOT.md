# Esbiko New Chat Handoff Snapshot

Generated: 2026-07-15T01:07:33.078Z

## Project Boundary

Esbiko is the product and platform repository. Keynu is only an external runtime and execution bridge. Esbiko architecture, simulation standards, APIs, catalogs and roadmap belong in this repository.

## Mandatory Reading
- `docs/ADDING_A_SIMULATION.md`
- `docs/SIMULATION_STANDARD.md`
- `docs/PLATFORM_ARCHITECTURE.md`
- `docs/PLATFORM_API.md`
- `docs/PLATFORM_CATALOG.md`
- `docs/PLATFORM_ROADMAP.md`

## Non-Negotiable Rules
- Read Esbiko documentation before changing architecture.
- Simulations are not standalone application pages.
- Do not add simulation-specific imports or routes to src/App.jsx.
- Use the generic routes /experiments/:id and /experiments/:id/run.
- Register simulations through the canonical experiments catalog and platform runtime.
- Generated catalog files must be generated from source, not treated as the primary source.
- Do not modify unrelated files while adding a simulation.
- Run verification and read back modified files before committing.

## Current Simulation

- ID: `evolution-of-life`
- Source: `src/simulations/subjects/biology/evolution/evolution-of-life`
- Catalog entries: 1
- Custom App import present: false
- Custom App route present: false
- Generic details route present: true
- Generic runtime route present: true

## Important Correction

The Evolution simulation was initially added directly to `src/App.jsx`. This violated `docs/ADDING_A_SIMULATION.md`. The custom import and custom routes were removed in commit `d9e7bd2`.

## Relevant Commits
- `9e1d1bb` — feat(biology): add responsive evolution of life simulation
- `57f7917` — fix(biology): connect evolution catalog route to simulation
- `d9e7bd2` — fix(platform): remove forbidden evolution custom routes

## Next Actions
- Read the required Esbiko documents in the new chat before changing code.
- Inspect how the generic SimulationRuntime resolves a catalog entry to its component.
- Confirm that evolution-of-life loads through /experiments/evolution-of-life/run without any App.jsx customization.
- Start the Esbiko development server and visually review desktop and mobile layouts.
- Repair visual or runtime problems only through the standard simulation architecture.
- Decide whether status should remain development or advance after visual verification.
- Remove or ignore temporary .esbiko audit files deliberately; do not commit them accidentally.

## New Chat Instruction

Read this handoff and the required documents before modifying code. Continue only Esbiko work unless Amin explicitly asks for another project.
