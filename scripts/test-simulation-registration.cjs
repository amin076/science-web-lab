/* eslint-env node */
const assert=require('node:assert/strict');const fs=require('fs');const os=require('os');const path=require('path');
const {generate,validate}=require('./generate-simulation-registrations.cjs');
const root=fs.mkdtempSync(path.join(os.tmpdir(),'esbiko-registration-'));
try{
 const dir=path.join(root,'src/simulations/subjects/physics/mechanics/test');fs.mkdirSync(dir,{recursive:true});fs.mkdirSync(path.join(root,'src/simulations/registry'),{recursive:true});fs.writeFileSync(path.join(root,'src/simulations/registry/index.js'),'export const simulationRegistry = {};');fs.writeFileSync(path.join(dir,'index.jsx'),'export default function Example(){}');
 const manifest={schemaVersion:'esbiko-simulation-registration.v1',id:'physics.mechanics.test',domain:'physics',topic:'mechanics',name:'Test',desc:'Test description',engine:'canvas2d',uiStandard:'2d-v0.1',scientificEngine:'none',entry:'index.jsx',visibility:'public'};
 const file=path.join(dir,'simulation.json');fs.writeFileSync(file,JSON.stringify(manifest));
 assert.equal(generate(root).length,1);const out=path.join(root,'src/simulations/definitions/generated.js');const first=fs.readFileSync(out,'utf8');generate(root);assert.equal(fs.readFileSync(out,'utf8'),first);assert.ok(first.includes('@/simulations/subjects/physics/mechanics/test/index.jsx'));
 for(const patch of [{topic:'optics'},{engine:'three'},{visibility:'private'},{entry:'../outside.jsx'},{scientificEngine:undefined}])assert.throws(()=>validate({...manifest,...patch},file));
 fs.writeFileSync(file,JSON.stringify({...manifest,visibility:'admin'}));assert.equal(generate(root).length,0);assert.ok(!fs.readFileSync(out,'utf8').includes('physics.mechanics.test'));
 fs.writeFileSync(file,JSON.stringify(manifest));const second=path.join(root,'src/simulations/subjects/physics/mechanics/duplicate');fs.mkdirSync(second);fs.writeFileSync(path.join(second,'index.jsx'),'');fs.writeFileSync(path.join(second,'simulation.json'),JSON.stringify(manifest));assert.throws(()=>generate(root),/Duplicate/);fs.rmSync(second,{recursive:true});
 fs.writeFileSync(path.join(root,'src/simulations/registry/index.js'),'"physics.mechanics.test": lazyWithRetry(()=>{})');assert.throws(()=>generate(root),/legacy registry/);
 console.log('Registration: valid grouping metadata, deterministic generation, schema/entry rejection, admin exclusion, duplicate/legacy collision checks passed');
}finally{fs.rmSync(root,{recursive:true,force:true});}
