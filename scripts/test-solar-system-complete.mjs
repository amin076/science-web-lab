import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const baseUrl = process.env.ESBIKO_TEST_BASE_URL || "http://127.0.0.1:4173";
const embeddedPath =
  "/experiments/astronomy.space.solar-system/run" +
  "?embed=mcp-app" +
  "&mcp.speed=5" +
  "&mcp.scaleMode=educational" +
  "&mcp.focusTarget=earth" +
  "&mcp.showTrails=true" +
  "&mcp.showOrbits=true" +
  "&mcp.showAxis=false" +
  "&mcp.showStars=true" +
  "&mcp.showLabels=true";

const viewports = [
  { width: 360, height: 500 },
  { width: 600, height: 600 },
  { width: 900, height: 650 },
  { width: 1280, height: 720 },
];

const screenshotDir = path.resolve("artifacts/solar-system-complete");
fs.mkdirSync(screenshotDir, { recursive: true });

const browser = await chromium.launch({
  headless: true,
  args: ["--use-gl=swiftshader", "--enable-webgl", "--ignore-gpu-blocklist"],
});

function filteredErrors(messages) {
  return messages.filter(
    (message) =>
      !message.includes("favicon") &&
      !message.includes("Failed to load resource") &&
      !message.includes("WebXR") &&
      !message.includes("XRSession"),
  );
}

try {
  for (const viewport of viewports) {
    const page = await browser.newPage({ viewport });
    const pageErrors = [];
    const consoleErrors = [];

    page.on("pageerror", (error) => pageErrors.push(String(error)));
    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });

    await page.goto(baseUrl + embeddedPath, {
      waitUntil: "domcontentloaded",
      timeout: 60_000,
    });

    const stage = page.locator('[data-agent-surface="solar-system-stage"]');
    const reset = page.locator('[data-agent-action="reset"]').first();
    const playback = page
      .locator('[data-agent-action="play"], [data-agent-action="pause"]')
      .first();
    const record = page.locator('[data-agent-action="record"]').first();

    await stage.waitFor({ state: "visible", timeout: 30_000 });
    await playback.waitFor({ state: "visible", timeout: 15_000 });
    await reset.waitFor({ state: "visible", timeout: 15_000 });
    await record.waitFor({ state: "visible", timeout: 15_000 });
    await page.waitForTimeout(1800);

    const layout = await page.evaluate(() => {
      const rect = (selector) => {
        const element = document.querySelector(selector);
        const value = element?.getBoundingClientRect();
        return value
          ? {
              width: value.width,
              height: value.height,
              left: value.left,
              right: value.right,
              top: value.top,
              bottom: value.bottom,
            }
          : null;
      };

      return {
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        scrollWidth: document.documentElement.scrollWidth,
        stage: rect('[data-agent-surface="solar-system-stage"]'),
        playback: rect(
          '[data-agent-action="play"], [data-agent-action="pause"]',
        ),
        reset: rect('[data-agent-action="reset"]'),
        record: rect('[data-agent-action="record"]'),
        orientationNotice:
          document.body?.innerText?.includes("Rotate your device") || false,
      };
    });

    await page.screenshot({
      path: path.join(
        screenshotDir,
        `solar-${viewport.width}x${viewport.height}.png`,
      ),
      fullPage: true,
    });

    assert(
      layout.scrollWidth <= layout.viewportWidth + 1,
      `Solar System horizontal overflow at ${viewport.width}x${viewport.height}`,
    );
    assert(layout.stage?.width >= layout.viewportWidth * 0.95);
    assert(layout.stage?.height >= Math.min(320, layout.viewportHeight * 0.65));
    assert(layout.playback?.width >= 44 && layout.playback?.height >= 44);
    assert(layout.reset?.width >= 44 && layout.reset?.height >= 44);
    assert(layout.record?.width >= 44 && layout.record?.height >= 44);
    assert.equal(layout.orientationNotice, false);
    assert.equal(pageErrors.length, 0, pageErrors.join("\n"));
    assert.equal(
      filteredErrors(consoleErrors).length,
      0,
      filteredErrors(consoleErrors).join("\n"),
    );

    if (viewport.width <= 600) {
      const openControls = page.locator('[data-agent-action="open-controls"]');
      await openControls.waitFor({ state: "visible", timeout: 10_000 });
      await openControls.click();

      const closeControls = page.locator('[data-agent-action="close-controls"]');
      await closeControls.waitFor({ state: "visible", timeout: 10_000 });

      const drawerOverflow = await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth + 1,
      );
      assert.equal(drawerOverflow, false);

      await closeControls.click();
    }

    console.log(
      `SOLAR RESPONSIVE PASS ${viewport.width}x${viewport.height}`,
      layout,
    );
    await page.close();
  }

  const portraitPage = await browser.newPage({
    viewport: { width: 390, height: 844 },
  });
  await portraitPage.goto(
    baseUrl + "/experiments/astronomy.space.solar-system/run",
    { waitUntil: "domcontentloaded", timeout: 60_000 },
  );
  await portraitPage
    .locator('[data-agent-surface="solar-system-stage"]')
    .waitFor({ state: "visible", timeout: 30_000 });
  await portraitPage.waitForTimeout(1000);
  assert.equal(
    await portraitPage
      .getByText("Rotate your device", { exact: true })
      .isVisible()
      .catch(() => false),
    false,
  );
  console.log("SOLAR NORMAL PORTRAIT PASS 390x844");
  await portraitPage.close();

  const videoPage = await browser.newPage({
    viewport: { width: 600, height: 600 },
  });
  const videoPath =
    embeddedPath +
    "&mcpVideo=1" +
    "&mcpVideoStoryMode=focus_target" +
    "&mcpVideoDurationSeconds=5" +
    "&mcpVideoAspectRatio=16%3A9";

  await videoPage.goto(baseUrl + videoPath, {
    waitUntil: "domcontentloaded",
    timeout: 60_000,
  });
  const recordButton = videoPage.locator('[data-agent-action="record"]').first();
  await recordButton.waitFor({ state: "visible", timeout: 30_000 });
  await videoPage.waitForTimeout(1500);
  await recordButton.click();

  const downloadButton = videoPage
    .locator('[data-agent-action="download-video"]')
    .first();
  await downloadButton.waitFor({ state: "visible", timeout: 15_000 });

  await videoPage.screenshot({
    path: path.join(screenshotDir, "solar-video-ready-600x600.png"),
    fullPage: true,
  });

  console.log("SOLAR WEBM RECORDING PASS 5s");
  await videoPage.close();

  console.log("SOLAR SYSTEM COMPLETE BROWSER TEST PASSED");
} finally {
  await browser.close();
}
