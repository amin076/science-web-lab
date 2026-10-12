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
 const control=useCallback((action,args={})=>new Promise((resolve,reject)=>{
  if(!ready.current||!frame.current?.contentWindow){
   reject(new Error("Wave simulator is not ready"));return;
  }
  const requestId=++sequence.current;
  requests.current.set(requestId,{resolve,reject});
  frame.current.contentWindow.postMessage({type:"esbiko-wave-control-v1",action,args,requestId},window.location.origin);
 }),[]);
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
 const sharedPhysics=wavePhysicsSource.replace(/\bexport\s+/g,"")+"\nwindow.esbikoWavePhysics=Object.freeze({pulseValue,sourceValue,component,sample});";
 const embeddedHtml=pageHtml.replace("</head>","<script>"+sharedPhysics+"<\/script></head>");
 return <iframe ref={frame} onLoad={onLoad} srcDoc={embeddedHtml}
  title="Esbiko Wave Strings Lab — 1 to 4 strings with reflection and superposition"
  style={{display:"block",width:"100%",height:"100%",minHeight:"100%",border:0,background:"#07111e"}}
  allow="fullscreen" />;
}
