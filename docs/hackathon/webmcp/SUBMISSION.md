# Devpost Submission Draft

## Project name

Esbiko WebMCP Science Lab

## One-line description

Interactive science simulations that teachers, learners, and AI agents can operate together through semantic WebMCP tools.

## Project description

Esbiko is an existing interactive science-learning platform with browser-based simulations for teachers and students. For the WebMCP Challenge, Esbiko was extended so an AI agent can discover, configure, run, inspect, and reset a real Doppler Effect experiment through structured website tools.

Scientific simulation interfaces are difficult for general browser agents. A visual agent must find sliders, infer what each control means, approximate values, determine whether the experiment is running, and scrape measurements from the page. Those steps are fragile and hide the user's scientific intent.

Esbiko now exposes that intent directly. A teacher can ask for a 440 Hz source approaching a stationary observer at 20 m/s. The agent opens the Doppler lab, configures the visible experiment, runs it, and reads the actual frequency shift calculated by Esbiko. The teacher can then move a slider manually or ask the agent to reverse the source and compare the two cases.

The integration uses the WebMCP Imperative API at the top-level page. Two site tools provide simulation discovery and navigation. Four Doppler tools provide structured state reads, validated configuration, playback, and reset. A JSON-safe adapter maps semantic inputs such as `approaching` and `receding` onto Esbiko's real runtime state and existing physics functions. React remains the state owner, so agent actions and human controls always operate the same experiment.

WebMCP is a progressive enhancement. The normal Esbiko interface still works in browsers without WebMCP, while supported browsers gain precise, inspectable tools instead of DOM-click automation.

## What is new

Esbiko, the Doppler simulation, the physics engine, the Platform API, Firebase hosting, and the human UI all existed before August 25, 2026. The challenge work adds the complete WebMCP registration layer, six tool contracts, first real Doppler simulation adapter, shared human-agent commands and state reads, validation and error handling, capability verification, automated tests, interface feedback, and submission documentation.

## Links

- Live app: <https://www.esbiko.com>
- Direct demo: <https://www.esbiko.com/experiments/physics.acoustics.doppler/run>
- Public repository: <https://github.com/amin076/science-web-lab>
- Demo video: PENDING

## Judge testing instructions

Use ChatGPT's in-app browser or Chrome 149+ with `chrome://flags/#enable-webmcp-testing` enabled. Open the live site and use this prompt:

> Open the Doppler simulation. Configure a 440 Hz source approaching a stationary observer at 20 m/s, run it, and explain the measured frequency shift. Then pause it, make the same source recede at the same speed, and compare the results.

No sign-in is required.

## Demo video script — target 2:35

### 0:00–0:18 — Problem

"Interactive simulations are designed for people. A browser agent normally has to guess which sliders to move, what the labels mean, and how to read the result."

Show the existing Esbiko catalog and human Doppler controls.

### 0:18–0:38 — WebMCP extension

"For the WebMCP Challenge, I made Esbiko agent-native. The website now exposes semantic scientific tools directly to the agent—without adding a chatbot and without replacing the human interface."

Show Available site tools and the six tool names.

### 0:38–1:25 — Approaching experiment

Ask the main judge prompt. Show the agent opening Doppler, configuring 440 Hz and 20 m/s, and starting playback. Keep the simulation visible while wavefronts and HUD update. Show the structured state result and positive frequency shift.

### 1:25–1:50 — Human collaboration

Change one visible control manually. Ask the agent to read the state again. Point out that the returned state includes the human change because both use the same runtime state.

### 1:50–2:15 — Receding comparison

Ask the agent to pause and make the source recede at the same speed. Show the source direction reverse and the observed frequency move below the emitted frequency.

### 2:15–2:32 — Architecture and impact

"A small validated adapter connects WebMCP tools to Esbiko's existing React state and physics engine. Teachers can describe pedagogical intent in natural language while students still see, hear, change, and discuss the experiment."

### 2:32–2:35 — Close

"Esbiko: science experiments that people and agents can operate together."

## Recording rules

- Keep the final upload below 3:00; aim for 2:25–2:40.
- Use clear narration and no background music.
- Show the functioning public deployment, not localhost.
- Keep the agent tool list, visible simulation, and structured result legible.
- Do not claim support for simulations other than the verified Doppler MVP.
