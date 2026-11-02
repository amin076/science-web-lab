import {useEffect,useRef,useState} from "react";
import {createSessionSyncQueue,sessionRetryDelay} from "./sessionSyncQueue.js";
export function useRemoteSimulationSession(onSnapshot){
  const expected=new URLSearchParams(window.location.search).get("remoteSessionId");
  const callback=useRef(onSnapshot);callback.current=onSnapshot;
  const dispatchRef=useRef(null),[status,setStatus]=useState(expected?"Connecting to private session":"Local simulation");
  useEffect(()=>{
    if(!expected)return;
    let remote=null,active=true,lastRevision=-1,timer,failures=0,terminal=false;
    const queue=createSessionSyncQueue();
    const abort=new AbortController();
    async function request(suffix="",body){
      if(!remote)throw new Error("Session credentials not attached");
      const response=await fetch("/api/v1/control/sessions/"+encodeURIComponent(expected)+suffix,{
        method:body?"POST":"GET",headers:{"X-Esbiko-Control-Token":remote.token,...(body?{"Content-Type":"application/json"}:{})},
        ...(body?{body:JSON.stringify(body)}:{}),cache:"no-store",signal:abort.signal});
      const result=await response.json();if(!response.ok||!result.ok)throw Object.assign(new Error(result.message||result.error||"Session unavailable"),{status:response.status});return result;
    }
    async function sync(){
      const snapshot=await request("?checkpoint=1"+(lastRevision>=0?"&since="+lastRevision:""));
      if(active&&!snapshot.unchanged&&snapshot.revision>lastRevision){await callback.current(snapshot);lastRevision=snapshot.revision;setStatus("Private session connected · revision "+lastRevision);}
      return snapshot;
    }
    dispatchRef.current=(action,input={})=>{
      const run=async()=>{const result=await request("/commands",{action,...input});await sync();return result.result;};
      return queue.run(run);
    };
    async function poll(){
      if(!active||terminal)return;
      if(document.hidden){timer=setTimeout(poll,1000);return;}
      try{
        await queue.run(sync);
        failures=0;
        if(active){
          setStatus("Private session connected · revision "+lastRevision);
          window.parent.postMessage({type:"esbiko-control-attached-v1",sessionId:expected},remote.origin);
        }
      }catch(e){
        if(!active)return;
        failures++;
        terminal=[401,403,404,410].includes(e.status);
        setStatus(terminal?"Private session unavailable. Open a new session.":"Connection interrupted. Retrying…");
      }
      if(active&&!terminal)timer=setTimeout(poll,sessionRetryDelay(failures));
    }
    const attach=event=>{
      const message=event.data;
      if(event.source!==window.parent||message?.type!=="esbiko-control-session-v1"||message.sessionId!==expected||
        typeof message.token!=="string"||!/^[a-f0-9]{64}$/.test(message.token)||remote)return;
      remote={token:message.token,origin:event.origin};
      poll();
    };
    window.addEventListener("message",attach);
    return()=>{active=false;abort.abort();clearTimeout(timer);queue.close();remote=null;dispatchRef.current=null;window.removeEventListener("message",attach);};
  },[expected]);
  return {requested:!!expected,status,command:(action,input)=>dispatchRef.current?dispatchRef.current(action,input):Promise.reject(new Error("Private session is connecting"))};
}
