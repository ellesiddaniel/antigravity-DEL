/**
 * Particle and Visual Effects Engine for Brawl Legends
 */
class Particle {
  constructor(opts) {
    this.x = opts.x || 0;
    this.y = opts.y || 0;
    this.vx = opts.vx || 0;
    this.vy = opts.vy || 0;
    this.size = opts.size || 4;
    this.color = opts.color || '#ffffff';
    this.alpha = opts.alpha !== undefined ? opts.alpha : 1.0;
    this.decay = opts.decay || 0.03;
    this.gravity = opts.gravity || 0;
    this.drag = opts.drag || 0.98;
    this.shape = opts.shape || 'circle'; // circle, spark, line, ring, dust, star
    this.rotation = opts.rotation || 0;
    this.rotSpeed = opts.rotSpeed || 0;
    this.maxLife = 1.0;
    this.life = 1.0;
    this.glow = opts.glow || false;
    this.ringRadius = opts.ringRadius || 5;
    this.ringGrowth = opts.ringGrowth || 6;
  }

  update(dt) {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += this.gravity;
    this.vx *= this.drag;
    this.vy *= this.drag;
    this.rotation += this.rotSpeed;
    this.alpha -= this.decay;
    this.life -= this.decay;

    if (this.shape === 'ring') {
      this.ringRadius += this.ringGrowth;
    }
  }

  draw(ctx) {
    if (this.alpha <= 0) return;
    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, this.alpha));

    if (this.glow) {
      ctx.shadowColor = this.color;
      ctx.shadowBlur = 10;
    }

    if (this.shape === 'circle') {
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, Math.max(0.5, this.size), 0, Math.PI * 2);
      ctx.fill();
    } else if (this.shape === 'spark') {
      ctx.strokeStyle = this.color;
      ctx.lineWidth = Math.max(1, this.size);
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(this.x - this.vx * 2.5, this.y - this.vy * 2.5);
      ctx.stroke();
    } else if (this.shape === 'ring') {
      ctx.strokeStyle = this.color;
      ctx.lineWidth = Math.max(1, this.size);
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.ringRadius, 0, Math.PI * 2);
      ctx.stroke();
    } else if (this.shape === 'dust') {
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size * (1 - (this.life * 0.3)), 0, Math.PI * 2);
      ctx.fill();
    } else if (this.shape === 'line') {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      ctx.strokeStyle = this.color;
      ctx.lineWidth = this.size;
      ctx.beginPath();
      ctx.moveTo(-15, 0);
      ctx.lineTo(15, 0);
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore();
  }
}

class SlashArc {
  constructor(x, y, radius, startAngle, endAngle, color, facing = 1, width = 6) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.startAngle = startAngle;
    this.endAngle = endAngle;
    this.color = color;
    this.facing = facing;
    this.width = width;
    this.alpha = 0.9;
    this.decay = 0.12;
  }

  update() {
    this.alpha -= this.decay;
    this.radius += 2;
  }

  draw(ctx) {
    if (this.alpha <= 0) return;
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 15;
    ctx.strokeStyle = this.color;
    ctx.lineWidth = this.width;
    ctx.lineCap = 'round';

    ctx.beginPath();
    if (this.facing > 0) {
      ctx.arc(this.x, this.y, this.radius, this.startAngle, this.endAngle, false);
    } else {
      ctx.arc(this.x, this.y, this.radius, Math.PI - this.endAngle, Math.PI - this.startAngle, false);
    }
    ctx.stroke();
    ctx.restore();
  }
}

class ParticleSystem {
  constructor() {
    this.particles = [];
    this.slashArcs = [];
    this.ambientParticles = [];
    this.screenShake = 0;
    this.screenShakeX = 0;
    this.screenShakeY = 0;
    this.particlesEnabled = true;
  }

  triggerShake(intensity = 10) {
    this.screenShake = Math.max(this.screenShake, intensity);
  }

  addHitSparks(x, y, color = '#fbbf24', count = 16, baseAngle = null) {
    if (!this.particlesEnabled) return;
    for (let i = 0; i < count; i++) {
      const angle = baseAngle !== null 
        ? baseAngle + (Math.random() - 0.5) * 1.6 
        : Math.random() * Math.PI * 2;
      const speed = 4 + Math.random() * 10;
      this.particles.push(new Particle({
        x: x + (Math.random() - 0.5) * 10,
        y: y + (Math.random() - 0.5) * 10,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2 + Math.random() * 3,
        color: Math.random() > 0.3 ? color : '#ffffff',
        alpha: 1.0,
        decay: 0.03 + Math.random() * 0.04,
        shape: 'spark',
        drag: 0.94,
        glow: true
      }));
    }

    // Impact burst flash ring
    this.particles.push(new Particle({
      x: x,
      y: y,
      size: 3,
      ringRadius: 8,
      ringGrowth: 8,
      color: color,
      alpha: 0.8,
      decay: 0.08,
      shape: 'ring',
      glow: true
    }));
  }

  addSlashArc(x, y, radius, startAngle, endAngle, color, facing = 1, width = 6) {
    if (!this.particlesEnabled) return;
    this.slashArcs.push(new SlashArc(x, y, radius, startAngle, endAngle, color, facing, width));
  }

  addDust(x, y, count = 6, dir = 0) {
    if (!this.particlesEnabled) return;
    for (let i = 0; i < count; i++) {
      this.particles.push(new Particle({
        x: x + (Math.random() - 0.5) * 12,
        y: y - 2,
        vx: (dir !== 0 ? -dir * (1 + Math.random() * 3) : (Math.random() - 0.5) * 3),
        vy: -(0.5 + Math.random() * 2),
        size: 3 + Math.random() * 4,
        color: 'rgba(203, 213, 225, 0.6)',
        alpha: 0.7,
        decay: 0.04 + Math.random() * 0.03,
        shape: 'dust',
        gravity: -0.02
      }));
    }
  }

  addKORing(x, y, color = '#f43f5e') {
    this.triggerShake(24);
    // Multiple concentric expanding rings
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        this.particles.push(new Particle({
          x: x,
          y: y,
          size: 4 + i * 2,
          ringRadius: 10 + i * 15,
          ringGrowth: 18 + i * 4,
          color: color,
          alpha: 1.0,
          decay: 0.03,
          shape: 'ring',
          glow: true
        }));
      }, i * 60);
    }

    // High velocity explosion sparkles
    for (let i = 0; i < 40; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 8 + Math.random() * 16;
      this.particles.push(new Particle({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 3 + Math.random() * 4,
        color: Math.random() > 0.4 ? color : '#ffffff',
        alpha: 1.0,
        decay: 0.02 + Math.random() * 0.03,
        shape: 'spark',
        drag: 0.95,
        glow: true
      }));
    }
  }

  addElementalAura(x, y, element, count = 2) {
    if (!this.particlesEnabled) return;
    for (let i = 0; i < count; i++) {
      let color, vy, vx, shape = 'circle', size = 3;
      if (element === 'shadow') {
        color = Math.random() > 0.5 ? '#a855f7' : '#4c1d95';
        vx = (Math.random() - 0.5) * 1.5;
        vy = -(1 + Math.random() * 2);
      } else if (element === 'fire') {
        color = Math.random() > 0.5 ? '#ef4444' : '#fbbf24';
        vx = (Math.random() - 0.5) * 2;
        vy = -(1.5 + Math.random() * 2.5);
      } else if (element === 'thunder') {
        color = Math.random() > 0.5 ? '#38bdf8' : '#e0f2fe';
        vx = (Math.random() - 0.5) * 4;
        vy = (Math.random() - 0.5) * 4;
        shape = 'spark';
      } else { // earth
        color = Math.random() > 0.5 ? '#f59e0b' : '#78350f';
        vx = (Math.random() - 0.5) * 2;
        vy = -(0.8 + Math.random() * 1.5);
      }

      this.particles.push(new Particle({
        x: x + (Math.random() - 0.5) * 20,
        y: y + (Math.random() - 0.5) * 20,
        vx: vx,
        vy: vy,
        size: size,
        color: color,
        alpha: 0.8,
        decay: 0.04 + Math.random() * 0.03,
        shape: shape,
        glow: true
      }));
    }
  }

  update(dt) {
    // Update Shake
    if (this.screenShake > 0) {
      this.screenShakeX = (Math.random() - 0.5) * this.screenShake * 1.5;
      this.screenShakeY = (Math.random() - 0.5) * this.screenShake * 1.5;
      this.screenShake *= 0.88;
      if (this.screenShake < 0.2) {
        this.screenShake = 0;
        this.screenShakeX = 0;
        this.screenShakeY = 0;
      }
    }

    // Update Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.update(dt);
      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // Update Slash Arcs
    for (let i = this.slashArcs.length - 1; i >= 0; i--) {
      const s = this.slashArcs[i];
      s.update();
      if (s.alpha <= 0) {
        this.slashArcs.splice(i, 1);
      }
    }
  }

  draw(ctx) {
    // Draw Slashes first (underneath spark bursts)
    for (let s of this.slashArcs) {
      s.draw(ctx);
    }
    // Draw Particles
    for (let p of this.particles) {
      p.draw(ctx);
    }
  }

  clear() {
    this.particles = [];
    this.slashArcs = [];
    this.screenShake = 0;
    this.screenShakeX = 0;
    this.screenShakeY = 0;
  }
}

window.particleSystem = new ParticleSystem();
