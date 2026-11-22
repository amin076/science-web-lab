import {App} from "@modelcontextprotocol/ext-apps";

const status = document.getElementById("status");
const details = document.getElementById("details");
const setStatus = (message) => { status.textContent = message; };

const app = new App({name: "Esbiko MCP SDK Diagnostic", version: "2.0.0"});
app.ontoolresult = (result) => {
  details.textContent = "Tool result received: " +
    (result.structuredContent?.diagnostic || "unknown");
};

setStatus("Connecting to MCP host...");
app.connect().then(() => {
  setStatus("Connected to MCP host");
  details.textContent = "MCP Apps SDK initialization completed successfully.";
}).catch((error) => {
  setStatus("Connection failed");
  details.textContent = String(error?.message || error);
});
