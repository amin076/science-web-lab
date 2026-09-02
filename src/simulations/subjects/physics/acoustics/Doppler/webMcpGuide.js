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
  "Using Esbiko's site tools, create the default 30-second 9:16 two-vehicle Doppler video at 440 Hz and 60 m/s with the observer stationary at 500 m. First show Esbiko Voice crossing left to right, then show an Ambulance Siren crossing right to left. Keep both vehicles visibly moving in the browser and recording, show the higher pitch before each pass and lower pitch after each pass, wait until the recording is ready, then download the WebM video.";

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
