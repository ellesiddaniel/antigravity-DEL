/**
 * Subway Surfers 3D - Procedural Web Audio API Engine
 * Generates dynamic dynamic synth BGM and crisp SFX without external asset latency.
 */
class AudioManager {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.isMusicPlaying = false;
    this.musicTimer = null;
    this.jetpackOsc = null;
    this.jetpackGain = null;
    this.masterGain = null;
    this.musicGain = null;
    this.sfxGain = null;
    this.tempo = 126; // BPM for bouncy subway rhythm
    this.step = 0;
  }

  init() {
    if (this.ctx) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    
    this.ctx = new AudioContext();
    
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.8, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);

    this.musicGain = this.ctx.createGain();
    this.musicGain.gain.setValueAtTime(0.35, this.ctx.currentTime);
    this.musicGain.connect(this.masterGain);

    this.sfxGain = this.ctx.createGain();
    this.sfxGain.gain.setValueAtTime(0.65, this.ctx.currentTime);
    this.sfxGain.connect(this.masterGain);
  }

  ensureContext() {
    if (!this.ctx) this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.8, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  // ==========================================
  // SOUND EFFECTS
  // ==========================================
  playCoin() {
    if (this.isMuted) return;
    this.ensureContext();
    const t = this.ctx.currentTime;
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    // Sparkling coin chime
    osc.type = 'sine';
    const notes = [987.77, 1318.51, 1567.98, 1975.53]; // B5, E6, G6, B6
    const note = notes[Math.floor(Math.random() * notes.length)];
    
    osc.frequency.setValueAtTime(note, t);
    osc.frequency.exponentialRampToValueAtTime(note * 1.5, t + 0.12);
    
    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    
    osc.connect(gain);
    gain.connect(this.sfxGain);
    
    osc.start(t);
    osc.stop(t + 0.15);
  }

  playJump(isSuper = false) {
    if (this.isMuted) return;
    this.ensureContext();
    const t = this.ctx.currentTime;
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'triangle';
    const startFreq = isSuper ? 200 : 150;
    const endFreq = isSuper ? 750 : 480;
    const duration = isSuper ? 0.3 : 0.22;
    
    osc.frequency.setValueAtTime(startFreq, t);
    osc.frequency.exponentialRampToValueAtTime(endFreq, t + duration);
    
    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
    
    osc.connect(gain);
    gain.connect(this.sfxGain);
    
    osc.start(t);
    osc.stop(t + duration);
  }

  playSlide() {
    if (this.isMuted) return;
    this.ensureContext();
    const t = this.ctx.currentTime;
    
    // White noise swoosh for sliding on ground
    const bufferSize = this.ctx.sampleRate * 0.2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.4));
    }
    
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200, t);
    filter.frequency.exponentialRampToValueAtTime(400, t + 0.2);
    
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
    
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    
    noise.start(t);
  }

  playPowerup() {
    if (this.isMuted) return;
    this.ensureContext();
    const t = this.ctx.currentTime;
    
    const notes = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + idx * 0.06);
      
      gain.gain.setValueAtTime(0.2, t + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.06 + 0.2);
      
      osc.connect(gain);
      gain.connect(this.sfxGain);
      
      osc.start(t + idx * 0.06);
      osc.stop(t + idx * 0.06 + 0.2);
    });
  }

  playTrainHorn() {
    if (this.isMuted) return;
    this.ensureContext();
    const t = this.ctx.currentTime;
    
    [311.13, 370.0, 466.16].forEach(freq => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, t);
      
      gain.gain.setValueAtTime(0.12, t);
      gain.gain.linearRampToValueAtTime(0.15, t + 0.2);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.7);
      
      osc.connect(gain);
      gain.connect(this.sfxGain);
      
      osc.start(t);
      osc.stop(t + 0.7);
    });
  }

  playHoverboard() {
    if (this.isMuted) return;
    this.ensureContext();
    const t = this.ctx.currentTime;
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, t);
    osc.frequency.exponentialRampToValueAtTime(900, t + 0.3);
    
    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.35);
    
    osc.connect(gain);
    gain.connect(this.sfxGain);
    
    osc.start(t);
    osc.stop(t + 0.35);
  }

  playCrash() {
    if (this.isMuted) return;
    this.ensureContext();
    const t = this.ctx.currentTime;
    
    // Heavy thud
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(30, t + 0.35);
    
    gain.gain.setValueAtTime(0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.4);
    
    osc.connect(gain);
    gain.connect(this.sfxGain);
    
    osc.start(t);
    osc.stop(t + 0.4);
  }

  playButton() {
    if (this.isMuted) return;
    this.ensureContext();
    const t = this.ctx.currentTime;
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, t);
    osc.frequency.exponentialRampToValueAtTime(800, t + 0.05);
    
    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
    
    osc.connect(gain);
    gain.connect(this.sfxGain);
    
    osc.start(t);
    osc.stop(t + 0.06);
  }

  startJetpackLoop() {
    if (this.jetpackOsc || this.isMuted) return;
    this.ensureContext();
    const t = this.ctx.currentTime;
    
    this.jetpackOsc = this.ctx.createOscillator();
    this.jetpackGain = this.ctx.createGain();
    
    this.jetpackOsc.type = 'sawtooth';
    this.jetpackOsc.frequency.setValueAtTime(110, t);
    
    this.jetpackGain.gain.setValueAtTime(0.01, t);
    this.jetpackGain.gain.linearRampToValueAtTime(0.2, t + 0.3);
    
    this.jetpackOsc.connect(this.jetpackGain);
    this.jetpackGain.connect(this.sfxGain);
    
    this.jetpackOsc.start(t);
  }

  stopJetpackLoop() {
    if (this.jetpackOsc) {
      try {
        const t = this.ctx.currentTime;
        this.jetpackGain.gain.linearRampToValueAtTime(0.001, t + 0.2);
        this.jetpackOsc.stop(t + 0.25);
      } catch (e) {}
      this.jetpackOsc = null;
      this.jetpackGain = null;
    }
  }

  // ==========================================
  // BACKGROUND MUSIC SYNTHESIZER
  // ==========================================
  startBGM() {
    if (this.isMusicPlaying) return;
    this.ensureContext();
    this.isMusicPlaying = true;
    this.step = 0;
    
    const secondsPerBeat = 60.0 / this.tempo;
    const stepTime = (secondsPerBeat / 4) * 1000; // 16th notes
    
    // Funky bassline & chord progression for Subway Surfers vibe
    const bassline = [
      110, 0, 110, 130.81, 0, 110, 146.83, 0,
      110, 0, 164.81, 0, 146.83, 130.81, 110, 0,
      98, 0, 98, 123.47, 0, 98, 130.81, 0,
      98, 0, 146.83, 0, 130.81, 123.47, 98, 0
    ];
    
    const melody = [
      440, 0, 523.25, 587.33, 0, 659.25, 0, 587.33,
      523.25, 0, 440, 0, 392, 440, 0, 0,
      587.33, 0, 659.25, 698.46, 0, 783.99, 0, 698.46,
      659.25, 0, 587.33, 0, 523.25, 440, 0, 0
    ];

    this.musicTimer = setInterval(() => {
      if (!this.isMusicPlaying || this.isMuted) return;
      
      const t = this.ctx.currentTime;
      const currentStep = this.step % 32;
      
      // Drum Kick on 0, 4, 8, 12...
      if (currentStep % 4 === 0) {
        this.playDrumKick(t);
      }
      
      // Snare / Clap on 4, 12, 20, 28
      if (currentStep % 8 === 4) {
        this.playDrumSnare(t);
      }
      
      // Hi-hat on every odd 16th note
      if (currentStep % 2 === 1) {
        this.playDrumHihat(t);
      }
      
      // Bass note
      const bassFreq = bassline[currentStep];
      if (bassFreq > 0) {
        this.playSynthNote(bassFreq, 'sawtooth', 0.15, 0.15, t);
      }
      
      // Lead Melody note
      const leadFreq = melody[currentStep];
      if (leadFreq > 0 && Math.random() > 0.15) {
        this.playSynthNote(leadFreq, 'square', 0.08, 0.12, t, true);
      }
      
      this.step++;
    }, stepTime);
  }

  stopBGM() {
    this.isMusicPlaying = false;
    if (this.musicTimer) {
      clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
    this.stopJetpackLoop();
  }

  playSynthNote(freq, type, gainVol, duration, time, isMelody = false) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, time);
    
    filter.type = isMelody ? 'lowpass' : 'lowpass';
    filter.frequency.setValueAtTime(isMelody ? 1800 : 800, time);
    
    gain.gain.setValueAtTime(gainVol, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
    
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.musicGain);
    
    osc.start(time);
    osc.stop(time + duration);
  }

  playDrumKick(time) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.frequency.setValueAtTime(130, time);
    osc.frequency.exponentialRampToValueAtTime(30, time + 0.12);
    
    gain.gain.setValueAtTime(0.5, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);
    
    osc.connect(gain);
    gain.connect(this.musicGain);
    
    osc.start(time);
    osc.stop(time + 0.12);
  }

  playDrumSnare(time) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, time);
    osc.frequency.exponentialRampToValueAtTime(60, time + 0.1);
    
    gain.gain.setValueAtTime(0.3, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);
    
    osc.connect(gain);
    gain.connect(this.musicGain);
    
    osc.start(time);
    osc.stop(time + 0.1);
  }

  playDrumHihat(time) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(8000, time);
    
    gain.gain.setValueAtTime(0.06, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.04);
    
    osc.connect(gain);
    gain.connect(this.musicGain);
    
    osc.start(time);
    osc.stop(time + 0.04);
  }
}

window.audioManager = new AudioManager();
