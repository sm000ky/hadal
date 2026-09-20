/**
 * Procedural Submerged Ocean & Sonar Audio Engine
 * Built purely with Web Audio API — zero network overhead, zero 404 risk.
 */

class HadalAudioEngine {
  private ctx: AudioContext | null = null;
  private isInitialized = false;
  private isMuted = false;

  // Audio Nodes
  private masterGain: GainNode | null = null;
  private ambientGain: GainNode | null = null;
  private depthFilter: BiquadFilterNode | null = null;
  private subRumbleOsc: OscillatorNode | null = null;
  private subRumbleGain: GainNode | null = null;
  private noiseSource: AudioBufferSourceNode | null = null;

  // Vocal Element Reference
  private vocalAudio: HTMLAudioElement | null = null;

  // Periodic Sonar timer
  private sonarInterval: number | null = null;

  public init(vocalElement?: HTMLAudioElement): void {
    if (this.isInitialized && this.ctx) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return;
    }

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      // 1. Master Output
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.85, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      // 2. Ambient Bus & Depth Lowpass Filter
      this.depthFilter = this.ctx.createBiquadFilter();
      this.depthFilter.type = 'lowpass';
      this.depthFilter.frequency.setValueAtTime(350, this.ctx.currentTime); // starting surface water
      this.depthFilter.Q.setValueAtTime(3.2, this.ctx.currentTime);

      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.setValueAtTime(0.45, this.ctx.currentTime);
      this.ambientGain.connect(this.depthFilter);
      this.depthFilter.connect(this.masterGain);

      // 3. Pink Noise / Water Current Buffer
      this.setupWaterNoise();

      // 4. Sub-bass Tectonic Rumble (36Hz)
      this.setupSubRumble();

      // 5. Connect Vocal Element if provided
      if (vocalElement) {
        this.vocalAudio = vocalElement;
      }

      this.isInitialized = true;
      this.startSonarLoop();
    } catch (err) {
      console.warn('Web Audio API not supported or blocked:', err);
    }
  }

  private setupWaterNoise(): void {
    if (!this.ctx || !this.ambientGain) return;

    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    // Generate Pink Noise
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.08;
      b6 = white * 0.115926;
    }

    this.noiseSource = this.ctx.createBufferSource();
    this.noiseSource.buffer = noiseBuffer;
    this.noiseSource.loop = true;
    this.noiseSource.connect(this.ambientGain);
    this.noiseSource.start();
  }

  private setupSubRumble(): void {
    if (!this.ctx || !this.depthFilter) return;

    this.subRumbleOsc = this.ctx.createOscillator();
    this.subRumbleOsc.type = 'sine';
    this.subRumbleOsc.frequency.setValueAtTime(34, this.ctx.currentTime); // 34 Hz deep rumble

    this.subRumbleGain = this.ctx.createGain();
    this.subRumbleGain.gain.setValueAtTime(0.35, this.ctx.currentTime);

    this.subRumbleOsc.connect(this.subRumbleGain);
    this.subRumbleGain.connect(this.depthFilter);
    this.subRumbleOsc.start();
  }

  /**
   * Adjust acoustic damping and tectonic intensity based on real depth in meters.
   */
  public updateDepth(depthMeters: number): void {
    if (!this.ctx || !this.depthFilter || !this.subRumbleGain || !this.subRumbleOsc) return;

    const clampedDepth = Math.max(0, Math.min(10994, depthMeters));
    const fraction = clampedDepth / 10994;

    // As depth increases, high frequencies are absorbed (Beer-Lambert acoustic extinction)
    // 0m = 380Hz, 10,994m = 52Hz (claustrophobic muffled pressure)
    const targetFreq = 380 * Math.pow(0.14, fraction);
    this.depthFilter.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.2);

    // Sub-bass rumble gets deeper and heavier as pressure increases
    const rumbleFreq = 38 - fraction * 14; // drops from 38Hz to 24Hz
    this.subRumbleOsc.frequency.setTargetAtTime(rumbleFreq, this.ctx.currentTime, 0.2);

    const rumbleGain = 0.25 + fraction * 0.55; // gets louder
    this.subRumbleGain.gain.setTargetAtTime(rumbleGain, this.ctx.currentTime, 0.2);
  }

  /**
   * Submarine active sonar ping with reverberant trench canyon echo
   */
  public triggerSonarPing(): void {
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const t = this.ctx.currentTime;

    // 1. Direct Sonar Ping
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1240, t);
    osc.frequency.exponentialRampToValueAtTime(1180, t + 0.08); // subtle chirp

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.32, t + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.6);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 1.7);

    // 2. Echo from Trench Canyon Walls (+380ms delay, darker tone)
    setTimeout(() => {
      if (!this.ctx || !this.masterGain || this.isMuted) return;
      const echoT = this.ctx.currentTime;
      const echoOsc = this.ctx.createOscillator();
      const echoGain = this.ctx.createGain();

      echoOsc.type = 'sine';
      echoOsc.frequency.setValueAtTime(1140, echoT);

      echoGain.gain.setValueAtTime(0.001, echoT);
      echoGain.gain.linearRampToValueAtTime(0.12, echoT + 0.03);
      echoGain.gain.exponentialRampToValueAtTime(0.0001, echoT + 2.1);

      echoOsc.connect(echoGain);
      echoGain.connect(this.masterGain);
      echoOsc.start(echoT);
      echoOsc.stop(echoT + 2.2);
    }, 380);
  }

  /**
   * Hull Stress Metallic Creak Sound (hydrostatic pressure creak)
   */
  public triggerHullCreak(): void {
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(95, t);
    osc.frequency.linearRampToValueAtTime(82, t + 0.8);
    osc.frequency.linearRampToValueAtTime(88, t + 1.4);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(260, t);
    filter.Q.setValueAtTime(6.0, t);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.18, t + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.5);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 1.6);
  }

  /**
   * Smoothly duck ambient background when vocal narration is speaking
   */
  public setDucking(isSpeaking: boolean): void {
    if (!this.ctx || !this.ambientGain) return;
    const t = this.ctx.currentTime;
    const targetGain = isSpeaking ? 0.18 : 0.45;
    this.ambientGain.gain.setTargetAtTime(targetGain, t, 0.25);
  }

  private startSonarLoop(): void {
    if (this.sonarInterval) clearInterval(this.sonarInterval);
    // Ping every 7.5 seconds
    this.sonarInterval = window.setInterval(() => {
      this.triggerSonarPing();
    }, 7500);
  }

  public toggleMute(): boolean {
    if (!this.ctx || !this.masterGain) return this.isMuted;
    this.isMuted = !this.isMuted;
    const targetGain = this.isMuted ? 0 : 0.85;
    this.masterGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.1);

    if (this.vocalAudio) {
      this.vocalAudio.muted = this.isMuted;
    }
    return this.isMuted;
  }

  public dispose(): void {
    if (this.sonarInterval) {
      clearInterval(this.sonarInterval);
      this.sonarInterval = null;
    }
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
    }
    this.isInitialized = false;
  }
}

export const hadalAudio = new HadalAudioEngine();
