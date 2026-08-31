# WebMCP Testing

## Automated checks

Install locked dependencies and run:

```bash
npm ci
npm run test:webmcp
npm run test:platform-api
npm run build
```

`test:webmcp` verifies:

- approaching motion produces a higher observed frequency;
- receding motion produces a lower observed frequency;
- semantic motion maps to correct signed velocity;
- parameter bounds reject unsafe input;
- all six intended tools exist;
- read/write annotation hints are correct;
- results use parseable JSON success/error envelopes;
- site discovery and navigation use the allowlisted simulation route;
- registration receives the lifecycle `AbortSignal`;
- tool names, descriptions, and representative output stay inside recommended budgets;
- unsupported browsers fail open to the existing human application.

The Platform API test verifies that the regenerated catalog remains valid. The production build verifies the complete Vite/PWA application.

## ChatGPT in-app browser test

Use the latest desktop app with GPT-5.6 Sol or GPT-5.6 Terra.

1. Open <https://www.esbiko.com> in the in-app browser.
2. Inspect Available site tools.
3. Confirm `list_science_simulations` and `open_science_simulation` appear.
4. Ask the agent to open the Doppler experiment.
5. Confirm the four Doppler tools appear after the page loads.
6. Configure a 440 Hz source approaching at 20 m/s.
7. Confirm the visible source, controls, and Last agent action change.
8. Run, then read state.
9. Confirm returned measurements match the visible HUD.
10. Change a slider manually and read state again; confirm the human change is returned.
11. Reconfigure as receding and confirm a negative shift.
12. Reset and confirm no sources, stationary observer, and paused state.

## Chrome test

1. Use Chrome 149 or later.
2. Enable `chrome://flags/#enable-webmcp-testing` and relaunch Chrome.
3. Open the direct Doppler URL.
4. Inspect `await document.modelContext.getTools()` in the WebMCP test environment.
5. Execute every tool with valid input.
6. Test missing, malformed, and out-of-range input.
7. Verify that navigating away removes the Doppler page tools.

## Required production evidence

Capture evidence of:

- live public URL and WebMCP-ready badge;
- two site tools discovered;
- four Doppler tools discovered;
- approaching configuration and positive shift;
- structured state output;
- manual human adjustment reflected in state;
- receding configuration and negative shift;
- reset result;
- clean console for WebMCP registration/execution;
- final public commit SHA and successful deployment workflow.

## Known pre-existing check issue

`npm run sim:check` currently targets the removed legacy path `src/data/experiments.js`; the current catalog lives under `src/data/experiments/index.js`. This issue predates the WebMCP work and is not used as evidence for this submission.
