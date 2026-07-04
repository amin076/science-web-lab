// src/simulations/subjects/physics/acoustics/Doppler/components/DopplerShortRecorder.jsx
import { useRef, useState } from "react";
import { Circle, Square } from "lucide-react";

const OUTPUT_WIDTH = 1080;
const OUTPUT_HEIGHT = 1920;
const FPS = 60;
const RECORD_ROOT_ID = "doppler-record-root";

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const DopplerShortRecorder = () => {
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const drawFrameRef = useRef(null);
  const displayStreamRef = useRef(null);

  const [recording, setRecording] = useState(false);
  const [preparing, setPreparing] = useState(false);

  const startRecording = async () => {
    try {
      setPreparing(true);
      await wait(250);

      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          frameRate: FPS,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: true,
      });

      displayStreamRef.current = displayStream;

      const video = document.createElement("video");
      video.srcObject = displayStream;
      video.muted = true;
      video.playsInline = true;
      await video.play();

      const canvas = document.createElement("canvas");
      canvas.width = OUTPUT_WIDTH;
      canvas.height = OUTPUT_HEIGHT;

      const ctx = canvas.getContext("2d");
      const canvasStream = canvas.captureStream(FPS);

      displayStream.getAudioTracks().forEach((track) => {
        canvasStream.addTrack(track);
      });

      const draw = () => {
        const root = document.getElementById(RECORD_ROOT_ID);
        const rect = root?.getBoundingClientRect();

        const vw = video.videoWidth;
        const vh = video.videoHeight;

        if (rect && vw && vh) {
          const scaleX = vw / window.innerWidth;
          const scaleY = vh / window.innerHeight;

          const rootX = rect.left * scaleX;
          const rootY = rect.top * scaleY;
          const rootW = rect.width * scaleX;
          const rootH = rect.height * scaleY;

          const targetRatio = OUTPUT_WIDTH / OUTPUT_HEIGHT;

          let sw = rootH * targetRatio;
          let sh = rootH;

          if (sw > rootW) {
            sw = rootW;
            sh = rootW / targetRatio;
          }

          const sx = rootX + (rootW - sw) / 2;
          const sy = rootY + (rootH - sh) / 2;

          ctx.drawImage(
            video,
            sx,
            sy,
            sw,
            sh,
            0,
            0,
            OUTPUT_WIDTH,
            OUTPUT_HEIGHT,
          );
        }

        drawFrameRef.current = requestAnimationFrame(draw);
      };

      draw();

      chunksRef.current = [];

      const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
        ? "video/webm;codecs=vp9"
        : "video/webm";

      const recorder = new MediaRecorder(canvasStream, { mimeType });

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };

      recorder.onstop = () => {
        cancelAnimationFrame(drawFrameRef.current);

        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = `esbiko-doppler-short-${Date.now()}.webm`;
        a.click();

        URL.revokeObjectURL(url);
        displayStream.getTracks().forEach((track) => track.stop());

        setRecording(false);
        setPreparing(false);
      };

      recorderRef.current = recorder;
      recorder.start();

      setRecording(true);
      setPreparing(false);
    } catch (error) {
      console.error(error);
      setPreparing(false);
      setRecording(false);
    }
  };

  const stopRecording = () => {
    recorderRef.current?.stop();
  };

  const controlsHidden = recording || preparing;

  return (
    <>
      <div className="pointer-events-none absolute left-1/2 top-0 z-[35] h-full aspect-[9/16] -translate-x-1/2 border-x-2 border-white/30 bg-white/[0.015]" />

      {!controlsHidden && (
        <div className="absolute bottom-5 left-5 z-50 flex -translate-x-1/2 items-center gap-2 rounded-2xl border border-white/20 bg-slate-950/75 px-3 py-2 shadow-2xl backdrop-blur-md">
          <button
            onClick={startRecording}
            className="flex items-center gap-2 rounded-xl bg-red-500 px-4 py-2 text-xs font-black text-white hover:bg-red-400"
          >
            <Circle size={14} fill="currentColor" />
            Record 9:16
          </button>
        </div>
      )}

      {recording && (
        <button
          onClick={stopRecording}
          className="absolute bottom-5 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-xl bg-slate-100 px-4 py-2 text-xs font-black text-slate-950 shadow-2xl"
        >
          <Square size={14} fill="currentColor" />
          Stop & Save
        </button>
      )}
    </>
  );
};

export default DopplerShortRecorder;