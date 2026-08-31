# WebMCP Production Evidence

Verified August 31, 2026 at approximately 19:27 AEST (09:27 UTC).

## Published revision

- Public repository: <https://github.com/amin076/science-web-lab>
- WebMCP feature PR: <https://github.com/amin076/science-web-lab/pull/86>
- Production-smoke fix PR: <https://github.com/amin076/science-web-lab/pull/87>
- Verified application commit on `main`: [`64affed67e537bb29253e3400b9033d0796db13e`](https://github.com/amin076/science-web-lab/commit/64affed67e537bb29253e3400b9033d0796db13e)
- Successful Firebase deployment: [Deploy Esbiko Hosting #103](https://github.com/amin076/science-web-lab/actions/runs/33377437466), completed in 1m 56s
- Public demo: <https://www.esbiko.com/experiments/physics.acoustics.doppler/run>

## Production browser results

The smoke test used a browser with the WebMCP capability enabled against the public Firebase deployment. No login was used.

| Check | Result | Evidence |
| --- | --- | --- |
| WebMCP-ready UI | PASS | The live Doppler panel displayed `WebMCP agent tools ready`. |
| Tool discovery | PASS | Six tools discovered: two site tools and four Doppler tools. |
| Catalog discovery | PASS | `list_science_simulations` returned the allowlisted `physics.acoustics.doppler` route and four supported actions. |
| Approaching case | PASS | 440 Hz source, 20 m/s toward a stationary observer: 467.24 Hz observed, +6.19% shift. Visible HUD rounded to 467 Hz and showed `Approaching / Higher pitch`. |
| Playback | PASS | `set_doppler_playback(run)` changed status to running; source position advanced from 250 m to 253 m before pause. |
| Receding case | PASS | 440 Hz source, 20 m/s away from a stationary observer: 415.76 Hz observed, -5.51% shift. Visible HUD rounded to 416 Hz and showed `Receding / Lower pitch`. |
| Input validation | PASS | 151 m/s returned a structured `PARAMETER_OUT_OF_RANGE` error with the 0–150 m/s limit. |
| Human/agent shared state | PASS | A manual keyboard change raised emitted frequency from 440 to 441 Hz; `get_doppler_state` returned 441 Hz emitted and 416.7 Hz observed, while the paused HUD immediately showed 441 Hz and rounded 417 Hz. |
| Reset | PASS | `reset_doppler` returned paused scientific mode, observer at 500 m and 0 m/s, and an empty source list. |
| Application console | PASS | No Esbiko/WebMCP registration or execution errors. Observed console noise was limited to the test-browser extension and the pre-existing missing Analytics-ID warning. |

## Automated verification

The final implementation also passed:

```text
ESBIKO_WEBMCP_TEST_PASSED
ESBIKO_PLATFORM_API_TEST_PASSED
targeted ESLint: PASS
git diff --check: PASS
Vite production build: PASS (15,660 modules, PWA generated)
```

The build reports only the repository's existing large-chunk advisory and stale Browserslist-data notice; neither blocks deployment or WebMCP execution.
