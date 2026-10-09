import assert from "node:assert/strict";
import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true, args: ["--use-gl=swiftshader","--enable-webgl","--ignore-gpu-blocklist"] });
try {
  for (const width of [360, 600, 900]) {
    const page = await browser.newPage({ viewport: { width, height: 650 } });
    await page.goto((process.env.ESBIKO_TEST_BASE_URL || "http://127.0.0.1:4173") +
      "/experiments/astronomy.space.earth-orbit-lab/run?embed=mcp-app", { waitUntil: "domcontentloaded", timeout: 60000 });
    const stage = page.locator('[data-agent-surface="earth-orbit-stage"]');
    await stage.waitFor({ state: "visible" });
    const root = stage.locator("..");
    await page.getByText("Space Object Catalog").waitFor({ state: "attached" });
    const data = await root.evaluate(el => {
      const scroll = getComputedStyle(el).overflowY;
      const before = el.scrollTop;
      el.scrollTop = el.scrollHeight;
      return { scroll, before, after: el.scrollTop, height: el.clientHeight, scrollHeight: el.scrollHeight };
    });
    assert.equal(data.scroll, "auto", "Mobile root must own scrolling: " + width);
    assert(data.scrollHeight > data.height + 100 && data.after > 100,
      "Mobile controls cannot be scrolled into view: " + JSON.stringify({ width, data }));
    await page.getByRole("slider", { name: "Orbit time scale" }).scrollIntoViewIfNeeded();
    assert(await page.getByRole("slider", { name: "Orbit time scale" }).isVisible());
    console.log("ORBIT LAB MOBILE SCROLL PASS", width, data.after);
    await page.close();
  }
} finally { await browser.close(); }
