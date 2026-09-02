# WebMCP Production Evidence

Last evidence refresh: September 2, 2026 AEST.

## Current public baseline before final 30-second default deploy

- Public repository: <https://github.com/amin076/science-web-lab>
- Public demo: <https://www.esbiko.com/experiments/physics.acoustics.doppler/run>
- Current deployed director/browser-sync commit before this final defaults branch: `2930967b8dd1d57c30fb807368def1dd88cae173`
- Firebase deployment run #116: <https://github.com/amin076/science-web-lab/actions/runs/33592748245> — **PASS**

## Verified production behavior

The production Chrome WebMCP Inspector has discovered **11 tools** on Esbiko: two site tools plus nine Doppler-page tools.

Verified behaviors during challenge testing include:

| Check | Result | Evidence / behavior |
| --- | --- | --- |
| WebMCP page readiness | PASS | Live Doppler page reports `11 tools available`. |
| Tool discovery | PASS | Two site tools + nine page tools discovered. |
| Semantic input validation | PASS | Invalid and premature actions return structured error codes rather than silent failure. |
| Basic state/configure/playback/reset | PASS | Existing 440 Hz approaching/receding workflows update the visible simulation and return physics-derived values. |
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
| Single-pass story | PASS | User confirmed a 10-second one-siren video with visible motion and audible voice/pitch change across the observer pass. |
| Live browser director motion | PASS | PR #98 mirrors deterministic director motion into the browser canvas; run #116 deployed it successfully. |

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
- live browser canvas mirroring of the same director source used by the recorder.

## Final default awaiting production smoke

This final branch changes the default director story to:

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

Expected exact timeline:

| Time | Source | Motion | Position |
| --- | --- | --- | --- |
| `0–7.5 s` | Esbiko Voice | approaching | `50 → 500 m` |
| `7.5–15 s` | Esbiko Voice | receding | `500 → 950 m` |
| `15–22.5 s` | Ambulance Siren | approaching | `950 → 500 m` |
| `22.5–30 s` | Ambulance Siren | receding | `500 → 50 m` |

The final production smoke test must confirm the deployed default end-to-end before this section is marked PASS.

## Final smoke-test acceptance criteria

After the final branch is merged and Firebase deployment succeeds:

1. Hard-refresh the public Doppler page.
2. Confirm 11 tools are still discovered.
3. Run the final 30-second payload.
4. Confirm browser motion follows all four phases and pass times.
5. Confirm both real sounds are audible.
6. Confirm higher/lower pitch behavior around each pass.
7. Confirm `audioIncluded: true` and `audioSignalDetected: true`.
8. Confirm status reaches `ready` and exposes the 7.5-second phase duration and expected timeline.
9. Download and play the full WebM.
10. Record final commit SHA, Firebase run, file size, and demo-video evidence here.

## Earlier automated verification

Previous challenge iterations passed the repository WebMCP contract tests, Platform API tests, targeted linting, `git diff --check`, and Vite production builds. The current final defaults update also expands `scripts/test-webmcp.mjs` with explicit assertions for the 30-second default geometry, instruments, prompt, and advertised video capabilities; run these checks again before final submission.
