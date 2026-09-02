# Devpost Submission Draft — Final Copy

## Project name

**Esbiko WebMCP Science Lab**

## One-line description

Interactive science simulations that humans and AI agents can operate together through semantic WebMCP tools — including a live, audible Doppler experiment that an agent can direct, record, verify, and download as video.

## Short project description

Esbiko is an existing interactive science-learning platform for teachers and students. For the OpenAI WebMCP Challenge, I extended Esbiko so an AI agent can discover, configure, run, inspect, direct, record, and export a real Doppler Effect experiment through structured website tools.

Instead of making a browser agent guess sliders, labels, coordinates, playback state, and measured values from the DOM, Esbiko exposes scientific intent directly through WebMCP. The tools update the same visible React simulation state used by the human interface and return measurements from Esbiko's real Doppler physics functions.

The final experience demonstrates a 30-second, 9:16, two-vehicle Doppler story at 440 Hz and 60 m/s. A Real Car Engine travels left-to-right, then an Ambulance Siren travels right-to-left. Each source passes a stationary observer at the exact time calculated from speed × time. The human sees the experiment running in the browser while the agent records it, hears the clear higher-to-lower pitch change at each pass, waits for verified recording status, and downloads the final WebM.

During AI-directed recording, audio and visual motion are driven from the same deterministic director timeline. This prevents the recorder's heavy canvas/WebM encoding work from making the audible Doppler transition drift away from the vehicle's visual observer crossing.

Before recording, Esbiko also verifies that real audio reaches the recording bus. Selected audio samples are preloaded, the browser AudioContext must be active, and an analyser checks for a measurable RMS signal. Silent recordings are rejected rather than reported as successful.

## Why WebMCP is a strong fit

Scientific simulations contain high-level intent that is difficult for generic browser automation to infer reliably. A user may want to say "show a 440 Hz source approaching at 60 m/s, compare the Doppler shift, record it, and give me the video" — but ordinary browser automation has to translate that intent into fragile DOM clicks and scrape the result back from the page.

WebMCP lets Esbiko expose those scientific actions directly as semantic tools. The agent can use structured parameters, validated state transitions, and physics-derived measurements while the learner still sees and controls the same experiment.

## How WebMCP improves the user experience

The user does not need to manually reproduce every setup step, guess numeric slider positions, track recording progress, or determine whether the captured file contains real audio. The agent can perform those operations through semantic tools while the user watches the experiment happen in the visible page.

This creates a collaborative workflow: the person provides the scientific goal and judges what they see/hear; the agent performs the repeatable configuration, measurement, recording, status-checking, and export steps.

## What people and agents can do together now

A person and agent can now work on the same live scientific instrument. The agent can:

- discover the WebMCP-enabled science simulation;
- navigate to the Doppler experiment;
- read the current scientific state;
- configure an approaching/receding source;
- configure one or two explicit sound sources;
- run/pause/reset the visible experiment;
- calculate/return the observed Doppler frequency from Esbiko's physics code;
- start a deterministic 9:16 scientific recording;
- verify that real audio reaches the recording bus;
- keep audio and recorded motion synchronized to the same director timeline;
- monitor recording progress and readiness;
- download the finalized WebM.

The human remains in the loop because all of this happens in the same visible simulation rather than in an invisible backend job.

## How WebMCP was implemented

Esbiko uses the WebMCP imperative API through `document.modelContext.registerTool(...)`. Two site-level tools provide discovery/navigation and nine Doppler-page tools provide scientific state, validated configuration, scene control, playback, reset, recording, recording status, stop/finalize, and download.

The tools call validated domain adapters that update the same React runtime state used by the human UI. Doppler frequency values come from application physics functions, not an LLM. Web Audio supplies the live/recorded sound; MediaRecorder captures a deterministic 1080×1920 canvas plus the Web Audio track; the AI Director calculates exact speed×time geometry and drives both recorded visuals and recorded audio from a shared deterministic timeline.

## 11 WebMCP tools

**Site tools**

- `list_science_simulations`
- `open_science_simulation`

**Doppler tools**

- `get_doppler_state`
- `configure_doppler`
- `configure_doppler_scene`
- `set_doppler_playback`
- `reset_doppler`
- `create_doppler_video`
- `get_doppler_video_status`
- `stop_doppler_video`
- `download_doppler_video`

## Final production-verified judge/demo story

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

The observer is stationary at `500 m`. Each phase lasts `7.5 s`, so each source travels `450 m` per phase:

- `0–7.5 s`: Real Car Engine approaches, `50 → 500 m`.
- `7.5–15 s`: Real Car Engine recedes, `500 → 950 m`.
- `15–22.5 s`: Ambulance Siren approaches, `950 → 500 m`.
- `22.5–30 s`: Ambulance Siren recedes, `500 → 50 m`.

At `60 m/s` with speed of sound `343 m/s`, a 440 Hz source is approximately **533.29 Hz while approaching** and **374.49 Hz while receding**.

The application default is also a 30-second `two_vehicle` story; the final demo uses `car_engine` + `ambulance_siren` explicitly because this pair produced the clearest audible before/after comparison in production testing.

## Optional single-pass comparison

Esbiko also supports a simple 10-second A/B listening test using the same continuous siren:

```json
{
  "storyMode": "single_pass",
  "durationSeconds": 10,
  "speedMps": 60,
  "emittedFrequencyHz": 440,
  "firstInstrument": "ambulance_siren"
}
```

The source travels `200 → 500 → 800 m` and crosses the observer at exactly `5 s`.

## What existed before the challenge vs what is new

**Pre-existing:** Esbiko web application, simulation catalog, human simulation UI, Doppler scientific model, Firebase deployment, dashboards, Platform API foundations, and media assets.

**Added during the WebMCP Challenge:**

- WebMCP registration lifecycle and safe feature detection;
- 11 semantic website tools;
- JSON-safe Doppler adapters and validation;
- shared human/agent runtime state;
- explicit one/two-source scene configuration;
- AI video director with exact speed×time timelines;
- `two_vehicle` and `single_pass` story modes;
- deterministic 1080×1920 WebM recording;
- real Web Audio capture and sample preloading;
- audio-signal verification and silent-file rejection;
- browser autoplay recovery errors;
- live browser mirroring of AI-directed recording motion;
- real-time recording-load clock correction;
- shared deterministic audio/visual director clock for AI recording;
- structured recording status and download operations;
- automated WebMCP contract/physics tests;
- challenge documentation and production evidence.

## Links

- Live app: <https://www.esbiko.com>
- Direct demo: <https://www.esbiko.com/experiments/physics.acoustics.doppler/run>
- Public repository: <https://github.com/amin076/science-web-lab>
- Open-source license: MIT (`LICENSE` in repository root)
- Demo video: **PENDING FINAL YOUTUBE UPLOAD**

## Judge testing instructions

No sign-in is required.

Recommended prompt:

> Using Esbiko's site tools, create a 30-second 9:16 two-vehicle Doppler video at 440 Hz and 60 m/s with the observer stationary at 500 m. First show a Real Car Engine crossing left to right, then show an Ambulance Siren crossing right to left. Keep both vehicles visibly moving in the browser and recording, make the higher pitch before each pass and lower pitch after each pass clearly audible, wait until the recording is ready, then download the WebM video.

For Chrome Inspector manual testing, execute `create_doppler_video` with the final payload above. Then call `get_doppler_video_status` until `state` is `ready`, confirm `audioIncluded: true` and `audioSignalDetected: true`, and execute `download_doppler_video`.

If browser audio is initially locked, click Esbiko's **Run Simulation** button once, pause, and retry the video tool.

## Demo video script — target 2:30

### 0:00–0:18 — Problem

**Screen:** Open the live Doppler simulation and briefly show the human controls.

**Narration:**

"Interactive science simulations are built for people. A browser agent normally has to guess which sliders to move, which values to read, and whether the experiment actually worked."

### 0:18–0:38 — WebMCP discovery

**Screen:** Show the WebMCP-ready badge and all 11 discovered tools in the Inspector/Site Tools UI.

**Narration:**

"For the OpenAI WebMCP Challenge, I made Esbiko agent-operable. The site exposes semantic science tools directly, while the human still sees and controls the same experiment."

### 0:38–0:55 — Start the directed experiment

**Screen:** Select `create_doppler_video` and show the final 30-second JSON with Real Car Engine + Ambulance Siren. Execute it.

**Narration:**

"Here the agent creates a thirty-second Doppler experiment at four hundred forty hertz and sixty meters per second, with the observer fixed in the middle."

### 0:55–1:32 — First pass and second approach

**Screen:** Let the browser visibly run. Make sure the first vehicle crosses around 7.5 s and the pitch drop is audible. Continue until the ambulance is clearly approaching from the opposite side.

**Narration:**

"The vehicle motion, displayed measurements, and audio come from Esbiko's real simulation. As the source approaches, the observed pitch is higher. At the observer pass, the pitch drops."

### 1:32–1:48 — Second pass

**Screen:** Show the ambulance crossing around 22.5 s and let the pitch drop be heard clearly.

**Narration:**

"The second source approaches from the opposite direction and the same higher-to-lower Doppler transition happens at the observer."

### 1:48–2:05 — Status and verified audio

**Screen:** Execute `get_doppler_video_status`. Show `ready`, timeline/phase duration, `audioIncluded: true`, and `audioSignalDetected: true`.

**Narration:**

"The agent can inspect structured recording status. Esbiko even verifies a real audio signal before it accepts the recording."

### 2:05–2:20 — Download and result

**Screen:** Execute `download_doppler_video`, then play a short section of the downloaded 9:16 WebM with audio.

**Narration:**

"Then the agent downloads the final WebM. The browser preview, recorded motion, and recorded Doppler audio share the same deterministic director timeline."

### 2:20–2:32 — Why it matters

**Screen:** Return to the live simulation / tool list.

**Narration:**

"The agent is not clicking guessed DOM controls or inventing physics. WebMCP connects directly to Esbiko's validated state, Doppler equations, audio engine, and recorder."

### 2:32–2:38 — Close

**Narration:**

"Esbiko — science experiments that people and agents can operate together."

## Recording rules

- Keep final YouTube video below `3:00`; target ~`2:30–2:40`.
- Use clear spoken narration and keep the Doppler simulation audio audible.
- Do not use background music.
- Show the public deployment, not localhost.
- Make the 11 tools, final input, live browser movement, pitch change, structured status, and downloaded result legible.
- Do not claim WebMCP coverage for simulations other than the verified Doppler implementation.
- Avoid showing private notifications, API keys, account details, or unrelated browser tabs.

## Final runtime evidence

- Audio/video synchronization runtime commit: `adb0d6a89ebb454f85c151058cc0f84f00a10038`
- Firebase deployment run #121: **PASS**
- Final 30-second two-vehicle production smoke: **PASS**
- Remaining user task: record/upload the public YouTube demo and submit the Devpost form.
