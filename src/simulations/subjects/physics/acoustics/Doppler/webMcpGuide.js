export const DOPPLER_WEBMCP_TOOL_NAMES = Object.freeze([
  "list_science_simulations",
  "open_science_simulation",
  "get_doppler_state",
  "configure_doppler",
  "configure_doppler_scene",
  "set_doppler_playback",
  "reset_doppler",
  "create_doppler_video",
  "get_doppler_video_status",
  "stop_doppler_video",
  "download_doppler_video",
]);

export const DOPPLER_WEBMCP_TEST_PROMPT =
  "Using Esbiko's site tools, create a 60-second 9:16 Doppler video with a 440 Hz emitted frequency. Keep the observer stationary at 500 m. First use a Real Car Engine moving left to right at 30 m/s, then use a Diesel Engine moving right to left at 30 m/s. Let each car pass the observer so the video shows and records the sound before and after passing. Display the emitted and observed frequencies, the direction and pitch change, finish with a scientific comparison, wait until the recording is ready, then download the WebM video.";

const STATUS_CONTENT = Object.freeze({
  ready: Object.freeze({
    label: "Ready",
    detail: `${DOPPLER_WEBMCP_TOOL_NAMES.length} tools available`,
    help: "Open Site tools in the ChatGPT browser address bar, then ask the agent to use the prompt below.",
  }),
  registering: Object.freeze({
    label: "Connecting",
    detail: "Registering tools",
    help: "Esbiko is registering its Doppler tools with this browser.",
  }),
  unsupported: Object.freeze({
    label: "Browser unavailable",
    detail: "Simulation still works normally",
    help: "Open this page in the ChatGPT desktop app's built-in browser with Site tools enabled. For Chrome testing, enable WebMCP testing in chrome://flags and relaunch.",
  }),
  error: Object.freeze({
    label: "Connection error",
    detail: "Reload to try again",
    help: "The browser supports WebMCP, but Esbiko could not register the Doppler tools. Reload the page and inspect the browser console if the error continues.",
  }),
});

export function getWebMcpGuideStatus(status) {
  return STATUS_CONTENT[status] || STATUS_CONTENT.unsupported;
}

function formatNumber(value, maximumFractionDigits = 2) {
  if (!Number.isFinite(value)) return null;

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits,
  }).format(value);
}

export function formatDopplerResultSummary(sources) {
  const source = sources?.[0];

  if (!source) return "No source configured yet";

  const emitted = formatNumber(source.baseFreq, 1);
  const observed = formatNumber(source.currentFreq, 2);
  const shift = formatNumber(Math.abs(source.shiftPercent), 2);

  if (emitted === null || observed === null || shift === null) {
    return "Experiment configured — run or read state for measurements";
  }

  const sign = source.shiftPercent > 0 ? "+" : source.shiftPercent < 0 ? "−" : "";

  return `${emitted} Hz → ${observed} Hz · ${sign}${shift}%`;
}
