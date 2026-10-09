import React, { useRef, useState, useEffect } from "react";
import { createSafeToolExecutor, registerWebMcpTools, getDocumentModelContext } from "@/webmcp/registerWebMcpTools.js";
import { readEmbeddedMcpParameters } from "@/platform/agent";
import { COMPONENT_TYPES, DEFAULT_VALUES, generateId } from "../CircuitUtils";
import CircuitHeader from "./CircuitHeader";
import Sidebar from "./Sidebar/Sidebar";
import PropertiesPanel from "./properties/PropertiesPanel";
import CircuitCanvas from "./Canvas/CircuitCanvas";
import LabsOverlay from "./Labs/LabsOverlay";
import "../CircuitStyles.css";
import { useCircuitReducer } from "./hooks/useCircuitReducer";
import { useCircuitInteraction } from "./hooks/useCircuitInteraction";
import { useSimulationLoop } from "./hooks/useSimulationLoop";
import { useCircuitRenderer } from "./hooks/useCircuitRenderer";

export default function CircuitSimulatorPage() {
  const [state, dispatch] = useCircuitReducer();
  const canvasRef = useRef(null);

  // Scope samples (Voltage/Current vs time) for the selected component.
  const [scopeSamples, setScopeSamples] = useState([]);

  // Step 3: Ground rule + educational message
  const [simWarning, setSimWarning] = useState("");
  const hasGround = state.components.some((c) => c.type === "ground");

  // Clear warning automatically once a Ground is added.
  useEffect(() => {
    if (hasGround && simWarning) setSimWarning("");
  }, [hasGround, simWarning]);

  const { onPointerDown, onPointerMove, onPointerUp, isTerminalConnected } =
    useCircuitInteraction({ state, dispatch, canvasRef });

  const { reset } = useSimulationLoop({ state, dispatch });

  useCircuitRenderer({ state, canvasRef, isTerminalConnected });

  const latestRef=useRef(state);
  latestRef.current=state;
  const actionRef=useRef({});
  actionRef.current={reset};
  const addedIdsRef=useRef([]);
  useEffect(()=>{
    const controller=new AbortController();
    const empty={type:"object",properties:{},additionalProperties:false};
    const componentTypes=Object.values(COMPONENT_TYPES);
    const snapshot=()=>({
      simulationId:"physics.electricity.circuits",
      isSimulating:latestRef.current.isSimulating,
      components:latestRef.current.components,
      connections:latestRef.current.connections,
      selectedId:latestRef.current.selectedId,
      results:latestRef.current.results,
      hasGround:latestRef.current.components.some(c=>c.type==="ground"),
    });
    const readValidComponent=(id)=>{
      const component=latestRef.current.components.find(c=>c.id===id);
      if(!component)throw Error("Unknown component: "+id);
      return component;
    };
    const tools=[
      {name:"esbiko_circuit_get_state",description:"Read circuit parts, connections, selected element, ground status and live simulation results.",
       inputSchema:empty,annotations:{readOnlyHint:true},
       execute:createSafeToolExecutor("circuit_get_state",async()=>snapshot())},
      {name:"esbiko_circuit_add_component",description:"Add a real battery, resistor, ground or other supported component onto the circuit canvas.",
       inputSchema:{type:"object",properties:{
         componentType:{type:"string",enum:componentTypes},
         x:{type:"number",minimum:0,maximum:3000},y:{type:"number",minimum:0,maximum:3000},
       },required:["componentType"],additionalProperties:false},
       execute:createSafeToolExecutor("circuit_add_component",async({componentType,x,y})=>{
         if(!componentTypes.includes(componentType))throw Error("Invalid component type");
         const rect=canvasRef.current?.getBoundingClientRect();
         const width=rect?.width||800,height=rect?.height||600;
         if(x!==undefined && (!Number.isFinite(x)||x<0||x>width))throw Error("Invalid x coordinate");
         if(y!==undefined && (!Number.isFinite(y)||y<0||y>height))throw Error("Invalid y coordinate");
         const id=generateId();
         const comp={id,type:componentType,x:x??width/2,y:y??height/2,rotation:0,props:{...DEFAULT_VALUES[componentType]}};
         dispatch({type:"ADD_COMPONENT",compType:componentType,x:comp.x,y:comp.y,id});
         return {id,componentType,x:comp.x,y:comp.y};
       })},
      {name:"esbiko_circuit_update_component",description:"Modify existing circuit element position, angle, or supported component property.",
       inputSchema:{type:"object",properties:{
         id:{type:"string"},x:{type:"number"},y:{type:"number"},rotation:{type:"number"},
         props:{type:"object"},
       },required:["id"],additionalProperties:false},
       execute:createSafeToolExecutor("circuit_update_component",async({id,x,y,rotation,props})=>{
         const comp=readValidComponent(id);
         const patch={};
         const rect=canvasRef.current?.getBoundingClientRect();
         const width=rect?.width||800,height=rect?.height||600;
         if(x!==undefined){if(!Number.isFinite(x)||x<0||x>width)throw Error("Invalid x");patch.x=x;}
         if(y!==undefined){if(!Number.isFinite(y)||y<0||y>height)throw Error("Invalid y");patch.y=y;}
         if(rotation!==undefined){if(!Number.isInteger(rotation)||rotation<0||rotation>=360||rotation%90)throw Error("Invalid rotation");patch.rotation=rotation;}
         if(props!==undefined){
           if(!props||typeof props!=="object"||Array.isArray(props))throw Error("Invalid props");
           for(const [key,value] of Object.entries(props)){
             if(!(key in DEFAULT_VALUES[comp.type]))throw Error("Unknown component property "+key);
             const previous=DEFAULT_VALUES[comp.type][key];
             if(typeof value!==typeof previous)throw Error("Invalid component property type");
             if(typeof value==="number"&&(!Number.isFinite(value)||value<0||value>1e9))throw Error("Invalid component property value");
           }
           patch.props=props;
         }
         dispatch({type:"UPDATE_COMPONENT",id,patch});
         return {id,updated:patch};
       })},
      {name:"esbiko_circuit_connect",description:"Connect a left/right terminal on each of two existing circuit elements.",
       inputSchema:{type:"object",properties:{
         fromId:{type:"string"},toId:{type:"string"},
         fromTerminal:{type:"string",enum:["left","right"]},toTerminal:{type:"string",enum:["left","right"]},
       },required:["fromId","toId","fromTerminal","toTerminal"],additionalProperties:false},
       execute:createSafeToolExecutor("circuit_connect",async({fromId,toId,fromTerminal,toTerminal})=>{
         readValidComponent(fromId);readValidComponent(toId);
         if(fromId===toId)throw Error("Cannot connect a component to itself");
         if(!["left","right"].includes(fromTerminal)||!["left","right"].includes(toTerminal))throw Error("Invalid terminal");
         if(latestRef.current.connections.some(w=>
           w.fromComponent===fromId&&w.toComponent===toId&&w.fromTerminal===fromTerminal&&w.toTerminal===toTerminal))
           throw Error("Connection already exists");
         const connection={id:generateId(),fromComponent:fromId,toComponent:toId,fromTerminal,toTerminal};
         dispatch({type:"ADD_CONNECTION",connection});return connection;
       })},
      {name:"esbiko_circuit_delete_component",description:"Delete a component and all connected wires.",
       inputSchema:{type:"object",properties:{id:{type:"string"}},required:["id"],additionalProperties:false},
       execute:createSafeToolExecutor("circuit_delete_component",async({id})=>{
         readValidComponent(id);dispatch({type:"DELETE_COMPONENT",id});return {deleted:id};
       })},
      {name:"esbiko_circuit_set_playback",description:"Start or pause circuit solving; ground required before starting.",
       inputSchema:{type:"object",properties:{running:{type:"boolean"}},required:["running"],additionalProperties:false},
       execute:createSafeToolExecutor("circuit_set_playback",async({running})=>{
         if(typeof running!=="boolean")throw Error("running must be boolean");
         if(running&&!latestRef.current.components.some(c=>c.type==="ground"))throw Error("Circuit requires Ground");
         dispatch({type:"SET_SIMULATING",value:running});return {running};
       })},
      {name:"esbiko_circuit_reset",description:"Reset circuit simulation without deleting components.",
       inputSchema:empty,execute:createSafeToolExecutor("circuit_reset",async()=>{
         actionRef.current.reset();return {reset:true};
       })},
      {name:"esbiko_circuit_clear",description:"Delete all components and connections.",
       inputSchema:empty,execute:createSafeToolExecutor("circuit_clear",async()=>{
         dispatch({type:"CLEAR_ALL"});return {cleared:true};
       })},
    ];
    registerWebMcpTools({modelContext:getDocumentModelContext(),tools,signal:controller.signal})
      .catch(error=>{if(!controller.signal.aborted)console.warn("Circuit WebMCP",error);});
    return ()=>controller.abort();
  },[dispatch]);

  // Clear scope when simulation stops or probe changes.
  useEffect(() => {
    if (!state.isSimulating) {
      setScopeSamples([]);
      return;
    }
    // When the user changes selected component (probe), clear the scope window.
    setScopeSamples([]);
  }, [state.isSimulating, state.selectedId]);

  useEffect(() => {
    // Collect scope samples from the selected component (probe).
    if (!state.isSimulating) return;
    if (!state.selectedId) return;

    const r = state.results?.components?.[state.selectedId];
    if (!r) return;

    setScopeSamples((prev) => {
      const next = [
        ...prev,
        {
          t: performance.now() / 1000,
          v: r.voltageDrop,
          i: r.current,
        },
      ];

      // Keep last ~900 samples (~15s at ~60fps)
      if (next.length > 900) next.splice(0, next.length - 900);
      return next;
    });
  }, [state.isSimulating, state.selectedId, state.results]);

  const handleToggleSim = () => {
    const goingToStart = !state.isSimulating;

    // Prevent starting without Ground (more educational, avoids floating circuits).
    if (goingToStart && !hasGround) {
      setSimWarning(
        "To start the simulation, please add a Ground component to the circuit."
      );
      return;
    }

    setSimWarning("");
    dispatch({ type: "SET_SIMULATING", value: goingToStart });
  };

  const handleAddComponent = (compType) => {
    const canvas = canvasRef.current;

    // DPR note:
    // canvas.width/height are device pixels after DPR scaling.
    // Use DOMRect (CSS pixels) for placing components visually.
    const rect = canvas?.getBoundingClientRect();
    const cx = rect ? rect.width / 2 : 400;
    const cy = rect ? rect.height / 2 : 300;

    dispatch({ type: "ADD_COMPONENT", compType, x: cx, y: cy });
  };

  const handleReset = () => {
    setScopeSamples([]); // keep scope clean
    reset();
  };

  const handleClearAll = () => {
    setScopeSamples([]);
    dispatch({ type: "CLEAR_ALL" });
  };

  return (
    <div className="circuit-root relative flex flex-col w-full h-full min-w-0 bg-[#1a1a2e] text-white font-sans overflow-y-auto xl:overflow-hidden">
      <CircuitHeader />

      {state.lab && (
        <LabsOverlay
          lab={state.lab}
          onClose={() => dispatch({ type: "CLOSE_LAB" })}
        />
      )}

      {/* Ground warning banner */}
      {simWarning && (
        <div className="mx-4 mt-2 mb-2 rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-4 py-2 text-yellow-200 text-sm">
          ⚠️ {simWarning}
        </div>
      )}

      <div className="flex flex-col xl:flex-row flex-1 min-w-0 xl:min-h-0 gap-2 xl:gap-0">
        <div className="order-2 xl:order-first min-w-0"><Sidebar
          isSimulating={state.isSimulating}
          onAdd={handleAddComponent}
          onToggleSim={handleToggleSim}
          onReset={handleReset}
          onClear={handleClearAll}
          onOpenLab={(lab) => dispatch({ type: "OPEN_LAB", lab })}
        /></div>

        <div data-esbiko-circuit-stage className="order-first xl:order-none w-full h-[min(58dvh,520px)] min-h-[290px] xl:h-full xl:min-h-0 min-w-0 xl:flex-1 overflow-hidden"><CircuitCanvas
          canvasRef={canvasRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
        /></div>

        <div className="order-3 xl:order-none min-w-0"><PropertiesPanel
          components={state.components}
          connections={state.connections}
          selectedId={state.selectedId}
          scopeSamples={scopeSamples}
          onClearScope={() => setScopeSamples([])}
          onSelect={(id) => dispatch({ type: "SELECT", id })}
          onRotate={(id) => dispatch({ type: "ROTATE_COMPONENT", id })}
          onUpdateProps={(id, propsPatch) =>
            dispatch({
              type: "UPDATE_COMPONENT",
              id,
              patch: { props: propsPatch },
            })
          }
          onDeleteComponent={(id) => dispatch({ type: "DELETE_COMPONENT", id })}
          onDeleteConnection={(id) =>
            dispatch({ type: "DELETE_CONNECTION", id })
          }
        /></div>
      </div>
    </div>
  );
}
