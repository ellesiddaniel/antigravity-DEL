/**
 * Particle & Visual Effects Engine
 * Ambient floating math symbols, dynamic spark bursts, and victory confetti.
 */
class ParticleEngine {
    constructor() {
        this.bgCanvas = document.getElementById('bg-canvas');
        this.fxCanvas = document.getElementById('fx-canvas');
        
        if (!this.bgCanvas || !this.fxCanvas) {
            console.warn("Canvas elements not found during init");
            return;
        }

        this.bgCtx = this.bgCanvas.getContext('2d');
        this.fxCtx = this.fxCanvas.getContext('2d');

        this.bgSymbols = [];
        this.fxParticles = [];
        this.confettiParticles = [];

        this.symbolsList = ['π', '∑', '√x', '∞', '∫', 'Δ', '24', '≈', '≠', '×', '÷', '+', '−', 'f(x)', 'λ', 'θ', '²', '³', '1/2', 'log'];
        this.colors = ['#38bdf8', '#818cf8', '#34d399', '#f472b6', '#fbbf24', '#a78bfa'];

        this.initResize();
        this.initBackgroundSymbols(25);
        this.animate = this.animate.bind(this);
        requestAnimationFrame(this.animate);
    }

    initResize() {
        const resize = () => {
            this.width = window.innerWidth;
            this.height = window.innerHeight;

            this.bgCanvas.width = this.width;
            this.bgCanvas.height = this.height;

            this.fxCanvas.width = this.width;
            this.fxCanvas.height = this.height;
        };
        resize();
        window.addEventListener('resize', resize);
    }

    initBackgroundSymbols(count) {
        this.bgSymbols = [];
        for (let i = 0; i < count; i++) {
            this.bgSymbols.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                symbol: this.symbolsList[Math.floor(Math.random() * this.symbolsList.length)],
                size: Math.random() * 18 + 14,
                alpha: Math.random() * 0.15 + 0.05,
                vx: (Math.random() - 0.5) * 0.3,
                vy: (Math.random() - 0.5) * 0.3 - 0.1,
                rot: Math.random() * Math.PI * 2,
                rotSpeed: (Math.random() - 0.5) * 0.01,
                color: this.colors[Math.floor(Math.random() * this.colors.length)]
            });
        }
    }

    // Burst sparks at specific client coordinates (e.g. over a button or tile)
    burstSparks(x, y, count = 18, color = '#38bdf8') {
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
            const speed = Math.random() * 4 + 2;
            this.fxParticles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: Math.random() * 4 + 2,
                color: Math.random() > 0.3 ? color : '#ffffff',
                alpha: 1,
                decay: Math.random() * 0.02 + 0.02,
                gravity: 0.05
            });
        }
    }

    // Celebrate Level Win with full screen confetti
    launchConfetti(duration = 2500) {
        const count = 100;
        for (let i = 0; i < count; i++) {
            this.confettiParticles.push({
                x: Math.random() * this.width,
                y: -20 - Math.random() * 100,
                vx: (Math.random() - 0.5) * 4,
                vy: Math.random() * 4 + 3,
                size: Math.random() * 8 + 6,
                color: this.colors[Math.floor(Math.random() * this.colors.length)],
                rot: Math.random() * 360,
                rotSpeed: (Math.random() - 0.5) * 8,
                alpha: 1,
                decay: 0.003
            });
        }
    }

    animate() {
        // Clear Canvases
        this.bgCtx.clearRect(0, 0, this.width, this.height);
        this.fxCtx.clearRect(0, 0, this.width, this.height);

        // 1. Draw Floating Math Ambient Symbols
        for (let p of this.bgSymbols) {
            p.x += p.vx;
            p.y += p.vy;
            p.rot += p.rotSpeed;

            if (p.x < -50) p.x = this.width + 50;
            if (p.x > this.width + 50) p.x = -50;
            if (p.y < -50) p.y = this.height + 50;
            if (p.y > this.height + 50) p.y = -50;

            this.bgCtx.save();
            this.bgCtx.translate(p.x, p.y);
            this.bgCtx.rotate(p.rot);
            this.bgCtx.font = `600 ${p.size}px "Outfit", sans-serif`;
            this.bgCtx.fillStyle = p.color;
            this.bgCtx.globalAlpha = p.alpha;
            this.bgCtx.textAlign = 'center';
            this.bgCtx.textBaseline = 'middle';
            this.bgCtx.fillText(p.symbol, 0, 0);
            this.bgCtx.restore();
        }

        // 2. Draw FX Particles (Sparks & Clicks)
        for (let i = this.fxParticles.length - 1; i >= 0; i--) {
            const p = this.fxParticles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += p.gravity;
            p.alpha -= p.decay;

            if (p.alpha <= 0) {
                this.fxParticles.splice(i, 1);
                continue;
            }

            this.fxCtx.save();
            this.fxCtx.globalAlpha = Math.max(0, p.alpha);
            this.fxCtx.fillStyle = p.color;
            this.fxCtx.shadowBlur = 8;
            this.fxCtx.shadowColor = p.color;
            this.fxCtx.beginPath();
            this.fxCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.fxCtx.fill();
            this.fxCtx.restore();
        }

        // 3. Draw Confetti
        for (let i = this.confettiParticles.length - 1; i >= 0; i--) {
            const p = this.confettiParticles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.rot += p.rotSpeed;
            p.alpha -= p.decay;

            if (p.y > this.height + 50 || p.alpha <= 0) {
                this.confettiParticles.splice(i, 1);
                continue;
            }

            this.fxCtx.save();
            this.fxCtx.translate(p.x, p.y);
            this.fxCtx.rotate((p.rot * Math.PI) / 180);
            this.fxCtx.globalAlpha = Math.max(0, p.alpha);
            this.fxCtx.fillStyle = p.color;
            this.fxCtx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
            this.fxCtx.restore();
        }

        requestAnimationFrame(this.animate);
    }
}

window.particleEngine = null;
window.addEventListener('DOMContentLoaded', () => {
    window.particleEngine = new ParticleEngine();
});
