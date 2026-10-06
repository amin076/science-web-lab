/* eslint-env node */

export const DOPPLER_WIDGET_URI = "ui://esbiko/doppler-v1.html";
export const DOPPLER_RUN_URL =
  "https://www.esbiko.com/experiments/physics.acoustics.doppler/run?embed=mcp-app";

export const DOPPLER_WIDGET_HTML = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Esbiko Doppler Lab</title>
  <style>
    :root {
      color-scheme: light dark;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }
    * { box-sizing: border-box; }
    body { margin: 0; background: transparent; }
    .app { display: grid; gap: 12px; padding: 12px; }
    .summary {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 8px;
    }
    .metric {
      border: 1px solid color-mix(in srgb, currentColor 18%, transparent);
      border-radius: 12px;
      padding: 10px;
      min-width: 0;
    }
    .label { font-size: 12px; opacity: .7; margin-bottom: 4px; }
    .value { font-size: 18px; font-weight: 700; overflow-wrap: anywhere; }
    .status { font-size: 13px; opacity: .8; }
    .frame-shell {
      overflow: hidden;
      border: 1px solid color-mix(in srgb, currentColor 18%, transparent);
      border-radius: 14px;
      min-height: 460px;
      background: #020617;
    }
    iframe { display: block; width: 100%; height: 560px; border: 0; background: #020617; }
    .hint { font-size: 12px; opacity: .72; line-height: 1.45; }
    @media (max-width: 720px) {
      .summary { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      iframe { height: 520px; }
    }
  </style>
</head>
<body>
  <main class="app">
    <section class="summary" aria-label="Doppler result">
      <div class="metric"><div class="label">Emitted</div><div id="emitted" class="value">—</div></div>
      <div class="metric"><div class="label">Observed</div><div id="observed" class="value">—</div></div>
      <div class="metric"><div class="label">Shift</div><div id="shift" class="value">—</div></div>
      <div class="metric"><div class="label">Motion</div><div id="motion" class="value">—</div></div>
    </section>
    <div id="status" class="status">Waiting for Esbiko result…</div>
    <section class="frame-shell">
      <iframe
        src="${DOPPLER_RUN_URL}"
        title="Esbiko Doppler interactive simulation"
        allow="autoplay; fullscreen"
        allowfullscreen
      ></iframe>
    </section>
    <div class="hint">
      The embedded Esbiko simulation is interactive. Browser audio/video recording may require one direct user click before playback or recording can start.
    </div>
  </main>
  <script>
    const $ = (id) => document.getElementById(id);

    function render(data) {
      if (!data) return;
      const input = data.input || {};
      const result = data.result || {};
      $("emitted").textContent =
        Number.isFinite(input.emittedFrequencyHz) ? input.emittedFrequencyHz + " Hz" : "—";
      $("observed").textContent =
        Number.isFinite(result.observedFrequencyHz) ? result.observedFrequencyHz + " Hz" : "—";
      $("shift").textContent =
        Number.isFinite(result.shiftPercent)
          ? (result.shiftPercent > 0 ? "+" : "") + result.shiftPercent + "%"
          : "—";
      $("motion").textContent = input.motion || "—";
      $("status").textContent = data.interpretation || result.motionStatus || "Esbiko Doppler Lab";
    }

    // Hydrate immediately when ChatGPT mounts the widget after the tool call.
    // ChatGPT exposes the tool's structuredContent through window.openai.toolOutput.
    render(window.openai?.toolOutput);

    window.addEventListener("message", (event) => {
      if (event.source !== window.parent) return;
      const message = event.data;
      if (!message || message.jsonrpc !== "2.0") return;

      if (message.method === "ui/notifications/tool-result") {
        render(message.params?.structuredContent);
      }
    }, { passive: true });
  </script>
</body>
</html>`;
