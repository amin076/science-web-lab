/* eslint-env node */
const fs = require("fs");
const path = require("path");

const token = process.argv[2] || process.env.OPENAI_APPS_CHALLENGE_TOKEN;

if (!token || !token.trim()) {
  console.error(
    "Usage: node scripts/set-openai-apps-challenge.cjs <exact-token-from-OpenAI-dashboard>",
  );
  process.exit(1);
}

if (/\r|\n/.test(token)) {
  console.error("Challenge token must be one plain-text line.");
  process.exit(1);
}

const output = path.resolve(
  __dirname,
  "..",
  "public",
  ".well-known",
  "openai-apps-challenge",
);

fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, token.trim(), "utf8");

console.log(`Wrote OpenAI domain-verification token to ${output}`);
