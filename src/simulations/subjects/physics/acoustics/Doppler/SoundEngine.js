// SoundEngine.js

export const INSTRUMENTS = {
  SINE: { id: "sine", name: "Pure Tone (Sine)", type: "simple", shape: "sine" },
  SAW: {
    id: "saw",
    name: "Buzzer (Sawtooth)",
    type: "simple",
    shape: "sawtooth",
  },
  SQUARE: {
    id: "square",
    name: "8-Bit (Square)",
    type: "simple",
    shape: "square",
  },
  ORGAN: { id: "organ", name: "Electric Organ", type: "complex" },
  BRASS: { id: "brass", name: "Synth Brass", type: "complex" },
  DRONE: { id: "drone", name: "Sci-Fi Drone", type: "complex" },
};

export class AudioVoice {
  constructor(audioCtx, destination, typeId) {
    this.ctx = audioCtx;
    this.typeId = typeId;
    this.nodes = []; // Keep track of all oscillators/nodes

    // Master Gain for this voice (controls volume)
    this.output = this.ctx.createGain();
    this.output.connect(destination);

    this.setupVoice();
  }

  setupVoice() {
    const t = this.ctx.currentTime;

    if (
      this.typeId === "sine" ||
      this.typeId === "saw" ||
      this.typeId === "square"
    ) {
      // --- SIMPLE WAVEFORMS ---
      const osc = this.ctx.createOscillator();
      osc.type = INSTRUMENTS[this.typeId.toUpperCase()].shape;
      osc.connect(this.output);
      osc.start(t);
      this.nodes.push(osc);
    } else if (this.typeId === "organ") {
      // --- HAMMOND ORGAN STYLE (Additive Synthesis) ---
      // Stack sine waves at different octaves
      const ratios = [0.5, 1, 2, 4]; // Sub-octave, Base, Octave up, 2 Octaves up
      const gains = [0.5, 1, 0.6, 0.3];

      ratios.forEach((ratio, i) => {
        const osc = this.ctx.createOscillator();
        osc.type = "sine";

        const gain = this.ctx.createGain();
        gain.gain.value = gains[i] * 0.4; // Scale down so it doesn't clip

        osc.connect(gain);
        gain.connect(this.output);
        osc.start(t);

        // Store osc and ratio so we can update pitch later
        this.nodes.push({ osc, ratio });
      });
    } else if (this.typeId === "brass") {
      // --- SYNTH BRASS (Sawtooth + Lowpass Filter) ---
      const osc = this.ctx.createOscillator();
      osc.type = "sawtooth";

      const osc2 = this.ctx.createOscillator();
      osc2.type = "triangle"; // Add body

      const filter = this.ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.Q.value = 2; // Resonance

      osc.connect(filter);
      osc2.connect(filter);
      filter.connect(this.output);

      osc.start(t);
      osc2.start(t);

      this.nodes.push({ osc, ratio: 1, filter });
      this.nodes.push({ osc: osc2, ratio: 1.01 }); // Slight detune for thickness
    } else if (this.typeId === "drone") {
      // --- SCI-FI DRONE (FM Synthesis) ---
      // Carrier
      const carrier = this.ctx.createOscillator();
      carrier.type = "sine";

      // Modulator (vibrato/growl)
      const modulator = this.ctx.createOscillator();
      modulator.type = "sawtooth";

      const modGain = this.ctx.createGain();
      modGain.gain.value = 50; // Modulation depth

      modulator.connect(modGain);
      modGain.connect(carrier.frequency); // FM Synthesis connection

      carrier.connect(this.output);

      carrier.start(t);
      modulator.start(t);

      this.nodes.push({ osc: carrier, type: "carrier" });
      this.nodes.push({ osc: modulator, type: "modulator" });
    }
  }

  setFrequency(freq) {
    const t = this.ctx.currentTime;
    const timeConst = 0.02; // Smoothing

    // Update based on voice type
    this.nodes.forEach((node) => {
      if (node instanceof OscillatorNode) {
        // Simple types
        node.frequency.setTargetAtTime(freq, t, timeConst);
      } else if (node.osc && node.ratio) {
        // Additive types (Organ/Brass)
        node.osc.frequency.setTargetAtTime(freq * node.ratio, t, timeConst);
        // For Brass, open the filter as pitch gets higher (brighter)
        if (node.filter) {
          node.filter.frequency.setTargetAtTime(freq * 3, t, timeConst);
        }
      } else if (node.type === "carrier") {
        // Drone Carrier
        node.osc.frequency.setTargetAtTime(freq, t, timeConst);
      } else if (node.type === "modulator") {
        // Drone Modulator - keep ratio fixed or independent?
        // Let's make the rumble speed up with pitch
        node.osc.frequency.setTargetAtTime(freq * 0.5, t, timeConst);
      }
    });
  }

  setVolume(vol) {
    const t = this.ctx.currentTime;
    // Smooth volume to prevent clicks
    this.output.gain.setTargetAtTime(vol, t, 0.02);
  }

  stop() {
    // Disconnect and stop everything to prevent memory leaks
    const t = this.ctx.currentTime;
    this.output.gain.setTargetAtTime(0, t, 0.05); // Fade out

    setTimeout(() => {
      this.output.disconnect();
    }, 100);
  }
}
