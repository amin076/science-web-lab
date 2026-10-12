/**
 * Adapter registry for transport-agnostic scientific simulations.
 * Future engines supply their own schema, checkpoint and command handler here.
 * HTTP/MCP authentication, revisioning and persistence remain unchanged.
 */
import {
 SIMULATION_CONTROL_ID,DESCRIPTOR,createControlDocument,
 exposeControlState,executeSimulationCommand,
} from "./controlCore.mjs";
import {HTML_REFERENCE_DESCRIPTOR,createHtmlReferenceDocument,exposeHtmlReferenceState,
 executeHtmlReferenceCommand} from "./htmlReferenceControl.mjs";

import {WAVE_DESCRIPTOR,createWaveControlDocument,exposeWaveControlState,executeWaveControlCommand} from "./waveStringControl.mjs";

const adapters=new Map([
 [WAVE_DESCRIPTOR.id,Object.freeze({id:WAVE_DESCRIPTOR.id,descriptor:WAVE_DESCRIPTOR,
  create:createWaveControlDocument,expose:exposeWaveControlState,execute:executeWaveControlCommand})],
 [SIMULATION_CONTROL_ID,Object.freeze({
  id:SIMULATION_CONTROL_ID,descriptor:DESCRIPTOR,
  create:createControlDocument,expose:exposeControlState,
  execute:executeSimulationCommand,
 })],
 [HTML_REFERENCE_DESCRIPTOR.id,Object.freeze({
  id:HTML_REFERENCE_DESCRIPTOR.id,descriptor:HTML_REFERENCE_DESCRIPTOR,
  create:createHtmlReferenceDocument,expose:exposeHtmlReferenceState,
  execute:executeHtmlReferenceCommand,
 })],
]);
export function listSimulationControlAdapters(){
 return [...adapters.values()].map(adapter=>adapter.descriptor);
}
export function requireSimulationControlAdapter(id=SIMULATION_CONTROL_ID){
 const adapter=adapters.get(id);
 if(!adapter){
  const error=new Error("Simulation has no registered control adapter");
  error.code="CONTROL_ADAPTER_UNAVAILABLE";error.status=404;
  throw error;
 }
 return adapter;
}
