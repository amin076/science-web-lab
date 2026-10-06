/* eslint-env node */

export const GENERIC_SIMULATION_WIDGET_URI =
  "ui://esbiko/simulation-shell-v1.html";

export const GENERIC_SIMULATION_WIDGET_HTML = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Esbiko Science Lab</title>
  <style>
    :root {
      color-scheme: light dark;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }
    * { box-sizing: border-box; }
    body { margin: 0; background: transparent; }
    .app { display: grid; gap: 10px; padding: 10px; }
    .header {
      display: flex;
      align-items: start;
      justify-content: space-between;
      gap: 12px;
      border: 1px solid color-mix(in srgb, currentColor 18%, transparent);
      border-radius: 12px;
      padding: 10px 12px;
    }
    .name { font-weight: 750; font-size: 16px; }
    .meta { margin-top: 3px; font-size: 12px; opacity: .7; }
    .badge {
      border: 1px solid color-mix(in srgb, currentColor 22%, transparent);
      border-radius: 999px;
      padding: 4px 8px;
      font-size: 11px;
      white-space: nowrap;
    }
    .frame-shell {
      overflow: hidden;
      border: 1px solid color-mix(in srgb, currentColor 18%, transparent);
      border-radius: 14px;
      min-height: 520px;
      background: #020617;
    }
    iframe { display: block; width: 100%; height: 620px; border: 0; background: #020617; }
    .status { font-size: 12px; opacity: .72; }
  </style>
</head>
<body>
  <main class="app">
    <section class="header">
      <div>
        <div id="name" class="name">Esbiko Science Lab</div>
        <div id="description" class="meta">Waiting for simulation…</div>
      </div>
      <div id="level" class="badge">universal</div>
    </section>
    <div id="status" class="status">Preparing interactive simulation…</div>
    <section class="frame-shell">
      <iframe
        id="simulation-frame"
        title="Esbiko interactive science simulation"
        allow="autoplay; fullscreen"
        allowfullscreen
      ></iframe>
    </section>
  </main>
  <script>
    const $ = (id) => document.getElementById(id);

    function render(data) {
      const simulation = data?.simulation || data;
      const parameters = data?.parameters || null;
      if (!simulation?.runUrl) return;

      $("name").textContent = simulation.name || simulation.id || "Esbiko Science Lab";
      $("description").textContent =
        simulation.description || "Interactive scientific simulation powered by Esbiko.";
      $("level").textContent = simulation.integrationLevel || "universal";
      $("status").textContent =
        simulation.integrationLevel === "adapted"
          ? "This simulation has an Esbiko agent adapter."
          : "Interactive mode is available. Deeper agent controls can be added through the reusable adapter contract.";

      const frame = $("simulation-frame");
      const url = new URL(simulation.runUrl);
      url.searchParams.set("embed", "mcp-app");

      if (parameters && typeof parameters === "object") {
        Object.entries(parameters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            url.searchParams.set("mcp." + key, String(value));
          }
        });
      }

      frame.src = url.toString();
    }

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
