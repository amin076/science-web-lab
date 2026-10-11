/**
 * Adapter registry for transport-agnostic scientific simulations.
 * Future engines supply their own schema, checkpoint and command handler here.
 * HTTP/MCP authentication, revisioning and persistence remain unchanged.
 */
import {
 SIMULATION_CONTROL_ID,DESCRIPTOR,createControlDocument,
 exposeControlState,executeSimulationCommand,
} from "./controlCore.mjs";

const adapters=new Map([[
 SIMULATION_CONTROL_ID,Object.freeze({
  id:SIMULATION_CONTROL_ID,descriptor:DESCRIPTOR,
  create:createControlDocument,expose:exposeControlState,
  execute:executeSimulationCommand,
 }),
]]);
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
