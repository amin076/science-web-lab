import { readEmbeddedMcpParameters } from "@/platform/agent";
import { createSafeToolExecutor, registerWebMcpTools, getDocumentModelContext } from "@/webmcp/registerWebMcpTools.js";
﻿import { useEffect, useMemo, useRef, useState } from "react";
import { TimelineWorkspace } from "@/components/timeline";
import {
  evolutionSubjects,
  getEvolutionSubject,
} from "./data/speciesTimelines.js";

const AUTOPLAY_INTERVAL_MS = 2600;

function clampStageIndex(index, stages) {
  const maximum = Math.max(0, stages.length - 1);
  const numericIndex = Number(index);
  if (!Number.isFinite(numericIndex)) return 0;
  return Math.max(0, Math.min(maximum, Math.round(numericIndex)));
}

export default function EvolutionOfLifeSimulation() {
  const initialJourney = evolutionSubjects[0];
  const embedded=useMemo(()=>readEmbeddedMcpParameters("evolution-of-life",{subjectId:initialJourney?.id??"life",stageIndex:0}),[initialJourney]);
  const [selectedSubjectId, setSelectedSubjectId] = useState(embedded.values.subjectId);
  const [stageIndex, setStageIndex] = useState(embedded.values.stageIndex);
  const [isPlaying, setIsPlaying] = useState(false);

  const selectedSubject = useMemo(
    () => getEvolutionSubject(selectedSubjectId) || initialJourney,
    [initialJourney, selectedSubjectId],
  );

  const subjectTimeline = selectedSubject?.timeline ?? [];
  const currentIndex = clampStageIndex(stageIndex, subjectTimeline);

  // A journey change resets the stage in the selection handler, not on mount (URL hydration).

  useEffect(() => {
    if (!isPlaying || subjectTimeline.length < 2) return undefined;

    const timer = window.setInterval(() => {
      setStageIndex((current) => {
        const next = current + 1;
        if (next >= subjectTimeline.length) {
          setIsPlaying(false);
          return subjectTimeline.length - 1;
        }
        return next;
      });
    }, AUTOPLAY_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [isPlaying, subjectTimeline.length]);

  const handleSelectJourney = (id) => {
    setSelectedSubjectId(id);setStageIndex(0);setIsPlaying(false);
  };
  const handleStageChange = (nextIndex) => {
    setStageIndex(clampStageIndex(nextIndex, subjectTimeline));
  };

  const handleReset = () => {
    setIsPlaying(false);
    setStageIndex(0);
  };

  const live=useRef({});
  live.current={subjectId:selectedSubjectId,stageIndex:currentIndex,playing:isPlaying,totalStages:subjectTimeline.length,stage:subjectTimeline[currentIndex]};
  const handlers=useRef({});
  handlers.current={setSubject:handleSelectJourney,setStage:handleStageChange,setPlay:setIsPlaying,reset:handleReset};
  useEffect(()=>{
    const controller=new AbortController();
    const empty={type:"object",properties:{},additionalProperties:false};
    const tools=[
      {name:"esbiko_evolution_get_state",description:"Read evolution journey, current stage, its scientific timeline data and playback state.",inputSchema:empty,annotations:{readOnlyHint:true},execute:createSafeToolExecutor("evolution_get_state",async()=>({simulationId:"evolution-of-life",state:live.current}))},
      {name:"esbiko_evolution_configure",description:"Choose life/humans/cats/horses timeline or seek an integer stage.",inputSchema:{type:"object",properties:{subjectId:{type:"string",enum:["life","humans","cats","horses"]},stageIndex:{type:"integer",minimum:0,maximum:200}},additionalProperties:false},
       execute:createSafeToolExecutor("evolution_configure",async(input)=>{
         if(!input||typeof input!=="object"||Array.isArray(input))throw Error("Expected timeline settings");
         const allowed=["life","humans","cats","horses"];
         for(const [key,value] of Object.entries(input)){
           if(key==="subjectId"){if(!allowed.includes(value))throw Error("Unknown evolution timeline");}
           else if(key==="stageIndex"){if(!Number.isInteger(value)||value<0||value>=getEvolutionSubject(input.subjectId??live.current.subjectId).timeline.length)throw Error("Stage index out of range");}
           else throw Error("Unknown timeline control: "+key);
         }
         if(input.subjectId!==undefined)handlers.current.setSubject(input.subjectId);
         if(input.stageIndex!==undefined)handlers.current.setStage(input.stageIndex);
         return {accepted:input};
       })},
      {name:"esbiko_evolution_set_playback",description:"Autoplay or pause the current evolutionary lineage timeline.",inputSchema:{type:"object",properties:{playing:{type:"boolean"}},required:["playing"],additionalProperties:false},execute:createSafeToolExecutor("evolution_set_playback",async({playing})=>{if(typeof playing!=="boolean")throw Error("playing must be boolean");handlers.current.setPlay(playing);return {playing};})},
      {name:"esbiko_evolution_reset",description:"Return to first stage and stop timeline autoplay.",inputSchema:empty,execute:createSafeToolExecutor("evolution_reset",async()=>{handlers.current.reset();return {reset:true};})},
    ];
    registerWebMcpTools({modelContext:getDocumentModelContext(),tools,signal:controller.signal}).catch(error=>{if(!controller.signal.aborted)console.warn("Evolution WebMCP",error);});
    return ()=>controller.abort();
  },[]);
  return (
    <TimelineWorkspace
      title="Evolution of Life"
      subtitle="Biology · Evolution timeline"
      journeys={evolutionSubjects}
      selectedJourneyId={selectedSubjectId}
      onSelectJourney={handleSelectJourney}
      stages={subjectTimeline}
      currentIndex={currentIndex}
      onChangeStage={handleStageChange}
      isPlaying={isPlaying}
      onTogglePlay={() => setIsPlaying((playing) => !playing)}
      onReset={handleReset}
      onBack={() => window.history.back()}
    />
  );
}
