/**
 * Stage Arenas for Brawl Legends
 */

class Stage {
  constructor(config) {
    this.id = config.id;
    this.name = config.name;
    this.desc = config.desc;
    this.theme = config.theme;
    this.blastZones = config.blastZones || { left: -350, right: 1630, top: -400, bottom: 950 };
    this.platforms = config.platforms || [];
    this.spawnPoints = config.spawnPoints || [
      { x: 440, y: 350 },
      { x: 840, y: 350 },
      { x: 340, y: 220 },
      { x: 940, y: 220 }
    ];
    this.bgTime = 0;
  }

  update(dt) {
    this.bgTime += dt;
    // Update moving platforms if any
    for (let plat of this.platforms) {
      if (plat.isMoving) {
        plat.x = plat.originX + Math.sin(this.bgTime * plat.speed) * plat.distance;
      }
    }
  }

  drawBackground(ctx, width, height) {
    // Overridden by specific stages
  }

  drawPlatforms(ctx) {
    // Draw all platforms with rich styling
    for (let plat of this.platforms) {
      ctx.save();
      if (plat.type === 'solid') {
        this.drawSolidPlatform(ctx, plat);
      } else {
        this.drawSemiSolidPlatform(ctx, plat);
      }
      ctx.restore();
    }
  }

  drawSolidPlatform(ctx, plat) {
    // Main Solid Platform with beveled 3D depth and wall textures
    const grad = ctx.createLinearGradient(plat.x, plat.y, plat.x, plat.y + plat.height);
    if (this.theme === 'sky') {
      grad.addColorStop(0, '#475569');
      grad.addColorStop(0.3, '#334155');
      grad.addColorStop(1, '#1e293b');
    } else if (this.theme === 'fire') {
      grad.addColorStop(0, '#3f1f1d');
      grad.addColorStop(0.5, '#231110');
      grad.addColorStop(1, '#140807');
    } else { // cyber
      grad.addColorStop(0, '#0f172a');
      grad.addColorStop(0.5, '#090d16');
      grad.addColorStop(1, '#020617');
    }

    // Platform Body (slight trapezoid taper at bottom for floating island feel)
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(plat.x, plat.y);
    ctx.lineTo(plat.x + plat.width, plat.y);
    ctx.lineTo(plat.x + plat.width - 40, plat.y + plat.height);
    ctx.lineTo(plat.x + 40, plat.y + plat.height);
    ctx.closePath();
    ctx.fill();

    // Top Landing Surface (Grass/Trim/Neon)
    if (this.theme === 'sky') {
      ctx.fillStyle = '#65a30d'; // Grass trim
      ctx.fillRect(plat.x - 4, plat.y - 2, plat.width + 8, 12);
      ctx.fillStyle = '#fef08a'; // Golden line
      ctx.fillRect(plat.x, plat.y + 10, plat.width, 3);
    } else if (this.theme === 'fire') {
      ctx.fillStyle = '#ef4444'; // Molten trim
      ctx.shadowColor = '#f97316';
      ctx.shadowBlur = 12;
      ctx.fillRect(plat.x - 2, plat.y - 2, plat.width + 4, 8);
      ctx.fillStyle = '#ffedd5';
      ctx.fillRect(plat.x + 20, plat.y, plat.width - 40, 2);
    } else {
      ctx.fillStyle = '#06b6d4'; // Cyan neon
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 15;
      ctx.fillRect(plat.x, plat.y - 2, plat.width, 6);
      ctx.fillStyle = '#818cf8';
      ctx.fillRect(plat.x + 20, plat.y + 4, plat.width - 40, 2);
    }

    // Wall slide grip accents (left and right edges)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.fillRect(plat.x, plat.y + 12, 6, plat.height - 20);
    ctx.fillRect(plat.x + plat.width - 6, plat.y + 12, 6, plat.height - 20);

    // Floating under-crystal or runes
    if (this.theme === 'sky') {
      ctx.fillStyle = '#38bdf8';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.moveTo(plat.x + plat.width / 2, plat.y + plat.height + 45);
      ctx.lineTo(plat.x + plat.width / 2 - 18, plat.y + plat.height + 5);
      ctx.lineTo(plat.x + plat.width / 2 + 18, plat.y + plat.height + 5);
      ctx.closePath();
      ctx.fill();
    }
  }

  drawSemiSolidPlatform(ctx, plat) {
    // Floating semi-solid side platform
    ctx.save();
    if (this.theme === 'sky') {
      ctx.fillStyle = '#334155';
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(plat.x, plat.y, plat.width, plat.height, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#84cc16';
      ctx.fillRect(plat.x, plat.y, plat.width, 5);
    } else if (this.theme === 'fire') {
      ctx.fillStyle = '#271010';
      ctx.strokeStyle = '#ea580c';
      ctx.shadowColor = '#ea580c';
      ctx.shadowBlur = 8;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(plat.x, plat.y, plat.width, plat.height, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#f97316';
      ctx.fillRect(plat.x, plat.y, plat.width, 4);
    } else {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.strokeStyle = '#a855f7';
      ctx.shadowColor = '#a855f7';
      ctx.shadowBlur = 12;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(plat.x, plat.y, plat.width, plat.height, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#c084fc';
      ctx.fillRect(plat.x + 10, plat.y + 2, plat.width - 20, 2);
    }
    ctx.restore();
  }
}

// Stage 1: Sky Citadel
class SkyCitadelStage extends Stage {
  constructor() {
    super({
      id: 'sky_citadel',
      name: 'Sky Citadel',
      desc: 'Kuil kuno melayang di angkasa dengan 2 platform samping.',
      theme: 'sky',
      platforms: [
        // Main Solid Island
        { x: 340, y: 440, width: 600, height: 180, type: 'solid' },
        // Left Semi-Solid Floating Platform
        { x: 200, y: 310, width: 180, height: 16, type: 'semisolid' },
        // Right Semi-Solid Floating Platform
        { x: 900, y: 310, width: 180, height: 16, type: 'semisolid' },
        // Top Center Semi-Solid High Platform
        { x: 540, y: 220, width: 200, height: 16, type: 'semisolid' }
      ]
    });
  }

  drawBackground(ctx, width, height) {
    // Sky Gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
    skyGrad.addColorStop(0, '#0c1b33');
    skyGrad.addColorStop(0.5, '#1e3a8a');
    skyGrad.addColorStop(0.85, '#60a5fa');
    skyGrad.addColorStop(1, '#fde047');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, height);

    // Distant mountain peaks
    ctx.fillStyle = 'rgba(15, 23, 42, 0.4)';
    ctx.beginPath();
    ctx.moveTo(0, height);
    ctx.lineTo(200, height - 260);
    ctx.lineTo(450, height - 120);
    ctx.lineTo(700, height - 300);
    ctx.lineTo(950, height - 150);
    ctx.lineTo(1200, height - 280);
    ctx.lineTo(width, height);
    ctx.closePath();
    ctx.fill();

    // Floating Clouds (Parallax)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    const t = this.bgTime * 15;
    for (let i = 0; i < 5; i++) {
      const cx = ((i * 320 + t) % (width + 300)) - 150;
      const cy = 120 + (i % 3) * 80;
      ctx.beginPath();
      ctx.arc(cx, cy, 60, 0, Math.PI * 2);
      ctx.arc(cx + 45, cy - 20, 50, 0, Math.PI * 2);
      ctx.arc(cx + 90, cy, 55, 0, Math.PI * 2);
      ctx.arc(cx + 40, cy + 20, 45, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

// Stage 2: Inferno Forge
class InfernoForgeStage extends Stage {
  constructor() {
    super({
      id: 'inferno_forge',
      name: 'Inferno Forge',
      desc: 'Benteng magma vulkanik dengan platform tengah bergerak.',
      theme: 'fire',
      platforms: [
        // Main Left and Right Split Solid Bases
        { x: 300, y: 460, width: 680, height: 180, type: 'solid' },
        // Floating Moving Platform
        { 
          x: 520, y: 280, width: 240, height: 18, type: 'semisolid',
          isMoving: true, originX: 520, speed: 1.2, distance: 160 
        },
        // Top High Side Platforms
        { x: 180, y: 340, width: 160, height: 16, type: 'semisolid' },
        { x: 940, y: 340, width: 160, height: 16, type: 'semisolid' }
      ]
    });
  }

  drawBackground(ctx, width, height) {
    // Dark Molten Sky
    const fireGrad = ctx.createLinearGradient(0, 0, 0, height);
    fireGrad.addColorStop(0, '#0f0505');
    fireGrad.addColorStop(0.5, '#260a0a');
    fireGrad.addColorStop(0.8, '#58100e');
    fireGrad.addColorStop(1, '#ea580c');
    ctx.fillStyle = fireGrad;
    ctx.fillRect(0, 0, width, height);

    // Glowing Lava Pool at Bottom
    const lavaGrad = ctx.createLinearGradient(0, height - 100, 0, height);
    lavaGrad.addColorStop(0, 'rgba(234, 88, 12, 0.4)');
    lavaGrad.addColorStop(0.5, '#ea580c');
    lavaGrad.addColorStop(1, '#fde047');
    ctx.fillStyle = lavaGrad;
    ctx.fillRect(0, height - 90, width, 90);

    // Volcanic smoke plumes
    ctx.fillStyle = 'rgba(20, 10, 10, 0.5)';
    ctx.beginPath();
    ctx.moveTo(100, height);
    ctx.lineTo(250, height - 380);
    ctx.lineTo(400, height);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(880, height);
    ctx.lineTo(1050, height - 420);
    ctx.lineTo(1220, height);
    ctx.closePath();
    ctx.fill();
  }
}

// Stage 3: Cyber Arena
class CyberArenaStage extends Stage {
  constructor() {
    super({
      id: 'cyber_arena',
      name: 'Cyber Arena',
      desc: 'Arena futuristik berenergi tinggi dengan grid neon menyala.',
      theme: 'cyber',
      platforms: [
        // Main Solid Cyber Grid Island
        { x: 320, y: 440, width: 640, height: 160, type: 'solid' },
        // Floating Cyber Pads
        { x: 220, y: 310, width: 170, height: 16, type: 'semisolid' },
        { x: 890, y: 310, width: 170, height: 16, type: 'semisolid' },
        { x: 490, y: 210, width: 300, height: 16, type: 'semisolid' }
      ]
    });
  }

  drawBackground(ctx, width, height) {
    // Synthwave Dark Gradient
    const cyberGrad = ctx.createLinearGradient(0, 0, 0, height);
    cyberGrad.addColorStop(0, '#030712');
    cyberGrad.addColorStop(0.4, '#0f172a');
    cyberGrad.addColorStop(0.8, '#311042');
    cyberGrad.addColorStop(1, '#581c87');
    ctx.fillStyle = cyberGrad;
    ctx.fillRect(0, 0, width, height);

    // Synthwave Grid Lines
    ctx.save();
    ctx.strokeStyle = 'rgba(217, 70, 239, 0.25)';
    ctx.lineWidth = 1.5;
    const horizon = height * 0.72;

    // Horizontal grid lines with perspective compression
    for (let y = horizon; y < height; y += (y - horizon + 10) * 0.3) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Radiating vertical lines
    const centerX = width / 2;
    for (let x = -width; x < width * 2; x += 90) {
      ctx.beginPath();
      ctx.moveTo(centerX, horizon);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // Glowing Neon Sun on Horizon
    const sunGrad = ctx.createLinearGradient(centerX, horizon - 160, centerX, horizon);
    sunGrad.addColorStop(0, '#fbbf24');
    sunGrad.addColorStop(0.5, '#f43f5e');
    sunGrad.addColorStop(1, '#a855f7');
    ctx.fillStyle = sunGrad;
    ctx.shadowColor = '#f43f5e';
    ctx.shadowBlur = 30;
    ctx.beginPath();
    ctx.arc(centerX, horizon, 110, Math.PI, 0);
    ctx.fill();
    ctx.restore();
  }
}

// Stage Registry
window.STAGES = [
  new SkyCitadelStage(),
  new InfernoForgeStage(),
  new CyberArenaStage()
];
