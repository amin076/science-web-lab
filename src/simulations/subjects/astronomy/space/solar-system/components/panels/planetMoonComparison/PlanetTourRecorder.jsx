import { useRef, useState } from "react";
import VideoRecorderControls from "@/components/shared/video/VideoRecorderControls.jsx";

// Saturn ring flyby recording duration.
// You can still stop manually earlier with Stop Tour Recording.
const TOUR_DURATION_MS = 82000;

export default function PlanetTourRecorder({ onStartTour, onStopTour }) {
  const recorderRef = useRef(null);
  const timeoutRef = useRef(null);

  const [tourRecording, setTourRecording] = useState(false);
  const [manualRecording, setManualRecording] = useState(false);

  const stopTourRecording = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // Stop the recorder first. Keep the tour alive briefly so the final
    // frame loop can flush and MediaRecorder can fire onstop/download.
    recorderRef.current?.stopRecording?.();

    window.setTimeout(() => {
      onStopTour?.();
      setTourRecording(false);
    }, 700);
  };

  const recordTour = () => {
    const started = recorderRef.current?.startRecording?.();
    if (!started) return;

    setTourRecording(true);

    window.setTimeout(() => {
      onStartTour?.();
    }, 350);

    timeoutRef.current = window.setTimeout(() => {
      stopTourRecording();
    }, TOUR_DURATION_MS);
  };

  return (
    <div style={{ display: "flex", gap: 10 }}>
      <VideoRecorderControls
        ref={recorderRef}
        canvasSelector="#planet-moon-comparison-root canvas"
        outputMode="shorts"
        fileName={`esbiko-saturn-ring-flyby-${Date.now()}.webm`}
        showButton={!tourRecording}
        onRecordingChange={setManualRecording}
      />

      {!manualRecording && (
        <button
          onClick={tourRecording ? stopTourRecording : recordTour}
          style={{
            padding: "10px 16px",
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.2)",
            background: tourRecording
              ? "rgba(239,68,68,0.9)"
              : "rgba(34,197,94,0.9)",
            color: "white",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          {tourRecording ? "Stop Tour Recording" : "🎬 Record Tour"}
        </button>
      )}
    </div>
  );
}

