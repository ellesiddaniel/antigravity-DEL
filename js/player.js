/* ==========================================================================
   Ghost of Tsushima - Player Controller (Jin Sakai)
   Combat Movement, Stances, Parries, Resolve Healing, Mythic Skills, Ghost Stance
   ========================================================================== */

class Player {
  constructor(scene) {
    this.scene = scene;

    // Base Stats & Progression Bindings
    this.maxHealth = 100;
    this.health = 100;
    this.maxPosture = 80;
    this.posture = 0;
    this.moveSpeed = 5.2;

    // Resolve & Ghost Meters
    this.maxResolve = 5;
    this.resolve = 3;
    this.ghostMeter = 0;
    this.maxGhostMeter = 100;
    this.isGhostMode = false;
    this.ghostModeTimer = 0;

    // Ghost Weapons
    this.kunaiCount = 3;
    this.maxKunai = 3;
    this.smokeCount = 2;
    this.maxSmoke = 2;

    // Combat State
    this.isAttacking = false;
    this.attackTimer = 0;
    this.comboStep = 0;
    this.isGuarding = false;
    this.guardTimer = 0;
    this.isRolling = false;
    this.rollTimer = 0;
    this.rollDirection = new THREE.Vector3();

    // 3D Mesh
    this.mesh = window.modelFactory.createPlayerMesh();
    this.mesh.position.set(0, 0, 0);
    this.scene.add(this.mesh);

    // Input States
    this.keys = {
      w: false, a: false, s: false, d: false,
      shift: false, space: false, q: false, e: false,
      j: false, k: false, f: false, g: false, r: false, t: false, v: false
    };

    this.initInputListeners();
    this.applyProgressionStats();
    this.updateHUD();
  }

  applyProgressionStats() {
    if (!window.progression) return;
    const armor = window.progression.armorSets[window.progression.equippedArmor];
    if (armor) {
      this.maxHealth = 100 + (armor.healthBonus || 0);
      this.health = Math.min(this.health, this.maxHealth);
      if (armor.speedBonus) this.moveSpeed = 5.2 * (1 + armor.speedBonus);
    }
    this.updateHUD();
  }

  initInputListeners() {
    window.addEventListener('keydown', (e) => {
      const k = e.key.toLowerCase();
      if (this.keys[k] !== undefined) this.keys[k] = true;

      // Stance Switching Keys (1 - 4)
      if (e.key === '1') window.stanceManager.setStance('stone');
      if (e.key === '2') window.stanceManager.setStance('water');
      if (e.key === '3') window.stanceManager.setStance('wind');
      if (e.key === '4') window.stanceManager.setStance('moon');

      // Actions
      if (k === 'e') this.heal();
      if (k === 'f') this.throwKunai();
      if (k === 'g') this.dropSmokeBomb();
      if (k === 'r') this.executeHeavenlyStrike();
      if (k === 't') this.executeDanceOfWrath();
      if (k === 'v') this.activateGhostStance();

      // Dodge Roll
      if (e.key === 'Shift') this.startRoll();

      // Guard / Parry
      if (k === 'q' || e.code === 'Space') {
        if (!this.isGuarding) {
          this.isGuarding = true;
          this.guardTimer = 0;
        }
      }
    });

    window.addEventListener('keyup', (e) => {
      const k = e.key.toLowerCase();
      if (this.keys[k] !== undefined) this.keys[k] = false;

      if (k === 'q' || e.code === 'Space') {
        this.isGuarding = false;
      }
    });

    // Mouse Controls
    window.addEventListener('mousedown', (e) => {
      if (e.button === 0) { // Left Click: Fast Slash
        this.executeLightAttack();
      } else if (e.button === 2) { // Right Click: Heavy Stance Attack
        this.executeHeavyAttack();
      }
    });

    // Prevent context menu on right click
    window.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  update(delta, enemies) {
    // 1. Guard & Roll Timer Updates
    if (this.isGuarding) {
      this.guardTimer += delta;
    }

    if (this.isRolling) {
      this.rollTimer -= delta;
      this.mesh.position.addScaledVector(this.rollDirection, this.moveSpeed * 2.2 * delta);
      this.mesh.rotation.x += delta * 15; // Rolling flip
      if (this.rollTimer <= 0) {
        this.isRolling = false;
        this.mesh.rotation.x = 0;
      }
      return; // Skip normal movement while rolling
    }

    // 2. Attack Animation Updates
    if (this.isAttacking) {
      this.attackTimer -= delta;
      if (this.attackTimer <= 0) {
        this.isAttacking = false;
        if (this.mesh.userData.swordPivot) {
          this.mesh.userData.swordPivot.rotation.x = 1.3;
          this.mesh.userData.swordPivot.rotation.y = 0.2;
        }
      }
    }

    // 3. Ghost Mode Timer
    if (this.isGhostMode) {
      this.ghostModeTimer -= delta;
      if (this.ghostModeTimer <= 0) {
        this.deactivateGhostStance();
      }
    }

    // 4. Movement Calculation
    if (!this.isAttacking) {
      const moveVec = new THREE.Vector3(0, 0, 0);
      if (this.keys.w) moveVec.z -= 1;
      if (this.keys.s) moveVec.z += 1;
      if (this.keys.a) moveVec.x -= 1;
      if (this.keys.d) moveVec.x += 1;

      if (moveVec.lengthSq() > 0) {
        moveVec.normalize();
        this.mesh.position.addScaledVector(moveVec, this.moveSpeed * delta);

        // Face movement direction
        const targetRot = Math.atan2(moveVec.x, moveVec.z);
        this.mesh.rotation.y = THREE.MathUtils.lerp(this.mesh.rotation.y, targetRot, delta * 12);

        // Leg walking animation
        const t = Date.now() * 0.01;
        if (this.mesh.userData.leftLeg && this.mesh.userData.rightLeg) {
          this.mesh.userData.leftLeg.rotation.x = Math.sin(t) * 0.7;
          this.mesh.userData.rightLeg.rotation.x = -Math.sin(t) * 0.7;
        }
      } else {
        // Idle breathing
        if (this.mesh.userData.leftLeg && this.mesh.userData.rightLeg) {
          this.mesh.userData.leftLeg.rotation.x = 0;
          this.mesh.userData.rightLeg.rotation.x = 0;
        }
      }

      // Constrain inside arena bounds
      this.mesh.position.x = THREE.MathUtils.clamp(this.mesh.position.x, -26, 26);
      this.mesh.position.z = THREE.MathUtils.clamp(this.mesh.position.z, -26, 26);
    }
  }

  // --- Combat Actions ---
  executeLightAttack() {
    if (this.isAttacking || this.isRolling) return;
    this.isAttacking = true;
    this.attackTimer = 0.22;
    this.comboStep = (this.comboStep + 1) % 3;

    if (window.soundEngine) window.soundEngine.playKatanaSlash(false);

    // Blade swing animation
    if (this.mesh.userData.swordPivot) {
      this.mesh.userData.swordPivot.rotation.x = -0.4;
      this.mesh.userData.swordPivot.rotation.y = (this.comboStep % 2 === 0 ? 1.5 : -1.5);
    }

    if (window.combatEngine) {
      window.combatEngine.handlePlayerSlash(this, false);
    }
  }

  executeHeavyAttack() {
    if (this.isAttacking || this.isRolling) return;
    this.isAttacking = true;
    this.attackTimer = 0.35;

    if (window.soundEngine) window.soundEngine.playKatanaSlash(true);

    // Heavy overhead chop animation
    if (this.mesh.userData.swordPivot) {
      this.mesh.userData.swordPivot.rotation.x = -1.1;
      this.mesh.userData.swordPivot.rotation.y = 0;
    }

    if (window.combatEngine) {
      window.combatEngine.handlePlayerSlash(this, true);
    }
  }

  startRoll() {
    if (this.isRolling) return;
    this.isRolling = true;
    this.rollTimer = 0.35;

    // Determine direction from keys or forward
    const dir = new THREE.Vector3(0, 0, 0);
    if (this.keys.w) dir.z -= 1;
    if (this.keys.s) dir.z += 1;
    if (this.keys.a) dir.x -= 1;
    if (this.keys.d) dir.x += 1;

    if (dir.lengthSq() === 0) {
      dir.set(Math.sin(this.mesh.rotation.y), 0, Math.cos(this.mesh.rotation.y));
    } else {
      dir.normalize();
    }
    this.rollDirection.copy(dir);

    if (window.soundEngine) window.soundEngine.playKatanaSlash(false);
  }

  // --- Healing (Iron Will) ---
  heal() {
    if (this.resolve < 1) {
      if (window.game) window.game.showCombatAlert('NO RESOLVE!', 'guard-break');
      return;
    }
    if (this.health >= this.maxHealth) return;

    this.resolve -= 1;
    const healAmount = Math.round(this.maxHealth * 0.4);
    this.health = Math.min(this.maxHealth, this.health + healAmount);

    if (window.soundEngine) window.soundEngine.playHeal();
    if (window.game) {
      window.game.showCombatAlert('+40 HP RECOVERED', 'guard-break');
      window.game.particleEngine.createLightningSparks(this.mesh.position, 15);
    }

    this.updateHUD();
  }

  addResolve(amount = 1) {
    this.resolve = Math.min(this.maxResolve, this.resolve + amount);
    this.updateHUD();
  }

  addGhostMeter(amount = 20) {
    this.ghostMeter = Math.min(this.maxGhostMeter, this.ghostMeter + amount);
    if (this.ghostMeter >= this.maxGhostMeter) {
      const wrap = document.getElementById('ghost-meter-wrap');
      if (wrap) wrap.classList.add('ready');
    }
    this.updateHUD();
  }

  activateGhostStance() {
    if (this.ghostMeter < this.maxGhostMeter) return;
    this.isGhostMode = true;
    this.ghostModeTimer = 10.0; // 10 seconds of demon rage
    this.ghostMeter = 0;

    const overlay = document.getElementById('ghost-overlay');
    if (overlay) overlay.classList.add('active');

    const wrap = document.getElementById('ghost-meter-wrap');
    if (wrap) wrap.classList.remove('ready');

    if (window.soundEngine) window.soundEngine.playGhostStanceRoar();
    if (window.game) {
      window.game.showCombatAlert('GHOST STANCE ACTIVATED!', 'critical');
      window.game.particleEngine.createBloodSpray(this.mesh.position, new THREE.Vector3(0, 1, 0), 40);
      // Terrify nearby enemies
      window.game.terrifyEnemies();
    }
    this.updateHUD();
  }

  deactivateGhostStance() {
    this.isGhostMode = false;
    const overlay = document.getElementById('ghost-overlay');
    if (overlay) overlay.classList.remove('active');
  }

  // --- Mythic Techniques & Ghost Weapons ---
  throwKunai() {
    if (this.kunaiCount <= 0) return;
    this.kunaiCount--;

    if (window.soundEngine) window.soundEngine.playKatanaClash();
    if (window.combatEngine) window.combatEngine.handleKunai(this);
    this.updateHUD();
  }

  dropSmokeBomb() {
    if (this.smokeCount <= 0) return;
    this.smokeCount--;

    if (window.soundEngine) window.soundEngine.playKatanaSlash(true);
    if (window.game) {
      window.game.particleEngine.createSmokeCloud(this.mesh.position, 25);
      window.combatEngine.handleSmokeBomb(this);
    }
    this.updateHUD();
  }

  executeHeavenlyStrike() {
    if (this.resolve < 1) {
      if (window.game) window.game.showCombatAlert('REQUIRES 1 RESOLVE!', 'guard-break');
      return;
    }
    this.resolve -= 1;

    if (window.soundEngine) window.soundEngine.playHeavenlyStrike();
    if (window.combatEngine) window.combatEngine.handleHeavenlyStrike(this);
    this.updateHUD();
  }

  executeDanceOfWrath() {
    if (this.resolve < 3) {
      if (window.game) window.game.showCombatAlert('REQUIRES 3 RESOLVE!', 'guard-break');
      return;
    }
    this.resolve -= 3;

    if (window.soundEngine) window.soundEngine.playHeavenlyStrike();
    if (window.combatEngine) window.combatEngine.handleDanceOfWrath(this);
    this.updateHUD();
  }

  // --- Take Damage ---
  takeDamage(amount) {
    this.health = Math.max(0, this.health - amount);

    // Blood vignette & camera shake
    const bloodVignette = document.getElementById('blood-vignette');
    if (bloodVignette) {
      if (this.health < this.maxHealth * 0.35) bloodVignette.classList.add('active');
      else bloodVignette.classList.remove('active');
    }

    if (this.health <= 0) {
      // Check Iron Will technique
      if (window.progression && window.progression.unlockedTechniques.ironWill && this.resolve >= 2) {
        this.resolve -= 2;
        this.health = Math.round(this.maxHealth * 0.5);
        if (window.soundEngine) window.soundEngine.playHeal();
        if (window.game) window.game.showCombatAlert('IRON WILL REVIVAL!', 'critical');
      } else {
        if (window.game) window.game.onPlayerDied();
      }
    }

    this.updateHUD();
  }

  // --- UI HUD Updates ---
  updateHUD() {
    // Health Bar
    const hpBar = document.getElementById('health-bar');
    const hpGhost = document.getElementById('health-ghost-bar');
    const hpText = document.getElementById('health-text');
    if (hpBar) hpBar.style.width = `${(this.health / this.maxHealth) * 100}%`;
    if (hpGhost) hpGhost.style.width = `${(this.health / this.maxHealth) * 100}%`;
    if (hpText) hpText.innerText = `${this.health} / ${this.maxHealth}`;

    // Resolve Orbs
    const resolveContainer = document.getElementById('resolve-orbs');
    if (resolveContainer) {
      resolveContainer.innerHTML = '';
      for (let i = 0; i < this.maxResolve; i++) {
        const orb = document.createElement('div');
        orb.className = 'resolve-orb' + (i < this.resolve ? ' full' : '');
        resolveContainer.appendChild(orb);
      }
    }

    // Ghost Meter
    const ghostFill = document.getElementById('ghost-meter-fill');
    if (ghostFill) {
      ghostFill.style.width = `${(this.ghostMeter / this.maxGhostMeter) * 100}%`;
    }

    // Weapon Counts
    const kunaiEl = document.getElementById('kunai-count');
    const smokeEl = document.getElementById('smoke-count');
    if (kunaiEl) kunaiEl.innerText = `${this.kunaiCount}/${this.maxKunai}`;
    if (smokeEl) smokeEl.innerText = `${this.smokeCount}/${this.maxSmoke}`;
  }
}
