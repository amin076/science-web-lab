// src/data/experiments/physics/waves.js
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import HeadphonesIcon from "@mui/icons-material/Headphones";
import GraphicEqIcon from "@mui/icons-material/GraphicEq";
import OpacityIcon from "@mui/icons-material/Opacity";
import WavesIcon from "@mui/icons-material/Waves";

export const physicsWaves = [
  {
    id: "physics.acoustics.doppler",
    domain: "physics",
    topic: "waves",
    name: "Doppler Effect",
    desc: "Hear the shift. Visualize how sound wave frequencies compress.",
    Icon: GraphicEqIcon,
    gradient: "linear-gradient(135deg, #f43f5e, #ec4899)",
    demo: true,
    engine: "canvas2d",
    tags: ["doppler", "sound", "frequency", "webmcp", "agent-ready"],
    platform: {
      capabilities: {
        interactive: {
          supported: true,
          verified: true,
          source: "doppler-webmcp-adapter.v1",
        },
        physics: {
          supported: true,
          verified: true,
          source: "doppler-webmcp-adapter.v1",
        },
        audio: {
          supported: true,
          verified: true,
          source: "doppler-webmcp-director.v2",
        },
        recording: {
          supported: true,
          verified: true,
          source: "doppler-webmcp-director.v2",
          reason: "The in-app 9:16 Canvas recorder captures synchronized Web Audio without screen sharing.",
        },
        export: {
          supported: true,
          verified: true,
          source: "doppler-webmcp-director.v2",
          reason: "A finalized AI-directed recording is exported as a downloadable WebM file.",
        },
        timeline: {
          supported: true,
          verified: true,
          source: "doppler-webmcp-director.v2",
          reason: "The verified director plan runs timed approach, passage, comparison, and completion phases.",
        },
        presets: {
          supported: true,
          verified: true,
          source: "doppler-webmcp-director.v2",
          reason: "The director exposes recorded car, diesel, bus, tractor, and siren sources.",
        },
        stateRead: {
          supported: true,
          verified: true,
          source: "doppler-webmcp-director.v2",
        },
        commandExecution: {
          supported: true,
          verified: true,
          source: "doppler-webmcp-director.v2",
        },
        agentReady: {
          supported: true,
          verified: true,
          source: "doppler-webmcp-director.v2",
        },
      },
    },
  },
  {
    id: "physics.acoustics.sound-waves",
    domain: "physics",
    topic: "waves",
    name: "Sound Waves Lab",
    desc: "Visualize how frequency, amplitude, and waveform shape create the sounds we hear.",
    Icon: VolumeUpIcon,
    gradient: "linear-gradient(135deg, #f43f5e, #ec4899)",
    demo: true,
  },
  {
    id: "physics.acoustics.spatial-audio",
    domain: "physics",
    topic: "waves",
    name: "Spatial Audio Lab",
    desc: "Experience 3D sound in a virtual environment.",
    Icon: HeadphonesIcon,
    gradient: "linear-gradient(135deg, #f43f5e, #ec4899)",
    demo: true,
  },
  {
    id: "physics.waves.surface-waves-double-slit",
    domain: "physics",
    topic: "waves",
    name: "Ripple Tank",
    desc: "Create water waves and replicate Young’s famous double-slit experiment.",
    Icon: OpacityIcon,
    gradient: "linear-gradient(135deg, #06b6d4, #3b82f6)",
    demo: true,
  },
  {
    id: "physics.waves.multi-source-interference",
    domain: "physics",
    topic: "waves",
    name: "Multi-Source Interference",
    desc: "Visualize wave interference from multiple sources.",
    Icon: WavesIcon,
    gradient: "linear-gradient(135deg, #06b6d4, #3b82f6)",
    demo: true,
  },
];
