import assert from "node:assert/strict";
import { createServer } from "../functions/mcp/transport.mjs";

const server = createServer();
assert(server, "MCP server factory returned no server");
console.log("MCP RUNTIME STARTUP TEST PASSED");
