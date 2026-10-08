import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const origin = process.env.ESBIKO_TEST_BASE_URL || "http://127.0.0.1:4173";
const url = origin + "/experiments/astronomy.space.earth-orbit-lab/run?embed=mcp-app&mcp.simMode=educational&mcp.timeScale=345";
const outDir = "artifacts/orbit-lab-agent";
fs.mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch({ headless: true, args: ["--use-gl=swiftshader", "--enable-webgl", "--ignore-gpu-blocklist"] });
try {
  for (const viewport of [{ width: 360, height: 500 }, { width: 390, height: 844 }, { width: 900, height: 650 }, { width: 1280, height: 720 }]) {
    const page = await browser.newPage({ viewport });
    const pageErrors = [];
    page.on("pageerror", (e) => pageErrors.push(String(e)));
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
    const stage = page.locator('[data-agent-surface="earth-orbit-stage"]');
    try {
      await stage.waitFor({ state: "visible", timeout: 30000 });
    } catch (error) {
      const body = await page.locator("body").innerText().catch(() => "(no body)");
      const markup = await page.locator("body").innerHTML().catch(() => "(no body)");
      await page.screenshot({ path: path.join(outDir, "orbit-failed-" + viewport.width + ".png"), fullPage: true }).catch(() => {});
      console.error("ORBIT DIAGNOSTIC", JSON.stringify({
        url: page.url(),
        title: await page.title(),
        body: body.slice(0, 6000),
        markup: markup.slice(0, 2500),
        errors: pageErrors,
      }));
      throw error;
    }
    const play = page.locator('[data-agent-action="pause"], [data-agent-action="play"]').first();
    const reset = page.locator('[data-agent-action="reset"]').first();
    await play.waitFor({ state: "visible" });
    await reset.waitFor({ state: "attached" });
    await page.waitForTimeout(1000);
    const result = await page.evaluate(() => ({
      viewport: window.innerWidth,
      width: document.documentElement.scrollWidth,
      stageHeight: document.querySelector('[data-agent-surface="earth-orbit-stage"]')?.getBoundingClientRect().height,
    }));
    assert(result.width <= result.viewport + 1, `Horizontal overflow at ${viewport.width}: ${JSON.stringify(result)}`);
    assert(result.stageHeight >= 320, `Stage too small: ${viewport.width}`);
    if (viewport.width === 360) {
      const scale = page.locator('input[aria-label="Orbit time scale numeric input"]');
      await scale.waitFor({ state: "attached" });
      assert.equal(await scale.inputValue(), "345", "MCP time scale was overwritten by mode initialization");
    }
    assert.equal(pageErrors.length, 0, pageErrors.join("\n"));
    await page.screenshot({ path: path.join(outDir, `orbit-${viewport.width}x${viewport.height}.png`), fullPage: true });
    console.log("ORBIT LAB RESPONSIVE PASS", viewport.width, viewport.height);
    await page.close();
  }

  // Real in-browser WebM verification; no mocked recorder or synthetic video.
  const videoPage = await browser.newPage({ viewport: { width: 600, height: 600 }, acceptDownloads: true });
  const videoUrl = origin + "/experiments/astronomy.space.earth-orbit-lab/run?embed=mcp-app&mcpVideo=1&mcpVideoDurationSeconds=5&mcpVideoStoryMode=focus_target&mcpVideoAspectRatio=16%3A9";
  const videoErrors = [];
  videoPage.on("pageerror", (error) => videoErrors.push(String(error)));
  await videoPage.goto(videoUrl, { waitUntil: "domcontentloaded", timeout: 60000 });
  const videoRecord = videoPage.locator('[data-agent-action="record"]').first();
  await videoRecord.waitFor({ state: "visible", timeout: 30000 });
  await videoPage.waitForTimeout(1500);
  await videoRecord.click();
  const videoDownload = videoPage.locator('[data-agent-action="download-video"]').first();
  await videoDownload.waitFor({ state: "visible", timeout: 30000 });
  const downloadPromise = videoPage.waitForEvent("download", { timeout: 15000 });
  await videoDownload.click();
  const download = await downloadPromise;
  const videoPath = path.join(outDir, "orbit-lab-test.webm");
  await download.saveAs(videoPath);
  assert(fs.statSync(videoPath).size > 1000, "Orbit Lab video file is empty");
  assert(download.suggestedFilename().endsWith(".webm"), "Expected a .webm file");
  assert.equal(videoErrors.length, 0, videoErrors.join("\\n"));
  await videoPage.screenshot({ path: path.join(outDir, "orbit-video-ready.png"), fullPage: true });
  await videoPage.close();
  console.log("ORBIT LAB REAL WEBM RECORDING PASS");
} finally {
  await browser.close();
}
