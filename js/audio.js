/**
 * Audio System - Web Audio API Procedural Sound Synthesizer
 * Provides rich sound effects and ambient generative background music
 * without relying on external audio assets.
 */
class SoundController {
    constructor() {
        this.ctx = null;
        this.soundEnabled = true;
        this.musicEnabled = false;
        this.ambientInterval = null;
        this.masterVolume = 0.4;
        
        // Initialize on first user interaction to satisfy browser autoplay policies
        this.initialized = false;
    }

    init() {
        if (this.initialized) return;
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
            this.initialized = true;
        } catch (e) {
            console.warn("Web Audio API not supported on this browser:", e);
        }
    }

    ensureContext() {
        this.init();
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    // Gentle UI Button Click Pop
    playClick(freq = 440) {
        if (!this.soundEnabled) return;
        this.ensureContext();
        if (!this.ctx) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const now = this.ctx.currentTime;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.5, now + 0.05);

        gain.gain.setValueAtTime(this.masterVolume * 0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.05);
    }

    // Number / Operator Card Select Sound
    playSelect(pitchIndex = 0) {
        if (!this.soundEnabled) return;
        this.ensureContext();
        if (!this.ctx) return;

        const baseFreq = 330;
        const scale = [1, 1.125, 1.25, 1.333, 1.5, 1.667, 1.875, 2];
        const freq = baseFreq * (scale[pitchIndex % scale.length] || 1);

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const now = this.ctx.currentTime;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.05, now + 0.08);

        gain.gain.setValueAtTime(this.masterVolume * 0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.08);
    }

    // Correct Answer - Harmonious Arpeggio Ding
    playCorrect(combo = 1) {
        if (!this.soundEnabled) return;
        this.ensureContext();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const chord = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        const comboShift = Math.min((combo - 1) * 25, 200);

        chord.forEach((freq, index) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const startTime = now + index * 0.05;
            const duration = 0.35;

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq + comboShift, startTime);

            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(this.masterVolume * 0.35, startTime + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(startTime);
            osc.stop(startTime + duration);
        });
    }

    // Wrong Answer - Low Buzz
    playWrong() {
        if (!this.soundEnabled) return;
        this.ensureContext();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc1.type = 'sawtooth';
        osc2.type = 'square';
        
        osc1.frequency.setValueAtTime(140, now);
        osc1.frequency.linearRampToValueAtTime(90, now + 0.25);
        
        osc2.frequency.setValueAtTime(147, now);
        osc2.frequency.linearRampToValueAtTime(95, now + 0.25);

        gain.gain.setValueAtTime(this.masterVolume * 0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(this.ctx.destination);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.25);
        osc2.stop(now + 0.25);
    }

    // Level Clear / Victory Fanfare
    playVictory() {
        if (!this.soundEnabled) return;
        this.ensureContext();
        if (!this.ctx) return;

        const notes = [
            { f: 523.25, d: 0.12, t: 0 },    // C5
            { f: 659.25, d: 0.12, t: 0.12 }, // E5
            { f: 783.99, d: 0.12, t: 0.24 }, // G5
            { f: 1046.50, d: 0.4, t: 0.36 }, // C6
            { f: 880.00, d: 0.15, t: 0.50 }, // A5
            { f: 1046.50, d: 0.6, t: 0.68 }  // C6 (hold)
        ];

        const now = this.ctx.currentTime;
        notes.forEach(note => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const startTime = now + note.t;

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(note.f, startTime);

            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(this.masterVolume * 0.4, startTime + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.0001, startTime + note.d);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(startTime);
            osc.stop(startTime + note.d);
        });
    }

    // Streak Multiplier Fire Up
    playStreak() {
        if (!this.soundEnabled) return;
        this.ensureContext();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.3);

        gain.gain.setValueAtTime(this.masterVolume * 0.3, now);
        gain.gain.linearRampToValueAtTime(this.masterVolume * 0.4, now + 0.2);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.3);
    }

    // Clock Tick-Tock for Time Attack
    playTick(isUrgent = false) {
        if (!this.soundEnabled) return;
        this.ensureContext();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(isUrgent ? 880 : 440, now);

        gain.gain.setValueAtTime(this.masterVolume * (isUrgent ? 0.25 : 0.15), now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.03);
    }

    // Ambient Chill Synth Beat Toggle
    toggleAmbientMusic(enable) {
        this.musicEnabled = enable;
        if (!this.musicEnabled) {
            if (this.ambientInterval) {
                clearInterval(this.ambientInterval);
                this.ambientInterval = null;
            }
            return;
        }

        this.ensureContext();
        if (!this.ctx) return;

        const chords = [
            [261.63, 329.63, 392.00, 493.88], // Cmaj7
            [220.00, 261.63, 329.63, 392.00], // Am7
            [174.61, 220.00, 261.63, 329.63], // Fmaj7
            [196.00, 246.94, 293.66, 349.23]  // G7
        ];
        let chordIdx = 0;

        const playChord = () => {
            if (!this.musicEnabled || !this.ctx) return;
            const currentChord = chords[chordIdx % chords.length];
            chordIdx++;

            const now = this.ctx.currentTime;
            currentChord.forEach(freq => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();

                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, now);

                gain.gain.setValueAtTime(0, now);
                gain.gain.linearRampToValueAtTime(this.masterVolume * 0.05, now + 0.8);
                gain.gain.linearRampToValueAtTime(this.masterVolume * 0.03, now + 2.0);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.8);

                osc.connect(gain);
                gain.connect(this.ctx.destination);

                osc.start(now);
                osc.stop(now + 3.8);
            });
        };

        playChord();
        this.ambientInterval = setInterval(playChord, 4000);
    }
}

window.soundCtrl = new SoundController();
