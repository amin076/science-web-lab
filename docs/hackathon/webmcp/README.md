# Esbiko WebMCP Science Lab

Esbiko WebMCP Science Lab extends the existing Esbiko science-education platform so a human and an AI agent can operate the same visible Doppler Effect experiment, hear the physics, and produce a downloadable scientific video.

- Live application: <https://www.esbiko.com>
- Direct Doppler experiment: <https://www.esbiko.com/experiments/physics.acoustics.doppler/run>
- Repository: <https://github.com/amin076/science-web-lab>
- Final submission checklist: [`FINAL_SUBMISSION_CHECKLIST.md`](FINAL_SUBMISSION_CHECKLIST.md)
- Production evidence: [`PRODUCTION_EVIDENCE.md`](PRODUCTION_EVIDENCE.md)

## What WebMCP adds

Without WebMCP, an agent has to infer sliders, labels, coordinates, playback state, and measured results from the DOM. Esbiko now exposes those scientific operations as semantic website tools through `document.modelContext.registerTool(...)`.

The tools operate the same React state and physics engine as the human interface. During an AI-directed recording, the live browser view, recorded WebM motion, and recorded Doppler audio are all tied to the deterministic director timeline, so the user can see and hear the same experiment the agent is capturing.

## 11 tools

| Tool | Purpose |
| --- | --- |
| `list_science_simulations` | Discover WebMCP-enabled Esbiko simulations and capabilities. |
| `open_science_simulation` | Navigate to the selected simulation. |
| `get_doppler_state` | Read live state and physics-derived measurements. |
| `configure_doppler` | Configure one semantic approaching/receding experiment. |
| `configure_doppler_scene` | Configure one or two explicit sound sources. |
| `set_doppler_playback` | Run or pause the visible experiment. |
| `reset_doppler` | Reset to a repeatable scientific baseline. |
| `create_doppler_video` | Start an AI-directed 9:16 WebM recording with verified audio. |
| `get_doppler_video_status` | Read progress, phase, timeline, audio-signal verification, and readiness. |
| `stop_doppler_video` | Stop and finalize an active recording. |
| `download_doppler_video` | Download the finalized WebM. |

## Default director story

`create_doppler_video` defaults to a **30-second `two_vehicle` story**:

- emitted frequency: `440 Hz`
- source speed: `60 m/s`
- observer: stationary at `500 m`
- vehicle 1 default sound: `esbiko_voice`
- vehicle 2 default sound: `ambulance_siren`
- output: `9:16 WebM`

The geometry is calculated from `distance = speed × time`. Each of the four phases lasts `7.5 s`, so each leg is `450 m`:

| Time | Phase | Position |
| --- | --- | --- |
| `0–7.5 s` | Vehicle 1 approaches | `50 → 500 m` |
| `7.5–15 s` | Vehicle 1 recedes | `500 → 950 m` |
| `15–22.5 s` | Vehicle 2 approaches | `950 → 500 m` |
| `22.5–30 s` | Vehicle 2 recedes | `500 → 50 m` |

At `60 m/s` with the Esbiko speed of sound (`343 m/s`), a `440 Hz` source is expected at approximately `533.29 Hz` while approaching and `374.49 Hz` while receding.

## Final production-verified judge/demo payload

For the clearest final demonstration, use two clearly different real sounds:

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

This was verified end-to-end in production after the shared audio/visual director-clock fix. The Real Car Engine passes the observer at `7.5 s`; the Ambulance Siren passes from the opposite direction at `22.5 s`; the higher-to-lower pitch transition is clearly audible around both passes.

Final synchronized runtime commit: `adb0d6a89ebb454f85c151058cc0f84f00a10038`.

Firebase deployment run #121: **PASS**.

## Optional single-pass comparison

For a simple A/B Doppler listening test, use the same sound for one complete pass:

```json
{
  "storyMode": "single_pass",
  "durationSeconds": 10,
  "speedMps": 60,
  "emittedFrequencyHz": 440,
  "firstInstrument": "ambulance_siren"
}
```

This runs the same siren from `200 → 500 → 800 m`, crossing the observer at exactly `5 s`.

## Final judge prompt

> Using Esbiko's site tools, create a 30-second 9:16 two-vehicle Doppler video at 440 Hz and 60 m/s with the observer stationary at 500 m. First show a Real Car Engine crossing left to right, then show an Ambulance Siren crossing right to left. Keep both vehicles visibly moving in the browser and recording, make the higher pitch before each pass and lower pitch after each pass clearly audible, wait until the recording is ready, then download the WebM video.

## Audio and recording safeguards

The director preloads selected real recordings, verifies that the browser audio context is running, confirms that a real audio signal reaches the recording bus, and refuses to start a silent WebM. If browser autoplay policy blocks audio, the tool returns `AUDIO_ACTIVATION_REQUIRED` so the user can click **Run Simulation** once and retry.

The recorder captures a deterministic 1080×1920 canvas plus the Web Audio capture track. The visible browser preview mirrors the same director source used by the recorder. The final PR #101 also drives AI-recorded pitch, volume, and pan from that same deterministic director timeline so recording load cannot make the audible pass drift away from the visual pass.

## Pre-existing versus challenge work

Esbiko, its simulations, Firebase deployment, Doppler physics, and human UI existed before the challenge. The challenge work added the WebMCP registration lifecycle, 11 semantic tools, validated adapters, scene control, video-director workflow, audio capture and signal verification, deterministic timeline/recording, live browser mirroring, audio/visual director synchronization, error handling, automated contract tests, and the hackathon documentation/evidence.

## Browser testing

- ChatGPT Site Tools: intended final agent experience when available to the account/model.
- Chrome 149+ WebMCP testing: enable `chrome://flags/#enable-webmcp-testing` and use the official WebMCP Inspector.
- The Inspector's natural-language **Send** control may require its optional Gemini configuration; manual **Execute Tool** testing does not require Gemini or any external AI API.

## Submission package

- Final Devpost copy + demo narration: [`SUBMISSION.md`](SUBMISSION.md)
- Reproducible judge test: [`TESTING.md`](TESTING.md)
- Compliance matrix: [`COMPLIANCE.md`](COMPLIANCE.md)
- Final production evidence: [`PRODUCTION_EVIDENCE.md`](PRODUCTION_EVIDENCE.md)
- User handoff / final checklist: [`FINAL_SUBMISSION_CHECKLIST.md`](FINAL_SUBMISSION_CHECKLIST.md)

Official references:

- <https://openai.com/webmcp-challenge/>
- <https://webmcp.devpost.com/rules>
- <https://webmcp.devpost.com/resources>
- <https://developer.chrome.com/docs/ai/webmcp>
