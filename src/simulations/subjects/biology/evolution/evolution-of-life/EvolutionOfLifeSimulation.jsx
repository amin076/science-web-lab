import { useEffect, useMemo, useState } from "react";
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
  const [selectedSubjectId, setSelectedSubjectId] = useState(initialJourney?.id ?? "life");
  const [stageIndex, setStageIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const selectedSubject = useMemo(
    () => getEvolutionSubject(selectedSubjectId) || initialJourney,
    [initialJourney, selectedSubjectId],
  );

  const subjectTimeline = selectedSubject?.timeline ?? [];
  const currentIndex = clampStageIndex(stageIndex, subjectTimeline);

  useEffect(() => {
    setStageIndex(0);
    setIsPlaying(false);
  }, [selectedSubjectId]);

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

  const handleStageChange = (nextIndex) => {
    setStageIndex(clampStageIndex(nextIndex, subjectTimeline));
  };

  const handleReset = () => {
    setIsPlaying(false);
    setStageIndex(0);
  };

  return (
    <TimelineWorkspace
      title="Evolution of Life"
      subtitle="Biology · Evolution timeline"
      journeys={evolutionSubjects}
      selectedJourneyId={selectedSubjectId}
      onSelectJourney={setSelectedSubjectId}
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
