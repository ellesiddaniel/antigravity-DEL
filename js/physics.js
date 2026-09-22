/**
 * Platform Fighter Physics Engine & Fighter State Machine for Brawl Legends
 */

const GRAVITY = 0.55;
const TERMINAL_VELOCITY = 15;
const FAST_FALL_SPEED = 22;
const GROUND_FRICTION = 0.82;
const AIR_DRAG = 0.96;
const WALL_SLIDE_SPEED = 2.2;

class Fighter {
  constructor(slotId, charId, isBot = false, botDifficulty = 'medium') {
    this.slotId = slotId; // 'P1', 'P2', 'P3', 'P4'
    this.charId = charId;
    this.characterData = window.CHARACTERS[charId] || window.CHARACTERS['valravn'];
    this.isBot = isBot;
    this.botDifficulty = botDifficulty;

    // Dimensions
    this.width = 40;
    this.height = 64;
    this.x = 640;
    this.y = 300;
    this.vx = 0;
    this.vy = 0;
    this.facing = 1; // 1 = right, -1 = left

    // Stats & Battle State
    this.damagePercent = 0;
    this.stocks = 3;
    this.isDead = false;
    this.isRespawning = false;
    this.respawnTimer = 0;
    this.invulnerableTimer = 0;

    // Movement States
    this.onGround = false;
    this.canDropPlatform = false;
    this.dropThroughTimer = 0;
    this.jumpsLeft = 2;
    this.hasUsedRecovery = false;
    this.isWallSliding = false;
    this.wallDir = 0; // -1 for left wall, 1 for right wall
    this.wallJumpCooldown = 0;
    this.isFastFalling = false;

    // Dodge & Invulnerability
    this.dodgeTimer = 0;
    this.dodgeCooldown = 0;
    this.isDodging = false;

    // Attack State Machine
    this.currentMove = null;
    this.moveFrame = 0;
    this.isAttacking = false;
    this.hasHitThisAttack = false;

    // Hitstun & Hitstop
    this.hitstunTimer = 0;
    this.hitstopTimer = 0;

    // Match Performance Stats
    this.matchStats = {
      kos: 0,
      falls: 0,
      damageDealt: 0,
      damageTaken: 0
    };

    // Visual Animation
    this.animTimer = Math.random() * 10;
  }

  resetForMatch(spawnPoint, stockCount = 3) {
    this.x = spawnPoint.x;
    this.y = spawnPoint.y;
    this.vx = 0;
    this.vy = 0;
    this.damagePercent = 0;
    this.stocks = stockCount;
    this.isDead = false;
    this.isRespawning = false;
    this.respawnTimer = 0;
    this.invulnerableTimer = 60; // Spawn invulnerability
    this.hitstunTimer = 0;
    this.hitstopTimer = 0;
    this.isAttacking = false;
    this.currentMove = null;
    this.jumpsLeft = 2;
    this.hasUsedRecovery = false;
    this.isDodging = false;
    this.dodgeTimer = 0;
    this.dodgeCooldown = 0;
    this.matchStats = { kos: 0, falls: 0, damageDealt: 0, damageTaken: 0 };
  }

  update(stage, fighters, input) {
    if (this.isDead) return;

    this.animTimer += 0.05;

    // 1. Handle Respawning State
    if (this.isRespawning) {
      this.respawnTimer--;
      this.vx = 0;
      this.vy = 0;
      if (this.respawnTimer <= 0) {
        this.isRespawning = false;
        this.invulnerableTimer = 120; // 2 seconds invulnerability after leaving platform
      }
      return;
    }

    // 2. Invulnerability & Timers Cooldown
    if (this.invulnerableTimer > 0) this.invulnerableTimer--;
    if (this.dodgeCooldown > 0) this.dodgeCooldown--;
    if (this.wallJumpCooldown > 0) this.wallJumpCooldown--;
    if (this.dropThroughTimer > 0) this.dropThroughTimer--;

    // 3. Hitstop (Freeze Frame)
    if (this.hitstopTimer > 0) {
      this.hitstopTimer--;
      return;
    }

    // 4. Hitstun
    if (this.hitstunTimer > 0) {
      this.hitstunTimer--;
      this.isAttacking = false;
      this.currentMove = null;
      this.isDodging = false;

      // Apply physics while in hitstun
      this.x += this.vx;
      this.y += this.vy;
      this.vy += GRAVITY;
      this.vx *= AIR_DRAG;
      this.checkStageCollisions(stage);
      this.checkBlastZones(stage, fighters);
      return;
    }

    // 5. Dodge State
    if (this.isDodging) {
      this.dodgeTimer--;
      this.x += this.vx;
      this.y += this.vy;
      this.vx *= 0.92;
      this.vy *= 0.92;

      // Trail particle
      if (Math.random() > 0.4) {
        window.particleSystem.addElementalAura(this.x, this.y, this.characterData.element, 1);
      }

      if (this.dodgeTimer <= 0) {
        this.isDodging = false;
        this.dodgeCooldown = 45; // Cooldown before next dodge
      }
      this.checkStageCollisions(stage);
      return;
    }

    // 6. Handle Attacks
    if (this.isAttacking) {
      this.updateAttack(fighters);
    } else {
      // 7. Handle Player / AI Movement Inputs
      this.handleMovement(input, stage);
    }

    // 8. Apply Gravity and Movement
    if (!this.onGround && !this.isWallSliding) {
      const maxFall = this.isFastFalling ? FAST_FALL_SPEED : TERMINAL_VELOCITY;
      this.vy = Math.min(maxFall, this.vy + GRAVITY);
    } else if (this.isWallSliding) {
      this.vy = Math.min(WALL_SLIDE_SPEED, this.vy + GRAVITY * 0.3);
    }

    // Apply Velocity
    this.x += this.vx;
    this.y += this.vy;

    // Apply Friction
    if (this.onGround) {
      this.vx *= GROUND_FRICTION;
      if (Math.abs(this.vx) < 0.2) this.vx = 0;
    } else {
      this.vx *= AIR_DRAG;
    }

    // 9. Stage Collisions & Wall Cling
    this.checkStageCollisions(stage);

    // 10. Check Blast Zones
    this.checkBlastZones(stage, fighters);
  }

  handleMovement(input, stage) {
    if (!input) return;

    const baseSpeed = 5.5 + (this.characterData.stats.speed * 0.3);
    const jumpForce = 13.5;

    // Left / Right Movement
    if (input.left) {
      this.facing = -1;
      this.vx = Math.max(this.vx - 1.2, -baseSpeed);
      if (this.onGround && Math.random() > 0.6) {
        window.particleSystem.addDust(this.x, this.y, 1, this.facing);
      }
    } else if (input.right) {
      this.facing = 1;
      this.vx = Math.min(this.vx + 1.2, baseSpeed);
      if (this.onGround && Math.random() > 0.6) {
        window.particleSystem.addDust(this.x, this.y, 1, this.facing);
      }
    }

    // Jump Input
    if (input.jumpJustPressed) {
      if (this.isWallSliding && this.wallDir !== 0 && this.wallJumpCooldown <= 0) {
        // Wall Jump!
        this.vy = -jumpForce * 1.05;
        this.vx = -this.wallDir * (baseSpeed * 1.1);
        this.facing = -this.wallDir;
        this.isWallSliding = false;
        this.wallJumpCooldown = 15;
        this.jumpsLeft = 1; // Gives 1 mid-air jump back after wall jump
        window.soundEngine.playWallJump();
        window.particleSystem.addDust(this.x, this.y, 4, this.wallDir);
      } else if (this.onGround) {
        // Ground Jump
        this.vy = -jumpForce;
        this.onGround = false;
        window.soundEngine.playJump();
        window.particleSystem.addDust(this.x, this.y, 5, 0);
      } else if (this.jumpsLeft > 0) {
        // Double Air Jump
        this.vy = -jumpForce * 0.95;
        this.jumpsLeft--;
        window.soundEngine.playJump();
        window.particleSystem.addElementalAura(this.x, this.y, this.characterData.element, 3);
      }
    }

    // Drop Through Platform / Fast Fall
    if (input.down) {
      if (this.onGround && this.canDropPlatform) {
        this.dropThroughTimer = 18;
        this.y += 4;
        this.onGround = false;
      } else if (!this.onGround && this.vy > 0) {
        this.isFastFalling = true;
      }
    }

    // Dodge / Dash Input
    if (input.dodgeJustPressed && this.dodgeCooldown <= 0 && !this.isDodging) {
      this.isDodging = true;
      this.dodgeTimer = 18;
      this.invulnerableTimer = 18;
      window.soundEngine.playDodge();

      // Dodge direction
      let dirX = 0, dirY = 0;
      if (input.left) dirX = -1;
      if (input.right) dirX = 1;
      if (input.up) dirY = -0.7;
      if (input.down) dirY = 0.7;

      if (dirX === 0 && dirY === 0) {
        dirX = this.facing; // Spot/Forward dash
      }

      this.vx = dirX * 11;
      this.vy = dirY * 11;
    }

    // Light Attack Input
    if (input.lightJustPressed) {
      this.triggerAttack('light', input);
    }
    // Heavy / Signature Attack Input
    else if (input.heavyJustPressed) {
      this.triggerAttack('heavy', input);
    }
  }

  triggerAttack(category, input) {
    let moveKey = 'nLight';
    const isAir = !this.onGround;

    if (category === 'light') {
      if (isAir) {
        if (input.up) moveKey = 'uAir';
        else if (input.down) moveKey = 'dAir';
        else if (input.left && this.facing === -1 || input.right && this.facing === 1) moveKey = 'fAir';
        else if (input.left && this.facing === 1 || input.right && this.facing === -1) moveKey = 'bAir';
        else moveKey = 'nAir';
      } else {
        if (input.up) moveKey = 'uLight';
        else if (input.down) moveKey = 'dLight';
        else if (input.left || input.right) moveKey = 'sLight';
        else moveKey = 'nLight';
      }
    } else { // Heavy / Signature / Recovery
      if (isAir && (input.up || (!this.hasUsedRecovery && input.up))) {
        moveKey = 'uRecovery';
        this.hasUsedRecovery = true;
        this.vy = -12; // Upward recovery propulsion
      } else {
        if (input.up) moveKey = 'nHeavy';
        else if (input.down) moveKey = 'dHeavy';
        else if (input.left || input.right) moveKey = 'sHeavy';
        else moveKey = 'nHeavy';
      }
    }

    const move = this.characterData.moves[moveKey];
    if (move) {
      this.currentMove = move;
      this.moveFrame = 0;
      this.isAttacking = true;
      this.hasHitThisAttack = false;

      // Play Sound
      if (move.sound === 'heavy') {
        window.soundEngine.playSwing(0.7);
      } else if (move.sound === 'whoosh') {
        window.soundEngine.playSwing(1.3);
      } else {
        window.soundEngine.playSwing(1.0);
      }
    }
  }

  updateAttack(fighters) {
    if (!this.currentMove) {
      this.isAttacking = false;
      return;
    }

    this.moveFrame++;
    const totalFrames = this.currentMove.startup + this.currentMove.active + this.currentMove.recovery;

    // Check Hitbox during Active Frames
    if (this.moveFrame >= this.currentMove.startup && 
        this.moveFrame < this.currentMove.startup + this.currentMove.active) {
      
      // Spawn Slash Visual on frame 1 of active
      if (this.moveFrame === this.currentMove.startup) {
        window.particleSystem.addSlashArc(
          this.x + (this.currentMove.hitbox.x * this.facing),
          this.y + this.currentMove.hitbox.y,
          32,
          -0.8,
          0.8,
          this.characterData.themeColor,
          this.facing
        );
      }

      if (!this.hasHitThisAttack) {
        const attackBox = {
          x: this.x + (this.facing > 0 ? this.currentMove.hitbox.x : -this.currentMove.hitbox.x - this.currentMove.hitbox.w),
          y: this.y + this.currentMove.hitbox.y,
          w: this.currentMove.hitbox.w,
          h: this.currentMove.hitbox.h
        };

        for (let other of fighters) {
          if (other === this || other.isDead || other.isRespawning || other.invulnerableTimer > 0) continue;

          // Hurtbox
          const hurtBox = {
            x: other.x - other.width / 2,
            y: other.y - other.height,
            w: other.width,
            h: other.height
          };

          if (this.checkAABB(attackBox, hurtBox)) {
            // HIT CONFIRMED!
            this.hasHitThisAttack = true;
            other.takeHit(this.currentMove, this);

            // Attacker Stats
            this.matchStats.damageDealt += this.currentMove.damage;

            // Freeze Frame / Hitstop for juicy impact
            const hitstop = this.currentMove.type === 'heavy' ? 8 : 4;
            this.hitstopTimer = hitstop;
            other.hitstopTimer = hitstop;
            break;
          }
        }
      }
    }

    if (this.moveFrame >= totalFrames) {
      this.isAttacking = false;
      this.currentMove = null;
      this.hasHitThisAttack = false;
    }
  }

  takeHit(move, attacker) {
    this.damagePercent += move.damage;
    this.matchStats.damageTaken += move.damage;

    // Calculate Knockback
    const weightFactor = 100 / this.characterData.stats.weight;
    const kbTotal = (move.baseKnockback + (this.damagePercent * move.knockbackGrowth * 0.12)) * weightFactor;

    // Knockback Angle
    let angle = move.knockbackAngle;
    if (attacker.facing < 0) {
      // Mirror horizontal angle if attacker is facing left
      angle = Math.PI - angle;
    }

    this.vx = Math.cos(angle) * kbTotal;
    this.vy = Math.sin(angle) * kbTotal;

    // Hitstun duration scales with knockback
    this.hitstunTimer = Math.min(60, Math.floor(10 + kbTotal * 1.4));
    this.isAttacking = false;
    this.isDodging = false;
    this.onGround = false;

    // Particle Sparks & Sounds
    if (move.type === 'heavy') {
      window.soundEngine.playHeavyHit();
      window.particleSystem.triggerShake(Math.min(20, kbTotal * 1.1));
      window.particleSystem.addHitSparks(this.x, this.y - 25, attacker.characterData.themeColor, 24, angle);
    } else {
      window.soundEngine.playLightHit();
      window.particleSystem.triggerShake(Math.min(8, kbTotal * 0.5));
      window.particleSystem.addHitSparks(this.x, this.y - 25, attacker.characterData.themeColor, 12, angle);
    }

    // Last attacker attribution for KO
    this.lastAttacker = attacker;
  }

  checkStageCollisions(stage) {
    this.onGround = false;
    this.isWallSliding = false;
    this.wallDir = 0;
    this.canDropPlatform = false;

    const feetY = this.y;
    const headY = this.y - this.height;
    const leftX = this.x - this.width / 2;
    const rightX = this.x + this.width / 2;

    for (let plat of stage.platforms) {
      if (plat.type === 'solid') {
        // Solid Platform Top Surface Collision
        if (this.vy >= 0 && feetY >= plat.y && (feetY - this.vy) <= plat.y + 16) {
          if (rightX > plat.x && leftX < plat.x + plat.width) {
            this.y = plat.y;
            this.vy = 0;
            this.onGround = true;
            this.jumpsLeft = 2;
            this.hasUsedRecovery = false;
            this.isFastFalling = false;
          }
        }

        // Left Wall Cling / Slide
        if (!this.onGround && feetY > plat.y + 10 && headY < plat.y + plat.height) {
          if (rightX >= plat.x && rightX <= plat.x + 14 && this.vx >= 0) {
            this.x = plat.x - this.width / 2;
            this.vx = 0;
            this.isWallSliding = true;
            this.wallDir = 1;
            this.hasUsedRecovery = false;
            this.isFastFalling = false;
          }
          // Right Wall Cling / Slide
          else if (leftX <= plat.x + plat.width && leftX >= plat.x + plat.width - 14 && this.vx <= 0) {
            this.x = plat.x + plat.width + this.width / 2;
            this.vx = 0;
            this.isWallSliding = true;
            this.wallDir = -1;
            this.hasUsedRecovery = false;
            this.isFastFalling = false;
          }
        }
      } else if (plat.type === 'semisolid') {
        // Semi-Solid Platform (Can pass through from below or drop down)
        if (this.dropThroughTimer <= 0 && this.vy >= 0) {
          if (feetY >= plat.y && (feetY - this.vy) <= plat.y + 12) {
            if (rightX > plat.x && leftX < plat.x + plat.width) {
              this.y = plat.y;
              this.vy = 0;
              this.onGround = true;
              this.canDropPlatform = true;
              this.jumpsLeft = 2;
              this.hasUsedRecovery = false;
              this.isFastFalling = false;
            }
          }
        }
      }
    }
  }

  checkBlastZones(stage, fighters) {
    const b = stage.blastZones;
    if (this.x < b.left || this.x > b.right || this.y < b.top || this.y > b.bottom) {
      // RING OUT / KO!
      this.triggerKO(stage);
    }
  }

  triggerKO(stage) {
    this.stocks--;
    this.matchStats.falls++;

    // Credit KO to last attacker if valid
    if (this.lastAttacker && this.lastAttacker !== this) {
      this.lastAttacker.matchStats.kos++;
    }

    window.soundEngine.playKO();
    window.particleSystem.addKORing(
      Math.max(50, Math.min(1230, this.x)),
      Math.max(50, Math.min(670, this.y)),
      this.characterData.themeColor
    );

    if (this.stocks <= 0) {
      this.isDead = true;
      this.x = -9999;
      this.y = -9999;
    } else {
      // Respawn on floating halo platform
      this.isRespawning = true;
      this.respawnTimer = 60; // 1 second halo timer
      this.damagePercent = 0;
      this.x = 640 + (Math.random() - 0.5) * 200;
      this.y = 200;
      this.vx = 0;
      this.vy = 0;
      this.hitstunTimer = 0;
      this.jumpsLeft = 2;
      this.hasUsedRecovery = false;
    }
  }

  checkAABB(rectA, rectB) {
    return (
      rectA.x < rectB.x + rectB.w &&
      rectA.x + rectA.w > rectB.x &&
      rectA.y < rectB.y + rectB.h &&
      rectA.y + rectA.h > rectB.y
    );
  }

  draw(ctx, debugHitbox = false) {
    if (this.isDead) return;

    ctx.save();
    ctx.translate(this.x, this.y);

    // Respawn Halo Platform
    if (this.isRespawning) {
      ctx.fillStyle = 'rgba(251, 191, 36, 0.4)';
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(0, 4, 30, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    // Invulnerability Flashing Blink
    if (this.invulnerableTimer > 0 && Math.floor(this.invulnerableTimer / 4) % 2 === 0) {
      ctx.globalAlpha = 0.4;
    }

    // Draw Character Vector Model
    this.characterData.render(ctx, this);

    // Player Indicator Tag (P1, P2, CPU, etc.)
    ctx.restore();
    ctx.save();
    ctx.translate(this.x, this.y - this.height - 18);
    ctx.fillStyle = this.characterData.themeColor;
    ctx.shadowColor = '#000';
    ctx.shadowBlur = 4;
    ctx.font = 'bold 12px Rajdhani, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(this.isBot ? `BOT ${this.slotId}` : this.slotId, 0, 0);

    // Draw little arrow pointer
    ctx.beginPath();
    ctx.moveTo(-5, 4);
    ctx.lineTo(5, 4);
    ctx.lineTo(0, 9);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Debug Hitboxes and Hurtboxes
    if (debugHitbox) {
      ctx.save();
      // Green Hurtbox
      ctx.strokeStyle = 'rgba(34, 197, 94, 0.8)';
      ctx.lineWidth = 2;
      ctx.strokeRect(this.x - this.width / 2, this.y - this.height, this.width, this.height);

      // Red Attack Hitbox
      if (this.isAttacking && this.currentMove && 
          this.moveFrame >= this.currentMove.startup && 
          this.moveFrame < this.currentMove.startup + this.currentMove.active) {
        ctx.fillStyle = 'rgba(239, 68, 68, 0.4)';
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        const abX = this.x + (this.facing > 0 ? this.currentMove.hitbox.x : -this.currentMove.hitbox.x - this.currentMove.hitbox.w);
        const abY = this.y + this.currentMove.hitbox.y;
        ctx.fillRect(abX, abY, this.currentMove.hitbox.w, this.currentMove.hitbox.h);
        ctx.strokeRect(abX, abY, this.currentMove.hitbox.w, this.currentMove.hitbox.h);
      }
      ctx.restore();
    }
  }
}

window.Fighter = Fighter;
