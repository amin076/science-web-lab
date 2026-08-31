// src/simulations/subjects/physics/acoustics/Doppler/SoundEngine.js

export const INSTRUMENTS = {
  ESBIKO_VOICE: {
    id: "esbiko_voice",
    name: "Esbiko Voice",
    group: "Real Recordings",
    type: "sample",
    url: "/audio/doppler/romantic_ringtone.mp3",
  },

  CAR_ENGINE: {
    id: "car_engine",
    name: "Real Car Engine",
    group: "Real Recordings",
    type: "sample",
    url: "/audio/doppler/cityford_trimmed.mp3",
  },

  DIESEL_ENGINE: {
    id: "diesel_engine",
    name: "Diesel Engine",
    group: "Real Recordings",
    type: "sample",
    url: "/audio/doppler/citydiesiel_trimmed.mp3",
  },

  BUS_ENGINE: {
    id: "bus_engine",
    name: "Bus Engine",
    group: "Real Recordings",
    type: "sample",
    url: "/audio/doppler/citybus_trimmed.mp3",
  },

  TRACTOR_ENGINE: {
    id: "tractor_engine",
    name: "Tractor Engine",
    group: "Real Recordings",
    type: "sample",
    url: "/audio/doppler/tractor_trimmed.mp3",
  },

  AMBULANCE_SIREN: {
    id: "ambulance_siren",
    name: "Ambulance Siren",
    group: "Real Recordings",
    type: "sample",
    url: "/audio/doppler/ambulance_trimmed.mp3",
  },

  POLICE_SIREN: {
    id: "police_siren",
    name: "Police Siren",
    group: "Real Recordings",
    type: "sample",
    url: "/audio/doppler/police_trimmed.mp3",
  },

  SINE: {
    id: "sine",
    name: "Pure Tone (Sine)",
    group: "Pure Waves",
    type: "simple",
    shape: "sine",
  },

  SAW: {
    id: "saw",
    name: "Sawtooth Wave",
    group: "Pure Waves",
    type: "simple",
    shape: "sawtooth",
  },

  SQUARE: {
    id: "square",
    name: "Square Wave",
    group: "Pure Waves",
    type: "simple",
    shape: "square",
  },

  ORGAN: {
    id: "organ",
    name: "Electric Organ",
    group: "Synthetic Instruments",
    type: "complex",
  },

  BRASS: {
    id: "brass",
    name: "Synth Brass",
    group: "Synthetic Instruments",
    type: "complex",
  },

  DRONE: {
    id: "drone",
    name: "Sci-Fi Drone",
    group: "Synthetic Instruments",
    type: "complex",
  },

  ENGINE: {
    id: "engine",
    name: "Synthetic Car Engine",
    group: "Engine Sounds",
    type: "complex",
  },
};

const getInstrumentById = (typeId) =>
  Object.values(INSTRUMENTS).find((instrument) => instrument.id === typeId);

const audioBufferCache = new Map();

async function loadAudioBuffer(ctx, url) {
  if (audioBufferCache.has(url)) {
    return audioBufferCache.get(url);
  }

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to load audio sample: ${url}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const audioBuffer = await ctx.decodeAudioData(arrayBuffer);

  audioBufferCache.set(url, audioBuffer);
  return audioBuffer;
}

export class AudioVoice {
  constructor(audioCtx, destination, typeId) {
    this.ctx = audioCtx;
    this.typeId = typeId;
    this.nodes = [];
    this.sampleSource = null;
    this.sampleReady = false;
    this.sampleLoadError = false;
    this.lastFreq = 440;
    this.lastBaseFreq = 440;

    this.output = this.ctx.createGain();
    this.output.gain.value = 0;
    this.panNode = this.ctx.createStereoPanner?.() || null;

    if (this.panNode) {
      this.output.connect(this.panNode);
      this.panNode.connect(destination);
    } else {
      this.output.connect(destination);
    }

    this.instrument = getInstrumentById(this.typeId);
    this.isSample = this.instrument?.type === "sample";

    this.setupVoice();
  }

  setupVoice() {
    const t = this.ctx.currentTime;
    const instrument = getInstrumentById(this.typeId);

    if (instrument?.type === "sample") {
      this.setupSampleVoice(instrument);
      return;
    }

    if (
      this.typeId === "sine" ||
      this.typeId === "saw" ||
      this.typeId === "square"
    ) {
      const osc = this.ctx.createOscillator();
      osc.type = INSTRUMENTS[this.typeId.toUpperCase()].shape;
      osc.connect(this.output);
      osc.start(t);
      this.nodes.push(osc);
      return;
    }

    if (this.typeId === "organ") {
      const ratios = [0.5, 1, 2, 4];
      const gains = [0.5, 1, 0.6, 0.3];

      ratios.forEach((ratio, i) => {
        const osc = this.ctx.createOscillator();
        osc.type = "sine";

        const gain = this.ctx.createGain();
        gain.gain.value = gains[i] * 0.4;

        osc.connect(gain);
        gain.connect(this.output);
        osc.start(t);

        this.nodes.push({ osc, ratio });
      });

      return;
    }

    if (this.typeId === "engine") {
      const base = this.ctx.createOscillator();
      base.type = "sawtooth";

      const sub = this.ctx.createOscillator();
      sub.type = "square";

      const rumble = this.ctx.createOscillator();
      rumble.type = "sine";

      const filter = this.ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 500;
      filter.Q.value = 1.5;

      const baseGain = this.ctx.createGain();
      baseGain.gain.value = 0.45;

      const subGain = this.ctx.createGain();
      subGain.gain.value = 0.25;

      const rumbleGain = this.ctx.createGain();
      rumbleGain.gain.value = 0.15;

      base.connect(baseGain);
      sub.connect(subGain);
      rumble.connect(rumbleGain);

      baseGain.connect(filter);
      subGain.connect(filter);
      rumbleGain.connect(filter);

      filter.connect(this.output);

      base.start(t);
      sub.start(t);
      rumble.start(t);

      this.nodes.push({ osc: base, ratio: 1, filter });
      this.nodes.push({ osc: sub, ratio: 0.5 });
      this.nodes.push({ osc: rumble, ratio: 0.25 });
      return;
    }

    if (this.typeId === "brass") {
      const osc = this.ctx.createOscillator();
      osc.type = "sawtooth";

      const osc2 = this.ctx.createOscillator();
      osc2.type = "triangle";

      const filter = this.ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.Q.value = 2;

      osc.connect(filter);
      osc2.connect(filter);
      filter.connect(this.output);

      osc.start(t);
      osc2.start(t);

      this.nodes.push({ osc, ratio: 1, filter });
      this.nodes.push({ osc: osc2, ratio: 1.01 });
      return;
    }

    if (this.typeId === "drone") {
      const carrier = this.ctx.createOscillator();
      carrier.type = "sine";

      const modulator = this.ctx.createOscillator();
      modulator.type = "sawtooth";

      const modGain = this.ctx.createGain();
      modGain.gain.value = 50;

      modulator.connect(modGain);
      modGain.connect(carrier.frequency);

      carrier.connect(this.output);

      carrier.start(t);
      modulator.start(t);

      this.nodes.push({ osc: carrier, type: "carrier" });
      this.nodes.push({ osc: modulator, type: "modulator" });
    }
  }

  async setupSampleVoice(instrument) {
    try {
      const buffer = await loadAudioBuffer(this.ctx, instrument.url);

      if (this.output.context.state === "closed") return;

      const source = this.ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;

      source.connect(this.output);
      source.start(this.ctx.currentTime);

      this.sampleSource = source;
      this.sampleReady = true;

      this.setFrequency(this.lastFreq, this.lastBaseFreq);
    } catch (error) {
      this.sampleLoadError = true;
      console.error(error);
    }
  }

  setFrequency(freq, baseFreq = 440) {
    const t = this.ctx.currentTime;
    const timeConst = 0.02;

    this.lastFreq = freq;
    this.lastBaseFreq = baseFreq || 440;

    if (this.sampleSource) {
      const ratio = Math.max(0.35, Math.min(2.5, freq / this.lastBaseFreq));
      this.sampleSource.playbackRate.setTargetAtTime(ratio, t, timeConst);
      return;
    }

    this.nodes.forEach((node) => {
      if (node instanceof OscillatorNode) {
        node.frequency.setTargetAtTime(freq, t, timeConst);
      } else if (node.osc && node.ratio) {
        node.osc.frequency.setTargetAtTime(freq * node.ratio, t, timeConst);

        if (node.filter) {
          node.filter.frequency.setTargetAtTime(
            Math.min(1800, Math.max(250, freq * 2.5)),
            t,
            timeConst,
          );
        }
      } else if (node.type === "carrier") {
        node.osc.frequency.setTargetAtTime(freq, t, timeConst);
      } else if (node.type === "modulator") {
        node.osc.frequency.setTargetAtTime(freq * 0.5, t, timeConst);
      }
    });
  }

  setVolume(vol) {
    const t = this.ctx.currentTime;
    const boost = this.isSample ? 3.0 : 1.0;
    const safeVol = Math.min(1.0, vol * boost);

    this.output.gain.setTargetAtTime(safeVol, t, 0.02);
  }

  setPan(value) {
    if (!this.panNode) return;

    const pan = Math.max(-1, Math.min(1, Number(value) || 0));
    this.panNode.pan.setTargetAtTime(pan, this.ctx.currentTime, 0.03);
  }

  stop() {
    const t = this.ctx.currentTime;
    this.output.gain.setTargetAtTime(0, t, 0.05);

    setTimeout(() => {
      try {
        if (this.sampleSource) {
          this.sampleSource.stop();
          this.sampleSource.disconnect();
        }

        this.nodes.forEach((node) => {
          if (node instanceof OscillatorNode) {
            node.stop();
            node.disconnect();
          } else if (node.osc) {
            node.osc.stop();
            node.osc.disconnect();
          }
        });

        this.output.disconnect();
        this.panNode?.disconnect();
      } catch {
        // Already stopped/disconnected.
      }
    }, 120);
  }
}
