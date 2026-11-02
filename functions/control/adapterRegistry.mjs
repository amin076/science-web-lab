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

import {COUPLED_DESCRIPTOR,createCoupledControlDocument,exposeCoupledControlState,executeCoupledControlCommand}
 from "./coupledPendulumControl.mjs";

import {createModelSessionAdapter} from "./modelSessionAdapter.mjs";
import {createThreeCameraSessionAdapter} from "./threeCameraSessionAdapter.mjs";
import cameraIds from "./data/threeCameraIds.generated.json" with {type:"json"};
import {createSimplePendulumModel,PENDULUM_SCHEMA,PENDULUM_DEFAULTS} from "../api/engine/simplePendulumModel.mjs";
import {createSolarSessionModel,SOLAR_SCHEMA,SOLAR_DEFAULTS} from "../api/engine/solarSessionModel.mjs";
import {createRegularPolygonModel,POLYGON_SCHEMA,POLYGON_DEFAULTS} from "../api/engine/regularPolygonModel.mjs";
const modelAdapters=[
 createModelSessionAdapter({id:"math.geometry.regular-polygons-circle",model:createRegularPolygonModel,schema:POLYGON_SCHEMA,defaults:POLYGON_DEFAULTS,units:"R, R², degrees, seconds"}),
 createModelSessionAdapter({id:"physics.mechanics.simple-pendulum",model:createSimplePendulumModel,schema:PENDULUM_SCHEMA,defaults:PENDULUM_DEFAULTS,units:"SI"}),
 createModelSessionAdapter({id:"astronomy.space.solar-system",model:createSolarSessionModel,schema:SOLAR_SCHEMA,defaults:SOLAR_DEFAULTS,units:"seconds; display scene units"}),
];
const adapters=new Map([
 ...cameraIds.map(id=>[id,Object.freeze(createThreeCameraSessionAdapter(id))]),
 ...modelAdapters.map(adapter=>[adapter.id,Object.freeze(adapter)]),
 [COUPLED_DESCRIPTOR.id,Object.freeze({id:COUPLED_DESCRIPTOR.id,descriptor:COUPLED_DESCRIPTOR,
  create:createCoupledControlDocument,expose:exposeCoupledControlState,execute:executeCoupledControlCommand})],
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
