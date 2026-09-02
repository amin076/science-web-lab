# Devpost Submission Draft

## Project name

Esbiko WebMCP Science Lab

## One-line description

Interactive science simulations that humans and AI agents can operate together through semantic WebMCP tools — including a live, audible Doppler experiment that the agent can direct, record, and download as video.

## Project description

Esbiko is an existing interactive science-learning platform with browser-based simulations for teachers and students. For the OpenAI WebMCP Challenge, Esbiko was extended so an AI agent can discover, configure, run, inspect, direct, record, and export a real Doppler Effect experiment through structured website tools.

Scientific simulation interfaces are difficult for general browser agents. A visual agent normally has to find sliders, infer what each control means, approximate numeric values, determine whether the experiment is running, and scrape measurements from the page. Those steps are fragile and hide the user's scientific intent.

Esbiko now exposes that intent directly. WebMCP tools connect to the same React state and physics functions used by the visible human interface. An agent can configure a source, run the experiment, read Esbiko's calculated frequency shift, configure a two-source scene, or start an AI-directed video. During recording, the browser view and the WebM use the same deterministic timeline, so the user watches the same experiment the agent is capturing.

The final default story is a 30-second, 9:16, two-vehicle Doppler demonstration at 440 Hz and 60 m/s. The first vehicle uses Esbiko Voice and travels left-to-right. The second uses an Ambulance Siren and travels right-to-left. Each vehicle reaches the stationary observer exactly at its planned pass time, then continues to the opposite side. The agent can wait for the recording to become ready and download the WebM.

The recording pipeline also verifies real audio before recording. Selected audio samples are preloaded, the browser AudioContext must be running, and an analyser confirms that a non-silent signal reaches the recording bus. Silent files are rejected rather than reported as successful.

Esbiko also provides a 10-second `single_pass` mode for a particularly clear A/B listening comparison: one Ambulance Siren approaches for five seconds, crosses the observer at exactly 5 s, and recedes for five seconds using the same continuous sample.

WebMCP is a progressive enhancement. The normal Esbiko interface continues to work in unsupported browsers; supported browsers gain precise semantic tools instead of DOM-click automation.

## 11 WebMCP tools

Two site-level tools provide discovery and navigation. Nine Doppler-page tools provide state reads, semantic configuration, explicit scene configuration, playback, reset, video creation, video status, stop/finalize, and download.

## Final default geometry

At 30 seconds and 60 m/s, each quarter is 7.5 seconds and each leg is 450 metres:

- 0–7.5 s: Esbiko Voice, `50 → 500 m`, approaching.
- 7.5–15 s: Esbiko Voice, `500 → 950 m`, receding.
- 15–22.5 s: Ambulance Siren, `950 → 500 m`, approaching.
- 22.5–30 s: Ambulance Siren, `500 → 50 m`, receding.

For a stationary observer and speed of sound 343 m/s, the 440 Hz source is approximately 533.29 Hz while approaching and 374.49 Hz while receding.

## What is new for the challenge

Pre-existing: Esbiko application, simulations, Doppler scientific model, human controls, Firebase hosting, Platform API foundations, and media assets.

Challenge work: WebMCP registration lifecycle, 11 semantic tools, validated Doppler adapter, two-source scene contract, shared human/agent runtime state, AI video director, `two_vehicle` and `single_pass` story modes, exact speed×time geometry, Web Audio recording capture, real-signal verification, live browser mirroring, deterministic 9:16 recording, structured errors/status, automated tests, and hackathon documentation/evidence.

## Links

- Live app: <https://www.esbiko.com>
- Direct demo: <https://www.esbiko.com/experiments/physics.acoustics.doppler/run>
- Public repository: <https://github.com/amin076/science-web-lab>
- Demo video: PENDING FINAL UPLOAD

## Judge testing instructions

No sign-in is required.

Final prompt:

> Using Esbiko's site tools, create the default 30-second 9:16 two-vehicle Doppler video at 440 Hz and 60 m/s with the observer stationary at 500 m. First show Esbiko Voice crossing left to right, then show an Ambulance Siren crossing right to left. Keep both vehicles visibly moving in the browser and recording, show the higher pitch before each pass and lower pitch after each pass, wait until the recording is ready, then download the WebM video.

For Chrome Inspector manual testing, execute `create_doppler_video` with:

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

Then call `get_doppler_video_status` until `state` is `ready`, confirm `audioIncluded: true` and `audioSignalDetected: true`, and execute `download_doppler_video`.

Optional clear listening test:

```json
{
  "storyMode": "single_pass",
  "durationSeconds": 10,
  "speedMps": 60,
  "emittedFrequencyHz": 440,
  "firstInstrument": "ambulance_siren"
}
```

## Demo video script — target 2:30

### 0:00–0:20 — Problem

Show the human Doppler simulation.

Narration: "Interactive science simulations are designed for people. A browser agent normally has to guess which controls to use and how to read the result."

### 0:20–0:40 — WebMCP

Show the WebMCP-ready badge and the 11 discovered tools.

Narration: "For the WebMCP Challenge, I made Esbiko agent-operable. The site exposes semantic scientific tools directly, while keeping the same human interface."

### 0:40–1:35 — Live two-vehicle director

Start the default 30-second story. Show the browser motion while it is being recorded. Emphasize the first pass and second pass, visible wavefronts, phase overlay, and audible pitch changes.

### 1:35–1:55 — Structured status and download

Show `get_doppler_video_status`, including timeline, audio verification, progress/ready state, then run `download_doppler_video`.

### 1:55–2:15 — Result

Play a short section of the downloaded WebM and show that it matches the live browser story.

### 2:15–2:27 — Why it matters

Narration: "The agent is not clicking sliders or inventing physics. A validated adapter connects WebMCP to Esbiko's real React state, Doppler equations, audio engine, and recorder."

### 2:27–2:30 — Close

"Esbiko: science experiments that people and agents can operate together."

## Recording rules

- Keep final YouTube video below 3:00.
- Use clear spoken audio; no background music is needed.
- Show the public deployment, not localhost.
- Make the 11 tools, live browser movement, structured status, and downloaded result legible.
- Do not claim WebMCP coverage for simulations other than the verified Doppler implementation.
