import {build} from 'esbuild';
import fs from 'node:fs';
fs.mkdirSync('artifacts/rope-beta/public',{recursive:true});
await build({entryPoints:['examples/rope-waves/comparison.js'],bundle:true,format:'esm',minify:true,outfile:'artifacts/rope-beta/public/comparison.js'});
for(const file of ['index.html','style.css'])fs.copyFileSync('examples/rope-waves/'+file,'artifacts/rope-beta/public/'+file);
fs.writeFileSync('artifacts/rope-beta/firebase.json',JSON.stringify({hosting:{public:'public',ignore:['firebase.json'],headers:[{source:'**',headers:[{key:'Cache-Control',value:'no-cache'}]}]}}));
