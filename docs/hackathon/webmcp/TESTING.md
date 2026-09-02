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
- the default director is `two_vehicle`, 30 s, 440 Hz, 60 m/s;
- the default 30-second timeline is exactly `50 → 500 → 950` then `950 → 500 → 50`;
- each default quarter lasts 7.5 s and each leg is 450 m;
- the optional 10-second `single_pass` story crosses the observer at exactly 5 s;
- the same single-pass sample is above 440 Hz immediately before the pass and below 440 Hz immediately after it;
- deterministic recording frames preserve source motion and wavefronts before and after passing.

## Final production Chrome test — PASSED

Use Chrome 149+ with `chrome://flags/#enable-webmcp-testing` enabled and the official WebMCP Inspector.

The final production smoke used:

```json
{
  "storyMode": "two_vehicle",
  "durationSeconds": 30,
  "speedMps": 60,
  "emittedFrequencyHz": 440,
  "firstInstrument": "car_engine",
  "secondInstrument": "ambulance_siren"
}
```

Expected timeline:

- `0–7.5 s`: Real Car Engine `50 → 500 m`, approaching;
- `7.5–15 s`: Real Car Engine `500 → 950 m`, receding;
- `15–22.5 s`: Ambulance Siren `950 → 500 m`, approaching;
- `22.5–30 s`: Ambulance Siren `500 → 50 m`, receding.

Expected observer passes: `7.5 s` and `22.5 s`.

Final production validation confirmed that the motion was visible, both real sounds were audible, and the before/after pitch transition was very clear in the AI-produced WebM. The final synchronization fix drives AI-recorded audio from the same deterministic director timeline as the recorded/live visual motion.

## Reproduce the final judge test

1. Open <https://www.esbiko.com/experiments/physics.acoustics.doppler/run>.
2. Hard refresh (`Ctrl+Shift+R`).
3. Confirm the page reports `11 tools available`.
4. Confirm `document.modelContext.getTools()` returns 11 names if using the console discovery check.
5. If browser audio is locked, click **Run Simulation** once, pause, and continue.
6. Execute `create_doppler_video` with the final payload above.
7. Watch the live browser during recording. It should show the same directed movement as the generated WebM.
8. Listen specifically around `7.5 s` and `22.5 s`: the higher approaching pitch should switch clearly to the lower receding pitch when each vehicle passes the observer.
9. Call `get_doppler_video_status`. Confirm `phaseDurationSeconds: 7.5`, the expected timeline, `audioIncluded: true`, and `audioSignalDetected: true`.
10. After `state: ready`, execute `download_doppler_video`.
11. Play the WebM and verify motion, captions, wavefronts, both sounds, and the two synchronized pitch changes.

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

## Final evidence state

Already verified:

- public live Doppler URL;
- 11 discovered WebMCP tools;
- live browser motion during AI recording;
- 30-second two-vehicle geometry;
- clear recorded Doppler pitch change around both pass times;
- audio/video synchronization using the director timeline;
- final runtime commit `adb0d6a89ebb454f85c151058cc0f84f00a10038`;
- successful Firebase deployment run #121.

Still required from the entrant before Devpost submission:

- record the final <3-minute demo with narration;
- upload it publicly to YouTube;
- optionally capture clean gallery screenshots;
- add the final YouTube URL and submit the Devpost project.

See [`FINAL_SUBMISSION_CHECKLIST.md`](FINAL_SUBMISSION_CHECKLIST.md).
