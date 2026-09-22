/* ==========================================================================
   Ghost of Tsushima - Web Audio API Procedural Sound Engine
   Synthesizes Japanese Instruments, Taiko Drums, Shakuhachi Flutes, and Katana FX
   ========================================================================== */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.bgmPlaying = false;
    this.ambientPlaying = false;
    this.nextTaikoTime = 0;
    this.nextFluteTime = 0;
    this.intensity = 0; // 0 = calm exploration, 1 = intense combat, 2 = boss duel
  }

  init() {
    if (this.ctx) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioContext();
    this.startAmbient();
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }

  // --- Dynamic Battle BGM Generator (Taiko Drums & Flute) ---
  updateMusic(intensity = 0) {
    this.intensity = intensity;
    if (!this.ctx || this.muted) return;

    const now = this.ctx.currentTime;
    if (now >= this.nextTaikoTime) {
      if (this.intensity > 0) {
        this.playTaikoBeat(this.intensity);
        this.nextTaikoTime = now + (this.intensity === 2 ? 0.35 : 0.5);
      } else {
        // Soft occasional drum
        if (Math.random() < 0.3) this.playTaikoBeat(0.5);
        this.nextTaikoTime = now + 1.2;
      }
    }

    if (now >= this.nextFluteTime) {
      if (this.intensity < 2 && Math.random() < 0.6) {
        this.playShakuhachiNote();
      }
      this.nextFluteTime = now + 3.0 + Math.random() * 2.0;
    }
  }

  // --- Ambient Wind & Crickets ---
  startAmbient() {
    if (!this.ctx || this.ambientPlaying) return;
    this.ambientPlaying = true;
    
    // Pink noise for Japanese mountain wind
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      output[i] = (b0 + b1 + b2) * 0.04;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    whiteNoise.start();
  }

  // --- Taiko Drum Beat ---
  playTaikoBeat(power = 1) {
    if (!this.ctx || this.muted) return;
    const now = this.ctx.currentTime;

    // Sub Bass Boom (Low Sine)
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    
    const pitch = power > 1.5 ? 65 : (power > 0.8 ? 52 : 45);
    osc.frequency.setValueAtTime(pitch, now);
    osc.frequency.exponentialRampToValueAtTime(25, now + 0.35);

    gain.gain.setValueAtTime(0.45 * Math.min(1.2, power), now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    // Rim Slap (Noise transient)
    const slap = this.ctx.createBufferSource();
    const slapBuffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.05, this.ctx.sampleRate);
    const data = slapBuffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * Math.exp(-i / 300);
    slap.buffer = slapBuffer;

    const slapGain = this.ctx.createGain();
    slapGain.gain.setValueAtTime(0.15 * power, now);
    slapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    slap.connect(slapGain);
    slapGain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.45);
    slap.start(now);
  }

  // --- Shakuhachi Bamboo Flute Note ---
  playShakuhachiNote() {
    if (!this.ctx || this.muted) return;
    const now = this.ctx.currentTime;

    // Japanese In-sen Pentatonic Scale (D, Eb, G, A, Bb)
    const pentatonicFrequencies = [293.66, 311.13, 392.00, 440.00, 466.16, 587.33];
    const freq = pentatonicFrequencies[Math.floor(Math.random() * pentatonicFrequencies.length)];

    const osc = this.ctx.createOscillator();
    const vibrato = this.ctx.createOscillator();
    const vibratoGain = this.ctx.createGain();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now);

    // Subtle breath vibrato
    vibrato.frequency.setValueAtTime(5.5, now);
    vibratoGain.gain.setValueAtTime(4.0, now);
    vibrato.connect(osc.frequency);

    // Lowpass filter for warm wooden flute tone
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, now);

    // Gentle swelling envelope
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.12, now + 0.4);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    vibrato.start(now);
    osc.start(now);
    vibrato.stop(now + 1.9);
    osc.stop(now + 1.9);
  }

  // --- Katana Slash Whoosh ---
  playKatanaSlash(isHeavy = false) {
    if (!this.ctx || this.muted) return;
    const now = this.ctx.currentTime;
    const duration = isHeavy ? 0.22 : 0.14;

    const noise = this.ctx.createBufferSource();
    const buffer = this.ctx.createBuffer(1, this.ctx.sampleRate * duration, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.setValueAtTime(3.0, now);
    filter.frequency.setValueAtTime(isHeavy ? 1800 : 2600, now);
    filter.frequency.exponentialRampToValueAtTime(400, now + duration);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(now);
  }

  // --- Katana Blade Clash (Steel Sparks) ---
  playKatanaClash() {
    if (!this.ctx || this.muted) return;
    const now = this.ctx.currentTime;

    // Dual metallic resonant square/saw harmonics
    [1420, 2840, 4260].forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq + (Math.random() * 40 - 20), now);

      gain.gain.setValueAtTime(0.2 / (i + 1), now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.26);
    });
  }

  // --- Perfect Parry (Temple Bell / Rin Gong & Time Slow Shockwave) ---
  playPerfectParry() {
    if (!this.ctx || this.muted) return;
    const now = this.ctx.currentTime;

    // Resonant high temple chime
    const bellFrequencies = [880, 1760, 2640, 3520];
    bellFrequencies.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.3 / (idx + 1), now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 1.3);
    });

    // Deep bass impact boom
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.frequency.setValueAtTime(110, now);
    subOsc.frequency.exponentialRampToValueAtTime(35, now + 0.4);
    subGain.gain.setValueAtTime(0.5, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    subOsc.connect(subGain);
    subGain.connect(this.ctx.destination);
    subOsc.start(now);
    subOsc.stop(now + 0.55);
  }

  // --- Lethal Blood Slice (Execution) ---
  playExecutionSlice() {
    if (!this.ctx || this.muted) return;
    const now = this.ctx.currentTime;

    // Sharp slash
    this.playKatanaSlash(true);

    // Deep gore squelch/impact
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.2);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, now);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.35);
  }

  // --- Heavenly Strike (Thunder Blast) ---
  playHeavenlyStrike() {
    if (!this.ctx || this.muted) return;
    const now = this.ctx.currentTime;

    // Lightning crackle (White noise modulated)
    const noise = this.ctx.createBufferSource();
    const buffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.8, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * Math.exp(-i / 8000);
    noise.buffer = buffer;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.6, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

    noise.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start(now);

    // Thunder boom
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.9);
    oscGain.gain.setValueAtTime(0.7, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 1.0);

    osc.connect(oscGain);
    oscGain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 1.1);
  }

  // --- Standoff Tension Heartbeat ---
  playHeartbeat() {
    if (!this.ctx || this.muted) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(60, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.15);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.22);
  }

  // --- Stance Switch Whoosh ---
  playStanceSwitch() {
    if (!this.ctx || this.muted) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(350, now);
    osc.frequency.exponentialRampToValueAtTime(700, now + 0.12);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.18);
  }

  // --- Heal Chime ---
  playHeal() {
    if (!this.ctx || this.muted) return;
    const now = this.ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.50].forEach((f, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.frequency.setValueAtTime(f, now + i * 0.08);
      gain.gain.setValueAtTime(0.15, now + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.45);
    });
  }

  // --- Ghost Stance Demon Roar ---
  playGhostStanceRoar() {
    if (!this.ctx || this.muted) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(90, now);
    osc.frequency.linearRampToValueAtTime(140, now + 0.4);
    osc.frequency.exponentialRampToValueAtTime(40, now + 1.2);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 1.3);
  }

  // --- Stage Clear Victory Gong ---
  playVictory() {
    if (!this.ctx || this.muted) return;
    const now = this.ctx.currentTime;
    [220, 277.18, 329.63, 440, 554.37].forEach((f, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, now + idx * 0.15);
      gain.gain.setValueAtTime(0.25, now + idx * 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.15 + 2.0);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + idx * 0.15);
      osc.stop(now + idx * 0.15 + 2.1);
    });
  }
}

// Global Audio Instance
window.soundEngine = new SoundEngine();
