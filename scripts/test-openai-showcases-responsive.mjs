import assert from "node:assert/strict";
import { chromium } from "playwright";

const baseUrl = process.env.ESBIKO_TEST_BASE_URL || "http://127.0.0.1:4173";

const cases = [
  {
    name: "Solar System",
    path:
      "/experiments/astronomy.space.solar-system/run" +
      "?embed=mcp-app" +
      "&mcp.speed=5" +
      "&mcp.scaleMode=educational" +
      "&mcp.focusTarget=earth" +
      "&mcp.showTrails=true" +
      "&mcp.showOrbits=true" +
      "&mcp.showAxis=false" +
      "&mcp.showStars=true" +
      "&mcp.showLabels=true",
    stage: '[data-agent-surface="solar-system-stage"]',
  },
  {
    name: "3D Orbit Lab",
    path:
      "/experiments/astronomy.space.earth-orbit-lab/run" +
      "?embed=mcp-app" +
      "&mcp.simMode=educational" +
      "&mcp.timeScale=200" +
      "&mcp.showTrails=true" +
      "&mcp.showVectors=true" +
      "&mcp.showLOS=false" +
      "&mcp.showOrbits=true" +
      "&mcp.showOnlyVisible=false" +
      "&mcp.showMoon=true" +
      "&mcp.showLagrangePoints=true" +
      "&mcp.showLabels=true" +
      "&mcp.telescopeLat=-37.8136" +
      "&mcp.telescopeLon=144.9631",
    stage: '[data-agent-surface="earth-orbit-stage"]',
  },
];

const viewports = [
  { width: 360, height: 500 },
  { width: 600, height: 600 },
  { width: 900, height: 650 },
  { width: 1280, height: 720 },
];

const browser = await chromium.launch({
  headless: true,
  args: ["--use-gl=swiftshader", "--enable-webgl", "--ignore-gpu-blocklist"],
});

try {
  for (const testCase of cases) {
    for (const viewport of viewports) {
      const page = await browser.newPage({ viewport });
      const pageErrors = [];
      const consoleErrors = [];

      page.on("pageerror", (error) => pageErrors.push(String(error)));
      page.on("console", (message) => {
        if (message.type() === "error") consoleErrors.push(message.text());
      });

      await page.goto(baseUrl + testCase.path, {
        waitUntil: "networkidle",
        timeout: 60_000,
      });

      const stage = page.locator(testCase.stage);
      const reset = page.locator('[data-agent-action="reset"]').first();
      const runningAction = page
        .locator(
          '[data-agent-action="pause"], [data-agent-action="play"]',
        )
        .first();

      try {
        await stage.waitFor({ state: "visible", timeout: 30_000 });
        await runningAction.waitFor({ state: "attached", timeout: 10_000 });
        await reset.waitFor({ state: "attached", timeout: 10_000 });
        await runningAction.scrollIntoViewIfNeeded();
        await reset.scrollIntoViewIfNeeded();
      } catch (error) {
        const diagnostics = await page.evaluate(() => ({
          url: window.location.href,
          title: document.title,
          bodyText: document.body?.innerText?.slice(0, 3000) || "",
          html: document.documentElement?.outerHTML?.slice(0, 5000) || "",
        }));

        console.error(
          "SHOWCASE RESPONSIVE LOAD DIAGNOSTICS",
          testCase.name,
          viewport,
          diagnostics,
          { pageErrors, consoleErrors },
        );
        throw error;
      }

      const layout = await page.evaluate(
        ({ stageSelector }) => {
          const stageEl = document.querySelector(stageSelector);
          const actionEl = document.querySelector(
            '[data-agent-action="pause"], [data-agent-action="play"]',
          );
          const resetEl = document.querySelector('[data-agent-action="reset"]');

          const rect = (element) => {
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
            bodyScrollWidth: document.documentElement.scrollWidth,
            viewportWidth: window.innerWidth,
            stage: rect(stageEl),
            runningAction: rect(actionEl),
            reset: rect(resetEl),
          };
        },
        { stageSelector: testCase.stage },
      );

      assert(
        layout.bodyScrollWidth <= layout.viewportWidth + 1,
        `${testCase.name} horizontal overflow at ${viewport.width}x${viewport.height}: ${layout.bodyScrollWidth}px`,
      );
      assert(layout.stage?.width > 0 && layout.stage?.height > 0);
      assert(layout.runningAction?.width >= 44 && layout.runningAction?.height >= 44);
      assert(layout.reset?.width >= 44 && layout.reset?.height >= 44);
      assert.equal(pageErrors.length, 0, pageErrors.join("\n"));

      const blockingConsoleErrors = consoleErrors.filter(
        (message) =>
          !message.includes("favicon") &&
          !message.includes("Failed to load resource") &&
          !message.includes("WebXR"),
      );

      assert.equal(
        blockingConsoleErrors.length,
        0,
        blockingConsoleErrors.join("\n"),
      );

      console.log(
        `SHOWCASE RESPONSIVE PASS ${testCase.name} ${viewport.width}x${viewport.height}`,
        layout,
      );

      await page.close();
    }
  }

  console.log("OPENAI SHOWCASE RESPONSIVE TEST PASSED");
} finally {
  await browser.close();
}
