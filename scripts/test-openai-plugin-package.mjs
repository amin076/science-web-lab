import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve("openai-plugin/esbiko-science-lab");
const readJson = (name) =>
  JSON.parse(fs.readFileSync(path.join(root, name), "utf8"));

const plugin = readJson("plugin.json");
const mcp = readJson("mcp.json");
const openai = plugin.extensions?.["com.openai"];

assert.equal(plugin.name, "esbiko-science-lab");
assert.equal(plugin.version, "1.0.0");
assert(openai?.interface, "Missing OpenAI interface metadata.");
assert(openai?.review, "Missing OpenAI review metadata.");

const listing = openai.interface;
for (const field of [
  "websiteURL",
  "supportURL",
  "privacyPolicyURL",
  "termsOfServiceURL",
]) {
  assert(
    typeof listing[field] === "string" && listing[field].startsWith("https://"),
    `${field} must be a public HTTPS URL.`,
  );
}

assert(
  listing.websiteURL.startsWith("https://www.esbiko.com"),
  "Website URL must use the Esbiko production domain.",
);
assert(
  listing.privacyPolicyURL.endsWith("/privacy"),
  "Privacy policy URL must use the public Esbiko privacy route.",
);
assert(
  listing.termsOfServiceURL.endsWith("/terms"),
  "Terms URL must use the public Esbiko terms route.",
);

for (const asset of [listing.logo, listing.composerIcon]) {
  assert(asset?.startsWith("./assets/"), `Invalid plugin asset path: ${asset}`);
  assert(
    fs.existsSync(path.join(root, asset.slice(2))),
    `Missing plugin asset: ${asset}`,
  );
}

const positives = openai.review.test_cases?.positive || [];
const negatives = openai.review.test_cases?.negative || [];

assert.equal(positives.length, 5, "Initial MCP review requires exactly 5 positive cases.");
assert.equal(negatives.length, 3, "Initial MCP review requires exactly 3 negative cases.");

for (const testCase of positives) {
  assert(testCase.description);
  assert(testCase.prompt);
  assert(testCase.tools_triggered);
  assert(testCase.expected_behavior);
}

for (const testCase of negatives) {
  assert(testCase.description);
  assert(testCase.prompt);
}

const server = mcp.mcpServers?.esbiko;
assert(server, "Missing Esbiko MCP server entry.");
assert.equal(server.type, "streamable-http");
assert.equal(server.url, "https://www.esbiko.com/mcp");

console.log("ESBIKO OPENAI PLUGIN PACKAGE TEST PASSED");
console.log("Positive review cases:", positives.length);
console.log("Negative review cases:", negatives.length);
console.log("MCP endpoint:", server.url);
