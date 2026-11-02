import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createServer} from 'vite';
import {chromium} from 'playwright';
const server=await createServer({server:{host:'127.0.0.1',port:4185},logLevel:'error'});await server.listen();
const browser=await chromium.launch({args:['--no-sandbox']});
try{
 const page=await browser.newPage();let reads=0;const urls=[];
 await page.route('**/api/v1/control/sessions/**',route=>{
  reads++;urls.push(route.request().url());
  return route.fulfill({status:reads===1?503:reads>=4?410:200,json:reads===1?{ok:false}:reads===2?{ok:true,revision:1}:{ok:reads<4,revision:1,unchanged:true}});
 });
 fs.writeFileSync('.session-reconnect-test.html',`<div id="root"></div><script type="module">
 import React from 'react';
 import {createRoot} from 'react-dom/client';
 import {useRemoteSimulationSession} from '/src/platform/control/useRemoteSimulationSession.js';
 window.snapshots=0;
 function App(){const s=useRemoteSimulationSession(()=>window.snapshots++);return React.createElement('div',null,s.status)}
 createRoot(document.getElementById('root')).render(React.createElement(App));
 setTimeout(()=>window.postMessage({type:'esbiko-control-session-v1',sessionId:'test',token:'a'.repeat(64)},location.origin),500);
 </script>`);
 await page.goto('http://127.0.0.1:4185/.session-reconnect-test.html?remoteSessionId=test');
 await page.getByText('Private session connected · revision 1',{exact:true}).waitFor({timeout:15000});
 await page.getByText('Private session unavailable. Open a new session.',{exact:true}).waitFor({timeout:15000});
 assert.equal(await page.evaluate(()=>window.snapshots),1);
 assert(urls[2].includes('since=1'));
 const stopped=reads;await page.waitForTimeout(1500);assert.equal(reads,stopped);
 console.log('Browser: first request failure recovered, unchanged snapshot skipped, conditional read, expired session stops polling PASS');
}finally{await browser.close();await server.close();fs.unlinkSync('.session-reconnect-test.html');}
