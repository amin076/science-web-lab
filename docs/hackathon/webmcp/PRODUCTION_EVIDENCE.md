# WebMCP Production Evidence

Last evidence refresh: September 2, 2026 AEST.

## Final production baseline

- Public repository: <https://github.com/amin076/science-web-lab>
- Public demo: <https://www.esbiko.com/experiments/physics.acoustics.doppler/run>
- Final audio/video synchronization runtime commit: `adb0d6a89ebb454f85c151058cc0f84f00a10038`
- Pull request: `#101` — **Synchronize 30-second AI Doppler audio with video motion**
- Firebase deployment run #121: <https://github.com/amin076/science-web-lab/actions/runs/33619254268> — **PASS**

## Verified production behavior

The production Chrome WebMCP Inspector has discovered **11 tools** on Esbiko: two site tools plus nine Doppler-page tools.

Verified behaviors during challenge testing include:

| Check | Result | Evidence / behavior |
| --- | --- | --- |
| WebMCP page readiness | PASS | Live Doppler page reports `11 tools available`. |
| Tool discovery | PASS | Two site tools + nine page tools discovered. |
| Semantic input validation | PASS | Invalid and premature actions return structured error codes rather than silent failure. |
| Basic state/configure/playback/reset | PASS | 440 Hz approaching/receding workflows update the visible simulation and return physics-derived values. |
| Two-source scene support | PASS | `configure_doppler_scene` supports one or two explicit sources. |
| Video creation | PASS | `create_doppler_video` creates a 9:16 WebM through the in-app recorder. |
| Video status | PASS | Status reports progress, phase, timeline, audio inclusion/signal verification, file readiness, and errors. |
| Video download | PASS | Ready WebM files can be downloaded through `download_doppler_video`. |
| Real audio capture | PASS | Web Audio is routed to both speakers and MediaStream recording destination. |
| Silent-file rejection | PASS | Director verifies analyser RMS before recording and reports `AUDIO_SIGNAL_MISSING` when no real signal reaches the bus. |
| Browser audio policy handling | PASS | Locked audio returns `AUDIO_ACTIVATION_REQUIRED` with an explicit user-action recovery path. |
| Sample preloading | PASS | Selected real recordings are decoded/preloaded before the recorded timeline starts. |
| Preflight timeline reset | PASS | Audio preflight is paused and scene reset to exact t=0 before MediaRecorder begins. |
| Continuous directed motion in WebM | PASS | Deterministic frame-source logic keeps vehicle movement independent of React paint timing. |
| Single-pass story | PASS | A 10-second one-siren video showed visible motion and a clear audible higher-to-lower pitch change across the observer pass at 5 s. |
| Live browser director motion | PASS | PR #98 mirrors deterministic director motion into the browser while recording. |
| AI audio follows visual director clock | PASS | PR #101 derives audible source state from the same deterministic director timeline used by the recorded/live visuals. |
| Final 30-second two-vehicle story | PASS | Real Car Engine + Ambulance Siren at 60 m/s were watched/listened to end-to-end; the pitch change was very clear before/after both observer passes. |
| Latest deployment | PASS | Firebase run #121 completed successfully for runtime commit `adb0d6a...`. |

## Important challenge fixes

The final Doppler implementation includes the following challenge iterations:

- continuous deterministic recorded motion;
- Web Audio capture and compressor/mix improvements;
- sample preloading and real-signal verification;
- audible-distance gain fix for recorded samples;
- real `esbiko_voice.wav` instrument support;
- exact speed×time four-phase geometry;
- audio preflight reset to recording t=0;
- optional `single_pass` story mode;
- live browser canvas mirroring of the same director source used by the recorder;
- real-time physics/audio clock correction under WebM encoding load (PR #100);
- final shared deterministic director clock for AI-recorded audio and visual motion (PR #101).

## Final production smoke payload

The clearest final judge/demo payload verified in production is:

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

Expected exact timeline:

| Time | Source | Motion | Position |
| --- | --- | --- | --- |
| `0–7.5 s` | Real Car Engine | approaching | `50 → 500 m` |
| `7.5–15 s` | Real Car Engine | receding | `500 → 950 m` |
| `15–22.5 s` | Ambulance Siren | approaching | `950 → 500 m` |
| `22.5–30 s` | Ambulance Siren | receding | `500 → 50 m` |

The observer is stationary at `500 m`. At `60 m/s` and speed of sound `343 m/s`, a 440 Hz emitted source corresponds to approximately `533.29 Hz` while approaching and `374.49 Hz` while receding.

## Final acceptance result

The final production smoke has passed the key end-to-end acceptance criteria:

1. public Doppler page loads and exposes WebMCP tools;
2. directed browser motion is visible during recording;
3. the first source reaches/passes the observer on the planned timeline;
4. the second source approaches from the opposite direction and passes on the planned timeline;
5. both real sounds are audible;
6. higher/lower pitch behavior is clearly audible around the two pass moments (`7.5 s`, `22.5 s`);
7. AI-recorded audio follows the same deterministic director timeline as the video motion;
8. the WebM is finalized and downloadable;
9. the final synchronized runtime deploy completed successfully.

## Remaining submission evidence

Only submission-media evidence remains to be added by the entrant:

- final public YouTube demo URL (<3 minutes, with narration/audio);
- optional final screenshots/gallery images;
- final Devpost submission URL after submission.

See [`FINAL_SUBMISSION_CHECKLIST.md`](FINAL_SUBMISSION_CHECKLIST.md) for the user handoff.

## Automated verification commands

The repository provides these final checks:

```bash
npm ci
npm run test:webmcp
npm run test:platform-api
npm run build
```

The Firebase deployment workflow also runs the production build before deployment. The final synchronized runtime deployment (#121) completed successfully.
