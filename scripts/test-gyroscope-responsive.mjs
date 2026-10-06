import assert from "node:assert/strict";
import { chromium } from "playwright";

const baseUrl = process.env.ESBIKO_TEST_BASE_URL || "http://127.0.0.1:4173";
const path =
  "/experiments/physics.mechanics.gyroscope/run" +
  "?embed=mcp-app" +
  "&mcp.spinSpeed=18" +
  "&mcp.tilt=35" +
  "&mcp.mass=1.5" +
  "&mcp.showVectors=true" +
  "&mcp.showTrail=false";

const viewports = [
  { width: 360, height: 500 },
  { width: 600, height: 600 },
  { width: 900, height: 650 },
  { width: 1280, height: 720 },
];

const browser = await chromium.launch({ headless: true });

try {
  for (const viewport of viewports) {
    const page = await browser.newPage({ viewport });
    const pageErrors = [];
    const consoleErrors = [];

    page.on("pageerror", (error) => pageErrors.push(String(error)));
    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });

    await page.goto(baseUrl + path, {
      waitUntil: "networkidle",
      timeout: 60_000,
    });

    const stage = page.locator('[data-agent-surface="gyroscope-stage"]');
    const play = page.locator('[data-agent-action="play"]');
    const reset = page.locator('[data-agent-action="reset"]');

    await stage.waitFor({ state: "visible" });
    await play.waitFor({ state: "visible" });
    await reset.waitFor({ state: "visible" });

    const layout = await page.evaluate(() => {
      const stageEl = document.querySelector(
        '[data-agent-surface="gyroscope-stage"]',
      );
      const playEl = document.querySelector('[data-agent-action="play"]');
      const resetEl = document.querySelector('[data-agent-action="reset"]');

      const stageRect = stageEl?.getBoundingClientRect();
      const playRect = playEl?.getBoundingClientRect();
      const resetRect = resetEl?.getBoundingClientRect();

      return {
        bodyScrollWidth: document.documentElement.scrollWidth,
        viewportWidth: window.innerWidth,
        stage: stageRect
          ? {
              width: stageRect.width,
              height: stageRect.height,
            }
          : null,
        play: playRect
          ? {
              top: playRect.top,
              bottom: playRect.bottom,
              left: playRect.left,
              right: playRect.right,
              width: playRect.width,
              height: playRect.height,
            }
          : null,
        reset: resetRect
          ? {
              top: resetRect.top,
              bottom: resetRect.bottom,
              left: resetRect.left,
              right: resetRect.right,
              width: resetRect.width,
              height: resetRect.height,
            }
          : null,
      };
    });

    assert(
      layout.bodyScrollWidth <= layout.viewportWidth + 1,
      `Horizontal overflow at ${viewport.width}x${viewport.height}: ${layout.bodyScrollWidth}px`,
    );
    assert(layout.stage?.width > 0 && layout.stage?.height > 0);
    assert(layout.play?.width >= 44 && layout.play?.height >= 44);
    assert(layout.reset?.width >= 44 && layout.reset?.height >= 44);
    assert(layout.play.left >= 0 && layout.play.right <= viewport.width + 1);
    assert(layout.reset.left >= 0 && layout.reset.right <= viewport.width + 1);
    assert.equal(pageErrors.length, 0, pageErrors.join("\n"));

    const blockingConsoleErrors = consoleErrors.filter(
      (message) =>
        !message.includes("favicon") &&
        !message.includes("Failed to load resource"),
    );
    assert.equal(
      blockingConsoleErrors.length,
      0,
      blockingConsoleErrors.join("\n"),
    );

    console.log(
      `GYROSCOPE RESPONSIVE PASS ${viewport.width}x${viewport.height}`,
      layout,
    );

    await page.close();
  }

  console.log("GYROSCOPE RESPONSIVE VIEWPORT TEST PASSED");
} finally {
  await browser.close();
}
