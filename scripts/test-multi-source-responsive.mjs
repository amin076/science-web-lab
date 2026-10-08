import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const base = process.env.ESBIKO_TEST_BASE_URL || "http://127.0.0.1:4173";
const route = "/experiments/physics.waves.multi-source-interference/run";
const artifacts = "artifacts/multi-source-agent";
fs.mkdirSync(artifacts, { recursive: true });
const browser = await chromium.launch({ headless: true, args: ["--use-gl=swiftshader", "--ignore-gpu-blocklist"] });

async function newTestPage(viewport) {
  const page = await browser.newPage({ viewport, acceptDownloads: true });
  const errors = [];
  page.on("pageerror", (error) => errors.push(String(error)));
  await page.addInitScript(() => {
    window.__multiWaveTools = {};
    Object.defineProperty(document, "modelContext", {
      configurable: true,
      value: {
        registerTool: async (tool) => { window.__multiWaveTools[tool.name] = tool; },
      },
    });
  });
  return { page, errors };
}
async function execute(page, name, input = {}) {
  return page.evaluate(async ({ name, input }) => {
    const tool = window.__multiWaveTools?.[name];
    if (!tool) return { ok: false, error: { code: "TOOL_MISSING", message: name } };
    return JSON.parse(await tool.execute(input));
  }, { name, input });
}

try {
  const sizes = [
    { width: 360, height: 640 }, { width: 390, height: 844 },
    { width: 768, height: 1024 }, { width: 1280, height: 720 },
  ];
  for (const viewport of sizes) {
    const { page, errors } = await newTestPage(viewport);
    await page.goto(base + route, { waitUntil: "domcontentloaded", timeout: 60000 });
    const stage = page.locator('[data-agent-surface="multi-source-stage"]');
    const controls = page.locator('[data-agent-surface="multi-source-controls"]');
    await stage.waitFor({ state: "visible", timeout: 30000 });
    await controls.waitFor({ state: "attached", timeout: 30000 });
    await page.locator("#multi-wave-recording-canvas").waitFor({ state: "visible" });
    await page.waitForFunction(() => Boolean(window.__multiWaveTools?.get_multi_source_state), { timeout: 20000 });
    const measure = await page.evaluate(() => {
      const root = document.querySelector('[data-agent-surface="multi-source-root"]');
      const stage = document.querySelector('[data-agent-surface="multi-source-stage"]');
      const controls = document.querySelector('[data-agent-surface="multi-source-controls"]');
      return {
        viewport: window.innerWidth,
        documentWidth: document.documentElement.scrollWidth,
        rootWidth: root.getBoundingClientRect().width,
        stageWidth: stage.getBoundingClientRect().width,
        stageHeight: stage.getBoundingClientRect().height,
        controlsWidth: controls.getBoundingClientRect().width,
      };
    });
    assert(measure.documentWidth <= measure.viewport + 3, "Horizontal overflow: " + JSON.stringify(measure));
    assert(measure.stageWidth <= measure.viewport + 2, "Stage is wider than device: " + JSON.stringify(measure));
    assert(measure.stageHeight >= 200, "Stage collapsed: " + JSON.stringify(measure));
    assert(measure.controlsWidth <= measure.viewport + 2 || viewport.width >= 1024, "Control panel overflows: " + JSON.stringify(measure));
    if (viewport.width === 360) {
      const initial = await execute(page, "get_multi_source_state");
      assert.equal(initial.ok, true);
      assert.equal(initial.data.sources.length, 2);
      assert.equal((await execute(page, "configure_multi_source", { renderMode: "water", waveSpeed: 22, bloom: 1.5 })).ok, true);
      assert.equal((await execute(page, "add_multi_source_source", { x: 0.24, y: 0.63, frequency: 1.9, motion: "horizontal" })).ok, true);
      await page.waitForTimeout(200);
      const after = await execute(page, "get_multi_source_state");
      assert.equal(after.data.renderMode, "water");
      assert.equal(after.data.medium.waveSpeed, 22);
      assert.equal(after.data.waterStyle.bloom, 1.5);
      assert.equal(after.data.sources.length, 3);
      const newId = after.data.sources[2].id;
      assert.equal((await execute(page, "update_multi_source_source", { sourceId: newId, amplitude: 3.2 })).ok, true);
      assert.equal((await execute(page, "remove_multi_source_source", { sourceId: newId })).ok, true);
      assert.equal((await execute(page, "set_multi_source_playback", { action: "pause" })).ok, true);
      await page.waitForTimeout(200);
      assert.equal((await execute(page, "get_multi_source_state")).data.running, false);
      assert.equal((await execute(page, "set_multi_source_playback", { action: "run" })).ok, true);
    }
    await page.screenshot({ path: path.join(artifacts, "multi-source-" + viewport.width + "x" + viewport.height + ".png"), fullPage: true });
    assert.deepEqual(errors, [], "Browser errors: " + errors.join("\n"));
    console.log("MULTI SOURCE RESPONSIVE PASS", viewport.width, viewport.height);
    await page.close();
  }

  const { page, errors } = await newTestPage({ width: 900, height: 720 });
  await page.goto(base + route, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForFunction(() => Boolean(window.__multiWaveTools?.start_multi_source_video), { timeout: 30000 });
  const videoResult = await execute(page, "start_multi_source_video", { durationSeconds: 5, fps: 30, aspectRatio: "9:16" });
  assert.equal(videoResult.ok, true, JSON.stringify(videoResult));
  const download = await page.waitForEvent("download", { timeout: 60000 });
  const videoPath = path.join(artifacts, "multi-source-vertical-test.webm");
  await download.saveAs(videoPath);
  assert(fs.statSync(videoPath).size > 1000, "Recorded WebM is empty");
  assert(download.suggestedFilename().endsWith(".webm"), "Output file extension missing");
  await page.waitForFunction(() => document.querySelector('[data-agent-video-status="ready"]'), { timeout: 15000 });
  const status = await execute(page, "get_multi_source_video_status");
  assert.equal(status.ok, true);
  assert.equal(status.data.downloadReady, true, JSON.stringify(status));
  const replayDownloadPromise = page.waitForEvent("download", { timeout: 15000 });
  const replay = await execute(page, "download_multi_source_video");
  assert.equal(replay.ok, true, JSON.stringify(replay));
  const replayDownload = await replayDownloadPromise;
  assert(replayDownload.suggestedFilename().endsWith(".webm"));
  assert.deepEqual(errors, [], errors.join("\n"));
  await page.screenshot({ path: path.join(artifacts, "multi-source-video-ready.png"), fullPage: true });
  console.log("MULTI SOURCE REAL WEBM & WEBMCP RECORDING PASS", fs.statSync(videoPath).size);
  await page.close();
} finally {
  await browser.close();
}
