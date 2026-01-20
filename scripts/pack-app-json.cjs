#!/usr/bin/env node
/* scripts/pack-app-json.cjs
 *
 * Packs an entire application folder into a single JSON file.
 * Useful for feeding a whole codebase into an LLM/AI context window.
 *
 * Features:
 * - Recursively scans directories.
 * - Respects .gitignore (if present).
 * - Built-in ignore list for common junk (node_modules, venv, .env, .git, etc).
 * - Detects binary files and skips their content (records presence/size only).
 * - formatting options for JSON output.
 *
 * Usage:
 *   node scripts/pack-app-json.cjs --root "./" --out "app-context.json"
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// --- Configuration ---

// Files strictly forbidden from being read (Credentials/Secrets)
const SECRETS_PATTERNS = [
  ".env",
  ".env.local",
  ".env.*",
  "*.pem",
  "*.key",
  "id_rsa",
  "credentials.json",
  "secrets.yaml",
];

// Directories to always ignore (Performance/Noise)
const IGNORE_DIRS = new Set([
  "node_modules",
  "venv",
  ".venv",
  "env",
  ".git",
  ".vscode",
  ".idea",
  ".next",
  ".nuxt",
  ".output",
  "dist",
  "build",
  "coverage",
  "__pycache__",
  ".cache",
  ".DS_Store",
  "tmp",
  "temp",
  "logs",
]);

// Binary extensions to skip reading content (keep metadata)
const BINARY_EXTENSIONS = new Set([
  ".png", ".jpg", ".jpeg", ".gif", ".ico", ".svg", ".webp",
  ".mp3", ".mp4", ".wav", ".mov",
  ".pdf", ".zip", ".tar", ".gz", ".7z", ".rar",
  ".exe", ".dll", ".so", ".dylib", ".bin",
  ".pyc", ".class", ".jar",
  ".eot", ".ttf", ".woff", ".woff2",
  ".db", ".sqlite", ".sqlite3"
]);

const MAX_FILE_SIZE_BYTES = 500 * 1024; // Skip reading text files larger than 500KB

// --- Helpers ---

function parseArgs(argv) {
  const args = {
    root: ".",
    out: "app-bundle.json",
    pretty: true,
  };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--root" || a === "-r") args.root = argv[++i] || ".";
    else if (a === "--out" || a === "-o") args.out = argv[++i] || "app-bundle.json";
    else if (a === "--no-pretty") args.pretty = false;
    else if (a === "--help" || a === "-h") {
      console.log(`
Usage: node pack-app-json.cjs [options]

Options:
  --root, -r    Root directory to scan (default: current dir)
  --out, -o     Output JSON file path (default: app-bundle.json)
  --no-pretty   Minify JSON output
      `);
      process.exit(0);
    }
  }
  return args;
}

/**
 * Checks if a file matches simple wildcard patterns (*.env, .env.*)
 */
function isSecret(filename) {
  return SECRETS_PATTERNS.some((pattern) => {
    if (pattern.startsWith("*")) return filename.endsWith(pattern.slice(1));
    if (pattern.endsWith("*")) return filename.startsWith(pattern.slice(0, -1));
    return filename === pattern;
  });
}

/**
 * Heuristic check for binary content (if extension check fails)
 */
function isBinaryBuffer(buf) {
  // Check start and a random chunk for null bytes
  const sampleSize = Math.min(buf.length, 4000);
  for (let i = 0; i < sampleSize; i++) {
    if (buf[i] === 0) return true;
  }
  return false;
}

/**
 * Get list of files ignored by git in the root directory
 */
function getGitIgnores(rootPath) {
  try {
    // Returns a list of ignored files relative to root
    // -c core.quotepath=false handles non-ascii paths better
    const output = execSync("git check-ignore * .[^.]* **/*", {
      cwd: rootPath,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"], // Suppress stderr
    });
    return new Set(output.split("\n").filter(Boolean).map(p => path.normalize(p.trim())));
  } catch (e) {
    // Git command failed (not a repo, or git not installed), fallback to manual ignore lists
    return new Set();
  }
}

// --- Main Logic ---

function walkDir(currentDir, rootDir, gitIgnores, fileList) {
  const entries = fs.readdirSync(currentDir, { withFileTypes: true });

  for (const ent of entries) {
    const fullPath = path.join(currentDir, ent.name);
    const relPath = path.relative(rootDir, fullPath);

    // 1. Security Check
    if (isSecret(ent.name)) {
      console.warn(`🔒 Skipping secret file: ${relPath}`);
      continue;
    }

    // 2. Directory Ignore Check
    if (ent.isDirectory()) {
      if (IGNORE_DIRS.has(ent.name)) continue;
      // Also check if this specific folder path is in gitignore
      if (gitIgnores.has(relPath)) continue;

      walkDir(fullPath, rootDir, gitIgnores, fileList);
    } 
    // 3. File Check
    else if (ent.isFile()) {
      // Check gitignore
      if (gitIgnores.has(relPath)) continue;
      
      fileList.push({
        path: relPath.split(path.sep).join("/"), // Standardize to forward slashes
        fullPath: fullPath,
        ext: path.extname(ent.name).toLowerCase(),
      });
    }
  }
}

function processFiles(fileList) {
  const output = {
    generatedAt: new Date().toISOString(),
    files: {},
  };

  let processedCount = 0;
  let skippedCount = 0;

  for (const file of fileList) {
    const { path: relPath, fullPath, ext } = file;
    
    try {
      const stats = fs.statSync(fullPath);
      
      // Skip logic: Known binary extension
      if (BINARY_EXTENSIONS.has(ext)) {
        output.files[relPath] = { type: "binary", size: stats.size, skipped: true };
        continue;
      }

      // Skip logic: File too large
      if (stats.size > MAX_FILE_SIZE_BYTES) {
        output.files[relPath] = { type: "large_file", size: stats.size, skipped: true };
        console.log(`⚠️  Skipping large file content: ${relPath} (${(stats.size/1024).toFixed(1)}KB)`);
        continue;
      }

      // Read content
      const buf = fs.readFileSync(fullPath);
      
      // Fallback binary check
      if (isBinaryBuffer(buf)) {
        output.files[relPath] = { type: "binary", size: stats.size, skipped: true };
        continue;
      }

      // Success
      output.files[relPath] = {
        type: "text",
        content: buf.toString("utf8"),
        size: stats.size
      };
      processedCount++;

    } catch (err) {
      console.error(`Error reading ${relPath}: ${err.message}`);
      output.files[relPath] = { error: err.message };
      skippedCount++;
    }
  }

  return { output, processedCount, skippedCount };
}

function main() {
  const args = parseArgs(process.argv);
  const absRoot = path.resolve(args.root);
  const absOut = path.resolve(args.out);

  console.log(`\n📦 Packaging Application`);
  console.log(`   Root: ${absRoot}`);
  console.log(`   Output: ${absOut}`);

  if (!fs.existsSync(absRoot)) {
    console.error(`❌ Root directory not found: ${absRoot}`);
    process.exit(1);
  }

  // 1. Get Git Ignore rules (best effort)
  console.log(`   Reading .gitignore rules...`);
  const gitIgnores = getGitIgnores(absRoot);
  
  // 2. Walk directory tree
  console.log(`   Scanning files...`);
  const fileList = [];
  walkDir(absRoot, absRoot, gitIgnores, fileList);

  // 3. Read content
  console.log(`   Reading content for ${fileList.length} files...`);
  const { output, processedCount } = processFiles(fileList);

  // 4. Write JSON
  console.log(`   Writing JSON...`);
  const jsonStr = args.pretty 
    ? JSON.stringify(output, null, 2) 
    : JSON.stringify(output);
  
  fs.writeFileSync(absOut, jsonStr, "utf8");

  console.log(`\n✅ Done!`);
  console.log(`   Packed ${processedCount} text files.`);
  console.log(`   Structure saved to: ${args.out}\n`);
}

main();