# Multi-Source Interference — agent-ready wave lab

Simulation ID: `physics.waves.multi-source-interference`

This experiment uses the existing 800×450 finite-difference surface-wave engine, a 1920×1080 presentation canvas, independent point emitters and two display modes: **classic interference pattern** and **cinematic water**. Source location, frequency, amplitude, phase, motion (including ellipse and figure-eight), visible size and pulse on/off times are editable in both the human UI and agent tools.

## WebMCP browser controls

Tools register on supported browser pages using `document.modelContext.registerTool`:

| Tool | Purpose |
| --- | --- |
| `get_multi_source_state` | Snapshot of running status, medium, emitters, water rendering and recording |
| `configure_multi_source` | Wave speed, damping, pattern/water mode, all 12 water-art values |
| `set_multi_source_playback` | Run, pause, reset |
| `add_multi_source_source` | Add an emitter (maximum 24) |
| `update_multi_source_source` | Update all configurable emitter properties by numeric ID |
| `remove_multi_source_source` | Remove an emitter; at least one must remain |
| `configure_multi_source_video` | Duration, FPS and output layout |
| `start_multi_source_video` | Start real browser WebM recording |
| `get_multi_source_video_status` | Progress and completed file metadata |
| `stop_multi_source_video` | Finalize active recording |
| `download_multi_source_video` | Download the last completed WebM |

Agent tools and human controls share the same React/physics source of truth, not a duplicate simulation. Tool inputs are validated with bounded values and return structured JSON success/errors. The registry advertises the wave lab in the site-level simulation discovery tools.

## Recording

Retains the existing `VideoRecorderControls` engine and optional direct save-directory picker, with 1920×1080 landscape and 1080×1920 portrait outputs at 30/60 FPS. Long recordings use up to 60-second segments, saved to the selected directory when supported, otherwise browser downloads. The most recently completed segment can also be explicitly downloaded by the agent. Recording is visual only (no audio), and browser MediaRecorder support is required. Automatic browser downloads and folder picker access depend on the client's permission policies. The status action exposes errors and availability rather than pretending an unsupported capture succeeded.

## Responsive behavior

Desktop places the canvas next to a scrollable control column; mobile and tablet stack an aspect-ratio-preserving canvas above full-width controls that scroll with the page. Controls have larger touch targets, the source drag hit area adjusts for touch and the canvas uses pointer capture. Video guides align with the letterboxed canvas.

## MCP Apps boundary

The remote MCP service can open this simulation with manifest-validated initial values, using `mcp.<parameter>` URL entries in `?embed=mcp-app`. Live manipulation via `WebMCP` tools requires client support for the browser's `document.modelContext` API and is not equivalent to remote MCP endpoint execution within ChatGPT. The embedded app does not register its own browser tools to prevent overlapping registrations.

## Verification

- `node scripts/test-multi-source-agent.mjs` checks 11 contract tools and invalid parameters.
- `node scripts/test-multi-source-responsive.mjs` checks four Chromium viewport sizes, live state changes and an actual five-second portrait WebM capture/download.
- `Multi Source Agent Ready` GitHub Actions workflow builds Esbiko and uploads viewport screenshots plus the captured video.

Known limits: the visual wave model uses finite-difference numerics and stylized presentation effects; artistic rendering is not an experimentally calibrated water tank. Video encoding performance varies with device/GPU/browser.
