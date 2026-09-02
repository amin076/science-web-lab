# Esbiko WebMCP Science Lab

Esbiko WebMCP Science Lab extends the existing Esbiko science-education platform so a human and an AI agent can operate the same visible Doppler Effect experiment, hear the physics, and produce a downloadable scientific video.

- Live application: <https://www.esbiko.com>
- Direct Doppler experiment: <https://www.esbiko.com/experiments/physics.acoustics.doppler/run>
- Repository: <https://github.com/amin076/science-web-lab>
- Production evidence: [`PRODUCTION_EVIDENCE.md`](PRODUCTION_EVIDENCE.md)

## What WebMCP adds

Without WebMCP, an agent has to infer sliders, labels, coordinates, playback state, and measured results from the DOM. Esbiko now exposes those scientific operations as semantic website tools through `document.modelContext.registerTool(...)`.

The tools operate the same React state and physics engine as the human interface. During an AI-directed recording, the live browser view and the recorded WebM are driven by the same deterministic director timeline, so the user can see the experiment while the agent is recording it.

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

## Final default director story

`create_doppler_video` now defaults to a **30-second `two_vehicle` story**:

- emitted frequency: `440 Hz`
- source speed: `60 m/s`
- observer: stationary at `500 m`
- vehicle 1 sound: `esbiko_voice`
- vehicle 2 sound: `ambulance_siren`
- output: `9:16 WebM`

The geometry is calculated from `distance = speed × time`. Each of the four phases lasts `7.5 s`, so each leg is `450 m`:

| Time | Phase | Position |
| --- | --- | --- |
| `0–7.5 s` | Esbiko Voice approaches | `50 → 500 m` |
| `7.5–15 s` | Esbiko Voice recedes | `500 → 950 m` |
| `15–22.5 s` | Ambulance approaches | `950 → 500 m` |
| `22.5–30 s` | Ambulance recedes | `500 → 50 m` |

At `60 m/s` with the Esbiko speed of sound (`343 m/s`), a `440 Hz` source is expected at approximately `533.29 Hz` while approaching and `374.49 Hz` while receding.

## Optional single-pass comparison

For the clearest A/B Doppler listening test, use the same sound for one complete pass:

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

> Using Esbiko's site tools, create the default 30-second 9:16 two-vehicle Doppler video at 440 Hz and 60 m/s with the observer stationary at 500 m. First show Esbiko Voice crossing left to right, then show an Ambulance Siren crossing right to left. Keep both vehicles visibly moving in the browser and recording, show the higher pitch before each pass and lower pitch after each pass, wait until the recording is ready, then download the WebM video.

## Audio and recording safeguards

The director preloads selected real recordings, verifies that the browser audio context is running, confirms that a real audio signal reaches the recording bus, and refuses to start a silent WebM. If browser autoplay policy blocks audio, the tool returns `AUDIO_ACTIVATION_REQUIRED` so the user can click **Run Simulation** once and retry.

The recorder captures a deterministic 1080×1920 canvas plus the Web Audio capture track. The visible browser preview mirrors the same director source and timeline used by the recorder.

## Pre-existing versus challenge work

Esbiko, its simulations, Firebase deployment, Doppler physics, and human UI existed before the challenge. The challenge work added the WebMCP registration lifecycle, 11 semantic tools, validated adapters, scene control, video-director workflow, audio capture and signal verification, deterministic timeline/recording, live browser mirroring, error handling, automated contract tests, and the hackathon documentation/evidence.

## Browser testing

- ChatGPT Site Tools: intended final agent experience when available to the account/model.
- Chrome 149+ WebMCP testing: enable `chrome://flags/#enable-webmcp-testing` and use the official WebMCP Inspector.
- The Inspector's natural-language **Send** control may require its optional Gemini configuration; manual **Execute Tool** testing does not require Gemini or any external AI API.

Official references:

- <https://openai.com/webmcp-challenge/>
- <https://webmcp.devpost.com/rules>
- <https://webmcp.devpost.com/resources>
- <https://developer.chrome.com/docs/ai/webmcp>
