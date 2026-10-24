import assert from "node:assert/strict";
import fs from "node:fs";
import {createServer} from "vite";
import {chromium} from "playwright";
import {getSimulationProfile} from "../functions/mcp/simulationRegistry.mjs";
import {requireSimulationControlAdapter} from "../functions/control/adapterRegistry.mjs";
import {GENERIC_SIMULATION_WIDGET_HTML} from "../functions/mcp/simulationWidget.mjs";

// Start browser and development server in the same test process/network namespace.
for(const [key,value] of Object.entries({VITE_FIREBASE_API_KEY:"test-only-not-a-credential",
  VITE_FIREBASE_PROJECT_ID:"demo-esbiko",VITE_FIREBASE_AUTH_DOMAIN:"demo-esbiko.firebaseapp.com",
  VITE_FIREBASE_APP_ID:"1:123:web:test"}))process.env[key]||=value;
const vite=await createServer({server:{host:"127.0.0.1",port:4173,strictPort:true},logLevel:"error"});
await vite.listen();
const base="http://127.0.0.1:4173";
const browser=await chromium.launch({headless:true,args:["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist"]});
const cases=[
  ["physics.waves.string-wave-lab",{visibleCount:2,s1_freq:2,s1_rightEnd:"free"},{s1_freq:3},"wave"],
  ["physics.waves.coupled-pendulums-cord",{count:3},{tension:60},"coupled"],
  ["physics.mechanics.compound-pendulum",{paneCount:2,p1_rodCount:2,p2_rodCount:2},{p2_initialAngleDeg1:155.2},"compound"],
  ["physics.mechanics.html-reference-projectile",{velocityXMps:10},{velocityXMps:12},"html"],
  ["physics.mechanics.simple-pendulum",{lengthM:1.5,entryAngle:25},{lengthM:1.7},"pendulum"],
  ["astronomy.space.solar-system",{speed:30,showLabels:false,showAxis:false},{focusTarget:"earth",speed:20},"solar"],
];
try{
  for(const [id,initial,patch,kind] of cases.filter(c=>!process.env.ESBIKO_BRIDGE_CASE||c[3]===process.env.ESBIKO_BRIDGE_CASE)){
    const adapter=requireSimulationControlAdapter(id);
    let doc=adapter.create(initial),writes=0,reads=0;
    const sessionId="a1111111-b222-4333-8444-c55555555555",token="a".repeat(64);
    const page=await browser.newPage({viewport:{width:1100,height:850}});
    const errors=[],warnings=[];page.on("pageerror",e=>errors.push(e.stack));page.on("requestfailed",r=>warnings.push("REQUESTFAIL "+r.url()+" "+r.failure()?.errorText));page.on("console",m=>{if(["warning","error"].includes(m.type()))warnings.push(m.text())});
    await page.addInitScript(()=>{
      window.__testTools={};Object.defineProperty(document,"modelContext",{configurable:true,value:{
        async registerTool(tool,{signal}={}){window.__testTools[tool.name]=tool;signal?.addEventListener("abort",()=>delete window.__testTools[tool.name],{once:true});}
      }});
    });
    const profile={...getSimulationProfile(id),runUrl:base+getSimulationProfile(id).route};
    const output={simulation:profile,remoteSession:{sessionId,token},parameters:initial};
    await page.route("**/__session-shell",route=>route.fulfill({contentType:"text/html",body:GENERIC_SIMULATION_WIDGET_HTML.replace("<script>","<script>window.openai={toolOutput:"+JSON.stringify(output)+"};")}));
    await page.route("**/api/v1/control/sessions/**",async route=>{
      const request=route.request();if(request.headers()["x-esbiko-control-token"]!==token)return route.fulfill({status:403,json:{ok:false,error:"INVALID_TOKEN"}});
      if(request.method()==="GET"){reads++;
        const since=new URL(request.url()).searchParams.get("since");
        return route.fulfill({json:since===String(doc.revision)?{ok:true,unchanged:true,revision:doc.revision}:
          {ok:true,sessionId,checkpoint:doc.checkpoint,...adapter.expose(doc)}});
      }
      if(request.method()==="POST"){
        const result=adapter.execute(doc,request.postDataJSON());doc=result.document;writes++;
        return route.fulfill({json:{ok:true,revision:doc.revision,result:result.result}});
      }
      return route.fulfill({status:405,body:"Unsupported"});
    });
    await page.goto(base+"/__session-shell",{waitUntil:"domcontentloaded"});
    let target;
    for(let attempt=0;attempt<100&&!target;attempt++){
      for(const frame of page.frames()){
        if(await frame.evaluate(k=>k==="wave"?!!window.esbikoWaveLab:k==="coupled"?!!window.esbikoCoupledLab:
          Object.keys(window.__testTools||{}).some(n=>n.includes(k==="solar"?"solar_system_state":k==="pendulum"?"pendulum_get_state":k==="compound"?"compound_pendulum_get_state":"get_state")),kind).catch(()=>false)){target=frame;break;}
      }
      if(!target)await new Promise(r=>setTimeout(r,150));
    }
    assert.ok(target,"Rendered lab failed to mount: "+id+" "+errors.join(";"));
    const read=()=>target.evaluate(async k=>{
      if(k==="wave")return window.esbikoWaveLab.readState();
      if(k==="coupled")return window.esbikoCoupledLab.readState();
      const names=Object.keys(window.__testTools),name=names.find(n=>n.includes(k==="solar"?"solar_system_state":k==="pendulum"?"pendulum_get_state":k==="compound"?"compound_pendulum_get_state":"get_state"));
      const out=JSON.parse(await window.__testTools[name].execute({}));if(!out.ok)throw Error(JSON.stringify(out));return out.data;
    },kind);
    // Read actual renderer state; wave/coupled reads deliberately bypass their server-backed read tools.
    let rendered;
    const until=async predicate=>{
      for(let n=0;n<100;n++){rendered=await read();if(predicate(rendered))return;await new Promise(r=>setTimeout(r,100));}
      throw new Error("Renderer did not synchronize "+id+" reads="+reads+" warnings="+warnings.filter(w=>w.startsWith("REQUESTFAIL")&&!w.includes("google")).join(";")+" state="+JSON.stringify(rendered).slice(0,2000)+" expected="+JSON.stringify(adapter.expose(doc).state.positions)+" errors="+errors.join(";"));
    };
    const time=s=>s.elapsedSeconds??s.physics?.timeSeconds??s.timeSeconds;
    const value=(s,key)=>s.parameters?.[key]??s[key]??s.physics?.parameters?.[key];
    await until(s=>Object.entries(initial).every(([key,v])=>kind==="wave"?key==="visibleCount"?s.visibleCount===v:s.strings?.[0]?.[key.slice(3)]===v:value(s,key)===v));
    doc=adapter.execute(doc,{action:"configure",parameters:patch}).document;
    doc=adapter.execute(doc,{action:"advance",seconds:0.5}).document;
    await until(s=>Math.abs(time(s)-0.5)<1e-7);
    if(kind==="wave"){assert.equal(rendered.visibleCount,2);assert.equal(rendered.strings[0].freq,3);assert.equal(rendered.strings[0].rightEnd,"free");}
    else for(const [key,v] of Object.entries(patch))assert.equal(value(rendered,key),v,id+" "+key);
    const expected=adapter.expose(doc).state;
    if(kind==="pendulum")assert.ok(Math.abs(rendered.thetaRadians-expected.theta)<1e-10);
    if(kind==="solar"){
      await until(s=>s.positions?.earth&&Math.abs(s.positions.earth[0]-expected.positions.earth[0])<1e-6);
      for(const [name,position] of Object.entries(expected.positions)){
        if(name==="sun")continue;
        assert.ok(rendered.positions[name],"Missing rendered position: "+name);
        position.forEach((v,i)=>assert.ok(Math.abs(rendered.positions[name][i]-v)<1e-5,name+" position mismatch"));
      }
    }
    // Change a real visible control and verify it returns to the same session.
    if(kind==="wave"){
      await target.locator('#freq-1').evaluate(el=>{el.value="2.5";el.dispatchEvent(new Event("input",{bubbles:true}));});
      for(let n=0;n<50&&adapter.expose(doc).parameters.s1_freq!==2.5;n++)await new Promise(r=>setTimeout(r,100));
      assert.equal(adapter.expose(doc).parameters.s1_freq,2.5);assert.ok(writes>0);
    }else if(kind==="pendulum"){
      await target.evaluate(async()=>JSON.parse(await window.__testTools.esbiko_pendulum_configure.execute({massKg:3})));
      assert.equal(adapter.expose(doc).parameters.massKg,3);assert.ok(writes>0);
    }
    if(kind==="solar"){
      await target.evaluate(async()=>JSON.parse(await window.__testTools.configure_solar_system.execute({focusTarget:"jupiter"})));
      assert.equal(adapter.expose(doc).parameters.focusTarget,"jupiter");assert.ok(writes>0);
    }
    const urls=page.frames().map(f=>f.url()).join(" ");assert.ok(!urls.includes(token));
    assert.ok(!(await page.locator("body").innerText()).includes(token));
    assert.deepEqual(errors,[],id+" browser errors");
    fs.mkdirSync("artifacts/session-bridges",{recursive:true});
    await page.screenshot({path:"artifacts/session-bridges/"+kind+".png"});
    console.log(id+": real MCP shell -> private session -> renderer parameters/time/physics PASS");
    await page.close();
  }
}finally{await browser.close();await vite.close();}
