import {useCallback,useEffect,useRef} from "react";
import html from "./lab.html?raw";
import {COUPLED_SCHEMA} from "../../../../../esbiko-physics/waves/coupledPendulumCordModel.js";
import {getDocumentModelContext,registerWebMcpTools,createSafeToolExecutor}
 from "../../../../../webmcp/registerWebMcpTools.js";

const ID="physics.waves.coupled-pendulums-cord";
const empty={type:"object",properties:{},additionalProperties:false};
const configureSchema=COUPLED_SCHEMA;
const fireSchema={type:"object",properties:{
 paneIndex:{type:"integer",minimum:1,maximum:10},
 angleDeg:{type:"number",minimum:-65,maximum:65}},additionalProperties:false};
const advanceSchema={type:"object",properties:{seconds:{type:"number",exclusiveMinimum:0,maximum:2}},
 required:["seconds"],additionalProperties:false};
const videoSchema={type:"object",properties:{mode:{type:"string",enum:["landscape","shorts"]}},additionalProperties:false};
function getPresetFromQuery(){
 if(new URLSearchParams(window.location.search).get("embed")!=="mcp-app")return {};
 const qs=new URLSearchParams(window.location.search),result={};
 for(const [key,rule] of Object.entries(COUPLED_SCHEMA.properties)){
  const raw=qs.get("mcp."+key);if(raw===null)continue;
  const value=rule.type==="boolean"?(raw==="true"?true:raw==="false"?false:undefined)
   :rule.type==="string"?raw:Number(raw);
  if(value===undefined||(typeof value==="number"&&!Number.isFinite(value)))continue;
  if(rule.type==="integer"&&!Number.isInteger(value))continue;
  if(rule.enum&&!rule.enum.includes(value))continue;
  if(typeof value==="number"&&((rule.minimum!==undefined&&value<rule.minimum)||
    (rule.maximum!==undefined&&value>rule.maximum)))continue;
  result[key]=value;
 }
 return result;
}
export default function CoupledPendulumsCord(){
 const frame=useRef(null),requestSeq=useRef(0),pending=useRef(new Map());
 const ready=useRef(false),remoteRef=useRef(null),remoteDispatch=useRef(null),remoteRevision=useRef(-1);
 const callFrame=useCallback((action,args={})=>new Promise((resolve,reject)=>{
  if(!ready.current||!frame.current?.contentWindow){reject(new Error("Pendulum lab not ready"));return}
  const requestId=++requestSeq.current;
  pending.current.set(requestId,{resolve,reject});
  frame.current.contentWindow.postMessage({type:"esbiko-coupled-control-v1",action,args,requestId},window.location.origin);
 }),[]);
 const send=useCallback((action,args={})=>{
  if(action!=="hydrate"&&remoteDispatch.current&&
   ["readState","configure","play","pause","reset","fire","advance"].includes(action))
   return remoteDispatch.current(action,args);
  return callFrame(action,args);
 },[callFrame]);
 const onFrameLoad=useCallback(()=>{
  ready.current=true;
  const preset=getPresetFromQuery();
  if(!new URLSearchParams(window.location.search).has("remoteSessionId")&&Object.keys(preset).length)callFrame("configure",preset)
   .catch(error=>console.warn("Coupled MCP preset:",error));
 },[callFrame]);
 useEffect(()=>{
  const receive=event=>{
   if(event.source!==frame.current?.contentWindow||event.origin!==window.location.origin)return;
   const msg=event.data;
   if(msg?.type==="esbiko-coupled-ready-v1")onFrameLoad();
   if(msg?.type==="esbiko-coupled-response-v1"){
    const p=pending.current.get(msg.requestId);if(!p)return;
    pending.current.delete(msg.requestId);
    msg.ok?p.resolve(msg.data):p.reject(new Error(msg.error||"Control command failed"));
   }
   if(msg?.type==="esbiko-coupled-ui-v1"&&remoteDispatch.current){
    if(msg.action==="configure"||["fire","play","pause","reset"].includes(msg.action))
     remoteDispatch.current(msg.action,msg.args||{})
      .catch(error=>console.warn("Coupled remote UI:",error));
   }
  };
  window.addEventListener("message",receive);
  const abort=new AbortController();
  const tool=(name,inputSchema,action,readOnly=false)=>({
   name:"esbiko_coupled_pendulums_"+name,
   description:"Esbiko Coupled Pendulums & Elastic Cord Lab: "+name.replaceAll("_"," "),
   inputSchema,annotations:{readOnlyHint:readOnly,untrustedContentHint:false},
   execute:createSafeToolExecutor(action,params=>send(action,params)),
  });
  const tools=[
   tool("get_state",empty,"readState",true),
   tool("configure",configureSchema,"configure"),
   tool("play",empty,"play"),tool("pause",empty,"pause"),
   tool("reset",empty,"reset"),tool("excite",fireSchema,"fire"),
   tool("advance",advanceSchema,"advance"),
   tool("video_capabilities",empty,"videoCapabilities",true),
   tool("start_video",videoSchema,"startVideo"),tool("stop_video",empty,"stopVideo"),
   tool("video_status",empty,"videoStatus",true),
   tool("download_video",empty,"downloadVideo"),
  ];
  registerWebMcpTools({modelContext:getDocumentModelContext(document),tools,signal:abort.signal})
   .catch(error=>console.warn("Coupled WebMCP:",error));
  return ()=>{
   abort.abort();window.removeEventListener("message",receive);
   ready.current=false;
   for(const p of pending.current.values())p.reject(new Error("Lab unmounted"));
   pending.current.clear();
  };
 },[send,onFrameLoad]);
 useEffect(()=>{
  const expected=new URLSearchParams(window.location.search).get("remoteSessionId");
  if(!expected)return;
  let active=true,poller=null,serial=Promise.resolve();
  const http=async(path,body)=>{
   if(!remoteRef.current)throw new Error("Missing remote session");
   const {token,id}=remoteRef.current;
   const response=await fetch("/api/v1/control/sessions/"+encodeURIComponent(id)+path,{
    method:body?"POST":"GET",
    headers:{"X-Esbiko-Control-Token":token,...(body?{"Content-Type":"application/json"}:{})},
    ...(body?{body:JSON.stringify(body)}:{}),cache:"no-store",
   });
   const data=await response.json();
   if(!response.ok||!data.ok)throw new Error(data.error||"Remote API error");
   return data;
  };
  const sync=async(force=false)=>{
   const s=await http("?checkpoint=1");
   if(!active||!ready.current)return s;
   if(force||s.revision!==remoteRevision.current){
    if(!s.checkpoint)throw new Error("No checkpoint from control service");
    await callFrame("hydrate",{checkpoint:s.checkpoint});
    remoteRevision.current=s.revision;
   }
   return s;
  };
  const dispatch=(action,args={})=>{
   if(action==="readState")return http("").then(v=>v.state);
   const run=async()=>{
    const body={action};
    if(action==="configure")body.parameters=args;
    if(action==="advance")body.seconds=args.seconds;
    if(action==="fire"){body.paneIndex=args.paneIndex??args.string??1;body.angleDeg=args.angleDeg??30}
    const response=await http("/commands",body);
    await sync(true);return response.result;
   };
   serial=serial.catch(()=>null).then(run);return serial;
  };
  const attach=event=>{
   if(event.source!==window.parent||event.data?.type!=="esbiko-control-session-v1")return;
   const {sessionId,token}=event.data;
   if(sessionId!==expected||!/^[a-f0-9]{64}$/.test(token)||remoteRef.current?.id===sessionId)return;
   remoteRef.current={id:sessionId,token};
   remoteDispatch.current=dispatch;
   sync(true).then(()=>{
    if(!active)return;
    window.parent.postMessage({type:"esbiko-control-attached-v1",sessionId},event.origin);
    poller=setInterval(()=>sync(false).catch(error=>console.warn("Coupled session:",error)),3500);
   }).catch(error=>console.warn("Coupled session attach:",error));
  };
  window.addEventListener("message",attach);
  return ()=>{
   active=false;window.removeEventListener("message",attach);
   if(poller)clearInterval(poller);
   remoteRef.current=null;remoteDispatch.current=null;
  };
 },[callFrame]);
 return <iframe ref={frame} onLoad={onFrameLoad} srcDoc={html.replace("</body>",'<script>window.parent.postMessage({type:"esbiko-coupled-ready-v1"},window.origin);</script></body>')}
  title="Esbiko Coupled Pendulums & Elastic Cord — ten pendulums with physics, energy and Video Studio"
  allow="fullscreen" style={{display:"block",width:"100%",height:"100%",minHeight:"100%",border:0,background:"#071426"}} />;
}
