import assert from "node:assert/strict";
import { chromium } from "playwright";

const base = process.env.ESBIKO_TEST_BASE_URL || "http://127.0.0.1:4173";
const browser = await chromium.launch({ headless: true });
try {
  for (const width of [360, 600, 900, 1440]) {
    const page = await browser.newPage({ viewport: { width, height: 650 } });
    const errors = [];
    page.on("pageerror", err => errors.push(String(err)));
    await page.goto(base + "/experiments/physics.acoustics.doppler/run?embed=mcp-app",
      { waitUntil: "domcontentloaded", timeout: 60000 });
    const stage = page.getByTestId("doppler-stage");
    const controls = page.locator("aside").filter({ hasText: "Doppler Lab" }).first();
    await stage.waitFor({ state: "visible" });
    await controls.waitFor({ state: "visible" });
    const positions = await page.evaluate(() => {
      const stage = document.querySelector('[data-testid="doppler-stage"]');
      const controls = Array.from(document.querySelectorAll("aside")).find(el => el.textContent.includes("Doppler Lab"));
      const root = stage.parentElement;
      const s = stage.getBoundingClientRect(), c = controls.getBoundingClientRect();
      return { stage: { x: s.x, y: s.y, width: s.width, height: s.height, bottom: s.bottom, right: s.right },
        controls: { x: c.x, y: c.y, width: c.width, top: c.top },
        rootOverflow: getComputedStyle(root).overflowY,
        scrollHeight: root.scrollHeight, clientHeight: root.clientHeight };
    });
    if (width < 1280) {
      assert(positions.stage.width >= width - 4,
        "Stage must fill mobile width: " + JSON.stringify({ width, positions }));
      assert(positions.controls.top >= positions.stage.bottom - 2,
        "Mobile controls must be below stage: " + JSON.stringify({ width, positions }));
      assert.equal(positions.rootOverflow, "auto");
      assert(positions.scrollHeight > positions.clientHeight + 150,
        "Mobile page must have reachable scroll range: " + JSON.stringify({ width, positions }));
      const scrolled = await stage.evaluate(el => {
        const root = el.parentElement;
        root.scrollTop = root.scrollHeight;
        return root.scrollTop;
      });
      assert(scrolled > 100, "Scrolling is locked at " + width);
      await page.getByText(/2D Sound Sources/i).first().scrollIntoViewIfNeeded();
    } else {
      assert(positions.controls.x >= positions.stage.right - 2,
        "Desktop controls must remain beside stage: " + JSON.stringify(positions));
    }
    assert.deepEqual(errors, [], "Browser errors at " + width);
    console.log("DOPPLER RESPONSIVE PASS", width, JSON.stringify(positions));
    await page.close();
  }
} finally { await browser.close(); }
