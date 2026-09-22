/* ==========================================================================
   Ghost of Tsushima: Way of the Samurai - Main Game Director
   Three.js 3D Scene, Dynamic Camera, Level Progression, Audio & Game Loop
   ========================================================================== */

class Game {
  constructor() {
    this.currentLevel = 1;
    this.isPaused = false;
    this.isGameOver = false;
    this.gameSpeed = 1.0;
    this.speedResetTimer = 0;
    this.shakeIntensity = 0;

    // Three.js Core
    this.container = document.getElementById('game-container');
    this.canvas = document.getElementById('bg-canvas');
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 200);
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      powerPreference: 'high-performance'
    });

    this.enemies = [];
    this.arenaGroup = null;

    this.initRenderer();
    this.initLighting();
    this.initSystems();
    this.initUIEvents();

    // Start Level 1
    this.loadLevel(1);

    // Main Animation Loop
    this.lastTime = performance.now();
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  // --- 1. Three.js Setup & Lighting ---
  initRenderer() {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;

    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  initLighting(theme = 'autumn') {
    // Ambient Light
    const ambientLight = new THREE.AmbientLight(0xfff5e6, 0.6);
    this.scene.add(ambientLight);

    // Directional Sunlight (Warm Golden Edo Sun)
    this.sunLight = new THREE.DirectionalLight(0xffe082, 1.3);
    this.sunLight.position.set(25, 35, 20);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 2048;
    this.sunLight.shadow.mapSize.height = 2048;
    this.sunLight.shadow.camera.near = 0.5;
    this.sunLight.shadow.camera.far = 100;
    this.sunLight.shadow.camera.left = -25;
    this.sunLight.shadow.camera.right = 25;
    this.sunLight.shadow.camera.top = 25;
    this.sunLight.shadow.camera.bottom = -25;
    this.scene.add(this.sunLight);

    // Fog for atmospheric depth
    this.scene.fog = new THREE.FogExp2(0x1a1c23, 0.018);
  }

  // --- 2. Initialize Game Systems ---
  initSystems() {
    this.particleEngine = new ParticleEngine(this.scene);
    window.player = new Player(this.scene);
  }

  // --- 3. Level Loading & Stage Management ---
  loadLevel(levelNum) {
    this.currentLevel = levelNum;
    this.isGameOver = false;

    // Fetch smooth difficulty config
    const levelConfig = window.difficultyDirector.getLevelConfig(levelNum);

    // Clear old arena & enemies
    if (this.arenaGroup) {
      this.scene.remove(this.arenaGroup);
    }
    this.enemies.forEach(e => {
      this.scene.remove(e.mesh);
    });
    this.enemies = [];

    // Build fresh themed arena (autumn, sakura, crimson, night)
    this.arenaGroup = window.modelFactory.buildArena(this.scene, levelConfig.theme);
    this.particleEngine.initAmbientLeaves(levelConfig.theme);

    // Reset Player Position & HUD
    window.player.mesh.position.set(0, 0, 4);
    window.player.health = window.player.maxHealth;
    window.player.posture = 0;
    window.player.updateHUD();

    // Spawn Level Enemies
    levelConfig.enemies.forEach(cfg => {
      const enemy = new Enemy(cfg, levelConfig, this.scene);
      this.enemies.push(enemy);
    });

    // Update Banner UI
    const titleEl = document.getElementById('stage-title');
    const subEl = document.getElementById('stage-sub');
    const kanjiEl = document.getElementById('stage-kanji');
    const countEl = document.getElementById('stage-enemies');

    if (titleEl) titleEl.innerText = levelConfig.title;
    if (subEl) subEl.innerText = levelConfig.sub;
    if (kanjiEl) kanjiEl.innerText = levelConfig.kanji;
    if (countEl) countEl.innerHTML = `ENEMIES REMAINING: <span>${this.enemies.length}</span>`;

    // Boss HUD Toggle
    const bossHud = document.getElementById('boss-hud');
    if (bossHud) {
      if (levelConfig.isBoss) {
        bossHud.classList.remove('hidden');
      } else {
        bossHud.classList.add('hidden');
      }
    }

    // Play stage intro audio
    if (window.soundEngine) {
      window.soundEngine.resume();
      window.soundEngine.playTaikoBeat(1.5);
      window.soundEngine.playShakuhachiNote();
    }

    // Trigger Standoff on skirmish entry (except boss)
    if (!levelConfig.isBoss && this.enemies.length > 0) {
      setTimeout(() => {
        window.combatEngine.startStandoff(this.enemies[0]);
      }, 500);
    }
  }

  // --- 4. Enemy Kill & Victory Handlers ---
  onEnemyKilled(enemy) {
    // Reward player
    const expReward = enemy.type === 'boss' ? 300 : 80;
    const suppliesReward = enemy.type === 'boss' ? 150 : 35;

    window.progression.addExp(expReward);
    window.progression.addSupplies(suppliesReward);
    window.player.addResolve(1);
    window.player.addGhostMeter(20);

    // Update remaining counter
    const aliveCount = this.enemies.filter(e => e.state !== 'dead').length;
    const countEl = document.getElementById('stage-enemies');
    if (countEl) countEl.innerHTML = `ENEMIES REMAINING: <span>${aliveCount}</span>`;

    // Check Victory
    if (aliveCount === 0) {
      setTimeout(() => this.triggerVictory(), 1000);
    }
  }

  triggerVictory() {
    if (window.soundEngine) window.soundEngine.playVictory();

    const vicModal = document.getElementById('victory-modal');
    if (vicModal) vicModal.classList.remove('hidden');

    // Bonus rewards
    window.progression.addSupplies(120);
    window.progression.addTechniquePoints(1);
  }

  onPlayerDied() {
    this.isGameOver = true;
    const goModal = document.getElementById('gameover-modal');
    if (goModal) goModal.classList.remove('hidden');
    if (window.soundEngine) window.soundEngine.playExecutionSlice();
  }

  terrifyEnemies() {
    this.enemies.forEach(e => {
      if (e.state !== 'dead' && e.type !== 'boss') {
        e.state = 'terrified';
        e.stateTimer = 0;
      }
    });
  }

  // --- 5. Screen FX & Bullet Time ---
  setGameSpeed(speed, duration = 0.5) {
    this.gameSpeed = speed;
    this.speedResetTimer = duration;
  }

  triggerScreenShake(intensity = 0.3) {
    this.shakeIntensity = intensity;
  }

  showCombatAlert(text, type = 'perfect-parry') {
    const container = document.getElementById('combat-alerts');
    if (!container) return;

    const el = document.createElement('div');
    el.className = `combat-alert-item ${type}`;
    el.innerText = text;
    container.appendChild(el);

    setTimeout(() => {
      if (el.parentNode) el.parentNode.removeChild(el);
    }, 1200);
  }

  // --- 6. UI Events & Hotkeys ---
  initUIEvents() {
    // Shrine Modal Open/Close
    const btnShrine = document.getElementById('btn-shrine');
    const shrineModal = document.getElementById('shrine-modal');
    const closeShrine = document.getElementById('close-shrine');
    const closeShrineBtm = document.getElementById('btn-close-shrine-bottom');
    const shrineVictoryBtn = document.getElementById('btn-open-shrine-victory');

    const toggleShrine = () => {
      shrineModal.classList.toggle('hidden');
      if (!shrineModal.classList.contains('hidden')) {
        window.progression.updateUI();
      }
    };

    if (btnShrine) btnShrine.addEventListener('click', toggleShrine);
    if (closeShrine) closeShrine.addEventListener('click', () => shrineModal.classList.add('hidden'));
    if (closeShrineBtm) closeShrineBtm.addEventListener('click', () => shrineModal.classList.add('hidden'));
    if (shrineVictoryBtn) shrineVictoryBtn.addEventListener('click', toggleShrine);

    // Kurosawa Mode Toggle
    const btnKurosawa = document.getElementById('btn-kurosawa');
    if (btnKurosawa) {
      btnKurosawa.addEventListener('click', () => {
        document.body.classList.toggle('kurosawa-on');
        if (window.soundEngine) window.soundEngine.playKatanaClash();
      });
    }

    // Audio Toggle
    const btnSound = document.getElementById('btn-sound');
    if (btnSound) {
      btnSound.addEventListener('click', () => {
        window.soundEngine.init();
        const isMuted = window.soundEngine.toggleMute();
        btnSound.innerHTML = `<span class="btn-icon">${isMuted ? '🔇' : '🔊'}</span> ${isMuted ? 'UNMUTE' : 'AUDIO'}`;
      });
    }

    // Controls Guide Modal
    const btnHelp = document.getElementById('btn-help');
    const controlsModal = document.getElementById('controls-modal');
    const closeControls = document.getElementById('close-controls');
    if (btnHelp && controlsModal) {
      btnHelp.addEventListener('click', () => controlsModal.classList.remove('hidden'));
    }
    if (closeControls && controlsModal) {
      closeControls.addEventListener('click', () => controlsModal.classList.add('hidden'));
    }

    // Next Level & Retry Buttons
    const btnNext = document.getElementById('btn-next-level');
    if (btnNext) {
      btnNext.addEventListener('click', () => {
        document.getElementById('victory-modal').classList.add('hidden');
        this.loadLevel(this.currentLevel + 1);
      });
    }

    const btnRetry = document.getElementById('btn-retry');
    if (btnRetry) {
      btnRetry.addEventListener('click', () => {
        document.getElementById('gameover-modal').classList.add('hidden');
        this.loadLevel(this.currentLevel);
      });
    }

    // Standoff Space/Click release binding
    window.addEventListener('keyup', (e) => {
      if (e.code === 'Space' && window.combatEngine.standoffActive) {
        window.combatEngine.onStandoffButtonRelease();
      }
      if (e.key.toLowerCase() === 'm') toggleShrine();
      if (e.key.toLowerCase() === 'k') document.body.classList.toggle('kurosawa-on');
      if (e.key === 'Enter') {
        const vicModal = document.getElementById('victory-modal');
        const goModal = document.getElementById('gameover-modal');
        if (vicModal && !vicModal.classList.contains('hidden')) {
          vicModal.classList.add('hidden');
          this.loadLevel(this.currentLevel + 1);
        } else if (goModal && !goModal.classList.contains('hidden')) {
          goModal.classList.add('hidden');
          this.loadLevel(this.currentLevel);
        }
      }
    });

    window.addEventListener('mouseup', (e) => {
      if (e.button === 0 && window.combatEngine.standoffActive) {
        window.combatEngine.onStandoffButtonRelease();
      }
    });

    // Stance Cards click binding
    document.querySelectorAll('.stance-card').forEach(card => {
      card.addEventListener('click', () => {
        window.stanceManager.setStance(card.dataset.stance);
      });
    });

    // Skill Hotbar click binding
    const skillKunai = document.getElementById('skill-kunai');
    const skillSmoke = document.getElementById('skill-smoke');
    const skillHeavenly = document.getElementById('skill-heavenly');
    const skillWrath = document.getElementById('skill-wrath');
    if (skillKunai) skillKunai.addEventListener('click', () => window.player.throwKunai());
    if (skillSmoke) skillSmoke.addEventListener('click', () => window.player.dropSmokeBomb());
    if (skillHeavenly) skillHeavenly.addEventListener('click', () => window.player.executeHeavenlyStrike());
    if (skillWrath) skillWrath.addEventListener('click', () => window.player.executeDanceOfWrath());
  }

  // --- 7. Main Game & Render Loop ---
  animate(time) {
    requestAnimationFrame(this.animate);

    const rawDelta = Math.min((time - this.lastTime) / 1000, 0.1);
    this.lastTime = time;

    // Bullet Time Speed Management
    if (this.speedResetTimer > 0) {
      this.speedResetTimer -= rawDelta;
      if (this.speedResetTimer <= 0) {
        this.gameSpeed = 1.0;
      }
    }
    const delta = rawDelta * this.gameSpeed;

    // Dynamic Battle Music
    const activeEnemies = this.enemies.filter(e => e.state !== 'dead').length;
    const intensity = activeEnemies === 0 ? 0 : (this.currentLevel % 5 === 0 ? 2 : 1);
    window.soundEngine.updateMusic(intensity);

    // Update Standoff Mini-Game if active
    if (window.combatEngine.standoffActive) {
      window.combatEngine.updateStandoff(delta);
    }

    // Update Player & Enemies
    if (window.player && !this.isGameOver) {
      window.player.update(delta, this.enemies);

      // Distribute AI attack tokens smoothly
      let tokensAssigned = 0;
      const levelCfg = window.difficultyDirector.getLevelConfig(this.currentLevel);

      this.enemies.forEach(enemy => {
        if (enemy.state !== 'dead') {
          if (enemy.state === 'idle' || enemy.state === 'approach' || enemy.state === 'circle') {
            if (tokensAssigned < levelCfg.maxAttackTokens) {
              enemy.hasAttackToken = true;
              tokensAssigned++;
            } else {
              enemy.hasAttackToken = false;
            }
          }
          enemy.update(delta, window.player.mesh.position, window.player, this.camera);
        }
      });
    }

    // Update Particle Engine
    if (this.particleEngine) {
      this.particleEngine.update(delta);
    }

    // Camera Director (Follows Jin Sakai with cinematic lerp & shake)
    if (window.player) {
      const pPos = window.player.mesh.position;
      let targetCamX = pPos.x;
      let targetCamY = 5.5;
      let targetCamZ = pPos.z + 8.5;

      // Standoff camera angle (Low cinematic profile)
      if (window.combatEngine.standoffActive) {
        targetCamX = pPos.x + 3.5;
        targetCamY = 1.6;
        targetCamZ = pPos.z + 1.2;
      }

      this.camera.position.x = THREE.MathUtils.lerp(this.camera.position.x, targetCamX, rawDelta * 6);
      this.camera.position.y = THREE.MathUtils.lerp(this.camera.position.y, targetCamY, rawDelta * 6);
      this.camera.position.z = THREE.MathUtils.lerp(this.camera.position.z, targetCamZ, rawDelta * 6);

      // Apply screen shake
      if (this.shakeIntensity > 0) {
        this.camera.position.x += (Math.random() - 0.5) * this.shakeIntensity;
        this.camera.position.y += (Math.random() - 0.5) * this.shakeIntensity;
        this.shakeIntensity = Math.max(0, this.shakeIntensity - rawDelta * 2);
      }

      const lookTarget = window.combatEngine.standoffActive ?
        new THREE.Vector3(pPos.x, 1.4, pPos.z - 2) :
        new THREE.Vector3(pPos.x, 1.2, pPos.z);
      this.camera.lookAt(lookTarget);
    }

    // Render 3D Scene
    this.renderer.render(this.scene, this.camera);
  }
}

// Start Game on page load
window.addEventListener('DOMContentLoaded', () => {
  window.game = new Game();
});
