import {useCallback,useEffect,useRef,useState} from "react";
import {useRemoteSimulationSession} from "../../../../../platform/control/useRemoteSimulationSession.js";

const SOURCE="/fractal-lab/index.html";
const ORIGIN=()=>window.location.origin;
/**
 * Standard Esbiko catalog entry for the approved self-contained HTML fractal lab.
 * The HTML view retains its original responsive/touch UI and recording. An
 * origin-checked bridge synchronizes it with the canonical HTTP/MCP session.
 * No control token is ever passed to the nested HTML document.
 */
export default function FractalGeometryLab(){
 const frame=useRef(null),lastSnapshot=useRef(null),[ready,setReady]=useState(false);
 const [error,setError]=useState("");
 const onRemote=useCallback(async snapshot=>{
   if(!snapshot?.checkpoint)return;
   lastSnapshot.current=snapshot;
   if(frame.current?.contentWindow){
     frame.current.contentWindow.postMessage({type:"esbiko-fractal-snapshot-v1",
       checkpoint:snapshot.checkpoint,camera:snapshot.camera,running:snapshot.running},ORIGIN());
   }
 },[]);
 const remote=useRemoteSimulationSession(onRemote);
 const remoteCommand=useRef(remote.command);
 remoteCommand.current=remote.command;
 useEffect(()=>{
   const onMessage=event=>{
     if(event.origin!==ORIGIN()||event.source!==frame.current?.contentWindow)return;
     const msg=event.data;
     if(msg?.type==="esbiko-fractal-ready-v1"){
       setReady(true);
       if(remote.requested){
         frame.current.contentWindow.postMessage({type:"esbiko-fractal-remote-attached-v1"},ORIGIN());
         if(lastSnapshot.current)onRemote(lastSnapshot.current);
       }
       return;
     }
     if(msg?.type!=="esbiko-fractal-command-v1"||!remote.requested)return;
     const allowed=new Set(["configure","set_camera","play","pause","reset"]);
     if(!allowed.has(msg.action))return;
     const payload=msg.action==="configure"?{parameters:msg.parameters}:
       msg.action==="set_camera"?{camera:msg.camera}:{};
     remoteCommand.current(msg.action,payload).catch(e=>setError(e?.message||"Private session command failed"));
   };
   window.addEventListener("message",onMessage);
   return ()=>window.removeEventListener("message",onMessage);
 },[remote.requested,onRemote]);
 return <section data-simulation-id="math.geometry.fractals-2d"
   style={{width:"100%",height:"100%",minHeight:"min(650px,75dvh)",background:"#081421",display:"flex",flexDirection:"column",overflow:"hidden"}}>
   {remote.requested&&<div role="status" style={{fontSize:12,padding:"7px 14px",color:"#a5e6de",background:"#0e2436"}}>
     {remote.status}{ready?" · Fractal viewer connected":""}
     {error&&<span role="alert" style={{color:"#ffbdbd"}}> · {error}</span>}
   </div>}
   <iframe ref={frame} title="Esbiko interactive 2D fractal geometry laboratory"
     src={SOURCE} loading="eager"
     allow="fullscreen"
     style={{width:"100%",flex:1,minHeight:0,display:"block",border:0,background:"#071523"}}
     onLoad={()=>{if(remote.requested)frame.current?.contentWindow?.postMessage({type:"esbiko-fractal-remote-attached-v1"},ORIGIN());}}
   />
 </section>;
}
