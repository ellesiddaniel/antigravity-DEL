/**
 * SoundFX & Procedural Synthwave BGM Engine
 * Uses Web Audio API for zero-dependency high-fidelity audio
 */
class SoundEngine {
    constructor() {
        this.ctx = null;
        this.sfxVolume = 0.8;
        this.musicVolume = 0.5;
        this.isMuted = false;
        this.musicPlaying = false;
        this.tempo = 128; // BPM
        this.currentStep = 0;
        this.musicInterval = null;
        this.masterGain = null;
        this.sfxGain = null;
        this.musicGain = null;
        this.slowMoFilter = null;
    }

    init() {
        if (this.ctx) return;
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioContext();

        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 1.0;
        this.masterGain.connect(this.ctx.destination);

        this.sfxGain = this.ctx.createGain();
        this.sfxGain.gain.value = this.sfxVolume;
        this.sfxGain.connect(this.masterGain);

        this.musicGain = this.ctx.createGain();
        this.musicGain.gain.value = this.musicVolume;

        // Low-pass filter for slow-motion effect
        this.slowMoFilter = this.ctx.createBiquadFilter();
        this.slowMoFilter.type = 'lowpass';
        this.slowMoFilter.frequency.value = 20000;
        this.musicGain.connect(this.slowMoFilter);
        this.slowMoFilter.connect(this.masterGain);
    }

    resume() {
        if (!this.ctx) this.init();
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    setSlowMotion(isSlow) {
        if (!this.ctx || !this.slowMoFilter) return;
        const targetFreq = isSlow ? 600 : 20000;
        this.slowMoFilter.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.1);
    }

    // --- Sound Effects ---

    playJump() {
        if (this.isMuted || !this.ctx) return;
        this.resume();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.exponentialRampToValueAtTime(540, now + 0.18);

        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.2);
    }

    playDoubleJump() {
        if (this.isMuted || !this.ctx) return;
        this.resume();
        const now = this.ctx.currentTime;
        
        // Whoosh + high chime
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc1.type = 'triangle';
        osc1.frequency.setValueAtTime(320, now);
        osc1.frequency.exponentialRampToValueAtTime(880, now + 0.25);

        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(640, now);
        osc2.frequency.exponentialRampToValueAtTime(1320, now + 0.25);

        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(this.sfxGain);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.3);
        osc2.stop(now + 0.3);
    }

    playSlide() {
        if (this.isMuted || !this.ctx) return;
        this.resume();
        const now = this.ctx.currentTime;
        
        // Filtered noise swoosh
        const bufferSize = this.ctx.sampleRate * 0.25;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.4));
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1200, now);
        filter.frequency.exponentialRampToValueAtTime(300, now + 0.25);
        filter.Q.value = 3;

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);

        noise.start(now);
    }

    playCorrect() {
        if (this.isMuted || !this.ctx) return;
        this.resume();
        const now = this.ctx.currentTime;
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 (Major Fanfare)

        notes.forEach((freq, idx) => {
            const noteStart = now + idx * 0.07;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, noteStart);

            gain.gain.setValueAtTime(0.4, noteStart);
            gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.35);

            osc.connect(gain);
            gain.connect(this.sfxGain);

            osc.start(noteStart);
            osc.stop(noteStart + 0.36);
        });
    }

    playWrong() {
        if (this.isMuted || !this.ctx) return;
        this.resume();
        const now = this.ctx.currentTime;
        
        // Low dissonant buzz + thud
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(140, now);
        osc1.frequency.exponentialRampToValueAtTime(65, now + 0.35);

        osc2.type = 'sawtooth';
        osc2.frequency.setValueAtTime(147, now); // Dissonant minor 2nd
        osc2.frequency.exponentialRampToValueAtTime(60, now + 0.35);

        gain.gain.setValueAtTime(0.45, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.38);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(this.sfxGain);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.4);
        osc2.stop(now + 0.4);
    }

    playSpeedBoost() {
        if (this.isMuted || !this.ctx) return;
        this.resume();
        const now = this.ctx.currentTime;
        
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.3);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(600, now);
        filter.frequency.exponentialRampToValueAtTime(3000, now + 0.3);

        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now);
        osc.stop(now + 0.35);
    }

    playBounce() {
        if (this.isMuted || !this.ctx) return;
        this.resume();
        const now = this.ctx.currentTime;
        
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(120, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.15);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.3);

        gain.gain.setValueAtTime(0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now);
        osc.stop(now + 0.35);
    }

    playCoin() {
        if (this.isMuted || !this.ctx) return;
        this.resume();
        const now = this.ctx.currentTime;
        
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(987.77, now); // B5
        osc.frequency.setValueAtTime(1318.51, now + 0.08); // E6

        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now);
        osc.stop(now + 0.25);
    }

    playGameOver() {
        if (this.isMuted || !this.ctx) return;
        this.resume();
        const now = this.ctx.currentTime;
        const notes = [440, 392, 349.23, 293.66]; // A4, G4, F4, D4

        notes.forEach((freq, idx) => {
            const noteStart = now + idx * 0.18;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(freq, noteStart);

            gain.gain.setValueAtTime(0.35, noteStart);
            gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.35);

            osc.connect(gain);
            gain.connect(this.sfxGain);

            osc.start(noteStart);
            osc.stop(noteStart + 0.4);
        });
    }

    // --- Procedural Synthwave Music Generator ---

    startMusic(tempo = 124) {
        if (this.musicPlaying) return;
        this.resume();
        this.tempo = tempo;
        this.musicPlaying = true;
        this.currentStep = 0;

        const stepTime = (60 / this.tempo) / 4; // 16th note step
        let nextNoteTime = this.ctx.currentTime + 0.05;

        // Bassline pattern (Cyber Synth bass)
        const bassLine = [
            110, 110, 110, 110,  110, 110, 130.81, 146.83, // A2, C3, D3
            98, 98, 98, 98,      98, 98, 110, 130.81,      // G2, A2, C3
            87.31, 87.31, 87.31, 87.31,  87.31, 87.31, 98, 110, // F2, G2, A2
            130.81, 130.81, 146.83, 146.83, 164.81, 164.81, 146.83, 130.81
        ];

        // Arp chords (F, G, Am, Em)
        const arpChords = [
            [220, 261.63, 329.63, 440], // Am
            [196, 246.94, 293.66, 392], // G
            [174.61, 220, 261.63, 349.23], // F
            [164.81, 196, 246.94, 329.63]  // Em
        ];

        this.musicInterval = setInterval(() => {
            if (!this.musicPlaying || this.isMuted) return;

            while (nextNoteTime < this.ctx.currentTime + 0.15) {
                const step = this.currentStep % 32;
                const bar = Math.floor(step / 8) % 4;
                const arpIndex = step % 4;

                // 1. Kick Drum on beats 0, 4, 8, 12, 16, 20, 24, 28
                if (step % 4 === 0) {
                    this._playKick(nextNoteTime);
                }

                // 2. Snare / Clap on beats 4, 12, 20, 28
                if (step % 8 === 4) {
                    this._playSnare(nextNoteTime);
                }

                // 3. Hi-hat on every offbeat
                if (step % 2 === 1) {
                    this._playHiHat(nextNoteTime);
                }

                // 4. Synth Bassline
                const bassFreq = bassLine[step];
                if (bassFreq) {
                    this._playSynthBass(bassFreq, nextNoteTime, stepTime * 0.85);
                }

                // 5. Arpeggiator Lead
                const chord = arpChords[bar];
                const arpFreq = chord[arpIndex];
                if (arpFreq && step % 2 === 0) {
                    this._playArpLead(arpFreq, nextNoteTime, stepTime * 1.5);
                }

                nextNoteTime += stepTime;
                this.currentStep++;
            }
        }, 30);
    }

    stopMusic() {
        this.musicPlaying = false;
        if (this.musicInterval) {
            clearInterval(this.musicInterval);
            this.musicInterval = null;
        }
    }

    _playKick(time) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.frequency.setValueAtTime(140, time);
        osc.frequency.exponentialRampToValueAtTime(38, time + 0.08);

        gain.gain.setValueAtTime(0.45, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);

        osc.connect(gain);
        gain.connect(this.musicGain);

        osc.start(time);
        osc.stop(time + 0.13);
    }

    _playSnare(time) {
        const bufferSize = this.ctx.sampleRate * 0.12;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 1000;

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.25, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.musicGain);

        noise.start(time);
    }

    _playHiHat(time) {
        const bufferSize = this.ctx.sampleRate * 0.04;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1);
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 7000;

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.12, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.04);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.musicGain);

        noise.start(time);
    }

    _playSynthBass(freq, time, dur) {
        const osc = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, time);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(900, time);
        filter.frequency.exponentialRampToValueAtTime(200, time + dur);

        gain.gain.setValueAtTime(0.3, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.musicGain);

        osc.start(time);
        osc.stop(time + dur);
    }

    _playArpLead(freq, time, dur) {
        const osc = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, time);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2200, time);
        filter.frequency.exponentialRampToValueAtTime(600, time + dur);

        gain.gain.setValueAtTime(0.18, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.musicGain);

        osc.start(time);
        osc.stop(time + dur);
    }

    setMusicVolume(val) {
        this.musicVolume = Math.max(0, Math.min(1, val));
        if (this.musicGain) this.musicGain.gain.value = this.musicVolume;
    }

    setSfxVolume(val) {
        this.sfxVolume = Math.max(0, Math.min(1, val));
        if (this.sfxGain) this.sfxGain.gain.value = this.sfxVolume;
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.masterGain) {
            this.masterGain.gain.value = this.isMuted ? 0 : 1;
        }
        return this.isMuted;
    }
}

window.soundEngine = new SoundEngine();
