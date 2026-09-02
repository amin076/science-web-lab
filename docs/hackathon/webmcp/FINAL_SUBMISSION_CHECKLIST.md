# Final WebMCP Submission Checklist

This file is the final handoff for the OpenAI WebMCP Challenge submission.

## Deadline

- Official submission deadline: **September 3, 2026 at 1:00 PM PDT**.
- For AEST (UTC+10), this is **September 4, 2026 at 6:00 AM AEST**.
- After the submission period closes, do not edit the Devpost submission, repository, or live site during judging. If development must continue, fork/copy the project and leave the submitted version unchanged.

## Final project identity

- Project name: **Esbiko WebMCP Science Lab**
- One-line description: **Interactive science simulations that humans and AI agents can operate together through semantic WebMCP tools.**
- Live app: <https://www.esbiko.com>
- Direct judge demo: <https://www.esbiko.com/experiments/physics.acoustics.doppler/run>
- Public repository: <https://github.com/amin076/science-web-lab>
- License: MIT (`LICENSE` in repository root)
- Demo video: **PENDING — public YouTube URL must be added before submission**

## Final production baseline

- Final audio/video synchronization runtime commit: `adb0d6a89ebb454f85c151058cc0f84f00a10038`
- Pull request: `#101` — Synchronize 30-second AI Doppler audio with video motion
- Firebase deployment workflow: run `#121`
- Deployment result: **PASS**
- Production smoke result: **PASS** — the 30-second two-vehicle recording was watched/listened to end-to-end and the Doppler pitch change was clearly audible around both observer passes.

The final tested judge/demo payload is:

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

Expected pass moments:

- Vehicle 1 passes the observer at **7.5 s**.
- Vehicle 2 passes the observer at **22.5 s**.
- Approaching pitch is approximately **533.29 Hz equivalent** for a 440 Hz emitted source at 60 m/s.
- Receding pitch is approximately **374.49 Hz equivalent**.

## Required Devpost materials

### 1. Working live URL — READY

Use:

<https://www.esbiko.com/experiments/physics.acoustics.doppler/run>

No judge login is required.

### 2. Public repository — READY

Use:

<https://github.com/amin076/science-web-lab>

The repository contains source code, build instructions, WebMCP implementation, challenge documentation, and a root MIT license.

### 3. Project description — READY

Copy the English submission text from [`SUBMISSION.md`](SUBMISSION.md). It explicitly explains:

- why Esbiko is a strong fit for WebMCP;
- how WebMCP improves the user experience;
- what humans and agents can now do together;
- how the WebMCP tools connect to Esbiko's real simulation state, physics, audio, and recorder;
- what existed before the challenge versus what was added during the challenge.

### 4. Testing instructions — READY

Use the judge instructions in [`TESTING.md`](TESTING.md). The recommended final payload is the Real Car Engine + Ambulance Siren 30-second story shown above.

### 5. Demo video — USER ACTION REQUIRED

Record a **public YouTube video shorter than 3 minutes** with spoken audio. Do not use background music.

Recommended target length: **2:20–2:40**.

The video should visibly prove:

1. the public Esbiko Doppler page is open;
2. WebMCP is ready and 11 tools are discovered;
3. `create_doppler_video` is invoked with the final 30-second payload;
4. the browser visibly runs the experiment while recording;
5. the first car crosses the observer and its pitch clearly drops;
6. the ambulance approaches from the opposite direction, crosses, and its pitch clearly drops;
7. `get_doppler_video_status` reaches `ready` and shows verified audio;
8. `download_doppler_video` downloads the WebM;
9. a short part of the downloaded WebM is played to prove the final artifact matches the live experiment.

Use the final narration script in [`SUBMISSION.md`](SUBMISSION.md).

### 6. Optional project images — RECOMMENDED

If Devpost allows project screenshots, capture 3–5 clean images:

- WebMCP-ready badge + 11 discovered tools;
- first vehicle approaching the observer;
- first vehicle immediately after passing with lower pitch shown;
- structured ready status with `audioIncluded: true` and `audioSignalDetected: true`;
- final 9:16 WebM frame / downloaded result.

Avoid screenshots containing unrelated browser tabs, private notifications, account details, API keys, or local paths.

## Copy-ready judge prompt

> Using Esbiko's site tools, create a 30-second 9:16 two-vehicle Doppler video at 440 Hz and 60 m/s with the observer stationary at 500 m. First show a Real Car Engine crossing left to right, then show an Ambulance Siren crossing right to left. Keep both vehicles visibly moving in the browser and recording, make the higher pitch before each pass and lower pitch after each pass clearly audible, wait until the recording is ready, then download the WebM video.

## Final user actions before clicking Submit

1. Run one final hard-refresh test of the public Doppler page.
2. Confirm WebMCP still reports 11 tools.
3. Run the 30-second final payload once more only if needed for the screen recording.
4. Record the demo with your own narration.
5. Watch the exported demo from beginning to end with headphones/speakers and confirm the Doppler pitch changes are audible.
6. Upload the demo to YouTube as **Public** (not Private/Unlisted if the form/rules require publicly visible access).
7. Add the YouTube URL to Devpost and replace the `PENDING` URL in the submission documentation if desired before final freeze.
8. Paste the project description and judge testing instructions from `SUBMISSION.md` / `TESTING.md` into Devpost.
9. Add the live URL and public GitHub repository URL.
10. Verify every Devpost required field, save, and submit before the deadline.
11. After the deadline: **freeze the submitted repo, live site, and Devpost entry until judging is over**.

## Final freeze rule

Once the Devpost submission is final, do not make additional commits/deployments to the submitted version unless the official organizers explicitly instruct entrants to do so. Preserve the exact version judges saw.
