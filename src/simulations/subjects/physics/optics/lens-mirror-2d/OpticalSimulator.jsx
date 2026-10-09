// src/simulations/subjects/physics/optics/lens-mirror-2d/OpticalSimulator.jsx
import React, { useState, useEffect, useMemo, useRef } from "react";
import { readEmbeddedMcpParameters } from "@/platform/agent";
import { createSafeToolExecutor, registerWebMcpTools, getDocumentModelContext } from "@/webmcp/registerWebMcpTools.js";
import { calculateOpticalElement } from "./OpticalPhysics";
import OpticalControls from "./OpticalControls";
import OpticalResults from "./OpticalResults";
import OpticalRayDiagram from "./OpticalRayDiagram";

export default function OpticalSimulator() {
  const defaults = useMemo(() => ({
    lensType:"convex-lens",objDistance:250,focalLength:120,
    objHeight:60,objType:"tree",objSide:"left",
  }),[]);
  const initial = useMemo(
    () => readEmbeddedMcpParameters("physics.optics.lens-mirror-2d",defaults).values,[defaults],
  );
  const [values,setValues] = useState(initial);
  const stateRef=useRef(values);
  stateRef.current=values;
  const {lensType,objDistance,focalLength,objHeight,objType,objSide}=values;
  const setField=(name)=>(value)=>setValues(previous=>({...previous,[name]:value}));
  const rules={
    lensType:{type:"string",enum:["convex-lens","concave-lens","concave-mirror","convex-mirror"]},
    objDistance:{type:"number",minimum:50,maximum:450},
    focalLength:{type:"number",minimum:50,maximum:300},
    objHeight:{type:"number",minimum:20,maximum:63},
    objType:{type:"string",enum:["tree","arrow"]},
    objSide:{type:"string",enum:["left","right"]},
  };
  useEffect(()=>{
    const controller=new AbortController();
    const empty={type:"object",properties:{},additionalProperties:false};
    const getState=()=>({
      simulationId:"physics.optics.lens-mirror-2d",...stateRef.current,
      optics:calculateOpticalElement(stateRef.current.lensType,stateRef.current.focalLength,
        stateRef.current.objDistance,stateRef.current.objHeight),
    });
    const tools=[
      {name:"esbiko_optics2d_get_state",
        description:"Read live 2D lens/mirror settings, image distance and magnification.",
        inputSchema:empty,annotations:{readOnlyHint:true},
        execute:createSafeToolExecutor("optics2d_get_state",async()=>getState())},
      {name:"esbiko_optics2d_configure",
        description:"Set any real optical element, object appearance, side, focal length, distance and height.",
        inputSchema:{type:"object",properties:rules,additionalProperties:false},
        execute:createSafeToolExecutor("optics2d_configure",async(input)=>{
          if(!input || typeof input!=="object" || Array.isArray(input))throw Error("Expected optics parameters");
          for(const [key,value] of Object.entries(input)){
            const rule=rules[key];
            if(!rule || typeof value!==rule.type || (rule.enum&&!rule.enum.includes(value)) ||
              (rule.type==="number" && (!Number.isFinite(value)||value<rule.minimum||value>rule.maximum)))
              throw Error("Invalid optics parameter: "+key);
          }
          stateRef.current={...stateRef.current,...input};
          setValues(stateRef.current);
          return getState();
        })},
      {name:"esbiko_optics2d_reset",description:"Restore initial optical settings.",
        inputSchema:empty,execute:createSafeToolExecutor("optics2d_reset",async()=>{
          stateRef.current={...defaults};setValues(stateRef.current);return getState();
        })},
    ];
    registerWebMcpTools({modelContext:getDocumentModelContext(),tools,signal:controller.signal})
      .catch(error=>{if(!controller.signal.aborted)console.warn("Optics MCP",error)});
    return ()=>controller.abort();
  },[defaults]);

  return (
    <div className="relative w-full h-full min-w-0 overflow-y-auto xl:overflow-hidden bg-[#0f172a] font-sans p-2 sm:p-3">
      {/* 1. Ultra-Minimal Scrollbar CSS */}
      <style>{`
        /* Width */
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        /* Track (Background) - Completely Invisible */
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        /* Handle (Thumb) - Semi-transparent glass pill */
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1); 
          border-radius: 10px;
        }
        /* Handle on Hover */
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3); 
        }
      `}</style>

      <div className="flex flex-col xl:grid xl:grid-cols-[minmax(0,1fr)_minmax(300px,370px)] gap-3 xl:h-full min-w-0">
      {/* 2. Main Canvas */}
      <div data-esbiko-optics-stage className="w-full min-w-0 h-[min(58dvh,520px)] min-h-[280px] xl:h-full xl:min-h-0 relative overflow-hidden rounded-xl border border-white/10">
        <OpticalRayDiagram
          type={lensType}
          focalLength={focalLength}
          objDistance={objDistance}
          objHeight={objHeight}
          objType={objType}
          objSide={objSide}
        />
      </div>

      {/* 3. Floating HUD Panel */}
      <div data-esbiko-optics-controls className="w-full min-w-0 flex flex-col xl:min-h-0 xl:overflow-y-auto">
        {/* Panel Container */}
        <div className="bg-slate-950 border border-white/10 rounded-2xl shadow-xl flex flex-col min-w-0">
          {/* Header */}
          <div className="px-5 py-4 border-b border-white/5 bg-gradient-to-r from-white/5 to-transparent shrink-0">
            <h1 className="text-lg font-extrabold text-white tracking-tight flex items-center gap-3 drop-shadow-md">
              Optics Lab
              <span className="text-[9px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded shadow-[0_0_10px_rgba(34,211,238,0.2)]">
                2D SIM
              </span>
            </h1>
          </div>

          {/* Scrollable Content */}
          <div className="p-3 sm:p-4 min-w-0 custom-scrollbar">
            <OpticalControls
              lensType={lensType}
              setLensType={setField('lensType')}
              objDistance={objDistance}
              setObjDistance={setField('objDistance')}
              focalLength={focalLength}
              setFocalLength={setField('focalLength')}
              objHeight={objHeight}
              setObjHeight={setField('objHeight')}
              objType={objType}
              setObjType={setField('objType')}
              objSide={objSide}
              setObjSide={setField('objSide')}
              onReset={() => setValues({...defaults})}
            />
            <OpticalResults
              type={lensType}
              focalLength={focalLength}
              objDistance={objDistance}
              objHeight={objHeight}
            />
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
