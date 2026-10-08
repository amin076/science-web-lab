import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const base = process.env.ESBIKO_TEST_BASE_URL || "http://127.0.0.1:4173";
const output = "artifacts/mechanics-agent";
fs.mkdirSync(output, { recursive: true });

const labs = [
  {
    id: "physics.mechanics.simple-pendulum",
    prefix: "esbiko_pendulum",
    canvas: ".pendulum-record-canvas",
    params: { lengthM: 1.7, showTrail: false },
    readKeys: ["lengthM", "showTrail"],
  },
  {
    id: "physics.mechanics.spring-mass",
    prefix: "esbiko_spring_mass",
    canvas: "[data-esbiko-spring-stage] canvas",
    params: { k: 28, showVectors: false },
    readKeys: ["k", "showVectors"],
  },
];
const sizes = [
  { width: 360, height: 640 }, { width: 390, height: 844 },
  { width: 768, height: 1024 }, { width: 1280, height: 720 },
];
const browser = await chromium.launch({ headless: true, args: ["--use-gl=swiftshader", "--ignore-gpu-blocklist"] });

async function makePage(viewport) {
  const page = await browser.newPage({ viewport, acceptDownloads: true });
  const errors = [];
  page.on("pageerror", (error) => errors.push(String(error)));
  await page.addInitScript(() => {
    window.__mechanicsTools = {};
    Object.defineProperty(document, "modelContext", {
      configurable: true,
      value: { registerTool: async (tool) => { window.__mechanicsTools[tool.name] = tool; } },
    });
  });
  return { page, errors };
}

async function call(page, toolName, input = {}) {
  return page.evaluate(async ({ toolName, input }) => {
    const tool = window.__mechanicsTools?.[toolName];
    if (!tool) throw new Error("WebMCP tool not registered: " + toolName);
    return JSON.parse(await tool.execute(input));
  }, { toolName, input });
}

try {
  for (const lab of labs) {
    for (const viewport of sizes) {
      const { page, errors } = await makePage(viewport);
      await page.goto(base + "/experiments/" + lab.id + "/run", { waitUntil: "domcontentloaded", timeout: 60000 });
      await page.locator(lab.canvas).waitFor({ state: "visible", timeout: 30000 });
      await page.waitForFunction((name) => Boolean(window.__mechanicsTools?.[name]),
        lab.prefix + "_get_state", { timeout: 20000 });
      const measure = await page.evaluate((canvasSelector) => {
        const canvas = document.querySelector(canvasSelector);
        const { width, height, top } = canvas.getBoundingClientRect();
        return { viewport: innerWidth, documentWidth: document.documentElement.scrollWidth,
          canvasWidth: width, canvasHeight: height, canvasTop: top };
      }, lab.canvas);
      assert(measure.documentWidth <= measure.viewport + 3, "Body overflows: " + JSON.stringify(measure));
      assert(measure.canvasWidth >= Math.min(300, viewport.width - 40), "Canvas was squeezed: " + JSON.stringify(measure));
      assert(measure.canvasHeight >= 200, "Canvas collapsed: " + JSON.stringify(measure));

      if (viewport.width === 360) {
        assert(measure.canvasTop <= 110, "Canvas is not at the top on mobile: " + JSON.stringify(measure));
        const before = await call(page, lab.prefix + "_get_state");
        assert.equal(before.ok, true);
        const configured = await call(page, lab.prefix + "_configure", lab.params);
        assert.equal(configured.ok, true, JSON.stringify(configured));
        await page.waitForTimeout(150);
        const after = await call(page, lab.prefix + "_get_state");
        assert.equal(after.ok, true);
        for (const key of lab.readKeys) assert.equal(after.data[key], lab.params[key], "Live state mismatch: " + key);
        assert.equal((await call(page, lab.prefix + "_configure", { mass: -100 })).ok, false, "Invalid parameter accepted");
        assert.equal((await call(page, lab.prefix + "_set_playback", { running: true })).ok, true);
        await page.waitForTimeout(100);
        assert.equal((await call(page, lab.prefix + "_get_state")).data.running, true);
        assert.equal((await call(page, lab.prefix + "_reset")).ok, true);
        await page.waitForTimeout(100);
        assert.equal((await call(page, lab.prefix + "_get_state")).data.running, false);
      }
      assert.equal(errors.length, 0, "Browser errors: " + errors.join("\n"));
      await page.screenshot({ path: path.join(output, lab.prefix + "-" + viewport.width + "x" + viewport.height + ".png"), fullPage: true });
      await page.close();
      console.log("MECHANICS RESPONSIVE + MCP PASS", lab.id, viewport.width, viewport.height);
    }

    const { page, errors } = await makePage({ width: 600, height: 700 });
    await page.goto(base + "/experiments/" + lab.id + "/run", { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.locator(lab.canvas).waitFor({ state: "visible", timeout: 30000 });
    await page.waitForFunction((name) => Boolean(window.__mechanicsTools?.[name]), lab.prefix + "_start_video");
    await page.getByRole("button", { name: "Record 16:9" }).click();
    await page.waitForTimeout(250);
    const stateAfterStart = await call(page, lab.prefix + "_video_status");
    console.log("MECHANICS VIDEO STATUS AFTER START", lab.id, JSON.stringify(stateAfterStart), "PAGE_ERRORS", errors);
    assert.equal(stateAfterStart.data?.status, "recording", "Video did not start: " + JSON.stringify(stateAfterStart));
    await page.waitForTimeout(1950);
    const downloadPromise = page.waitForEvent("download", { timeout: 8000 });
    await page.locator('[aria-label="Simulation video recording"]').getByRole("button", { name: "Stop", exact: true }).click({ timeout: 5000 });
    await page.waitForTimeout(900);
    const earlyState = await call(page, lab.prefix + "_video_status");
    console.log("MECHANICS VIDEO STATUS AFTER STOP", lab.id, JSON.stringify(earlyState));
    if (earlyState.data?.status === "failed") throw new Error("Media recorder failed: " + JSON.stringify(earlyState));
    const download = await downloadPromise;
    const saved = path.join(output, lab.prefix + "-webm.webm");
    await download.saveAs(saved);
    assert(fs.statSync(saved).size > 1000, "WebM recording was empty");
    await page.waitForFunction((name) => {
      const tool = window.__mechanicsTools?.[name];
      return Boolean(tool);
    }, lab.prefix + "_video_status");
    await page.waitForTimeout(400);
    const status = await call(page, lab.prefix + "_video_status");
    assert.equal(status.ok, true);
    assert.equal(status.data.status, "ready", JSON.stringify(status));
    assert.equal(status.data.audioIncluded, false);
    assert.equal(errors.length, 0, "Video browser errors: " + errors.join("\n"));
    await page.close();
    console.log("MECHANICS REAL WEBM PASS", lab.id, fs.statSync(saved).size);
  }
} finally {
  await browser.close();
}
