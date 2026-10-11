/* eslint-env node */
import {
 getControlDescriptor,createControlSession,readControlSession,
 commandControlSession,deleteControlSession,
} from "./controlService.mjs";

const knownOrigins=new Set(["https://www.esbiko.com","https://esbiko.com"]);
const send=(res,status,data)=>res.status(status).json({ok:status>=200&&status<300,...data});
const tokenFrom=req=>req.get("X-Esbiko-Control-Token") || "";
const validBody=req=>req.body&&typeof req.body==="object"&&!Array.isArray(req.body);
export async function handleControlHttp(req,res){
 res.set("Cache-Control","no-store");
 res.set("Vary","Origin");
 const origin=req.get("Origin");
 if(origin&&knownOrigins.has(origin)){
  res.set("Access-Control-Allow-Origin",origin);
  res.set("Access-Control-Allow-Headers","Content-Type,X-Esbiko-Control-Token");
  res.set("Access-Control-Allow-Methods","GET,POST,DELETE,OPTIONS");
 }
 if(req.method==="OPTIONS"){
  if(origin&&!knownOrigins.has(origin))return res.status(403).send("");
  return res.status(204).send("");
 }
 if(origin&&!knownOrigins.has(origin))return send(res,403,{error:"ORIGIN_NOT_ALLOWED"});
 const segments=(req.path||"/").split("/").filter(Boolean);
 const controlIndex=segments.indexOf("control");
 const local=controlIndex>=0?segments.slice(controlIndex+1):segments;
 try{
  if(req.method==="GET"&&local.length===1&&local[0]==="schema")
   return send(res,200,{capabilities:getControlDescriptor()});
  if(req.method==="POST"&&local.join("/")==="sessions"){
   if(!validBody(req)||JSON.stringify(req.body).length>16000)
    return send(res,400,{error:"INVALID_BODY"});
   const result=await createControlSession(req.body.parameters||{});
   return send(res,201,result);
  }
  if(local[0]==="sessions"&&local.length>=2){
   const sessionId=local[1],token=tokenFrom(req);
   if(!token)return send(res,401,{error:"CONTROL_TOKEN_REQUIRED"});
   if(req.method==="GET"&&local.length===2){
    const since=req.query?.since;
    const revision=since===undefined?undefined:Number(since);
    return send(res,200,await readControlSession({sessionId,token,
     includeCheckpoint:req.query?.checkpoint==="1",
     sinceRevision:Number.isInteger(revision)?revision:undefined}));
   }
   if(req.method==="POST"&&local.length===3&&local[2]==="commands"){
    if(!validBody(req)||JSON.stringify(req.body).length>16000)
     return send(res,400,{error:"INVALID_BODY"});
    return send(res,200,await commandControlSession({sessionId,token,
     request:req.body,expectedRevision:req.body.expectedRevision}));
   }
   if(req.method==="DELETE"&&local.length===2)
    return send(res,200,await deleteControlSession({sessionId,token}));
  }
  return send(res,404,{error:"ROUTE_NOT_FOUND"});
 }catch(e){
  console.error("Simulation control request",e.code||"INTERNAL_ERROR",e.message);
  return send(res,e.status||400,{error:e.code||"SIMULATION_CONTROL_ERROR",
   message:e.status&&e.status<500?e.message:"Simulation control request failed"});
 }
}
