/* scripts/verify-simulations.cjs */
const fs = require("fs");
const path = require("path");

const root = process.cwd();

const registryPath = path.join(
  root,
  "src",
  "simulations",
  "registry",
  "index.js"
);
const experimentsPath = path.join(root, "src", "data", "experiments.js");

function read(file) {
  return fs.readFileSync(file, "utf8");
}

function extractIdsFromExperiments(text) {
  // matches: id: "something"
  const ids = new Set();
  const re = /id:\s*["']([^"']+)["']/g;
  let m;
  while ((m = re.exec(text))) ids.add(m[1]);
  return ids;
}

function extractKeysFromRegistry(text) {
  // matches: "key": lazyWithRetry(...)
  const keys = new Set();
  const re = /["']([^"']+)["']\s*:\s*lazyWithRetry/g;
  let m;
  while ((m = re.exec(text))) keys.add(m[1]);
  return keys;
}

function main() {
  if (!fs.existsSync(registryPath)) {
    console.error("❌ Missing registry file:", registryPath);
    process.exit(1);
  }
  if (!fs.existsSync(experimentsPath)) {
    console.error("❌ Missing experiments file:", experimentsPath);
    process.exit(1);
  }

  const registry = read(registryPath);
  const experiments = read(experimentsPath);

  const expIds = extractIdsFromExperiments(experiments);
  const regKeys = extractKeysFromRegistry(registry);

  const missingInRegistry = [...expIds].filter((id) => !regKeys.has(id));
  const missingInExperiments = [...regKeys].filter((k) => !expIds.has(k));

  if (missingInRegistry.length) {
    console.error("❌ Experiments missing in registry:", missingInRegistry);
    process.exit(1);
  }

  if (missingInExperiments.length) {
    console.error(
      "❌ Registry keys missing in experiments:",
      missingInExperiments
    );
    process.exit(1);
  }

  console.log("✅ Registry and experiments are consistent.");
}

main();
