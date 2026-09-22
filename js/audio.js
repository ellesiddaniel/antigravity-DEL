/**
 * Audio Engine for Brawl Legends
 * Zero-dependency Procedural Sound Synthesizer & BGM Generator using Web Audio API
 */
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.sfxVolume = 0.8;
    this.bgmVolume = 0.4;
    this.bgmGain = null;
    this.sfxGain = null;
    this.isBgmPlaying = false;
    this.bgmTimer = null;
    this.bgmStep = 0;
  }

  init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();

      // Master Gains
      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
      this.sfxGain.connect(this.ctx.destination);

      this.bgmGain = this.ctx.createGain();
      this.bgmGain.gain.setValueAtTime(this.bgmVolume, this.ctx.currentTime);
      this.bgmGain.connect(this.ctx.destination);
    } catch (e) {
      console.warn("Web Audio not supported or blocked", e);
    }
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setSfxVolume(val) {
    this.sfxVolume = Math.max(0, Math.min(1, val));
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
    }
  }

  setBgmVolume(val) {
    this.bgmVolume = Math.max(0, Math.min(1, val));
    if (this.bgmGain && this.ctx) {
      this.bgmGain.gain.setValueAtTime(this.bgmVolume, this.ctx.currentTime);
    }
  }

  // --- SOUND EFFECTS ---

  playSwing(pitch = 1.0) {
    this.init(); this.resume();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'triangle';
    const now = this.ctx.currentTime;
    osc.frequency.setValueAtTime(450 * pitch, now);
    osc.frequency.exponentialRampToValueAtTime(80 * pitch, now + 0.12);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, now);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.13);
  }

  playLightHit() {
    this.init(); this.resume();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // Punchy snap
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.08);

    gain.gain.setValueAtTime(0.7, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.09);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.09);

    // Noise burst
    this.playNoise(0.05, 0.4, 1800);
  }

  playHeavyHit() {
    this.init(); this.resume();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(25, now + 0.28);

    osc2.type = 'square';
    osc2.frequency.setValueAtTime(90, now);
    osc2.frequency.exponentialRampToValueAtTime(30, now + 0.25);

    gain.gain.setValueAtTime(0.85, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

    osc.connect(gain);
    osc2.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc2.start(now);
    osc.stop(now + 0.3);
    osc2.stop(now + 0.3);

    this.playNoise(0.18, 0.6, 900);
  }

  playJump() {
    this.init(); this.resume();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(420, now + 0.14);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.14);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.15);
  }

  playWallJump() {
    this.init(); this.resume();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.08);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.09);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.09);
  }

  playDodge() {
    this.init(); this.resume();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.18);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, now);
    filter.Q.setValueAtTime(3, now);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.19);
  }

  playKO() {
    this.init(); this.resume();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // Sub-bass boom
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.exponentialRampToValueAtTime(20, now + 0.7);

    gain.gain.setValueAtTime(1.0, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.7);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.72);

    // Explosive noise
    this.playNoise(0.5, 0.8, 600);

    // High shimmer
    const chime = this.ctx.createOscillator();
    const cGain = this.ctx.createGain();
    chime.type = 'triangle';
    chime.frequency.setValueAtTime(880, now);
    chime.frequency.exponentialRampToValueAtTime(1760, now + 0.4);
    cGain.gain.setValueAtTime(0.3, now);
    cGain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);
    chime.connect(cGain);
    cGain.connect(this.sfxGain);
    chime.start(now);
    chime.stop(now + 0.45);
  }

  playAnnounce(type) {
    this.init(); this.resume();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    if (type === 'count') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 0.22);
    } else if (type === 'brawl') {
      // Powerful chord
      const freqs = [330, 440, 554, 660];
      freqs.forEach(f => {
        const o = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        o.type = 'sawtooth';
        o.frequency.setValueAtTime(f, now);
        g.gain.setValueAtTime(0.18, now);
        g.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
        o.connect(g);
        g.connect(this.sfxGain);
        o.start(now);
        o.stop(now + 0.65);
      });
    }
  }

  playVictory() {
    this.init(); this.resume();
    if (!this.ctx) return;

    const notes = [440, 554, 659, 880];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.42);
      }, idx * 120);
    });
  }

  playNoise(duration, vol = 0.3, cutoff = 1000) {
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(cutoff, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(vol, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    noise.start();
  }

  // --- SYNTH BGM GENERATOR (Dynamic 135 BPM Battle Beats) ---

  startBattleBGM() {
    this.init(); this.resume();
    if (this.isBgmPlaying || !this.ctx) return;
    this.isBgmPlaying = true;
    this.bgmStep = 0;

    const tempo = 135;
    const stepTime = (60 / tempo) / 4; // 16th notes

    // Bassline Progression (Am - F - C - G)
    const bassline = [
      110, 110, 0, 110, 110, 0, 110, 130, // A
      87, 87, 0, 87, 87, 0, 87, 98,       // F
      130, 130, 0, 130, 130, 0, 130, 146, // C
      98, 98, 0, 98, 98, 0, 110, 123      // G
    ];

    const leadArp = [
      440, 523, 659, 880, 659, 523, 440, 523,
      349, 440, 523, 698, 523, 440, 349, 440,
      523, 659, 783, 1046, 783, 659, 523, 659,
      392, 493, 587, 783, 587, 493, 392, 493
    ];

    const playStep = () => {
      if (!this.isBgmPlaying || !this.ctx) return;
      const now = this.ctx.currentTime;
      const beatIdx = this.bgmStep % 32;

      // 1. Kick Drum on beats 0, 4, 8, 12, 16, 20, 24, 28
      if (beatIdx % 4 === 0) {
        const kick = this.ctx.createOscillator();
        const kGain = this.ctx.createGain();
        kick.type = 'sine';
        kick.frequency.setValueAtTime(140, now);
        kick.frequency.exponentialRampToValueAtTime(35, now + 0.1);
        kGain.gain.setValueAtTime(0.4, now);
        kGain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
        kick.connect(kGain);
        kGain.connect(this.bgmGain);
        kick.start(now);
        kick.stop(now + 0.13);
      }

      // 2. Snare / HiHat on off-beats (beats 4, 12, 20, 28)
      if (beatIdx % 8 === 4) {
        this.playBgmNoise(0.08, 0.18, 2200);
      } else if (beatIdx % 2 === 0) {
        this.playBgmNoise(0.03, 0.08, 6000); // Hi-hat tick
      }

      // 3. Bass Synth
      const bassFreq = bassline[beatIdx];
      if (bassFreq > 0) {
        const bassOsc = this.ctx.createOscillator();
        const bGain = this.ctx.createGain();
        const bFilter = this.ctx.createBiquadFilter();

        bassOsc.type = 'sawtooth';
        bassOsc.frequency.setValueAtTime(bassFreq, now);

        bFilter.type = 'lowpass';
        bFilter.frequency.setValueAtTime(650, now);

        bGain.gain.setValueAtTime(0.2, now);
        bGain.gain.exponentialRampToValueAtTime(0.01, now + stepTime * 1.5);

        bassOsc.connect(bFilter);
        bFilter.connect(bGain);
        bGain.connect(this.bgmGain);

        bassOsc.start(now);
        bassOsc.stop(now + stepTime * 1.6);
      }

      // 4. Arp Synth Melody
      if (beatIdx % 2 === 0) {
        const arpFreq = leadArp[beatIdx];
        const arpOsc = this.ctx.createOscillator();
        const aGain = this.ctx.createGain();

        arpOsc.type = 'square';
        arpOsc.frequency.setValueAtTime(arpFreq, now);

        aGain.gain.setValueAtTime(0.06, now);
        aGain.gain.exponentialRampToValueAtTime(0.005, now + stepTime);

        arpOsc.connect(aGain);
        aGain.connect(this.bgmGain);

        arpOsc.start(now);
        arpOsc.stop(now + stepTime * 1.1);
      }

      this.bgmStep++;
      this.bgmTimer = setTimeout(playStep, stepTime * 1000);
    };

    playStep();
  }

  stopBattleBGM() {
    this.isBgmPlaying = false;
    if (this.bgmTimer) {
      clearTimeout(this.bgmTimer);
      this.bgmTimer = null;
    }
  }

  playBgmNoise(duration, vol, cutoff) {
    if (!this.ctx) return;
    const bufferSize = Math.floor(this.ctx.sampleRate * duration);
    if (bufferSize <= 0) return;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(cutoff, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(vol, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.bgmGain);

    noise.start();
  }
}

// Global Sound Singleton
window.soundEngine = new SoundEngine();
