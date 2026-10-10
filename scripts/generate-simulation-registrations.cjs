/* eslint-env node */
const fs=require('fs');const path=require('path');
const ROOT=path.resolve(__dirname,'..');
const taxonomy={physics:['mechanics','optics','electricity','waves','acoustics','thermodynamics','fluid-mechanics','challenges'],astronomy:['space','kepler'],biology:['evolution'], 'earth-science':['geology'],creative:['patterns'],chemistry:['general','reactions'],math:['general','algebra','geometry']};
function validate(m,file){
 if(m.schemaVersion!=='esbiko-simulation-registration.v1')throw Error(file+': unsupported registration schema');
 if(!/^[a-z0-9-]+\.[a-z0-9-]+\.[a-z0-9-]+$/.test(m.id)||m.id!==`${m.domain}.${m.topic}.${m.id.split('.').at(-1)}`)throw Error(file+': id/domain/topic mismatch');
 if(!taxonomy[m.domain]?.includes(m.topic))throw Error(file+': unknown domain/topic; extend the taxonomy explicitly');
 for(const key of ['name','desc'])if(typeof m[key]!=='string'||!m[key].trim())throw Error(file+': missing '+key);
 if(!['canvas2d','three','timeline','p5'].includes(m.engine))throw Error(file+': invalid renderer');
 if(!['2d-v0.1','3d-v0.1','timeline-v0.1','custom'].includes(m.uiStandard))throw Error(file+': missing UI standard');
 const expected={canvas2d:'2d-v0.1',three:'3d-v0.1',timeline:'timeline-v0.1',p5:'custom'};
 if(m.uiStandard!==expected[m.engine])throw Error(file+': renderer/UI standard mismatch');
 if(!['public','admin'].includes(m.visibility))throw Error(file+': visibility must be public or admin');
 if(!['esbiko-physics','domain-specific','none'].includes(m.scientificEngine))throw Error(file+': scientificEngine required');
 if(m.entry!=='index.jsx')throw Error(file+': standard entry must be index.jsx');
 if(!fs.existsSync(path.join(path.dirname(file),m.entry)))throw Error(file+': entry missing');
 return m;
}
function collect(dir){if(!fs.existsSync(dir))return [];return fs.readdirSync(dir,{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name)).flatMap(e=>e.isDirectory()?collect(path.join(dir,e.name)):e.name==='simulation.json'?[path.join(dir,e.name)]:[]);}
function generate(root=ROOT){
 const files=collect(path.join(root,'src/simulations/subjects'));const seen=new Set();
 const records=files.map(file=>({file,manifest:validate(JSON.parse(fs.readFileSync(file,'utf8')),file)}));
 for(const {manifest:m}of records){if(seen.has(m.id))throw Error('Duplicate manifest ID: '+m.id);seen.add(m.id);}
 const legacy=fs.readFileSync(path.join(root,'src/simulations/registry/index.js'),'utf8');
 for(const id of seen)if(legacy.includes('"'+id+'":'))throw Error('ID already registered in legacy registry: '+id);
 const publicRecords=records.filter(r=>r.manifest.visibility==='public');
 const source='// Generated from colocated simulation.json files. Do not edit.\nexport const standardSimulationDefinitions = [\n'+publicRecords.map(({file,manifest:m})=>{
 const rel=path.relative(path.join(root,'src'),path.join(path.dirname(file),m.entry)).split(path.sep).join('/');
 const {entry,visibility,...metadata}=m;
 return '  {metadata: '+JSON.stringify(metadata)+', load: () => import('+JSON.stringify('@/'+rel)+')},';
 }).join('\n')+'\n];\n';
 const output=path.join(root,'src/simulations/definitions/generated.js');fs.mkdirSync(path.dirname(output),{recursive:true});if(!fs.existsSync(output)||fs.readFileSync(output,'utf8')!==source)fs.writeFileSync(output,source);
 return publicRecords.map(r=>r.manifest);
}
module.exports={generate,validate,taxonomy};
if(require.main===module){try{console.log('Registered',generate().length,'manifest-based public simulations');}catch(e){console.error(e.message);process.exitCode=1;}}
