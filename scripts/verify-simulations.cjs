/* scripts/verify-simulations.cjs */
const fs = require("fs");
const path = require("path");

const root = process.cwd();
const registryPath = path.join(root, "src", "simulations", "registry", "index.js");
const experimentsRoot = path.join(root, "src", "data", "experiments");

function read(file) {
  return fs.readFileSync(file, "utf8");
}

function listJavaScriptFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return listJavaScriptFiles(fullPath);
    return entry.isFile() && /\.(?:js|jsx|mjs|cjs)$/.test(entry.name) ? [fullPath] : [];
  });
}

function extractIdsFromExperiments(files) {
  const ids = new Set();
  const re = /\bid\s*:\s*["']([^"']+)["']/g;
  for (const file of files) {
    const text = read(file);
    let match;
    while ((match = re.exec(text))) ids.add(match[1]);
  }
  return ids;
}

function extractKeysFromRegistry(text) {
  const keys = new Set();
  const re = /["']([^"']+)["']\s*:\s*lazyWithRetry/g;
  let match;
  while ((match = re.exec(text))) keys.add(match[1]);
  return keys;
}

function main() {
  if (!fs.existsSync(registryPath)) {
    console.error("❌ Missing registry file:", registryPath);
    process.exit(1);
  }
  if (!fs.existsSync(experimentsRoot) || !fs.statSync(experimentsRoot).isDirectory()) {
    console.error("❌ Missing experiments directory:", experimentsRoot);
    process.exit(1);
  }

  const experimentFiles = listJavaScriptFiles(experimentsRoot);
  if (experimentFiles.length === 0) {
    console.error("❌ No experiment data files found in:", experimentsRoot);
    process.exit(1);
  }

  const expIds = extractIdsFromExperiments(experimentFiles);
  const regKeys = extractKeysFromRegistry(read(registryPath));

  const missingInRegistry = [...expIds].filter((id) => !regKeys.has(id));
  const missingInExperiments = [...regKeys].filter((key) => !expIds.has(key));

  if (missingInRegistry.length) {
    console.error("❌ Experiments missing in registry:", missingInRegistry);
    process.exit(1);
  }

  if (missingInExperiments.length) {
    console.error("❌ Registry keys missing in experiments:", missingInExperiments);
    process.exit(1);
  }

  console.log(
    `✅ Registry and experiments are consistent (${expIds.size} experiment ids across ${experimentFiles.length} data files).`,
  );
}

main();
