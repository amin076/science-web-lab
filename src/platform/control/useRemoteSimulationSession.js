import {useEffect,useRef,useState} from "react";
export function useRemoteSimulationSession(onSnapshot){
  const expected=new URLSearchParams(window.location.search).get("remoteSessionId");
  const callback=useRef(onSnapshot);callback.current=onSnapshot;
  const dispatchRef=useRef(null),[status,setStatus]=useState(expected?"Connecting to private session":"Local simulation");
  useEffect(()=>{
    if(!expected)return;
    let remote=null,active=true,lastRevision=-1,serial=Promise.resolve(),timer;
    const abort=new AbortController();
    async function request(suffix="",body){
      if(!remote)throw new Error("Session credentials not attached");
      const response=await fetch("/api/v1/control/sessions/"+encodeURIComponent(expected)+suffix,{
        method:body?"POST":"GET",headers:{"X-Esbiko-Control-Token":remote.token,...(body?{"Content-Type":"application/json"}:{})},
        ...(body?{body:JSON.stringify(body)}:{}),cache:"no-store",signal:abort.signal});
      const result=await response.json();if(!response.ok||!result.ok)throw new Error(result.message||result.error||"Session unavailable");return result;
    }
    async function sync(){
      const snapshot=await request("?checkpoint=1");
      if(active&&snapshot.revision>lastRevision){lastRevision=snapshot.revision;await callback.current(snapshot);setStatus("Private session connected · revision "+lastRevision);}
      return snapshot;
    }
    dispatchRef.current=(action,input={})=>{
      const run=async()=>{const result=await request("/commands",{action,...input});await sync();return result.result;};
      serial=serial.catch(()=>null).then(run);return serial;
    };
    const attach=event=>{
      const message=event.data;
      if(event.source!==window.parent||message?.type!=="esbiko-control-session-v1"||message.sessionId!==expected||
        typeof message.token!=="string"||!/^[a-f0-9]{64}$/.test(message.token)||remote)return;
      remote={token:message.token};
      sync().then(()=>{if(!active)return;window.parent.postMessage({type:"esbiko-control-attached-v1",sessionId:expected},event.origin);
        timer=setInterval(()=>sync().catch(e=>{if(active)setStatus(e.message);}),1000);}).catch(e=>{if(active)setStatus(e.message);});
    };
    window.addEventListener("message",attach);
    return()=>{active=false;abort.abort();clearInterval(timer);remote=null;dispatchRef.current=null;window.removeEventListener("message",attach);};
  },[expected]);
  return {requested:!!expected,status,command:(action,input)=>dispatchRef.current?dispatchRef.current(action,input):Promise.reject(new Error("Private session is connecting"))};
}
