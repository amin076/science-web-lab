import {useCallback,useEffect,useRef} from "react";
import pageHtml from "./wave-lab.html?raw";
import wavePhysicsSource from "../../../../../esbiko-physics/waves/stringWaveModel.js?raw";
import {getDocumentModelContext,registerWebMcpTools,createSafeToolExecutor} from "../../../../../webmcp/registerWebMcpTools.js";

const ID="physics.waves.string-wave-lab";
const empty={type:"object",properties:{},additionalProperties:false};
const parameters={visibleCount:{type:"integer",minimum:1,maximum:4},timeScale:{type:"number",enum:[0.25,0.5,1,2]}};
const ends=["fixed","free","absorbing"], modes=["continuous","pulse","dual"], shapes=["sine","gaussian","triangle","square","ricker","chirp","composite","asymmetric"];
for(let i=1;i<=4;i++){
 const prefix="s"+i+"_";
 Object.assign(parameters,{
  [prefix+"mode"]:{type:"string",enum:modes},
  [prefix+"leftEnd"]:{type:"string",enum:ends},
  [prefix+"rightEnd"]:{type:"string",enum:ends},
  [prefix+"amp"]:{type:"number",minimum:0.1,maximum:1.2},
  [prefix+"rightAmp"]:{type:"number",minimum:0.1,maximum:1.2},
  [prefix+"freq"]:{type:"number",minimum:0.25,maximum:5},
  [prefix+"period"]:{type:"number",minimum:0.2,maximum:4},
  [prefix+"speed"]:{type:"number",minimum:1,maximum:40},
  [prefix+"mu"]:{type:"number",minimum:0.05,maximum:2},
  [prefix+"tension"]:{type:"number",minimum:0.2,maximum:300},
  [prefix+"mass"]:{type:"number",minimum:0.6,maximum:24},
  [prefix+"shape"]:{type:"string",enum:shapes},
  [prefix+"rightShape"]:{type:"string",enum:shapes},
  [prefix+"cycles"]:{type:"number",enum:[0.5,0.75,1,1.5,2,3]},
  [prefix+"polarity"]:{type:"integer",enum:[-1,1]},
  [prefix+"auto"]:{type:"boolean"},
 });
}
const configureSchema={type:"object",properties:parameters,additionalProperties:false};
const fireSchema={type:"object",properties:{string:{type:"integer",minimum:1,maximum:4}},required:["string"],additionalProperties:false};

function parseMcpQuery(){
 if(typeof window==="undefined")return {};
 const qs=new URLSearchParams(window.location.search);
 if(qs.get("embed")!=="mcp-app")return {};
 const patch={};
 for(const [key,rule] of Object.entries(parameters)){
  const raw=qs.get("mcp."+key);
  if(raw===null)continue;
  const value=rule.type==="boolean"?(raw==="true"?true:raw==="false"?false:undefined)
   :rule.type==="string"?raw:Number(raw);
  if(value===undefined||(typeof value==="number"&&!Number.isFinite(value)))continue;
  if(rule.type==="integer"&&!Number.isInteger(value))continue;
  if(rule.enum&&!rule.enum.includes(value))continue;
  if(typeof value==="number"&&((rule.minimum!==undefined&&value<rule.minimum)||(rule.maximum!==undefined&&value>rule.maximum)))continue;
  patch[key]=value;
 }
 return patch;
}

export default function StringWaveLab(){
 const frame=useRef(null);
 const requests=useRef(new Map());
 const sequence=useRef(0);
 const ready=useRef(false);
 const remoteDispatch=useRef(null);
 const onResponse=useCallback(event=>{
  if(event.source!==frame.current?.contentWindow||event.origin!==window.location.origin)return;
  const response=event.data;
  if(!response||response.type!=="esbiko-wave-response-v1")return;
  const pending=requests.current.get(response.requestId);
  if(!pending)return;
  requests.current.delete(response.requestId);
  if(response.ok)pending.resolve(response.data);
  else pending.reject(new Error(response.error||"Wave control failed"));
 },[]);
 const control=useCallback((action,args={})=>{
  if(action!=="hydrate" && remoteDispatch.current &&
     ["readState","configure","play","pause","reset","fire"].includes(action))
    return remoteDispatch.current(action,args);
  return new Promise((resolve,reject)=>{
  if(!ready.current||!frame.current?.contentWindow){
   reject(new Error("Wave simulator is not ready"));return;
  }
  const requestId=++sequence.current;
  requests.current.set(requestId,{resolve,reject});
  frame.current.contentWindow.postMessage({type:"esbiko-wave-control-v1",action,args,requestId},window.location.origin);
 });
 },[]);
 const onLoad=useCallback(()=>{
  ready.current=true;
  const patch=parseMcpQuery();
  if(Object.keys(patch).length)control("configure",patch).catch(error=>console.warn("Wave MCP preset:",error));
 },[control]);
 useEffect(()=>{
  window.addEventListener("message",onResponse);
  const abort=new AbortController();
  const schema=(name,inputSchema,action,readonly=false)=>({
   name:"esbiko_string_waves_"+name,
   description:"Esbiko string wave lab: "+name.replaceAll("_"," "),
   inputSchema,
   annotations:{readOnlyHint:readonly,untrustedContentHint:false},
   execute:createSafeToolExecutor(action,params=>control(action,params)),
  });
  const tools=[
   schema("get_state",empty,"readState",true),
   schema("configure",configureSchema,"configure"),
   schema("play",empty,"play"),
   schema("pause",empty,"pause"),
   schema("reset",empty,"reset"),
   schema("send_pulses",fireSchema,"fire"),
   schema("video_capabilities",empty,"getVideoCapabilities",true),
   schema("start_video",{type:"object",properties:{mode:{type:"string",enum:["landscape","shorts"]}},additionalProperties:false},"startVideo"),
   schema("stop_video",empty,"stopVideo"),
   schema("video_status",empty,"getVideoStatus",true),
   schema("download_video",empty,"downloadVideo"),
  ];
  registerWebMcpTools({modelContext:getDocumentModelContext(document),tools,signal:abort.signal})
   .catch(error=>console.warn("Wave WebMCP registration:",error));
  return ()=>{
   abort.abort();ready.current=false;
   window.removeEventListener("message",onResponse);
   for(const pending of requests.current.values())pending.reject(new Error("Simulation unmounted"));
   requests.current.clear();
  };
 },[control,onResponse]);

 // The MCP shell sends the same private session token as the HTTP control API.
 // Advance remains explicit; remote playback never secretly advances the clock.
 useEffect(()=>{
  const expected=new URLSearchParams(window.location.search).get("remoteSessionId");
  if(!expected)return undefined;
  let remote=null,lastRevision=-1,poller=null,active=true,serial=Promise.resolve();
  const read=async()=>{
   if(!remote)return null;
   const response=await fetch("/api/v1/control/sessions/"+encodeURIComponent(remote.id)+"?checkpoint=1",{
    headers:{"X-Esbiko-Control-Token":remote.token},cache:"no-store",
   });
   const data=await response.json();
   if(!response.ok||!data.ok)throw new Error(data.error||"Remote session unavailable");
   return data;
  };
  const sync=async(force=false)=>{
   const state=await read();
   if(!state||!active||!ready.current)return state;
   if(force||state.revision!==lastRevision){
    const snap=state.checkpoint;
    if(!snap)throw new Error("Remote checkpoint unavailable");
    await control("hydrate",{checkpoint:snap,serverRunning:state.running});
    lastRevision=state.revision;
   }
   return state;
  };
  const dispatch=(action,args={})=>{
   if(action==="readState")return read().then(result=>result?.state);
   const run=async()=>{
    if(!remote)throw new Error("No remote session");
    const body={action};
    if(action==="configure")body.parameters=args;
    if(action==="fire")body.paneIndex=args.string;
    const response=await fetch("/api/v1/control/sessions/"+encodeURIComponent(remote.id)+"/commands",{
     method:"POST",headers:{"Content-Type":"application/json","X-Esbiko-Control-Token":remote.token},
     body:JSON.stringify(body),cache:"no-store",
    });
    const output=await response.json();
    if(!response.ok||!output.ok)throw new Error(output.error||"Remote command failed");
    await sync(true);
    return output.result;
   };
   serial=serial.catch(()=>null).then(run);
   return serial;
  };
  const onRemoteMessage=event=>{
   const msg=event.data;
   if(event.source===window.parent&&msg?.type==="esbiko-control-session-v1"){
    if(msg.sessionId!==expected||typeof msg.token!=="string"||!/^[a-f0-9]{64}$/.test(msg.token))return;
    if(remote?.id===msg.sessionId)return;
    remote={id:msg.sessionId,token:msg.token};
    remoteDispatch.current=dispatch;
    sync(true).then(()=>{
     if(!active)return;
     window.parent.postMessage({type:"esbiko-control-attached-v1",sessionId:remote.id},event.origin);
     if(!poller)poller=setInterval(()=>sync().catch(error=>console.warn("Wave remote refresh:",error)),3500);
    }).catch(error=>console.warn("Wave remote session:",error));
   }else if(event.source===frame.current?.contentWindow &&
      event.origin===window.location.origin&&msg?.type==="esbiko-wave-ui-command-v1"&&remote){
    dispatch(msg.action,msg.args||{}).catch(error=>console.warn("Wave remote control:",error));
   }
  };
  window.addEventListener("message",onRemoteMessage);
  return ()=>{
   active=false;
   window.removeEventListener("message",onRemoteMessage);
   if(poller)clearInterval(poller);
   remoteDispatch.current=null;
   remote=null;
  };
 },[control]);

 const sharedPhysics=wavePhysicsSource.replace(/\bexport\s+/g,"")+"\nwindow.esbikoWavePhysics=Object.freeze({pulseValue,sourceValue,component,sample});";
 const embeddedHtml=pageHtml.replace("</head>","<script>"+sharedPhysics+"<\/script></head>");
 return <iframe ref={frame} onLoad={onLoad} srcDoc={embeddedHtml}
  title="Esbiko Wave Strings Lab — 1 to 4 strings with reflection and superposition"
  style={{display:"block",width:"100%",height:"100%",minHeight:"100%",border:0,background:"#07111e"}}
  allow="fullscreen" />;
}
