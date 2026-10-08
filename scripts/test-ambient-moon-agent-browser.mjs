import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const base = process.env.ESBIKO_TEST_BASE_URL || "http://127.0.0.1:4173";
const output = "artifacts/ambient-moon-agent";
fs.mkdirSync(output, { recursive: true });
const specs = [
  {
    id: "creative.patterns.ambient-pattern-studio",
    prefix: "esbiko_ambient_pattern",
    canvas: "#ambient-pattern-recording-canvas",
    configure: { symmetry: 12, speed: 3 },
    readback: ["symmetry", "speed"],
    invalid: { symmetry: -20 },
  },
  {
    id: "physics.challenges.moon-lander",
    prefix: "esbiko_moon_lander",
    canvas: "[data-esbiko-moon-stage] canvas",
    configure: { mainThrust: true },
    readback: [],
    invalid: { mainThrust: "yes" },
  },
];
const sizes = [
  { width: 360, height: 640 },
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1280, height: 720 },
];

const browser = await chromium.launch({
  headless: true, args: ["--use-gl=swiftshader", "--ignore-gpu-blocklist"],
});
async function makePage(viewport) {
  const page = await browser.newPage({ viewport, acceptDownloads: true });
  const errors = [];
  page.on("pageerror", (error) => errors.push(String(error)));
  await page.addInitScript(() => {
    window.__esbikoTestTools = {};
    Object.defineProperty(document, "modelContext", {
      configurable: true,
      value: { registerTool: async (tool) => { window.__esbikoTestTools[tool.name] = tool; } },
    });
  });
  return { page, errors };
}
async function call(page, prefix, tool, args = {}) {
  return page.evaluate(async ({ name, args }) => {
    const target = window.__esbikoTestTools?.[name];
    if (!target) throw new Error("Missing WebMCP tool: " + name);
    return JSON.parse(await target.execute(args));
  }, { name: prefix + "_" + tool, args });
}
async function visit(page, spec) {
  await page.goto(base + "/experiments/" + spec.id + "/run", {
    waitUntil: "domcontentloaded", timeout: 60000,
  });
  await page.locator(spec.canvas).waitFor({ state: "visible", timeout: 60000 });
  await page.waitForFunction((prefix) => Boolean(window.__esbikoTestTools?.[prefix + "_get_state"]),
    spec.prefix, { timeout: 20000 });
}
async function getStatus(page, spec) {
  return (await call(page, spec.prefix, "video_status")).data;
}

try {
  for (const spec of specs) {
    for (const viewport of sizes) {
      const { page, errors } = await makePage(viewport);
      await visit(page, spec);
      const measure = await page.evaluate((selector) => {
        const canvas = document.querySelector(selector);
        const rect = canvas.getBoundingClientRect();
        return { width: rect.width, height: rect.height, top: rect.top,
          viewportWidth: innerWidth, documentWidth: document.documentElement.scrollWidth };
      }, spec.canvas);
      assert(measure.documentWidth <= viewport.width + 4,
        "Horizontal overflow: " + JSON.stringify(measure));
      assert(measure.width >= Math.min(300, viewport.width - 48),
        "Canvas too narrow: " + JSON.stringify(measure));
      assert(measure.height >= 180, "Canvas collapsed: " + JSON.stringify(measure));
      if (viewport.width === 360) {
        const before = await call(page, spec.prefix, "get_state");
        assert.equal(before.ok, true);
        assert.equal((await call(page, spec.prefix, "configure", spec.configure)).ok, true);
        await page.waitForTimeout(180);
        const state = await call(page, spec.prefix, "get_state");
        assert.equal(state.ok, true);
        for (const key of spec.readback) assert.equal(state.data[key], spec.configure[key]);
        if (spec.id === "physics.challenges.moon-lander") {
          assert.equal(state.data.input.mainThrust, true);
          assert.equal((await call(page, spec.prefix, "configure", { mainThrust: false })).ok, true);
          assert.equal((await call(page, spec.prefix, "get_state")).data.input.mainThrust, false);
        }
        assert.equal((await call(page, spec.prefix, "configure", spec.invalid)).ok, false);
        assert.equal((await call(page, spec.prefix, "set_playback", { running: false })).ok, true);
        assert.equal((await call(page, spec.prefix, "reset")).ok, true);
      }
      assert.deepEqual(errors, [], "Browser errors: " + errors.join("\n"));
      await page.screenshot({
        path: path.join(output, spec.prefix + "-" + viewport.width + "x" + viewport.height + ".png"),
        fullPage: true,
      });
      await page.close();
      console.log("RESPONSIVE + LIVE WEBMCP PASS", spec.id, viewport.width, viewport.height);
    }

    const { page, errors } = await makePage({ width: 800, height: 700 });
    await visit(page, spec);
    for (const mode of ["landscape", "shorts"]) {
      const start = await call(page, spec.prefix, "start_video", { mode });
      assert.equal(start.ok, true, JSON.stringify(start));
      assert.equal((await getStatus(page, spec)).status, "recording");
      await page.waitForTimeout(2050);
      const downloadPromise = page.waitForEvent("download", { timeout: 15000 });
      const stop = await call(page, spec.prefix, "stop_video");
      assert.equal(stop.ok, true, JSON.stringify(stop));
      const download = await downloadPromise;
      const saved = path.join(output, spec.prefix + "-" + mode + ".webm");
      await download.saveAs(saved);
      assert(fs.statSync(saved).size > 1000, "Empty WebM: " + saved);
      await page.waitForFunction(async (prefix) => {
        const tool = window.__esbikoTestTools?.[prefix + "_video_status"];
        if (!tool) return false;
        const state = JSON.parse(await tool.execute({}));
        return state.data?.status === "ready";
      }, spec.prefix, { timeout: 15000 });
      const status = await getStatus(page, spec);
      assert.equal(status.audioIncluded, false);
      if (spec.id === "physics.challenges.moon-lander") {
        assert.equal(status.lastReadyMode, mode);
      }
      console.log("REAL WEBM PASS", spec.id, mode, fs.statSync(saved).size);
    }
    assert.deepEqual(errors, [], "Recording browser errors: " + errors.join("\n"));
    await page.close();
  }
} finally {
  await browser.close();
}
