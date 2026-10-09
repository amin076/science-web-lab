import assert from "node:assert/strict";
import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
try {
  for (const width of [360, 600, 900, 1440]) {
    const page = await browser.newPage({ viewport: { width, height: 700 } });
    await page.goto((process.env.ESBIKO_TEST_BASE_URL || "http://127.0.0.1:4173") +
      "/experiments/physics.mechanics.circular-motion/run?embed=mcp-app",
      { waitUntil: "domcontentloaded" });
    const canvas = page.locator(".circular-record-canvas");
    await canvas.waitFor({ state: "visible" });
    await page.waitForFunction(() => {
      const c = document.querySelector(".circular-record-canvas");
      if (!c) return false;
      const r = c.getBoundingClientRect();
      return r.width > 0 && r.height > 0 && Math.abs(c.width / c.height - r.width / r.height) < 0.02;
    }, null, { timeout: 10000 });
    const result = await canvas.evaluate(c => {
      const r = c.getBoundingClientRect();
      return { pixelRatio: c.width / c.height, cssRatio: r.width / r.height,
        width: r.width, height: r.height };
    });
    assert(Math.abs(result.pixelRatio / result.cssRatio - 1) < 0.02,
      "Circular orbit distorted at " + width + ": " + JSON.stringify(result));
    console.log("CIRCULAR ASPECT PASS", width, result);
    await page.close();
  }
} finally {
  await browser.close();
}
