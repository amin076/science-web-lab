import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const baseUrl = process.env.ESBIKO_TEST_BASE_URL || "http://127.0.0.1:4173";
const route =
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

const screenshotDir = path.resolve("artifacts/gyroscope-v2");
fs.mkdirSync(screenshotDir, { recursive: true });

const browser = await chromium.launch({
  headless: true,
  args: [
    "--use-gl=swiftshader",
    "--enable-webgl",
    "--ignore-gpu-blocklist",
  ],
});

try {
  for (const viewport of viewports) {
    const page = await browser.newPage({ viewport });
    const pageErrors = [];
    const consoleErrors = [];

    page.on("pageerror", (error) => pageErrors.push(String(error)));
    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });

    await page.goto(baseUrl + route, {
      waitUntil: "domcontentloaded",
      timeout: 60_000,
    });

    const stage = page.locator('[data-agent-surface="gyroscope-stage"]');
    const controls = page.locator('[data-gyroscope-controls="true"]');
    const hud = page.locator('[data-gyroscope-hud="true"]');
    const play = page.locator(
      '[data-agent-action="play"], [data-agent-action="pause"]',
    ).first();
    const reset = page.locator('[data-agent-action="reset"]').first();

    try {
      await stage.waitFor({ state: "visible", timeout: 30_000 });
      await controls.waitFor({ state: "visible", timeout: 10_000 });
      await hud.waitFor({ state: "visible", timeout: 10_000 });
      await play.waitFor({ state: "visible", timeout: 10_000 });
      await reset.waitFor({ state: "visible", timeout: 10_000 });
    } catch (error) {
      const diagnostics = await page.evaluate(() => ({
        url: window.location.href,
        bodyText: document.body?.innerText?.slice(0, 3000) || "",
      }));
      console.error("GYROSCOPE V2 LOAD DIAGNOSTICS", viewport, diagnostics, {
        pageErrors,
        consoleErrors,
      });
      throw error;
    }

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

      const controlsEl = document.querySelector(
        '[data-gyroscope-controls="true"]',
      );
      const controlsStyle = controlsEl
        ? window.getComputedStyle(controlsEl)
        : null;

      return {
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        documentScrollWidth: document.documentElement.scrollWidth,
        stage: rect('[data-agent-surface="gyroscope-stage"]'),
        controls: rect('[data-gyroscope-controls="true"]'),
        hud: rect('[data-gyroscope-hud="true"]'),
        play: rect(
          '[data-agent-action="play"], [data-agent-action="pause"]',
        ),
        reset: rect('[data-agent-action="reset"]'),
        controlsOverflowY: controlsStyle?.overflowY || null,
      };
    });

    assert(
      layout.documentScrollWidth <= layout.viewportWidth + 1,
      `Horizontal overflow at ${viewport.width}x${viewport.height}: ${layout.documentScrollWidth}px`,
    );

    assert(
      layout.stage?.width >= layout.viewportWidth * 0.72,
      `Stage is too narrow at ${viewport.width}x${viewport.height}: ${layout.stage?.width}px`,
    );

    assert(
      layout.stage?.height >= Math.min(300, layout.viewportHeight * 0.45),
      `Stage is too short at ${viewport.width}x${viewport.height}: ${layout.stage?.height}px`,
    );

    assert(layout.play?.width >= 44 && layout.play?.height >= 44);
    assert(layout.reset?.width >= 44 && layout.reset?.height >= 44);

    assert(
      layout.hud?.width <= layout.stage.width * 0.96,
      "Physics HUD is wider than the usable stage.",
    );
    assert(
      layout.hud?.height <= layout.stage.height * 0.38,
      `Physics HUD dominates the stage at ${viewport.width}x${viewport.height}.`,
    );

    assert(
      !["auto", "scroll"].includes(layout.controlsOverflowY),
      "Controls panel must not create a nested vertical scroller.",
    );

    assert.equal(pageErrors.length, 0, pageErrors.join("\n"));

    const blockingConsoleErrors = consoleErrors.filter(
      (message) =>
        !message.includes("favicon") &&
        !message.includes("Failed to load resource") &&
        !message.includes("WebGL"),
    );
    assert.equal(
      blockingConsoleErrors.length,
      0,
      blockingConsoleErrors.join("\n"),
    );

    const screenshotPath = path.join(
      screenshotDir,
      `gyroscope-${viewport.width}x${viewport.height}.png`,
    );
    await page.screenshot({
      path: screenshotPath,
      fullPage: true,
    });

    console.log(
      `GYROSCOPE V2 RESPONSIVE PASS ${viewport.width}x${viewport.height}`,
      layout,
    );

    await page.close();
  }

  console.log("GYROSCOPE V2 RESPONSIVE UX TEST PASSED");
} finally {
  await browser.close();
}
