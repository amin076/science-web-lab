# Esbiko WebMCP Science Lab

Esbiko WebMCP Science Lab extends the existing Esbiko science-education platform so people and AI agents can operate the same interactive Doppler Effect experiment together.

Live application: <https://www.esbiko.com>

Direct Doppler experiment: <https://www.esbiko.com/experiments/physics.acoustics.doppler/run>

Repository: <https://github.com/amin076/science-web-lab>

## Why WebMCP

Without WebMCP, a browser agent must identify sliders, infer scientific meanings, approximate values, click visual controls, and scrape results from the page. Esbiko now exposes the scientific intent directly: configure an approaching source at a given speed, run the experiment, and read the actual calculated frequency shift.

The visible simulation remains fully usable by a person. Agent actions update the same runtime state, and later human changes are reflected when the agent reads the experiment again.

## Tools

| Tool | Scope | Mutation | Purpose |
| --- | --- | --- | --- |
| `list_science_simulations` | Site | No | Discover WebMCP-enabled simulations and capabilities. |
| `open_science_simulation` | Site | Navigation | Open the selected simulation in Esbiko. |
| `get_doppler_state` | Doppler page | No | Read live parameters and physics-derived measurements. |
| `configure_doppler` | Doppler page | Yes | Configure one semantic source/observer experiment. |
| `set_doppler_playback` | Doppler page | Yes | Run or pause the visible simulation. |
| `reset_doppler` | Doppler page | Yes | Return to a repeatable empty baseline. |

## Suggested judge workflow

Open the live site in ChatGPT's in-app browser or Chrome 149+ with `chrome://flags/#enable-webmcp-testing` enabled.

Try:

> Open the Doppler simulation. Configure a 440 Hz source approaching a stationary observer at 20 m/s, run it, and explain the measured frequency shift.

Then:

> Pause it. Make the same source recede at the same speed and compare the observed frequency with the first setup.

Expected behaviour:

1. Esbiko opens the Doppler page.
2. The visible source and observer are configured.
3. The simulation runs and the wavefronts move.
4. `get_doppler_state` returns the same visible state plus calculated measurements.
5. The second configuration reverses the relative motion and changes the frequency shift from positive to negative.

## Pre-existing versus hackathon work

Esbiko is a pre-existing project, which the official challenge rules permit when it is meaningfully extended with WebMCP after the submission period begins.

### Pre-existing before August 25, 2026

- Esbiko application, simulations, dashboards, routing, Firebase deployment, and public domain.
- Doppler simulation and physics implementation. Its last feature commit before the challenge was `4c58b53` on June 15, 2026.
- Platform catalog and capability foundations, including `771a21a` on July 14, 2026.
- Pre-challenge `main` baseline `000041e` on August 6, 2026.

### Added during the challenge

- Imperative WebMCP registration lifecycle and safe feature detection.
- Site-level simulation discovery and navigation tools.
- A JSON-safe Doppler adapter for validated state reads and commands.
- Four Doppler-specific semantic tools.
- Shared human/agent state with visible agent-action feedback.
- Verified `stateRead`, `commandExecution`, and `agentReady` capability metadata.
- Automated WebMCP contract, physics, validation, registration, and output-budget tests.
- Hackathon-specific architecture, compliance, testing, and submission documentation.

The timestamped commit history on the WebMCP feature branch and final merge records the new work.

## Current browser constraints

The integration uses only the Imperative API. This is deliberate because ChatGPT's in-app browser currently does not expose declarative form tools or tools registered inside iframes. Esbiko registers directly on the top-level document and gracefully preserves the normal human UI when WebMCP is unavailable.

Official references:

- <https://openai.com/webmcp-challenge/>
- <https://webmcp.devpost.com/rules>
- <https://webmcp.devpost.com/resources>
- <https://learn.chatgpt.com/docs/webmcp>
- <https://developer.chrome.com/docs/ai/webmcp/imperative-api>
- <https://developer.chrome.com/docs/ai/webmcp/secure-tools>
