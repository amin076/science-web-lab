import {build} from "esbuild";
import {writeFile,readFile} from "node:fs/promises";
import {resolve} from "node:path";

const entry=resolve("functions/mcp/sdkDiagnostic.client.mjs");
const output=resolve("functions/mcp/sdkDiagnostic.generated.html");
const built=await build({
  entryPoints:[entry],bundle:true,platform:"browser",format:"iife",
  target:["es2020"],write:false,minify:true,
});
const script=built.outputFiles[0].text.replace(/<\\/script/gi,"<\\\\/script");
if(!script.includes("postMessage")) throw new Error("SDK bundle missing host communication");
const html='<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Esbiko MCP SDK diagnostic</title></head><body style="font:15px system-ui;padding:16px"><h2>Esbiko MCP SDK diagnostic</h2><p id="status">Preparing...</p><pre id="details" style="white-space:pre-wrap"></pre><script>'+script+'</script></body></html>';
await writeFile(output,html,"utf8");
const saved=await readFile(output,"utf8");
if(saved.length<10000)throw new Error("Unexpectedly small app bundle");
console.log("Bundled MCP Apps SDK diagnostic:",saved.length,"bytes");
