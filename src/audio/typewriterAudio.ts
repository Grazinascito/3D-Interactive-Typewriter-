class TypewriterAudioEngine {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Play standard mechanical typebar strike
  public playKeyStrike() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const jitter = (Math.random() - 0.5) * 0.15;

    // 1. High frequency mechanical impact snap (metal click)
    const snapOsc = this.ctx.createOscillator();
    const snapGain = this.ctx.createGain();
    snapOsc.type = 'triangle';
    snapOsc.frequency.setValueAtTime(1400 + jitter * 400, t);
    snapOsc.frequency.exponentialRampToValueAtTime(320, t + 0.025);
    snapGain.gain.setValueAtTime(0.35, t);
    snapGain.gain.exponentialRampToValueAtTime(0.001, t + 0.035);
    snapOsc.connect(snapGain);
    snapGain.connect(this.ctx.destination);
    snapOsc.start(t);
    snapOsc.stop(t + 0.04);

    // 2. Heavy platen thud (the hammer striking the rubber platen through ribbon)
    const thudOsc = this.ctx.createOscillator();
    const thudGain = this.ctx.createGain();
    thudOsc.type = 'sine';
    thudOsc.frequency.setValueAtTime(160 + jitter * 30, t);
    thudOsc.frequency.exponentialRampToValueAtTime(45, t + 0.06);
    thudGain.gain.setValueAtTime(0.45, t);
    thudGain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
    thudOsc.connect(thudGain);
    thudGain.connect(this.ctx.destination);
    thudOsc.start(t);
    thudOsc.stop(t + 0.09);

    // 3. Crisp noise burst (escapement pawl and friction)
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.035);
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2800 + jitter * 500, t);
    filter.Q.setValueAtTime(3.5, t);
    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.28, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.035);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);
    noise.start(t);
  }

  // Deep resonant spacebar sound
  public playSpacebar() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const thud = this.ctx.createOscillator();
    const thudGain = this.ctx.createGain();
    thud.type = 'triangle';
    thud.frequency.setValueAtTime(110, t);
    thud.frequency.exponentialRampToValueAtTime(35, t + 0.07);
    thudGain.gain.setValueAtTime(0.5, t);
    thudGain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
    thud.connect(thudGain);
    thudGain.connect(this.ctx.destination);
    thud.start(t);
    thud.stop(t + 0.1);

    // Clack noise
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.025);
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.5;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, t);
    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.3, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.03);
    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);
    noise.start(t);
  }

  // Classic margin warning bell "Ding!"
  public playBell() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    // Harmonic bell oscillators
    const freqs = [2093, 4186, 6279];
    const gains = [0.35, 0.12, 0.04];
    const decays = [0.8, 0.45, 0.2];

    freqs.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(gains[idx], t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + decays[idx]);
      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(t);
      osc.stop(t + decays[idx]);
    });
  }

  // Carriage return lever throw + sliding ratchet whir
  public playCarriageReturn() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    // 1. Initial lever throw click
    const lever = this.ctx.createOscillator();
    const leverGain = this.ctx.createGain();
    lever.type = 'square';
    lever.frequency.setValueAtTime(820, t);
    lever.frequency.exponentialRampToValueAtTime(240, t + 0.03);
    leverGain.gain.setValueAtTime(0.3, t);
    leverGain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
    lever.connect(leverGain);
    leverGain.connect(this.ctx.destination);
    lever.start(t);
    lever.stop(t + 0.05);

    // 2. Series of fast ratchet clicks (escapement pawl sliding back)
    const numClicks = 9;
    for (let i = 0; i < numClicks; i++) {
      const clickTime = t + 0.05 + i * 0.032;
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(2400 + (i % 2) * 300, clickTime);
      g.gain.setValueAtTime(0.18, clickTime);
      g.gain.exponentialRampToValueAtTime(0.001, clickTime + 0.012);
      osc.connect(g);
      g.connect(this.ctx.destination);
      osc.start(clickTime);
      osc.stop(clickTime + 0.015);
    }

    // 3. Final solid margin stop clonk
    const stopTime = t + 0.05 + numClicks * 0.032 + 0.02;
    const stopOsc = this.ctx.createOscillator();
    const stopGain = this.ctx.createGain();
    stopOsc.type = 'triangle';
    stopOsc.frequency.setValueAtTime(140, stopTime);
    stopGain.gain.setValueAtTime(0.4, stopTime);
    stopGain.gain.exponentialRampToValueAtTime(0.001, stopTime + 0.06);
    stopOsc.connect(stopGain);
    stopGain.connect(this.ctx.destination);
    stopOsc.start(stopTime);
    stopOsc.stop(stopTime + 0.07);
  }

  // Backspace escapement reverse click
  public playBackspace() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(950, t);
    osc.frequency.exponentialRampToValueAtTime(400, t + 0.025);
    g.gain.setValueAtTime(0.25, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.035);
    osc.connect(g);
    g.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.04);
  }
}

export const typewriterAudio = new TypewriterAudioEngine();
