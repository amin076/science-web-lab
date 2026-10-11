/* eslint-env node */
import admin from "firebase-admin";
import {createHash,randomBytes,randomUUID,timingSafeEqual} from "node:crypto";
import {DESCRIPTOR,createControlDocument,exposeControlState,executeSimulationCommand} from "./controlCore.mjs";

if(!admin.apps.length)admin.initializeApp();
const db=admin.firestore();
const collection=db.collection("simulationControlSessionsV1");
const quota=db.collection("simulationControlHourlyLimitsV1");
const SESSION_MINUTES=30;
const MAX_CREATES_PER_HOUR=150;

const failure=(status,code,message)=>Object.assign(new Error(message),{status,code});
const hash=token=>createHash("sha256").update(token).digest();
function validToken(saved,provided){
 if(typeof provided!=="string"||!/^[0-9a-f]{64}$/.test(provided)||typeof saved!=="string")return false;
 const expected=Buffer.from(saved,"hex"),actual=hash(provided);
 return expected.length===actual.length&&timingSafeEqual(expected,actual);
}
function validateId(id){
 if(typeof id!=="string"||!/^[0-9a-f-]{36}$/.test(id))throw failure(400,"INVALID_SESSION","Invalid session ID");
}
function expireCheck(data){
 if(data.expiresAt?.toMillis?.()<=Date.now())throw failure(410,"SESSION_EXPIRED","Session expired; create a new session");
}
export function getControlDescriptor(){return DESCRIPTOR;}
export async function createControlSession(parameters={}){
 const doc=createControlDocument(parameters);
 const id=randomUUID(),token=randomBytes(32).toString("hex"),now=Date.now();
 const ref=collection.doc(id);
 const limitId=new Date(now).toISOString().slice(0,13).replace(/[^0-9]/g,"");
 const quotaRef=quota.doc(limitId);
 await db.runTransaction(async tx=>{
  const rateDoc=await tx.get(quotaRef);
  const current=rateDoc.exists?rateDoc.data()?.count||0:0;
  if(current>=MAX_CREATES_PER_HOUR)throw failure(429,"RATE_LIMIT","Session creation quota reached; retry later");
  tx.set(quotaRef,{count:current+1,expiresAt:admin.firestore.Timestamp.fromMillis(now+7200e3)});
  tx.create(ref,{...doc,tokenHash:hash(token).toString("hex"),
   createdAt:admin.firestore.Timestamp.fromMillis(now),
   expiresAt:admin.firestore.Timestamp.fromMillis(now+SESSION_MINUTES*60000)});
 });
 return {sessionId:id,token,expiresAt:new Date(now+SESSION_MINUTES*60000).toISOString(),
  simulationId:DESCRIPTOR.id,revision:0,capabilities:DESCRIPTOR};
}
async function authorizedSnapshot(id,token){
 validateId(id);
 const doc=await collection.doc(id).get();
 if(!doc.exists)throw failure(404,"SESSION_NOT_FOUND","Session not found");
 const data=doc.data();
 if(!validToken(data.tokenHash,token))throw failure(403,"INVALID_SESSION_TOKEN","Invalid session token");
 expireCheck(data);
 return data;
}
function publicDoc(data,includeCheckpoint=false){
 return {...exposeControlState(data),expiresAt:data.expiresAt.toDate().toISOString(),
   ...(includeCheckpoint?{checkpoint:data.checkpoint}:{})};
}
export async function readControlSession({sessionId,token,includeCheckpoint=false,sinceRevision}){
 const data=await authorizedSnapshot(sessionId,token);
 if(Number.isInteger(sinceRevision)&&sinceRevision===data.revision)
  return {sessionId,revision:data.revision,unchanged:true};
 return {sessionId,...publicDoc(data,includeCheckpoint)};
}
export async function commandControlSession({sessionId,token,request,expectedRevision}){
 validateId(sessionId);
 const ref=collection.doc(sessionId);
 return db.runTransaction(async tx=>{
  const snapshot=await tx.get(ref);
  if(!snapshot.exists)throw failure(404,"SESSION_NOT_FOUND","Session not found");
  const data=snapshot.data();
  if(!validToken(data.tokenHash,token))throw failure(403,"INVALID_SESSION_TOKEN","Invalid session token");
  expireCheck(data);
  if(expectedRevision!==undefined&&(!Number.isInteger(expectedRevision)||expectedRevision!==data.revision))
   throw failure(409,"REVISION_CONFLICT","Session revision changed; read state and retry");
  const {document:next,result,mutation}=executeSimulationCommand(data,request);
  if(mutation){
   const newExpiry=admin.firestore.Timestamp.fromMillis(Date.now()+SESSION_MINUTES*60000);
   tx.update(ref,{checkpoint:next.checkpoint,revision:next.revision,running:next.running,
    camera:next.camera,commandCount:next.commandCount,simulatedSeconds:next.simulatedSeconds,
    expiresAt:newExpiry});
  }
  return {sessionId,revision:next.revision,mutation,result};
 });
}
export async function deleteControlSession({sessionId,token}){
 const doc=await authorizedSnapshot(sessionId,token);
 const ref=collection.doc(sessionId);
 await ref.delete();
 return {sessionId,closed:true};
}
