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
