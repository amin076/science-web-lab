/* plopfile.cjs */
const path = require("path");
const fs = require("fs");

function pascalCase(str) {
  return String(str || "")
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("");
}

/**
 * Normalize folder input like:
 * - remove wrapping quotes "..."/'...'
 * - replace backslashes with slashes
 * - remove leading slashes
 * - collapse multiple slashes
 */
function normalizeRelPath(input) {
  return String(input || "")
    .trim()
    .replace(/^["']+|["']+$/g, "")
    .replace(/\\/g, "/")
    .replace(/^\/+/, "")
    .replace(/\/+/g, "/")
    .trim();
}

function validateRegistryKey(v) {
  const s = String(v || "").trim();
  if (!s) return "Required.";
  if (!s.includes(".")) return "Must include dots, e.g. physics.mechanics.xxx";
  if (s.includes(" ")) return "No spaces allowed.";
  if (!/^[a-z0-9._-]+$/i.test(s))
    return "Use only letters/numbers/dot/underscore/dash.";
  return true;
}

function validateRelativePath(v) {
  const s = normalizeRelPath(v);
  if (!s) return "Required.";
  if (s.includes('"') || s.includes("'")) return "Do not use quotes.";
  if (s.includes("..")) return "No '..' segments allowed.";
  if (s.startsWith("/")) return "Use a relative path like physics/mechanics/x";
  if (!/^[a-z0-9/_-]+$/i.test(s))
    return "Use only letters/numbers/_- and slashes.";
  return true;
}

function exists(p) {
  try {
    fs.accessSync(p, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

function readText(p) {
  return fs.readFileSync(p, "utf8");
}

/**
 * Wrap file content safely.
 * Use 4 backticks so inner ``` blocks won't break the pack.
 */
function fencedFile(rel, content) {
  const lang = rel.endsWith(".md")
    ? "md"
    : rel.endsWith(".jsx")
    ? "jsx"
    : rel.endsWith(".js")
    ? "js"
    : "txt";
  return `\n## File: \`${rel}\`\n\n\`\`\`\`${lang}\n${content}\n\`\`\`\`\n`;
}

function buildAiPack({
  repoRoot,
  simDirRel,
  registryKey,
  title,
  subtitle,
  engine,
  addSpec,
  addScaffold,
}) {
  const simDirAbs = path.resolve(repoRoot, simDirRel);

  const header = `# AI Pack — ${title || "Simulation"}

This file is a **single-source context pack** for any AI.
It contains:
- project rules (do/don't)
- the simulation spec (if present)
- the actual template/scaffold code in this folder

---

## Project Rules (DO NOT VIOLATE)
- Do NOT change routing.
- Keep entry file \`index.jsx\` exporting default.
- Use \`SimulationShell\` (left stage + right panel).
- Right panel: fixed top controls + scrollable body.
- Keep files flat in this simulation folder (no nested folders for this template).
- Use Canvas 2D approach (current focus).
- Provide FULL FILE CONTENT for every file you change.

---

## Metadata
- Registry Key: ${registryKey || "(unknown)"}
- Folder: ${simDirRel}
- Engine: ${engine || "canvas2d"}
- Subtitle: ${subtitle || ""}
- addSpec: ${String(!!addSpec)}
- addScaffold: ${String(!!addScaffold)}

---

## How to use with any AI
1) Paste this entire file.
2) Paste your filled \`spec.md\` content (or fill it here).
3) Ask AI to ONLY edit these files inside this folder.
4) Ask for FULL FILE CONTENT outputs.

---

`;

  // Candidate files (flat)
  const candidates = [
    "index.jsx",
    // main simulation component will be discovered dynamically below too
    "README.md",
    "spec.md",
    "constants.js",
    "schema.js",
    "useSimLoop.js",
    "Controls.jsx",
    "HUD.jsx",
    "Charts.jsx",
  ];

  // Discover the main Simulation component file in folder:
  // Prefer "*Simulation.jsx" excluding index.jsx
  let discoveredMain = null;
  try {
    const items = fs.readdirSync(simDirAbs, { withFileTypes: true });
    const simFiles = items
      .filter((d) => d.isFile())
      .map((d) => d.name)
      .filter((n) => n.endsWith(".jsx") && n !== "index.jsx")
      .filter((n) => /Simulation\.jsx$/i.test(n));
    if (simFiles.length) discoveredMain = simFiles[0];
  } catch {
    // ignore
  }

  const files = [];
  if (discoveredMain) files.push(discoveredMain);
  files.push(...candidates);

  // De-dup while keeping order
  const uniq = [];
  const seen = new Set();
  for (const f of files) {
    if (!seen.has(f)) {
      seen.add(f);
      uniq.push(f);
    }
  }

  let body = header;

  for (const filename of uniq) {
    const abs = path.resolve(simDirAbs, filename);
    const rel = path.posix.join(simDirRel, filename);

    if (!exists(abs)) continue;

    const content = readText(abs);
    body += fencedFile(rel, content);
  }

  return body;
}

module.exports = function (plop) {
  plop.setHelper("pascalCase", pascalCase);

  /**
   * Custom action: write/overwrite ai-pack.md in the simulation folder.
   */
  plop.setActionType("writeAiPack", (answers, config, plopApi) => {
    const repoRoot = process.cwd();

    const simDirRel = config?.simDirRel;
    if (!simDirRel) {
      throw new Error("writeAiPack: missing simDirRel");
    }

    const simDirAbs = path.resolve(repoRoot, simDirRel);
    if (!exists(simDirAbs)) {
      throw new Error(`writeAiPack: folder not found: ${simDirRel}`);
    }

    const pack = buildAiPack({
      repoRoot,
      simDirRel,
      registryKey: answers.registryKey,
      title: answers.title,
      subtitle: answers.subtitle,
      engine: answers.engine,
      addSpec: answers.addSpec,
      addScaffold: answers.addScaffold,
    });

    const outAbs = path.resolve(simDirAbs, "ai-pack.md");
    fs.writeFileSync(outAbs, pack, "utf8");

    return `Created/updated: ${path.posix.join(simDirRel, "ai-pack.md")}`;
  });

  // -------------------------
  // Generator 1: simulation
  // -------------------------
  plop.setGenerator("simulation", {
    description:
      "Generate a new simulation folder + register it in registry & experiments (and create ai-pack.md)",
    prompts: [
      {
        type: "input",
        name: "registryKey",
        message:
          'Simulation Registry Key (e.g. "physics.mechanics.circular-motion"):',
        validate: validateRegistryKey,
      },
      {
        type: "input",
        name: "relativePath",
        message:
          'Simulation folder path under src/simulations/subjects (e.g. "physics/mechanics/circular-motion"):',
        filter: normalizeRelPath,
        validate: validateRelativePath,
      },
      {
        type: "list",
        name: "engine",
        message: "Simulation engine/template:",
        choices: [
          { name: "Canvas 2D (recommended)", value: "canvas2d" },
          { name: "Three.js / R3F (3D)", value: "three" },
          { name: "p5.js", value: "p5" },
        ],
        default: "canvas2d",
      },
      {
        type: "input",
        name: "title",
        message: 'Title (e.g. "Uniform Circular Motion"):',
        validate: (v) => (!!String(v || "").trim() ? true : "Required"),
      },
      {
        type: "input",
        name: "subtitle",
        message: "Subtitle (optional):",
        default: "",
      },
      {
        type: "input",
        name: "desc",
        message: "Experiment card description:",
        default: "Interactive simulation.",
      },
      {
        type: "list",
        name: "subject",
        message: "Subject label:",
        choices: [
          "Physics",
          "Astronomy",
          "Earth Science",
          "Chemistry",
          "Biology",
          "Math",
        ],
        default: "Physics",
      },
      {
        type: "list",
        name: "iconName",
        message: "Which icon to use in experiments card?",
        choices: [
          "ScienceIcon",
          "SpeedIcon",
          "CompareArrowsIcon",
          "WavesIcon",
          "ElectricBoltIcon",
          "PublicIcon",
          "ShowChartIcon",
          "VisibilityIcon",
          "BlurOnIcon",
          "OpacityIcon",
          "GraphicEqIcon",
        ],
        default: "ScienceIcon",
      },
      {
        type: "input",
        name: "gradient",
        message:
          "Card gradient (CSS). Example: linear-gradient(135deg, #0ea5e9, #22d3ee)",
        default: "linear-gradient(135deg, #0ea5e9, #22d3ee)",
      },
      {
        type: "confirm",
        name: "addSpec",
        message: "Add spec.md (prompt contract for AI)?",
        default: true,
      },
      {
        type: "confirm",
        name: "addScaffold",
        message:
          "Add scaffold files (constants, schema, loop, controls, HUD, charts)?",
        default: true,
      },
      {
        type: "confirm",
        name: "addAiPack",
        message: "Create ai-pack.md (bundle spec + all files for any AI)?",
        default: true,
      },
    ],

    actions: (data) => {
      data.registryKey = String(data.registryKey || "").trim();
      data.relativePath = normalizeRelPath(data.relativePath);

      const lastSegment = data.relativePath
        .split("/")
        .filter(Boolean)
        .slice(-1)[0];

      const componentBase = pascalCase(lastSegment);
      data.componentName = `${componentBase}Simulation`;

      const simDirRel = path.posix.join(
        "src/simulations/subjects",
        data.relativePath
      );

      // Template selection by engine
      const simTemplate =
        data.engine === "three"
          ? "plop-templates/simulation/Simulation.three.jsx.hbs"
          : data.engine === "p5"
          ? "plop-templates/simulation/Simulation.p5.jsx.hbs"
          : "plop-templates/simulation/Simulation.jsx.hbs";

      const actions = [
        // Core files
        {
          type: "add",
          path: `${simDirRel}/index.jsx`,
          templateFile: "plop-templates/simulation/index.jsx.hbs",
          abortOnFail: true,
        },
        {
          type: "add",
          path: `${simDirRel}/${data.componentName}.jsx`,
          templateFile: simTemplate,
          abortOnFail: true,
        },
        {
          type: "add",
          path: `${simDirRel}/README.md`,
          templateFile: "plop-templates/simulation/README.md.hbs",
          abortOnFail: true,
        },
      ];

      // Optional: spec.md
      if (data.addSpec) {
        actions.push({
          type: "add",
          path: `${simDirRel}/spec.md`,
          templateFile: "plop-templates/simulation/spec.md.hbs",
          abortOnFail: true,
        });
      }

      // Optional: scaffold (flat)
      if (data.addScaffold) {
        actions.push(
          {
            type: "add",
            path: `${simDirRel}/constants.js`,
            templateFile: "plop-templates/simulation/constants.js.hbs",
            abortOnFail: true,
            skipIfExists: true,
          },
          {
            type: "add",
            path: `${simDirRel}/schema.js`,
            templateFile: "plop-templates/simulation/schema.js.hbs",
            abortOnFail: true,
            skipIfExists: true,
          },
          {
            type: "add",
            path: `${simDirRel}/useSimLoop.js`,
            templateFile: "plop-templates/simulation/useSimLoop.js.hbs",
            abortOnFail: true,
            skipIfExists: true,
          },
          {
            type: "add",
            path: `${simDirRel}/Controls.jsx`,
            templateFile: "plop-templates/simulation/Controls.jsx.hbs",
            abortOnFail: true,
            skipIfExists: true,
          },
          {
            type: "add",
            path: `${simDirRel}/HUD.jsx`,
            templateFile: "plop-templates/simulation/HUD.jsx.hbs",
            abortOnFail: true,
            skipIfExists: true,
          },
          {
            type: "add",
            path: `${simDirRel}/Charts.jsx`,
            templateFile: "plop-templates/simulation/Charts.jsx.hbs",
            abortOnFail: true,
            skipIfExists: true,
          }
        );
      }

      // Register in simulation registry
      actions.push({
        type: "modify",
        path: "src/simulations/registry/index.js",
        transform: (content) => {
          const keyStr = `"${data.registryKey}"`;
          if (content.includes(keyStr)) return content;

          const importPath = `@/simulations/subjects/${data.relativePath}`;
          const line =
            `  "${data.registryKey}": lazyWithRetry(() =>\n` +
            `    import("${importPath}")\n` +
            `  ),\n`;

          const replaced = content.replace(/};\s*$/m, `${line}};\n`);
          if (replaced === content) return content + "\n" + line;
          return replaced;
        },
      });

      // Add to experiments (use marker if present)
      actions.push({
        type: "modify",
        path: "src/data/experiments.js",
        transform: (content) => {
          if (content.includes(`id: "${data.registryKey}"`)) return content;

          const block =
            `  {\n` +
            `    id: "${data.registryKey}",\n` +
            `    subject: "${data.subject}",\n` +
            `    name: "${data.title}",\n` +
            `    desc: "${data.desc}",\n` +
            `    Icon: ${data.iconName},\n` +
            `    gradient: "${data.gradient}",\n` +
            `    demo: true,\n` +
            `  },\n`;

          const marker = "// PLOP:INSERT:EXPERIMENTS";
          if (content.includes(marker)) {
            return content.replace(marker, `${marker}\n${block}`);
          }

          const replaced = content.replace(/\];\s*$/m, `${block}];\n`);
          if (replaced === content) return content + "\n" + block;
          return replaced;
        },
      });

      // Finally: write ai-pack.md (after files exist)
      if (data.addAiPack) {
        actions.push({
          type: "writeAiPack",
          simDirRel,
        });
      }

      return actions;
    },
  });

  // -------------------------
  // Generator 2: sim-pack (for existing folders)
  // -------------------------
  plop.setGenerator("sim-pack", {
    description: "Create/refresh ai-pack.md for an existing simulation folder",
    prompts: [
      {
        type: "input",
        name: "relativePath",
        message:
          'Existing simulation folder path under src/simulations/subjects (e.g. "physics/mechanics/circular-motion"):',
        filter: normalizeRelPath,
        validate: validateRelativePath,
      },
      {
        type: "input",
        name: "registryKey",
        message: "Registry key (optional, for metadata only):",
        default: "",
      },
      {
        type: "input",
        name: "title",
        message: "Title (optional, for metadata only):",
        default: "",
      },
      {
        type: "input",
        name: "subtitle",
        message: "Subtitle (optional, for metadata only):",
        default: "",
      },
    ],
    actions: (data) => {
      const simDirRel = path.posix.join(
        "src/simulations/subjects",
        normalizeRelPath(data.relativePath)
      );

      return [
        {
          type: "writeAiPack",
          simDirRel,
        },
      ];
    },
  });
};
