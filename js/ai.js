/**
 * AI Bot Controller for Brawl Legends
 * Handles off-stage recovery, navigation, attack combos, and defensive dodging.
 */

class AIController {
  constructor(fighter) {
    this.fighter = fighter;
    this.decisionTimer = 0;
    this.currentInput = this.createEmptyInput();
    this.target = null;
    this.targetSwitchTimer = 0;
  }

  createEmptyInput() {
    return {
      left: false,
      right: false,
      up: false,
      down: false,
      jumpJustPressed: false,
      lightJustPressed: false,
      heavyJustPressed: false,
      dodgeJustPressed: false
    };
  }

  update(stage, fighters) {
    const input = this.createEmptyInput();
    const self = this.fighter;

    if (self.isDead || self.isRespawning) {
      return input;
    }

    // Pick / update target
    this.targetSwitchTimer--;
    if (!this.target || this.target.isDead || this.targetSwitchTimer <= 0) {
      this.target = this.findBestTarget(fighters);
      this.targetSwitchTimer = 60 + Math.floor(Math.random() * 60);
    }

    const diff = self.botDifficulty || 'medium';
    const mainPlat = stage.platforms.find(p => p.type === 'solid') || stage.platforms[0];
    const stageCenterX = mainPlat ? mainPlat.x + mainPlat.width / 2 : 640;
    const stageLeftX = mainPlat ? mainPlat.x : 340;
    const stageRightX = mainPlat ? mainPlat.x + mainPlat.width : 940;
    const stageY = mainPlat ? mainPlat.y : 440;

    const isOffstage = (self.x < stageLeftX - 30 || self.x > stageRightX + 30 || self.y > stageY + 20);

    // =========================================================================
    // 1. CRITICAL PRIORITY: OFFSTAGE RECOVERY
    // =========================================================================
    if (isOffstage) {
      // Steer back towards center
      if (self.x < stageCenterX) {
        input.right = true;
      } else {
        input.left = true;
      }

      // If wall sliding, perform wall jump!
      if (self.isWallSliding) {
        input.jumpJustPressed = true;
      }
      // If falling below stage level
      else if (self.y > stageY - 40) {
        if (self.jumpsLeft > 0 && self.vy > 1) {
          input.jumpJustPressed = true;
        } else if (!self.hasUsedRecovery && self.vy > 0) {
          // Use Up Recovery
          input.up = true;
          input.heavyJustPressed = true;
        }
      }
      return input;
    }

    // =========================================================================
    // 2. COMBAT & TARGET TRACKING
    // =========================================================================
    if (!this.target) return input;

    const dx = this.target.x - self.x;
    const dy = this.target.y - self.y;
    const dist = Math.hypot(dx, dy);

    // Face target
    if (dx > 20) {
      input.right = true;
    } else if (dx < -20) {
      input.left = true;
    }

    // Vertical Navigation
    if (dy < -60) {
      // Target is above on high platform
      if (self.onGround || (self.jumpsLeft > 0 && Math.random() > 0.4)) {
        input.jumpJustPressed = true;
      }
    } else if (dy > 60 && self.canDropPlatform) {
      // Target is below on lower stage
      input.down = true;
    }

    // =========================================================================
    // 3. DEFENSIVE DODGE LOGIC
    // =========================================================================
    const dodgeChance = diff === 'hard' ? 0.4 : (diff === 'medium' ? 0.2 : 0.05);
    if (this.target.isAttacking && dist < 90 && Math.random() < dodgeChance) {
      input.dodgeJustPressed = true;
      return input;
    }

    // =========================================================================
    // 4. ATTACK LOGIC
    // =========================================================================
    const attackRange = 75;
    if (Math.abs(dx) <= attackRange && Math.abs(dy) <= 60) {
      const isTargetHighPercent = this.target.damagePercent > 70;
      const attackDecision = Math.random();

      // Heavy / Signature Attack for KO
      if (isTargetHighPercent && attackDecision < (diff === 'hard' ? 0.75 : 0.5)) {
        input.heavyJustPressed = true;
        if (Math.random() > 0.5) {
          input.left = dx < 0;
          input.right = dx > 0;
        } else if (Math.random() > 0.5) {
          input.down = true;
        } else {
          input.up = true;
        }
      }
      // Light Combo Attacks
      else if (attackDecision < (diff === 'easy' ? 0.4 : 0.85)) {
        input.lightJustPressed = true;
        if (!self.onGround) {
          if (dy > 15) input.down = true;
          else if (dy < -15) input.up = true;
        } else {
          if (Math.random() > 0.6) input.down = true;
          else if (Math.random() > 0.6) input.up = true;
        }
      }
    }

    return input;
  }

  findBestTarget(fighters) {
    let closest = null;
    let minDist = Infinity;

    for (let f of fighters) {
      if (f === this.fighter || f.isDead || f.isRespawning) continue;
      const d = Math.hypot(f.x - this.fighter.x, f.y - this.fighter.y);
      if (d < minDist) {
        minDist = d;
        closest = f;
      }
    }
    return closest;
  }
}

window.AIController = AIController;
