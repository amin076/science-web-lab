/* eslint-env node */
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname,"..");
const out=path.join(root,"functions","api","engine");
fs.mkdirSync(out,{recursive:true});
const a=fs.readFileSync(path.join(root,"src/esbiko-physics/mechanics/compoundPendulum.js"),"utf8");
const b=fs.readFileSync(path.join(root,"src/simulations/subjects/physics/mechanics/compound-pendulum/comparisonModel.js"),"utf8");
const updated=b.replace(/from ["']\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/esbiko-physics\/mechanics\/compoundPendulum\.js["']/, 'from "./compoundPendulum.mjs"');
if(updated===b)throw Error("Shared physics adapter import not found");
fs.writeFileSync(path.join(out,"compoundPendulum.mjs"),a);
fs.writeFileSync(path.join(out,"compoundComparison.mjs"),updated);
console.log("Packed simulation control engine from canonical Esbiko Physics source.");

// Produce a self-contained ESM copy of the canonical HTML reference model for Cloud Functions.
// Never fork physics equations or depend on Vite/runtime DOM globals server-side.
const {buildSync}=require("esbuild");
buildSync({entryPoints:[path.join(root,"src/esbiko-physics/mechanics/htmlReferenceProjectile.js")],
 bundle:true,format:"esm",platform:"node",target:"node22",
 outfile:path.join(out,"htmlReferenceProjectile.mjs")});
console.log("Packed HTML reference shared scientific model for HTTP/MCP.");


// Bundle exactly the canonical browser wave model for HTTP and MCP control.
buildSync({entryPoints:[path.join(root,"src/esbiko-physics/waves/stringWaveModel.js")],
 bundle:true,format:"esm",platform:"node",target:"node22",
 outfile:path.join(out,"stringWaveModel.mjs")});
console.log("Packed canonical Wave Strings physics model for HTTP/MCP.");

// Shared coupled-pendulum V4 model is also the source of truth for MCP/HTTP.
buildSync({entryPoints:[path.join(root,"src/esbiko-physics/waves/coupledPendulumCordModel.js")],
 bundle:true,format:"esm",platform:"node",target:"node22",
 outfile:path.join(out,"coupledPendulumCordModel.mjs")});
console.log("Packed Coupled Pendulum Cord canonical engine.");
