import { readEmbeddedMcpParameters } from "@/platform/agent";
import { createSafeToolExecutor, registerWebMcpTools, getDocumentModelContext } from "@/webmcp/registerWebMcpTools.js";
import React, { useState, Suspense, useEffect, useRef, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import { EarthSystem3D } from "./EarthSystem3D";
import { Sidebar } from "./Sidebar";
// NEW IMPORT
import { SimulationHUD } from "./SimulationHUD";

export default function GeologySimulator3D() {
  const defaults=useMemo(()=>({
    showCrust: true,
    showMantle: true,
    showOuter: true,
    showInner: true,
    sliceDepth: 2,
    sliceVariant: "small",
    showClouds: true,
    showTectonics: false,
    showAxis: false,
    showField: false,
    showNight: false,
  }),[]);
  const initial=useMemo(()=>readEmbeddedMcpParameters("earth-science.geology.plate-tectonics",{...defaults,scaleMode:"scientific"}).values,[defaults]);
  const [settings,setSettings]=useState(()=>{const {scaleMode,...rest}=initial;return rest});
  const [scaleMode,setScaleMode]=useState(initial.scaleMode);
  const currentRef=useRef({});
  currentRef.current={...settings,scaleMode};
  const toggleSetting = (key) => setSettings((p) => ({ ...p, [key]: !p[key] }));
  const setSliceDepth = (depth) =>
    setSettings((p) => ({ ...p, sliceDepth: depth }));
  const setSliceVariant = (variant) =>
    setSettings((p) => ({ ...p, sliceVariant: variant }));

  const [isNarrow, setIsNarrow] = useState(() => typeof window !== "undefined" && window.innerWidth < 900);

  useEffect(() => {
    const handleResize = () => setIsNarrow(window.innerWidth < 900);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handlers=useRef({});
  handlers.current={setSettings,setScaleMode};
  useEffect(()=>{
    const controller=new AbortController();
    const properties=Object.fromEntries(Object.keys(defaults).map(k=>[k,typeof defaults[k]==="boolean"?{type:"boolean"}:k==="sliceDepth"?{type:"integer",minimum:0,maximum:4}:{type:"string",enum:["small","big"]}]));
    properties.scaleMode={type:"string",enum:["scientific","schematic"]};
    const empty={type:"object",properties:{},additionalProperties:false};
    const snapshot=()=>({simulationId:"earth-science.geology.plate-tectonics",state:currentRef.current});
    const tools=[
      {name:"esbiko_geology_get_state",description:"Read actual geological layers, cross-section depth, night, clouds, tectonics, field and scale mode.",inputSchema:empty,annotations:{readOnlyHint:true},execute:createSafeToolExecutor("geology_get_state",async()=>snapshot())},
      {name:"esbiko_geology_configure",description:"Configure real Earth layer visibility, cutaway geometry and scientific/schematic scale.",inputSchema:{type:"object",properties,additionalProperties:false},execute:createSafeToolExecutor("geology_configure",async(input)=>{
        if(!input||typeof input!=="object"||Array.isArray(input))throw Error("Expected geology controls");
        for(const [key,value] of Object.entries(input)){const rule=properties[key];if(!rule||(rule.type==="integer"?!Number.isInteger(value):typeof value!==rule.type)||(rule.enum&&!rule.enum.includes(value))||(rule.minimum!==undefined&&(value<rule.minimum||value>rule.maximum)))throw Error("Invalid geology control: "+key);}
        const {scaleMode,...visual}=input;
        if(Object.keys(visual).length)handlers.current.setSettings(p=>({...p,...visual}));
        if(scaleMode!==undefined)handlers.current.setScaleMode(scaleMode);
        currentRef.current={...currentRef.current,...input};
        return snapshot();
      })},
      {name:"esbiko_geology_reset",description:"Restore default scientific Earth model and cross-section.",inputSchema:empty,execute:createSafeToolExecutor("geology_reset",async()=>{
        handlers.current.setSettings({...defaults});handlers.current.setScaleMode("scientific");
        currentRef.current={...defaults,scaleMode:"scientific"};return snapshot();
      })},
    ];
    registerWebMcpTools({modelContext:getDocumentModelContext(),tools,signal:controller.signal}).catch(error=>{if(!controller.signal.aborted)console.warn("Geology MCP",error);});
    return ()=>controller.abort();
  },[defaults]);
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "#050510",
        color: "white",
        display: "flex",
        flexDirection: isNarrow ? "column" : "row",
        overflowY: isNarrow ? "auto" : "hidden",
        minWidth: 0,
      }}
    >
      <div data-esbiko-geology-stage style={{ flex: isNarrow ? "none" : 1, height: isNarrow ? "min(58dvh, 530px)" : "100%", minHeight: isNarrow ? 290 : 0, position: "relative", minWidth: 0 }}>
        {/* NEW: HUD Component (Replaces old static title) */}
        <SimulationHUD />

        <Canvas
          style={{ width: "100%", height: "100%" }}
          camera={{ position: [6, 4, 12], fov: 40 }}
          gl={{ localClippingEnabled: true, antialias: true }}
          shadows
        >
          {/* Increased ambient light to prevent pitch black insides */}
          <ambientLight intensity={0.4} />
          <directionalLight position={[15, 5, 5]} intensity={3.0} />
          <pointLight position={[-10, 5, -5]} intensity={0.5} />
          <spotLight
            position={[-10, 10, -5]}
            intensity={1}
            color="#b0b0ff"
            angle={0.5}
          />

          <Stars
            radius={100}
            depth={50}
            count={5000}
            factor={4}
            fade
            speed={1}
          />

          <Suspense fallback={null}>
            <EarthSystem3D settings={settings} scaleMode={scaleMode} />
          </Suspense>

          <OrbitControls
            enablePan={false}
            minDistance={4.1}
            maxDistance={100}
          />
        </Canvas>
      </div>

      <div
        data-esbiko-geology-controls
        style={{
          width: isNarrow ? "100%" : 360,
          flexShrink: 0,
          height: isNarrow ? "auto" : "100%",
          minHeight: isNarrow ? 320 : 0,
          borderLeft: isNarrow ? "none" : "1px solid rgba(255,255,255,0.08)",
          borderTop: isNarrow ? "1px solid rgba(255,255,255,0.08)" : "none",
          background: "rgba(10, 15, 30, 0.55)",
          backdropFilter: "blur(10px)",
          overflowY: "auto",
        }}
      >
        <Sidebar
          settings={settings}
          scaleMode={scaleMode}
          setScaleMode={setScaleMode}
          toggleSetting={toggleSetting}
          setSliceDepth={setSliceDepth}
          setSliceVariant={setSliceVariant}
        />
      </div>
    </div>
  );
}