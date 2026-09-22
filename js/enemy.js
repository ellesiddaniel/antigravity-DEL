/* ==========================================================================
   Ghost of Tsushima - Enemy Archetypes & State Machine
   Swordsman, Shieldman, Spearman, Brute, Ronin, and Boss (General Khotun)
   ========================================================================== */

class Enemy {
  constructor(config, levelConfig, scene) {
    this.type = config.type; // swordsman, shieldman, spearman, brute, ronin, boss
    this.scene = scene;
    this.levelConfig = levelConfig;

    // Archetype Base Stats
    const baseStats = this.getBaseStats(this.type);
    this.maxHealth = Math.round(baseStats.health * levelConfig.hpMult);
    this.health = this.maxHealth;
    this.maxPosture = Math.round(baseStats.posture * levelConfig.postureMult);
    this.posture = 0; // Fills up to maxPosture -> broken guard
    this.damage = Math.round(baseStats.damage * levelConfig.dmgMult);
    this.moveSpeed = baseStats.speed;
    this.attackRange = baseStats.range;
    this.isUnblockable = baseStats.isUnblockable || false;

    // State Machine
    this.state = 'idle'; // idle, approach, circle, telegraph, attack, staggered, parried, dead, terrified
    this.stateTimer = 0;
    this.attackTimer = Math.random() * levelConfig.attackCooldown;
    this.telegraphDuration = levelConfig.telegraphTime;
    this.telegraphType = 'blue'; // blue (parriable), red (unblockable), white

    // 3D Mesh
    this.mesh = window.modelFactory.createEnemyMesh(this.type);
    this.mesh.position.set(config.x || 0, 0, config.z || -8);
    this.scene.add(this.mesh);

    // Glint Telegraph 3D Indicator
    this.glintMesh = this.createGlintIndicator();
    this.mesh.add(this.glintMesh);
    this.glintMesh.visible = false;

    // Floating Health/Posture Bar Billboard
    this.healthBar3D = this.createFloatingBar();
    this.mesh.add(this.healthBar3D);

    // Tactical token
    this.hasAttackToken = false;
    this.circleAngle = Math.random() * Math.PI * 2;
    this.circleRadius = 4.5 + Math.random() * 2.5;
  }

  getBaseStats(type) {
    switch (type) {
      case 'shieldman':
        return { health: 90, posture: 80, damage: 16, speed: 2.4, range: 2.2, stanceWeakness: 'water' };
      case 'spearman':
        return { health: 75, posture: 70, damage: 18, speed: 2.6, range: 3.4, stanceWeakness: 'wind' };
      case 'brute':
        return { health: 180, posture: 140, damage: 32, speed: 1.8, range: 2.8, stanceWeakness: 'moon', isUnblockable: true };
      case 'ronin':
        return { health: 120, posture: 100, damage: 24, speed: 3.4, range: 2.6, stanceWeakness: 'stone' };
      case 'boss':
        return { health: 350, posture: 240, damage: 30, speed: 3.0, range: 3.2, stanceWeakness: 'water' };
      case 'swordsman':
      default:
        return { health: 70, posture: 60, damage: 14, speed: 2.8, range: 2.4, stanceWeakness: 'stone' };
    }
  }

  createGlintIndicator() {
    const geom = new THREE.SphereGeometry(0.22, 8, 8);
    const mat = new THREE.MeshBasicMaterial({ color: 0x29b6f6, transparent: true, opacity: 0.9 });
    const glint = new THREE.Mesh(geom, mat);
    glint.position.set(0, 2.6, 0.4);
    return glint;
  }

  createFloatingBar() {
    const group = new THREE.Group();
    // Background
    const bgGeom = new THREE.PlaneGeometry(1.2, 0.12);
    const bgMat = new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.DoubleSide });
    const bg = new THREE.Mesh(bgGeom, bgMat);

    // HP Fill
    const hpGeom = new THREE.PlaneGeometry(1.16, 0.08);
    const hpMat = new THREE.MeshBasicMaterial({ color: 0xe53935, side: THREE.DoubleSide });
    this.hpFillMesh = new THREE.Mesh(hpGeom, hpMat);
    this.hpFillMesh.position.z = 0.01;

    // Posture Fill (under HP)
    const postGeom = new THREE.PlaneGeometry(1.16, 0.04);
    const postMat = new THREE.MeshBasicMaterial({ color: 0xffb300, side: THREE.DoubleSide });
    this.postFillMesh = new THREE.Mesh(postGeom, postMat);
    this.postFillMesh.position.set(0, -0.06, 0.01);

    group.add(bg);
    group.add(this.hpFillMesh);
    group.add(this.postFillMesh);
    group.position.set(0, 2.85, 0);

    // Hide if boss (boss uses main screen HUD)
    if (this.type === 'boss') group.visible = false;

    return group;
  }

  update(delta, playerPos, player, camera) {
    if (this.state === 'dead') return;

    // Billboard healthbar to camera
    if (this.healthBar3D && camera) {
      this.healthBar3D.quaternion.copy(camera.quaternion);
    }

    // Distance and vector to player
    const toPlayer = new THREE.Vector3().subVectors(playerPos, this.mesh.position);
    toPlayer.y = 0;
    const dist = toPlayer.length();

    // Face player
    if (this.state !== 'dead' && this.state !== 'terrified') {
      const targetAngle = Math.atan2(toPlayer.x, toPlayer.z);
      this.mesh.rotation.y = THREE.MathUtils.lerp(this.mesh.rotation.y, targetAngle, delta * 8);
    }

    // State Machine Processing
    this.stateTimer += delta;

    switch (this.state) {
      case 'idle':
      case 'approach':
        if (this.hasAttackToken) {
          if (dist > this.attackRange) {
            // Close in on player
            const dir = toPlayer.clone().normalize();
            this.mesh.position.addScaledVector(dir, this.moveSpeed * delta);
            this.animateWalk(delta);
          } else {
            // Start attack telegraph
            this.startTelegraph();
          }
        } else {
          // Circle player defensively
          this.circlePlayer(playerPos, dist, delta);
        }
        break;

      case 'telegraph':
        // Flash blue/red glint and wind up weapon
        if (this.glintMesh) {
          this.glintMesh.visible = true;
          const s = 1.0 + Math.sin(this.stateTimer * 25) * 0.4;
          this.glintMesh.scale.set(s, s, s);
        }

        // Windup animation
        if (this.mesh.userData.weaponPivot) {
          this.mesh.userData.weaponPivot.rotation.x = 2.2;
        }

        if (this.stateTimer >= this.telegraphDuration) {
          this.executeAttack(player);
        }
        break;

      case 'attack':
        // Swing weapon down
        if (this.mesh.userData.weaponPivot) {
          this.mesh.userData.weaponPivot.rotation.x = THREE.MathUtils.lerp(this.mesh.userData.weaponPivot.rotation.x, -0.6, delta * 18);
        }
        if (this.stateTimer >= 0.35) {
          // Return to circle/approach
          this.state = 'idle';
          this.hasAttackToken = false;
          this.attackTimer = 0;
          if (this.glintMesh) this.glintMesh.visible = false;
        }
        break;

      case 'parried':
        // Knocked back into stunned state
        if (this.mesh.userData.weaponPivot) {
          this.mesh.userData.weaponPivot.rotation.x = 2.4;
        }
        if (this.stateTimer >= 0.9) {
          this.state = 'idle';
          if (this.glintMesh) this.glintMesh.visible = false;
        }
        break;

      case 'staggered':
        // Guard broken: shaking, completely defenseless
        this.mesh.position.x += (Math.random() - 0.5) * 0.04;
        if (this.stateTimer >= 2.0) {
          this.state = 'idle';
          this.posture = 0; // Reset posture
          this.updateBars();
        }
        break;

      case 'terrified':
        // Flee away from player
        const fleeDir = new THREE.Vector3().subVectors(this.mesh.position, playerPos).normalize();
        this.mesh.position.addScaledVector(fleeDir, this.moveSpeed * 1.5 * delta);
        this.mesh.rotation.y = Math.atan2(-fleeDir.x, -fleeDir.z);
        this.animateWalk(delta);
        break;
    }
  }

  circlePlayer(playerPos, currentDist, delta) {
    this.circleAngle += delta * 0.8;
    const targetX = playerPos.x + Math.cos(this.circleAngle) * this.circleRadius;
    const targetZ = playerPos.z + Math.sin(this.circleAngle) * this.circleRadius;

    const moveTarget = new THREE.Vector3(targetX, 0, targetZ);
    const toTarget = new THREE.Vector3().subVectors(moveTarget, this.mesh.position);
    toTarget.y = 0;

    if (toTarget.length() > 0.2) {
      const dir = toTarget.normalize();
      this.mesh.position.addScaledVector(dir, this.moveSpeed * 0.7 * delta);
      this.animateWalk(delta);
    }
  }

  animateWalk(delta) {
    const t = Date.now() * 0.008;
    if (this.mesh.userData.leftLeg && this.mesh.userData.rightLeg) {
      this.mesh.userData.leftLeg.rotation.x = Math.sin(t) * 0.6;
      this.mesh.userData.rightLeg.rotation.x = -Math.sin(t) * 0.6;
    }
  }

  startTelegraph() {
    this.state = 'telegraph';
    this.stateTimer = 0;

    // Decide glint type: Red (unblockable) vs Blue (parriable)
    if (this.isUnblockable || (this.type === 'boss' && Math.random() < 0.4) || (this.type === 'ronin' && Math.random() < 0.25)) {
      this.telegraphType = 'red';
      if (this.glintMesh) {
        this.glintMesh.material.color.setHex(0xff1744); // Crimson Red
        this.glintMesh.visible = true;
      }
    } else {
      this.telegraphType = 'blue';
      if (this.glintMesh) {
        this.glintMesh.material.color.setHex(0x29b6f6); // Samurai Blue
        this.glintMesh.visible = true;
      }
    }

    if (window.soundEngine) window.soundEngine.playKatanaSlash(false);
  }

  executeAttack(player) {
    this.state = 'attack';
    this.stateTimer = 0;
    if (this.glintMesh) this.glintMesh.visible = false;

    if (window.soundEngine) window.soundEngine.playKatanaSlash(this.telegraphType === 'red');

    // Notify Combat Engine of incoming attack
    if (window.combatEngine) {
      window.combatEngine.handleEnemyStrike(this, player);
    }
  }

  // --- Taking Damage & Posture Calculation ---
  takeDamage(amount, postureDmg, playerStance, isHeavy = false, isCritical = false) {
    if (this.state === 'dead') return;

    // Calculate Stance Advantage
    let stanceBonus = 1.0;
    let postureBonus = 1.0;

    if (window.stanceManager) {
      const mult = window.stanceManager.getMultiplierVs(this.type);
      stanceBonus = mult.damage;
      postureBonus = mult.posture;
    }

    // Shieldman blocks light attacks from front unless guard is broken
    if (this.type === 'shieldman' && this.state !== 'staggered' && !isHeavy && playerStance !== 'water') {
      // Blocked with shield!
      if (window.soundEngine) window.soundEngine.playKatanaClash();
      if (window.game) window.game.particleEngine.createSwordSparks(this.mesh.position, 10);
      this.posture += postureDmg * 0.4;
      this.updateBars();
      return;
    }

    // Apply Damage
    const finalDamage = Math.round(amount * stanceBonus * (isCritical ? 1.5 : 1.0));
    this.health = Math.max(0, this.health - finalDamage);

    // Apply Posture Damage
    const finalPosture = postureDmg * postureBonus;
    this.posture = Math.min(this.maxPosture, this.posture + finalPosture);

    // Sound & Visuals
    if (this.health <= 0) {
      this.die();
    } else {
      if (window.soundEngine) window.soundEngine.playExecutionSlice();
      if (window.game) window.game.particleEngine.createBloodSpray(this.mesh.position, new THREE.Vector3(0, 0, 1), 15);

      // Check Posture Break
      if (this.posture >= this.maxPosture && this.state !== 'staggered') {
        this.state = 'staggered';
        this.stateTimer = 0;
        if (window.game) window.game.showCombatAlert('POSTURE BROKEN!', 'guard-break');
        if (window.soundEngine) window.soundEngine.playPerfectParry();
      }
    }

    this.updateBars();
  }

  updateBars() {
    // 3D floating bar
    if (this.hpFillMesh) {
      const hpPct = Math.max(0, this.health / this.maxHealth);
      this.hpFillMesh.scale.set(hpPct, 1, 1);
      this.hpFillMesh.position.x = -(1.16 * (1 - hpPct)) / 2;
    }
    if (this.postFillMesh) {
      const postPct = Math.min(1, this.posture / this.maxPosture);
      this.postFillMesh.scale.set(postPct, 1, 1);
      this.postFillMesh.position.x = -(1.16 * (1 - postPct)) / 2;
    }

    // Boss main HUD
    if (this.type === 'boss') {
      const bossHp = document.getElementById('boss-health-bar');
      const bossPost = document.getElementById('boss-posture-bar');
      if (bossHp) bossHp.style.width = `${(this.health / this.maxHealth) * 100}%`;
      if (bossPost) bossPost.style.width = `${(this.posture / this.maxPosture) * 100}%`;
    }
  }

  die() {
    this.state = 'dead';
    this.health = 0;
    if (this.glintMesh) this.glintMesh.visible = false;
    if (this.healthBar3D) this.healthBar3D.visible = false;

    if (window.soundEngine) window.soundEngine.playExecutionSlice();
    if (window.game) {
      window.game.particleEngine.createBloodSpray(this.mesh.position, new THREE.Vector3(0, 0, 1), 35);
      window.game.onEnemyKilled(this);
    }

    // Collapse to ground
    this.mesh.rotation.x = -Math.PI / 2;
    this.mesh.position.y = 0.2;
  }
}
