// src/simulations/subjects/physics/acoustics/Doppler/hooks/useAudioEngine.js
// Hook to manage the audio engine for the Doppler simulation
import { useRef } from "react";
import { AudioVoice } from "../SoundEngine";

export function useAudioEngine(masterVolume, isRunning) {
  const audioCtxRef = useRef(null);
  const masterGainRef = useRef(null);
  const voicesRef = useRef({});

  const initAudio = () => {
    if (!audioCtxRef.current) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtxRef.current = new AudioContext();

      masterGainRef.current = audioCtxRef.current.createGain();
      masterGainRef.current.gain.value = masterVolume;
      masterGainRef.current.connect(audioCtxRef.current.destination);
    }

    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
  };

  const updateVoice = (sourceId, freq, vol, instrumentType) => {
    if (!audioCtxRef.current) return;

    let voice = voicesRef.current[sourceId];

    if (!voice || voice.typeId !== instrumentType) {
      if (voice) voice.stop();

      voice = new AudioVoice(
        audioCtxRef.current,
        masterGainRef.current,
        instrumentType,
      );

      voicesRef.current[sourceId] = voice;
    }

    voice.setFrequency(freq);
    voice.setVolume(isRunning ? vol : 0);
  };

  const muteAllVoices = () => {
    Object.values(voicesRef.current).forEach((voice) => voice.setVolume(0));
  };

  const stopAllVoices = () => {
    Object.values(voicesRef.current).forEach((voice) => voice.stop());
    voicesRef.current = {};
  };

  const stopVoice = (sourceId) => {
    if (voicesRef.current[sourceId]) {
      voicesRef.current[sourceId].stop();
      delete voicesRef.current[sourceId];
    }
  };

  const setMasterVolumeValue = (value) => {
    if (masterGainRef.current) {
      masterGainRef.current.gain.value = value;
    }
  };

  return {
    masterGainRef,
    initAudio,
    updateVoice,
    muteAllVoices,
    stopAllVoices,
    stopVoice,
    setMasterVolumeValue,
  };
}