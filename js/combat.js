/* ==========================================================================
   Ghost of Tsushima - Combat Engine & Standoff Duel System
   Hitboxes, Perfect Parries, Slow-Mo Bullet Time, Standoff Mini-Game, Mythics
   ========================================================================== */

class CombatEngine {
  constructor() {
    this.standoffActive = false;
    this.standoffState = 'idle'; // prompt, waiting_release, resolved
    this.standoffEnemy = null;
    this.standoffEnemyTimer = 0;
    this.standoffEnemyStrikeTime = 0;
    this.standoffStreak = 0;
    this.maxStandoffStreak = 1;
    this.isHoldingStandoff = false;
  }

  // --- 1. Player Katana Slash Hitbox ---
  handlePlayerSlash(player, isHeavy = false) {
    if (!window.game || !window.game.enemies) return;

    const currentStance = window.stanceManager.currentStance;
    const stanceConfig = window.stanceManager.getCurrent();
    const attackConfig = isHeavy ? stanceConfig.heavyAttack : stanceConfig.lightAttack;

    // Forward strike box
    const playerPos = player.mesh.position;
    const pRot = player.mesh.rotation.y;
    const forward = new THREE.Vector3(Math.sin(pRot), 0, Math.cos(pRot));

    // Katana damage modified by progression
    const dmgMultiplier = window.progression.getKatanaDamageMultiplier();
    let baseDmg = attackConfig.damage * dmgMultiplier;
    let postureDmg = attackConfig.postureDmg;

    // Ghost Mode 1-Hit Kill
    if (player.isGhostMode) {
      baseDmg = 999;
      postureDmg = 999;
    }

    const reach = attackConfig.range || 2.8;

    window.game.enemies.forEach(enemy => {
      if (enemy.state === 'dead') return;

      const toEnemy = new THREE.Vector3().subVectors(enemy.mesh.position, playerPos);
      toEnemy.y = 0;
      const dist = toEnemy.length();

      if (dist <= reach) {
        // Angle check (is enemy in front of player?)
        const angle = forward.angleTo(toEnemy);
        if (angle < Math.PI / 2.2 || attackConfig.isAreaOfEffect) {
          // Hit connected!
          enemy.takeDamage(baseDmg, postureDmg, currentStance, isHeavy, player.isGhostMode);

          // Spawn katana sparks & blood
          if (window.game.particleEngine) {
            window.game.particleEngine.createSwordSparks(enemy.mesh.position, 12);
          }

          // Screen shake
          if (window.game) window.game.triggerScreenShake(isHeavy ? 0.3 : 0.15);

          // Typhoon kick knockback
          if (isHeavy && currentStance === 'wind' && attackConfig.knockback) {
            enemy.mesh.position.addScaledVector(forward, attackConfig.knockback);
            if (window.game) window.game.showCombatAlert('TYPHOON KICK!', 'guard-break');
          }
        }
      }
    });
  }

  // --- 2. Enemy Strike Handling & Player Parry Check ---
  handleEnemyStrike(enemy, player) {
    const toPlayer = new THREE.Vector3().subVectors(player.mesh.position, enemy.mesh.position);
    toPlayer.y = 0;
    const dist = toPlayer.length();

    // Check if player is within weapon reach
    if (dist > enemy.attackRange + 0.8) return; // Whiffed!

    // Check if player is rolling (Invulnerability frames)
    if (player.isRolling) {
      if (window.game) window.game.showCombatAlert('PERFECT DODGE!', 'perfect-parry');
      return;
    }

    // Check Unblockable (Red Glint)
    if (enemy.telegraphType === 'red') {
      if (player.isGuarding) {
        // Guard Broken by Unblockable!
        if (window.game) window.game.showCombatAlert('UNBLOCKABLE STRIKE!', 'critical');
        player.takeDamage(Math.round(enemy.damage * 1.3));
        if (window.soundEngine) window.soundEngine.playExecutionSlice();
      } else {
        player.takeDamage(enemy.damage);
      }
      return;
    }

    // Check Player Guard / Parry
    if (player.isGuarding) {
      // Perfect Parry Window: within first 0.28s of raising guard
      let parryWindow = 0.28;
      if (window.progression.unlockedTechniques.perfectParry) parryWindow = 0.38;

      if (player.guardTimer <= parryWindow) {
        // --- PERFECT PARRY! ---
        this.triggerPerfectParry(enemy, player);
      } else {
        // Standard Block
        if (window.soundEngine) window.soundEngine.playKatanaClash();
        if (window.game) {
          window.game.particleEngine.createSwordSparks(player.mesh.position, 15);
          window.game.showCombatAlert('BLOCKED', 'guard-break');
        }
        player.posture += 15;
      }
    } else {
      // Direct Hit on Player
      player.takeDamage(enemy.damage);
      if (window.soundEngine) window.soundEngine.playExecutionSlice();
      if (window.game) {
        window.game.particleEngine.createBloodSpray(player.mesh.position, new THREE.Vector3(0, 0, 1), 20);
        window.game.triggerScreenShake(0.35);
      }
    }
  }

  // --- 3. Perfect Parry Cinematic Execution ---
  triggerPerfectParry(enemy, player) {
    // 1. Time Slow (Bullet Time)
    if (window.game) window.game.setGameSpeed(0.12, 0.45);

    // 2. Audio & Flash
    if (window.soundEngine) window.soundEngine.playPerfectParry();

    const flash = document.getElementById('parry-flash');
    if (flash) {
      flash.classList.add('flash-active');
      setTimeout(() => flash.classList.remove('flash-active'), 150);
    }

    // 3. Stun enemy & Riposte
    enemy.state = 'parried';
    enemy.stateTimer = 0;
    enemy.posture = enemy.maxPosture; // Instant guard break

    // Riposte counter-damage
    setTimeout(() => {
      enemy.takeDamage(75 * window.progression.getKatanaDamageMultiplier(), 100, window.stanceManager.currentStance, true, true);
      player.addResolve(1);
      player.addGhostMeter(25);
    }, 200);

    // Visuals & Alerts
    if (window.game) {
      window.game.showCombatAlert('⚡ PERFECT PARRY & RIPOSTE!', 'perfect-parry');
      window.game.particleEngine.createSwordSparks(enemy.mesh.position, 30);
      window.game.triggerScreenShake(0.4);

      // Charm of Amaterasu / Lightning
      if (window.progression.equippedCharms.amaterasu) {
        player.health = Math.min(player.maxHealth, player.health + 20);
        player.updateHUD();
      }
      if (window.progression.equippedCharms.lightning) {
        window.game.particleEngine.createLightningSparks(enemy.mesh.position, 30);
      }
    }
  }

  // --- 4. Mythic Techniques ---
  handleHeavenlyStrike(player) {
    if (!window.game || !window.game.enemies) return;

    // Dash forward 5 units
    const forward = new THREE.Vector3(Math.sin(player.mesh.rotation.y), 0, Math.cos(player.mesh.rotation.y));
    player.mesh.position.addScaledVector(forward, 4.5);

    if (window.game) {
      window.game.particleEngine.createLightningSparks(player.mesh.position, 50);
      window.game.setGameSpeed(0.18, 0.4);
      window.game.showCombatAlert('⚡ HEAVENLY STRIKE!', 'perfect-parry');
      window.game.triggerScreenShake(0.5);
    }

    // Obliterate enemies in path
    window.game.enemies.forEach(enemy => {
      if (enemy.state === 'dead') return;
      const dist = enemy.mesh.position.distanceTo(player.mesh.position);
      if (dist < 4.2) {
        enemy.takeDamage(120 * window.progression.getKatanaDamageMultiplier(), 150, 'stone', true, true);
      }
    });
  }

  handleDanceOfWrath(player) {
    if (!window.game || !window.game.enemies) return;

    const aliveEnemies = window.game.enemies.filter(e => e.state !== 'dead');
    if (aliveEnemies.length === 0) return;

    if (window.game) {
      window.game.showCombatAlert('🌪️ DANCE OF WRATH!', 'critical');
      window.game.setGameSpeed(0.15, 0.9);
    }

    // Teleport and slice up to 3 enemies
    const targets = aliveEnemies.slice(0, 3);
    targets.forEach((target, idx) => {
      setTimeout(() => {
        player.mesh.position.copy(target.mesh.position).add(new THREE.Vector3(0.5, 0, 0.5));
        if (window.soundEngine) window.soundEngine.playExecutionSlice();
        if (window.game) {
          window.game.particleEngine.createBloodSpray(target.mesh.position, new THREE.Vector3(0, 1, 0), 30);
          window.game.particleEngine.createSwordSparks(target.mesh.position, 20);
        }
        target.takeDamage(160 * window.progression.getKatanaDamageMultiplier(), 200, 'stone', true, true);
      }, idx * 250);
    });
  }

  handleKunai(player) {
    if (!window.game || !window.game.enemies) return;
    const forward = new THREE.Vector3(Math.sin(player.mesh.rotation.y), 0, Math.cos(player.mesh.rotation.y));

    window.game.enemies.forEach(enemy => {
      if (enemy.state === 'dead') return;
      const dist = enemy.mesh.position.distanceTo(player.mesh.position);
      if (dist < 8.0) {
        enemy.state = 'parried';
        enemy.stateTimer = 0;
        enemy.takeDamage(25, 40, 'stone');
        if (window.game) window.game.particleEngine.createSwordSparks(enemy.mesh.position, 10);
      }
    });
    if (window.game) window.game.showCombatAlert('KUNAI STAGGER!', 'guard-break');
  }

  handleSmokeBomb(player) {
    if (!window.game || !window.game.enemies) return;
    window.game.enemies.forEach(enemy => {
      if (enemy.state === 'dead') return;
      const dist = enemy.mesh.position.distanceTo(player.mesh.position);
      if (dist < 7.0) {
        enemy.state = 'staggered';
        enemy.stateTimer = 0;
      }
    });
    if (window.game) window.game.showCombatAlert('SMOKE BLIND!', 'guard-break');
  }

  // --- 5. STANDOFF MINI-GAME (Iaijutsu) ---
  startStandoff(enemy) {
    this.standoffActive = true;
    this.standoffState = 'prompt';
    this.standoffEnemy = enemy;
    this.standoffStreak = 0;
    this.maxStandoffStreak = 1 + (window.progression.armorSets[window.progression.equippedArmor].standoffStreakBonus || 0);

    const overlay = document.getElementById('standoff-overlay');
    if (overlay) overlay.classList.remove('hidden');

    document.body.classList.add('cinematic-mode');

    // Position player and enemy facing each other
    window.player.mesh.position.set(0, 0, 2);
    window.player.mesh.rotation.y = Math.PI; // Face enemy
    enemy.mesh.position.set(0, 0, -4);
    enemy.mesh.rotation.y = 0; // Face player

    // Schedule enemy attack strike time (2.0 - 3.5 seconds)
    this.standoffEnemyTimer = 0;
    this.standoffEnemyStrikeTime = 2.2 + Math.random() * 1.5;

    if (window.soundEngine) window.soundEngine.playHeartbeat();
  }

  updateStandoff(delta) {
    if (!this.standoffActive) return;

    this.standoffEnemyTimer += delta;

    // Heartbeat audio pulse
    if (Math.sin(this.standoffEnemyTimer * 6) > 0.95 && window.soundEngine) {
      window.soundEngine.playHeartbeat();
    }

    // Enemy slow tense approach
    if (this.standoffEnemy && this.standoffEnemyTimer < this.standoffEnemyStrikeTime) {
      this.standoffEnemy.mesh.position.z += delta * 0.4;
    }

    // Enemy strikes!
    if (this.standoffEnemyTimer >= this.standoffEnemyStrikeTime && this.standoffState !== 'resolved') {
      // Enemy flashes blue and attacks
      this.standoffEnemy.startTelegraph();
    }
  }

  onStandoffButtonRelease() {
    if (!this.standoffActive || this.standoffState === 'resolved') return;

    const reactionDiff = this.standoffEnemyTimer - this.standoffEnemyStrikeTime;

    if (reactionDiff < -0.1) {
      // Released too early (Flinched on feint!) -> Player loses standoff
      this.standoffState = 'resolved';
      window.player.takeDamage(55);
      if (window.game) window.game.showCombatAlert('FLINCHED TOO EARLY!', 'critical');
      this.endStandoff();
    } else if (reactionDiff >= -0.1 && reactionDiff <= 0.45) {
      // SUCCESSFUL STANDOFF INSTANT KILL!
      this.standoffState = 'resolved';
      this.standoffStreak++;

      // Time slow & blood explosion
      if (window.game) {
        window.game.setGameSpeed(0.1, 0.6);
        window.game.showCombatAlert('⚔️ STANDOFF EXECUTION!', 'perfect-parry');
        window.game.particleEngine.createBloodSpray(this.standoffEnemy.mesh.position, new THREE.Vector3(0, 1, 0), 50);
        window.game.triggerScreenShake(0.5);
      }

      if (window.soundEngine) {
        window.soundEngine.playPerfectParry();
        window.soundEngine.playExecutionSlice();
      }

      this.standoffEnemy.die();
      window.player.addResolve(2);
      window.player.addGhostMeter(40);

      setTimeout(() => {
        this.endStandoff();
      }, 700);
    } else {
      // Released too late -> Enemy cuts player
      this.standoffState = 'resolved';
      window.player.takeDamage(60);
      if (window.game) window.game.showCombatAlert('TOO SLOW!', 'critical');
      this.endStandoff();
    }
  }

  endStandoff() {
    this.standoffActive = false;
    const overlay = document.getElementById('standoff-overlay');
    if (overlay) overlay.classList.add('hidden');
    document.body.classList.remove('cinematic-mode');
  }
}

// Global Combat Engine Instance
window.combatEngine = new CombatEngine();
