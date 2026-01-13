/* scripts/sim-spec.cjs */
const fs = require("fs");
const path = require("path");
const readline = require("readline/promises");
const { stdin: input, stdout: output } = require("process");

function safeNum(v, fallback) {
  const n = Number(String(v ?? "").trim());
  return Number.isFinite(n) ? n : fallback;
}

/**
 * Normalize folder input like:
 * - remove wrapping quotes "..."/'...'
 * - replace backslashes with slashes
 * - remove leading slashes
 * - collapse multiple slashes
 */
function normalizeRelPath(inputStr) {
  return String(inputStr || "")
    .trim()
    .replace(/^["']+|["']+$/g, "")
    .replace(/\\/g, "/")
    .replace(/^\/+/, "")
    .replace(/\/+/g, "/")
    .trim();
}

function mdEscape(s) {
  return String(s ?? "")
    .replace(/\r/g, "")
    .trim();
}

// Markdown table cell escape (prevents breaking table with "|")
function mdCell(v) {
  return mdEscape(v).replace(/\|/g, "\\|");
}

function buildSpecMd(spec) {
  const s = spec;

  const controlsRows = (s.controls || [])
    .map((c) => {
      return `| ${mdCell(c.key)} | ${mdCell(c.label)} | ${mdCell(
        c.type
      )} | ${mdCell(c.unit || "")} | ${mdCell(c.default)} | ${mdCell(
        c.min ?? ""
      )} | ${mdCell(c.max ?? "")} | ${mdCell(c.step ?? "")} | ${mdCell(
        c.notes || ""
      )} |`;
    })
    .join("\n");

  const outputsRows = (s.outputs || [])
    .map(
      (o) =>
        `| ${mdCell(o.key)} | ${mdCell(o.label)} | ${mdCell(
          o.unit || ""
        )} | ${mdCell(o.formula || "")} |`
    )
    .join("\n");

  const chartKeys = (s.charts?.seriesKeys || []).join(", ");

  return `# Simulation Spec — ${mdEscape(s.title)}

**Registry Key:** ${mdEscape(s.registryKey)}
**Folder:** ${mdEscape(s.folder)}
**Subtitle:** ${mdEscape(s.subtitle || "")}

---

## 1) Goal
${mdEscape(s.goal || "")}

---

## 2) Units & Timing
- length: m
- time: s
- mass: kg
- pxPerMeter: ${mdEscape(s.render?.pxPerMeter)}
- MAX_DT: ${mdEscape(s.timing?.maxDt)}
- UI_HZ: ${mdEscape(s.timing?.uiHz)}
- sampleRate: ${mdEscape(s.charts?.sampleRate)} Hz
- windowSec: ${mdEscape(s.charts?.windowSec)} s
- maxPoints: ${mdEscape(s.charts?.maxPoints)}

---

## 3) Inputs (UI Controls)
| key | label | type | unit | default | min | max | step | notes |
|---|---|---|---|---:|---:|---:|---:|---|
${controlsRows || "|  |  |  |  |  |  |  |  |  |"}

Buttons:
- Start/Stop
- Reset

---

## 4) Outputs (HUD)
| key | label | unit | formula / definition |
|---|---|---|---|
${outputsRows || "|  |  |  |  |"}

---

## 5) Charts
Series keys: ${chartKeys || "—"}

Sampling policy:
- sampleRate: ${mdEscape(s.charts?.sampleRate)} Hz
- windowSec: ${mdEscape(s.charts?.windowSec)} s
- maxPoints: ${mdEscape(s.charts?.maxPoints)}

---

## 6) Physics / Logic
${mdEscape(s.physics || "")}

---

## 7) Acceptance Checks (Manual)
${
  (s.tests || []).length
    ? (s.tests || [])
        .map((t, i) => {
          return `### Test Case ${i + 1}
Inputs:
${mdEscape(t.inputs || "")}

Expected:
${mdEscape(t.expected || "")}
`;
        })
        .join("\n")
    : "- [ ] Add at least 2 numeric test cases"
}

`;
}

async function main() {
  const rl = readline.createInterface({ input, output });

  try {
    const registryKey = (await rl.question("Registry key: ")).trim();

    const folderRel = normalizeRelPath(
      await rl.question(
        "Simulation folder under src/simulations/subjects (e.g. physics/mechanics/two-body): "
      )
    );

    if (!folderRel) {
      throw new Error("Folder path is required.");
    }
    if (folderRel.includes("..")) {
      throw new Error("Invalid folder path: '..' segments are not allowed.");
    }

    const folder = `src/simulations/subjects/${folderRel}`;
    const absFolder = path.join(process.cwd(), folder);

    // IMPORTANT: Do NOT create missing simulation folder.
    // Generator should create it first. This prevents writing spec into wrong places.
    if (!fs.existsSync(absFolder)) {
      throw new Error(
        `Simulation folder not found:\n${absFolder}\n\nRun generator first:\n  npm run gen  (choose "simulation")\n`
      );
    }

    const title = (await rl.question("Title: ")).trim();
    const subtitle = (await rl.question("Subtitle (optional): ")).trim();

    const goal = await rl.question("Goal (2-3 lines): ");

    const pxPerMeter = safeNum(
      await rl.question("pxPerMeter (default 60): "),
      60
    );
    const maxDt = safeNum(
      await rl.question("MAX_DT (default 0.0333): "),
      1 / 30
    );
    const uiHz = safeNum(await rl.question("UI_HZ (default 12): "), 12);

    const sampleRate = safeNum(
      await rl.question("Chart sampleRate Hz (default 30): "),
      30
    );
    const windowSec = safeNum(
      await rl.question("Chart windowSec (default 10): "),
      10
    );
    const maxPoints = Math.max(60, Math.floor(sampleRate * windowSec));

    const controlsCount = safeNum(
      await rl.question("How many controls? (default 3): "),
      3
    );

    const controls = [];
    for (let i = 0; i < controlsCount; i++) {
      output.write(`\n--- Control ${i + 1} ---\n`);
      const key = (await rl.question("key (e.g. mass1): ")).trim();
      const label = (await rl.question("label (e.g. Mass 1): ")).trim();
      const type =
        (await rl.question("type (number/toggle/select) [number]: ")).trim() ||
        "number";
      const unit = (await rl.question("unit (optional): ")).trim();

      const def = safeNum(await rl.question("default: "), 0);

      const minRaw = (await rl.question("min (optional): ")).trim();
      const maxRaw = (await rl.question("max (optional): ")).trim();
      const stepRaw = (await rl.question("step (optional): ")).trim();

      const notes = (await rl.question("notes/help (optional): ")).trim();

      controls.push({
        key,
        label,
        type,
        unit,
        default: def,
        min: minRaw === "" ? null : safeNum(minRaw, null),
        max: maxRaw === "" ? null : safeNum(maxRaw, null),
        step: stepRaw === "" ? null : safeNum(stepRaw, null),
        notes,
      });
    }

    const outputsCount = safeNum(
      await rl.question("\nHow many HUD outputs? (default 5): "),
      5
    );

    const outputs = [];
    for (let i = 0; i < outputsCount; i++) {
      output.write(`\n--- Output ${i + 1} ---\n`);
      const key = (await rl.question("key (e.g. t): ")).trim();
      const label = (await rl.question("label (e.g. time): ")).trim();
      const unit = (await rl.question("unit (optional): ")).trim();
      const formula = (
        await rl.question("formula/definition (optional): ")
      ).trim();
      outputs.push({ key, label, unit, formula });
    }

    const seriesKeysRaw = await rl.question(
      "\nChart series keys (comma separated, e.g. vx,vy,ax,ay): "
    );
    const seriesKeys = String(seriesKeysRaw || "")
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);

    const physics = await rl.question(
      "\nPhysics/Logic notes (can be short now): "
    );

    const tests = [];
    const wantTests = (
      await rl.question("\nAdd 2 quick numeric test cases now? (y/n) [y]: ")
    )
      .trim()
      .toLowerCase();

    if (wantTests !== "n") {
      for (let i = 0; i < 2; i++) {
        output.write(`\n--- Test Case ${i + 1} ---\n`);
        const inputsText = await rl.question("Inputs: ");
        const expectedText = await rl.question("Expected: ");
        tests.push({
          inputs: String(inputsText || "").trim(),
          expected: String(expectedText || "").trim(),
        });
      }
    }

    const spec = {
      title,
      subtitle,
      registryKey,
      folder,
      render: { stack: "canvas2d", pxPerMeter },
      timing: { maxDt, uiHz },
      goal: String(goal || "").trim(),
      controls,
      outputs,
      charts: { sampleRate, windowSec, maxPoints, seriesKeys },
      physics: String(physics || "").trim(),
      tests,
      generatedAt: new Date().toISOString(),
    };

    const jsonPath = path.join(absFolder, "spec.json");
    const mdPath = path.join(absFolder, "spec.md");

    fs.writeFileSync(jsonPath, JSON.stringify(spec, null, 2), "utf8");
    fs.writeFileSync(mdPath, buildSpecMd(spec), "utf8");

    console.log("\n✅ Wrote:");
    console.log(" - " + jsonPath);
    console.log(" - " + mdPath);
  } finally {
    rl.close();
  }
}

main().catch((e) => {
  console.error("❌ spec wizard failed:", e?.message || e);
  process.exit(1);
});
