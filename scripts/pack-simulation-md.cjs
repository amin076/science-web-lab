#!/usr/bin/env node
/* scripts/pack-simulation-md.cjs
 *
 * Packs a simulation folder (including all subfolders/files) into ONE Markdown file
 * so an AI can review/improve the simulation with full context.
 *
 * Output includes:
 * - A top explanation block for the AI (what this file is + what to do)
 * - A file tree
 * - Contents of every text file under the simulation folder
 * - Root package.json content
 *
 * Run:
 *   npm run pack:sim
 *   npm run pack:sim -- --sim "src/simulations/subjects/physics/..." --out "packed.md"
 */

const fs = require("fs");
const path = require("path");
const readline = require("readline/promises");
const { stdin: input, stdout: output } = require("process");

function parseArgs(argv) {
  const args = {
    sim: "",
    out: "",
    maxBytes: 1024 * 1024,
    includePackage: true,
  };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--sim" || a === "-s") args.sim = argv[++i] || "";
    else if (a === "--out" || a === "-o") args.out = argv[++i] || "";
    else if (a === "--max-bytes")
      args.maxBytes = Number(argv[++i] || args.maxBytes);
    else if (a === "--no-package") args.includePackage = false;
    else if (a === "--help" || a === "-h") args.help = true;
  }
  return args;
}

function usage() {
  return `
pack-simulation-md.cjs

Packs a simulation folder (recursive) into a single Markdown file for AI review.

Options:
  --sim, -s         Path to simulation folder (relative to repo root)
  --out, -o         Output markdown file (default: <sim-folder-name>.pack.md in repo root)
  --max-bytes       Skip embedding file content if file is larger than this (default: 1048576)
  --no-package      Do not include root package.json
  --help, -h        Show help

Examples:
  npm run pack:sim
  npm run pack:sim -- --sim "src/simulations/subjects/physics/mechanics/two-body-gravity" --out "two-body-gravity.pack.md"
`.trim();
}

function isProbablyBinary(buf) {
  const sample = buf.subarray(0, Math.min(buf.length, 8000));
  for (const b of sample) if (b === 0) return true;
  return false;
}

function extToLang(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const map = {
    ".js": "js",
    ".cjs": "js",
    ".mjs": "js",
    ".jsx": "jsx",
    ".ts": "ts",
    ".tsx": "tsx",
    ".json": "json",
    ".md": "md",
    ".css": "css",
    ".scss": "scss",
    ".html": "html",
    ".yml": "yaml",
    ".yaml": "yaml",
    ".xml": "xml",
    ".svg": "svg",
    ".txt": "text",
    ".env": "text",
  };
  return map[ext] || "";
}

function pickFence(content) {
  let maxRun = 0;
  let run = 0;
  for (let i = 0; i < content.length; i++) {
    if (content[i] === "`") {
      run++;
      if (run > maxRun) maxRun = run;
    } else run = 0;
  }
  const len = Math.max(3, maxRun + 1);
  return "`".repeat(len);
}

function shouldIgnore(relPath) {
  const parts = relPath.split(path.sep);
  const ignoreDirs = new Set([
    "node_modules",
    ".git",
    "dist",
    "build",
    "coverage",
    ".next",
    ".vite",
    ".cache",
  ]);
  const ignoreFiles = new Set([".DS_Store", "Thumbs.db"]);

  if (parts.some((p) => ignoreDirs.has(p))) return true;
  if (ignoreFiles.has(path.basename(relPath))) return true;

  return false;
}

function walkFiles(dirAbs, baseAbs) {
  const out = [];
  const stack = [dirAbs];

  while (stack.length) {
    const cur = stack.pop();
    const entries = fs.readdirSync(cur, { withFileTypes: true });

    for (const ent of entries) {
      const abs = path.join(cur, ent.name);
      const rel = path.relative(baseAbs, abs);
      if (shouldIgnore(rel)) continue;

      if (ent.isDirectory()) stack.push(abs);
      else if (ent.isFile()) out.push(abs);
    }
  }

  out.sort((a, b) =>
    path.relative(baseAbs, a).localeCompare(path.relative(baseAbs, b))
  );
  return out;
}

function buildTree(relPaths) {
  const root = {};
  for (const rp of relPaths) {
    const parts = rp.split(path.sep);
    let node = root;
    for (let i = 0; i < parts.length; i++) {
      const p = parts[i];
      node[p] = node[p] || (i === parts.length - 1 ? null : {});
      if (node[p] !== null) node = node[p];
    }
  }

  function render(node, prefix = "") {
    const keys = Object.keys(node).sort((a, b) => a.localeCompare(b));
    const lines = [];
    keys.forEach((k, idx) => {
      const isLast = idx === keys.length - 1;
      const branch = isLast ? "└─ " : "├─ ";
      lines.push(prefix + branch + k);
      const child = node[k];
      if (child && typeof child === "object") {
        lines.push(...render(child, prefix + (isLast ? "   " : "│  ")));
      }
    });
    return lines;
  }

  return render(root).join("\n");
}

function safeReadText(fileAbs, maxBytes) {
  const stat = fs.statSync(fileAbs);
  if (stat.size > maxBytes)
    return { kind: "too_large", text: null, size: stat.size };

  const buf = fs.readFileSync(fileAbs);
  if (isProbablyBinary(buf))
    return { kind: "binary", text: null, size: buf.length };

  return { kind: "text", text: buf.toString("utf8"), size: buf.length };
}

async function promptForPaths(projectRoot, args) {
  const rl = readline.createInterface({ input, output });

  console.log("\n📦 Simulation packer (Markdown bundle for AI review)\n");
  console.log("Tip: You can also run non-interactive:");
  console.log(
    '  npm run pack:sim -- --sim "src/simulations/subjects/..." --out "name.pack.md"\n'
  );

  let simRel = (args.sim || "").trim();
  while (!simRel) {
    simRel = (
      await rl.question(
        "Enter simulation folder path (relative to repo root): "
      )
    ).trim();
  }

  let simAbs = path.resolve(projectRoot, simRel);
  while (!fs.existsSync(simAbs) || !fs.statSync(simAbs).isDirectory()) {
    console.log(`❌ Not a valid folder: ${simRel}`);
    simRel = (await rl.question("Try again (relative path): ")).trim();
    simAbs = path.resolve(projectRoot, simRel);
  }

  const defaultOut = `${path.basename(simAbs)}.pack.md`;
  let outRel = (args.out || "").trim();
  if (!outRel) {
    const ans = (
      await rl.question(`Output file (default: ${defaultOut}): `)
    ).trim();
    outRel = ans || defaultOut;
  }

  rl.close();
  return { simAbs, simRel, outAbs: path.resolve(projectRoot, outRel), outRel };
}

async function main() {
  const args = parseArgs(process.argv);
  if (args.help) {
    console.log(usage());
    process.exit(0);
  }

  const projectRoot = process.cwd();

  // If sim not provided, prompt interactively
  let simAbs, simRel, outAbs, outRel;
  if (!args.sim) {
    ({ simAbs, simRel, outAbs, outRel } = await promptForPaths(
      projectRoot,
      args
    ));
  } else {
    simRel = args.sim.trim();
    simAbs = path.resolve(projectRoot, simRel);
    if (!fs.existsSync(simAbs) || !fs.statSync(simAbs).isDirectory()) {
      console.error(
        `ERROR: Simulation folder not found or not a directory:\n  ${simAbs}\n`
      );
      console.error(usage());
      process.exit(1);
    }
    const simName = path.basename(simAbs);
    outRel =
      args.out && args.out.trim() ? args.out.trim() : `${simName}.pack.md`;
    outAbs = path.resolve(projectRoot, outRel);
  }

  const simName = path.basename(simAbs);
  const filesAbs = walkFiles(simAbs, simAbs);
  const filesRel = filesAbs.map((p) => path.relative(simAbs, p));

  const now = new Date().toISOString();

  let md = "";
  md += `# Simulation Pack: ${simName}\n\n`;
  md += `Generated: ${now}\n\n`;

  md += `## What is this file?\n\n`;
  md += `This Markdown file is an **auto-generated bundle** of a simulation folder from the Science Web Lab project.\n`;
  md += `It exists so an AI can review and improve the simulation with full context.\n\n`;

  md += `## Instructions for the AI (read carefully)\n\n`;
  md += `1. **Read every file included below before suggesting changes.**\n`;
  md += `2. Keep the existing project structure and conventions.\n`;
  md += `3. When proposing edits, reference file paths explicitly (e.g., \`src/.../MyFile.jsx\`).\n`;
  md += `4. If something looks missing (registry entry, exports, schema, constants), call it out.\n\n`;

  md += `## Included content\n\n`;
  md += `- Simulation folder: \`${simRel.replace(/\\/g, "/")}\` (recursive)\n`;
  if (args.includePackage) md += `- Root \`package.json\`\n`;
  md += `\n`;

  md += `## File tree (simulation folder)\n\n`;
  md += "```text\n" + buildTree(filesRel) + "\n```\n\n";

  if (args.includePackage) {
    const pkgAbs = path.join(projectRoot, "package.json");
    md += `## File: package.json (project root)\n\n`;
    if (fs.existsSync(pkgAbs) && fs.statSync(pkgAbs).isFile()) {
      const r = safeReadText(pkgAbs, args.maxBytes);
      if (r.kind === "text") {
        const fence = pickFence(r.text);
        md += `${fence}json\n${r.text}\n${fence}\n\n`;
      } else if (r.kind === "too_large") {
        md += `> Skipped: file too large (${r.size} bytes). Increase --max-bytes if needed.\n\n`;
      } else {
        md += `> Skipped: file appears to be binary.\n\n`;
      }
    } else {
      md += `> Not found: package.json at project root.\n\n`;
    }
  }

  for (const fileAbs of filesAbs) {
    const rel = path.relative(simAbs, fileAbs).replace(/\\/g, "/");
    md += `## File: ${rel}\n\n`;

    const r = safeReadText(fileAbs, args.maxBytes);
    if (r.kind === "text") {
      const lang = extToLang(fileAbs);
      const fence = pickFence(r.text);
      md += `${fence}${lang ? lang : ""}\n${r.text}\n${fence}\n\n`;
    } else if (r.kind === "too_large") {
      md += `> Skipped content: file too large (${r.size} bytes). Increase --max-bytes if needed.\n\n`;
    } else {
      md += `> Skipped content: file appears to be binary (size ${r.size} bytes).\n\n`;
    }
  }

  fs.writeFileSync(outAbs, md, "utf8");

  console.log("\n✅ DONE");
  console.log(`Output file: ${outRel.replace(/\\/g, "/")}`);
  console.log(`Simulation:  ${simRel.replace(/\\/g, "/")}`);
  console.log(`Files packed: ${filesAbs.length}`);
  if (args.includePackage) console.log("Included: package.json");
  console.log("");
}

main().catch((err) => {
  console.error("❌ Failed:", err?.stack || err);
  process.exit(1);
});
