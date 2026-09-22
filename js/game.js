/**
 * Main Game Engine for Brawl Legends
 * Handles 60 FPS update loop, dynamic zooming camera, match flow, HUD, and rendering.
 */

class GameEngine {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');

    this.gameState = 'TITLE'; // TITLE, SELECT, COUNTDOWN, BRAWL, GAME_OVER, PAUSED
    this.prevGameState = 'TITLE';
    this.stage = window.STAGES[0];
    this.stageIndex = 0;
    this.fighters = [];
    this.aiControllers = [];
    this.matchMode = 'stock'; // stock, timed, training
    this.matchDuration = 180; // 3 minutes in seconds
    this.matchTimeRemaining = 180;
    this.timerTickCounter = 0;

    // Countdown before match starts
    this.countdownStep = 3;
    this.countdownTimer = 0;

    // Camera System (Auto Tracking & Smooth Zoom)
    this.camera = {
      x: 640,
      y: 360,
      targetX: 640,
      targetY: 360,
      zoom: 1.0,
      targetZoom: 1.0,
      minZoom: 0.65,
      maxZoom: 1.15
    };

    this.debugHitbox = false;
    this.lastTime = performance.now();

    this.initHUD();
    this.startLoop();
  }

  initHUD() {
    this.hudElement = document.getElementById('battle-hud');
    this.timerDisplay = document.getElementById('match-timer');
    this.cardsContainer = document.getElementById('player-hud-cards');
    this.announcerBanner = document.getElementById('announcer-banner');
    this.announcerText = document.getElementById('announcer-text');
    this.announcerSub = document.getElementById('announcer-subtitle');
  }

  startMatch(stageIndex, slotsConfig, mode = 'stock') {
    this.stageIndex = stageIndex;
    this.stage = window.STAGES[stageIndex] || window.STAGES[0];
    this.matchMode = mode;
    this.matchTimeRemaining = (mode === 'timed' ? 180 : 0);
    this.timerTickCounter = 0;

    this.fighters = [];
    this.aiControllers = [];
    window.particleSystem.clear();

    const stockCount = (mode === 'timed' ? 99 : (mode === 'training' ? 99 : 3));

    // Spawn Active Fighters
    slotsConfig.forEach((slot, idx) => {
      if (!slot.active) return;
      const f = new Fighter(slot.id, slot.charId, slot.isBot, slot.botDifficulty);
      const spawnPoint = this.stage.spawnPoints[idx] || { x: 640, y: 300 };
      f.resetForMatch(spawnPoint, stockCount);
      this.fighters.push(f);

      if (slot.isBot) {
        this.aiControllers.push(new AIController(f));
      } else {
        this.aiControllers.push(null);
      }
    });

    // Reset Camera
    this.camera.x = 640;
    this.camera.y = 360;
    this.camera.zoom = 1.0;

    // Start 3-2-1 Countdown
    this.gameState = 'COUNTDOWN';
    this.countdownStep = 3;
    this.countdownTimer = 60;
    this.renderHUDCards();
    this.hudElement.classList.remove('hidden');

    this.triggerAnnouncer('3', 'GET READY!');
    window.soundEngine.playAnnounce('count');
  }

  triggerAnnouncer(title, sub = '', duration = 1200) {
    this.announcerText.textContent = title;
    this.announcerSub.textContent = sub;
    this.announcerBanner.classList.remove('hidden');

    clearTimeout(this.announceTimeout);
    this.announceTimeout = setTimeout(() => {
      this.announcerBanner.classList.add('hidden');
    }, duration);
  }

  update(dt) {
    // Background stage animation always updates
    if (this.stage) {
      this.stage.update(dt);
    }

    if (this.gameState === 'PAUSED') return;

    // 1. COUNTDOWN STATE
    if (this.gameState === 'COUNTDOWN') {
      this.countdownTimer--;
      if (this.countdownTimer <= 0) {
        this.countdownStep--;
        this.countdownTimer = 50;

        if (this.countdownStep === 2) {
          this.triggerAnnouncer('2', '');
          window.soundEngine.playAnnounce('count');
        } else if (this.countdownStep === 1) {
          this.triggerAnnouncer('1', '');
          window.soundEngine.playAnnounce('count');
        } else if (this.countdownStep === 0) {
          this.triggerAnnouncer('BRAWL!', 'FIGHT FOR GLORY!');
          window.soundEngine.playAnnounce('brawl');
          window.soundEngine.startBattleBGM();
          this.gameState = 'BRAWL';
        }
      }
      return;
    }

    // 2. BRAWL STATE (Active Gameplay)
    if (this.gameState === 'BRAWL') {
      // Update Match Clock
      if (this.matchMode === 'timed') {
        this.timerTickCounter++;
        if (this.timerTickCounter >= 60) {
          this.timerTickCounter = 0;
          this.matchTimeRemaining--;
          if (this.matchTimeRemaining <= 0) {
            this.endMatch('WAKTU HABIS!');
            return;
          }
        }
      }

      // Update Fighters
      this.fighters.forEach((f, idx) => {
        const input = window.inputManager.getInput(
          f.slotId, 
          f.isBot, 
          this.aiControllers[idx], 
          this.stage, 
          this.fighters
        );
        f.update(this.stage, this.fighters, input);
      });

      // Clear input manager pulses
      window.inputManager.update();

      // Check Match Over condition (Stock Elimination)
      this.checkMatchOver();
    }

    // 3. Update VFX Particles & Camera
    window.particleSystem.update(dt);
    this.updateCamera();

    // 4. Synchronize In-Game HUD
    this.updateHUD();
  }

  checkMatchOver() {
    if (this.matchMode === 'training') return;

    const aliveFighters = this.fighters.filter(f => !f.isDead);
    if (aliveFighters.length <= 1 && this.fighters.length > 1) {
      const winner = aliveFighters[0] || this.fighters[0];
      this.endMatch(`PEMENANG: ${winner.slotId} (${winner.characterData.name})`, winner);
    }
  }

  endMatch(bannerText, winner = null) {
    this.gameState = 'GAME_OVER';
    window.soundEngine.stopBattleBGM();
    window.soundEngine.playVictory();
    this.triggerAnnouncer('GAME!', bannerText, 2500);

    setTimeout(() => {
      if (window.onMatchFinished) {
        window.onMatchFinished(winner, this.fighters);
      }
    }, 2200);
  }

  updateCamera() {
    const activeFighters = this.fighters.filter(f => !f.isDead && !f.isRespawning);
    if (activeFighters.length === 0) return;

    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;

    activeFighters.forEach(f => {
      minX = Math.min(minX, f.x);
      maxX = Math.max(maxX, f.x);
      minY = Math.min(minY, f.y);
      maxY = Math.max(maxY, f.y);
    });

    // Add padding margin around fighters
    const paddingX = 220;
    const paddingY = 180;
    const spanX = Math.max(450, (maxX - minX) + paddingX * 2);
    const spanY = Math.max(300, (maxY - minY) + paddingY * 2);

    const zoomX = this.canvas.width / spanX;
    const zoomY = this.canvas.height / spanY;
    this.camera.targetZoom = Math.max(this.camera.minZoom, Math.min(this.camera.maxZoom, Math.min(zoomX, zoomY)));

    this.camera.targetX = (minX + maxX) / 2;
    this.camera.targetY = ((minY + maxY) / 2) - 40;

    // Smooth Lerp Camera
    this.camera.x += (this.camera.targetX - this.camera.x) * 0.1;
    this.camera.y += (this.camera.targetY - this.camera.y) * 0.1;
    this.camera.zoom += (this.camera.targetZoom - this.camera.zoom) * 0.08;
  }

  render() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.clearRect(0, 0, w, h);

    // 1. Draw Background Stage
    if (this.stage) {
      this.stage.drawBackground(ctx, w, h);
    }

    // 2. Apply Camera World Transform + Screen Shake
    ctx.save();
    const shakeX = window.particleSystem.screenShakeX;
    const shakeY = window.particleSystem.screenShakeY;

    ctx.translate(w / 2 + shakeX, h / 2 + shakeY);
    ctx.scale(this.camera.zoom, this.camera.zoom);
    ctx.translate(-this.camera.x, -this.camera.y);

    // 3. Draw Stage Platforms
    if (this.stage) {
      this.stage.drawPlatforms(ctx);
    }

    // 4. Draw Fighters
    for (let f of this.fighters) {
      f.draw(ctx, this.debugHitbox);
    }

    // 5. Draw Particle VFX
    window.particleSystem.draw(ctx);

    ctx.restore();
  }

  renderHUDCards() {
    this.cardsContainer.innerHTML = '';
    this.fighters.forEach(f => {
      const card = document.createElement('div');
      card.className = 'hud-player-card';
      card.id = `hud-card-${f.slotId}`;
      card.style.setProperty('--char-color', f.characterData.themeColor);

      card.innerHTML = `
        <div class="hud-avatar" style="color:${f.characterData.themeColor}">
          ${f.slotId}
        </div>
        <div class="hud-info">
          <div class="hud-header-line">
            <span class="hud-player-name">${f.characterData.name} ${f.isBot ? `[BOT]` : ''}</span>
            <div class="hud-stocks" id="stocks-${f.slotId}">
              ${this.renderStocksHTML(f.stocks)}
            </div>
          </div>
          <div class="hud-damage-wrapper">
            <span class="hud-damage-val damage-low" id="damage-val-${f.slotId}">0</span>
            <span class="hud-damage-percent">%</span>
          </div>
        </div>
      `;
      this.cardsContainer.appendChild(card);
    });
  }

  renderStocksHTML(stocks) {
    if (this.matchMode === 'timed' || this.matchMode === 'training') {
      return `<span style="font-size:11px;color:#94a3b8">∞</span>`;
    }
    let html = '';
    for (let i = 0; i < 3; i++) {
      html += `<div class="stock-icon ${i < stocks ? '' : 'lost'}"></div>`;
    }
    return html;
  }

  updateHUD() {
    if (this.gameState !== 'BRAWL' && this.gameState !== 'COUNTDOWN') return;

    // Update Timer
    if (this.matchMode === 'timed') {
      const m = Math.floor(this.matchTimeRemaining / 60);
      const s = this.matchTimeRemaining % 60;
      this.timerDisplay.textContent = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    } else {
      this.timerDisplay.textContent = '∞';
    }

    // Update Fighter Cards
    this.fighters.forEach(f => {
      const dmgEl = document.getElementById(`damage-val-${f.slotId}`);
      const stocksEl = document.getElementById(`stocks-${f.slotId}`);
      if (dmgEl) {
        dmgEl.textContent = Math.floor(f.damagePercent);
        dmgEl.className = 'hud-damage-val ' + this.getDamageClass(f.damagePercent);
      }
      if (stocksEl && this.matchMode === 'stock') {
        stocksEl.innerHTML = this.renderStocksHTML(f.stocks);
      }
    });
  }

  getDamageClass(dmg) {
    if (dmg < 50) return 'damage-low';
    if (dmg < 100) return 'damage-mid';
    if (dmg < 140) return 'damage-high';
    return 'damage-crit';
  }

  toggleHitboxDebug() {
    this.debugHitbox = !this.debugHitbox;
  }

  startLoop() {
    const loop = (now) => {
      const dt = Math.min(0.1, (now - this.lastTime) / 1000);
      this.lastTime = now;

      this.update(dt);
      this.render();

      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }
}

window.gameEngine = new GameEngine();
