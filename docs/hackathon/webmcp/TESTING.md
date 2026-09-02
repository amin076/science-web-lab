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
- semantic motion maps to the correct signed velocity;
- parameter bounds reject unsafe input;
- all 11 intended tools register with correct read/write hints;
- tool outputs use parseable JSON success/error envelopes;
- site discovery/navigation use the allowlisted Doppler route;
- site discovery advertises video-director/download capability;
- registration receives the lifecycle `AbortSignal`;
- tool names/descriptions stay inside WebMCP budgets;
- the default director is `two_vehicle`, 30 s, 440 Hz, 60 m/s, Esbiko Voice + Ambulance Siren;
- the default 30-second timeline is exactly `50 → 500 → 950` then `950 → 500 → 50`;
- each default quarter lasts 7.5 s and each leg is 450 m;
- the optional 10-second `single_pass` story crosses the observer at exactly 5 s;
- the same single-pass sample is above 440 Hz immediately before the pass and below 440 Hz immediately after it;
- deterministic recording frames preserve source motion and wavefronts before and after passing.

## Final production Chrome test

Use Chrome 149+ with `chrome://flags/#enable-webmcp-testing` enabled and the official WebMCP Inspector.

1. Open <https://www.esbiko.com/experiments/physics.acoustics.doppler/run>.
2. Hard refresh (`Ctrl+Shift+R`).
3. Confirm the page reports `11 tools available`.
4. Confirm `document.modelContext.getTools()` returns 11 names.
5. If browser audio is locked, click **Run Simulation** once, pause, and continue.
6. Execute `create_doppler_video` with the final default payload:

```json
{
  "storyMode": "two_vehicle",
  "durationSeconds": 30,
  "speedMps": 60,
  "emittedFrequencyHz": 440,
  "firstInstrument": "esbiko_voice",
  "secondInstrument": "ambulance_siren"
}
```

7. Watch the live browser during recording. It must show the same directed movement as the generated WebM.
8. Confirm four visible phases:
   - `0–7.5 s`: Esbiko Voice `50 → 500 m`;
   - `7.5–15 s`: Esbiko Voice `500 → 950 m`;
   - `15–22.5 s`: Ambulance `950 → 500 m`;
   - `22.5–30 s`: Ambulance `500 → 50 m`.
9. Call `get_doppler_video_status`. Confirm `phaseDurationSeconds: 7.5`, the expected timeline, `audioIncluded: true`, and `audioSignalDetected: true`.
10. After `state: ready`, execute `download_doppler_video`.
11. Play the WebM and verify motion, captions, wavefronts, both sounds, and pitch change around 7.5 s and 22.5 s.

The Chrome Inspector's natural-language **Send** field may require its optional Gemini configuration. That is not required for Esbiko testing: manual **Execute Tool** calls invoke WebMCP directly and use no Gemini API.

## Optional single-pass audio check

Use this when a particularly obvious before/after pitch comparison is needed:

```json
{
  "storyMode": "single_pass",
  "durationSeconds": 10,
  "speedMps": 60,
  "emittedFrequencyHz": 440,
  "firstInstrument": "ambulance_siren"
}
```

Expected geometry: `200 → 500 → 800 m`; expected pass time: exactly `5 s`.

## ChatGPT Site Tools test

When Site Tools are available in the ChatGPT in-app browser:

1. Open Esbiko and inspect available site tools.
2. Ask ChatGPT to open the Doppler simulation.
3. Confirm all page tools appear after navigation.
4. Use the final judge prompt from `SUBMISSION.md`.
5. Confirm the browser visibly runs the experiment while recording.
6. Confirm ChatGPT waits for ready status before requesting download.

## Required final evidence

Capture:

- live public URL and WebMCP-ready badge;
- all 11 discovered tools;
- final default two-vehicle input;
- live browser motion during AI recording;
- status with timeline and verified audio signal;
- downloaded 30-second WebM;
- optional 10-second single-pass sample if used in the demo;
- final public commit SHA and successful Firebase deployment workflow;
- demo video URL after upload.

Do not mark the 30-second final production smoke test PASS until the live deployed file has been watched and listened to end-to-end.
