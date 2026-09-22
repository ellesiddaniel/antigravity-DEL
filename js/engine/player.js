/**
 * Cyber Runner 3D Player Character
 * Procedural animations, parkour physics (jump, double jump flip, slide, lane shift), neon trail
 */
class CyberPlayer {
    constructor(scene) {
        this.scene = scene;
        this.mesh = new THREE.Group();

        // Lanes configuration (-1 = Left, 0 = Center, 1 = Right)
        this.laneWidth = 3.2;
        this.currentLane = 0;
        this.targetX = 0;

        // Physics & Movement
        this.baseSpeed = 22; // units per sec
        this.speed = this.baseSpeed;
        this.speedMultiplier = 1.0;
        this.velocityY = 0;
        this.gravity = -48;
        this.jumpForce = 16.5;
        this.doubleJumpForce = 15;
        this.isGrounded = true;
        this.canDoubleJump = false;
        this.isSliding = false;
        this.slideTimer = 0;
        this.slideDuration = 0.65; // seconds
        this.isFlipping = false;
        this.flipProgress = 0;

        // Stats & State
        this.lives = 3;
        this.maxLives = 3;
        this.score = 0;
        this.streak = 0;
        this.multiplier = 1;
        this.distance = 0;
        this.isInvulnerable = false;
        this.invulnTimer = 0;
        this.slowMoTimer = 0;
        this.slowMoEnergy = 100;
        this.isSlowMo = false;
        this.isDead = false;

        // Customization / Colors
        this.themeColor = 0x00f3ff; // Neon cyan
        this.accentColor = 0xff0077; // Neon magenta

        // Limb references for procedural animation
        this.limbs = {};
        this.animTime = 0;

        // Neon Trail
        this.trailPoints = [];
        this.trailLine = null;

        this.initModel();
        this.initTrail();
        this.scene.add(this.mesh);
    }

    initModel() {
        // Material definitions
        const bodyMat = new THREE.MeshStandardMaterial({
            color: 0x1a1d2e,
            roughness: 0.2,
            metalness: 0.8
        });

        const armorMat = new THREE.MeshStandardMaterial({
            color: 0x0e111f,
            roughness: 0.3,
            metalness: 0.9
        });

        this.glowMat = new THREE.MeshBasicMaterial({
            color: this.themeColor
        });

        this.accentGlowMat = new THREE.MeshBasicMaterial({
            color: this.accentColor
        });

        // 1. Torso
        const torsoGeo = new THREE.BoxGeometry(0.7, 0.9, 0.45);
        this.torso = new THREE.Mesh(torsoGeo, bodyMat);
        this.torso.position.y = 1.35;
        this.torso.castShadow = true;
        this.mesh.add(this.torso);

        // Neon Core on Chest
        const coreGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.1, 16);
        coreGeo.rotateX(Math.PI / 2);
        const core = new THREE.Mesh(coreGeo, this.glowMat);
        core.position.set(0, 0.1, 0.23);
        this.torso.add(core);

        // Armor Plate Back
        const backPackGeo = new THREE.BoxGeometry(0.4, 0.6, 0.15);
        const backPack = new THREE.Mesh(backPackGeo, armorMat);
        backPack.position.set(0, 0.05, -0.25);
        this.torso.add(backPack);

        // Neon Back Thrusters
        const thrusterGeo = new THREE.BoxGeometry(0.08, 0.3, 0.05);
        const thrusterL = new THREE.Mesh(thrusterGeo, this.accentGlowMat);
        thrusterL.position.set(-0.12, 0, -0.34);
        const thrusterR = new THREE.Mesh(thrusterGeo, this.accentGlowMat);
        thrusterR.position.set(0.12, 0, -0.34);
        this.torso.add(thrusterL);
        this.torso.add(thrusterR);

        // 2. Head & Cyber Visor
        this.headGroup = new THREE.Group();
        this.headGroup.position.y = 0.65;
        this.torso.add(this.headGroup);

        const headGeo = new THREE.BoxGeometry(0.45, 0.45, 0.45);
        const head = new THREE.Mesh(headGeo, armorMat);
        this.headGroup.add(head);

        // Glowing Visor
        const visorGeo = new THREE.BoxGeometry(0.46, 0.15, 0.25);
        this.visor = new THREE.Mesh(visorGeo, this.glowMat);
        this.visor.position.set(0, 0.04, 0.15);
        this.headGroup.add(this.visor);

        // 3. Left Arm
        this.limbs.armL = new THREE.Group();
        this.limbs.armL.position.set(-0.48, 0.35, 0);
        this.torso.add(this.limbs.armL);

        const armGeo = new THREE.BoxGeometry(0.2, 0.75, 0.2);
        armGeo.translate(0, -0.32, 0);
        const armMeshL = new THREE.Mesh(armGeo, bodyMat);
        armMeshL.castShadow = true;
        this.limbs.armL.add(armMeshL);

        // 4. Right Arm
        this.limbs.armR = new THREE.Group();
        this.limbs.armR.position.set(0.48, 0.35, 0);
        this.torso.add(this.limbs.armR);

        const armMeshR = new THREE.Mesh(armGeo, bodyMat);
        armMeshR.castShadow = true;
        this.limbs.armR.add(armMeshR);

        // 5. Left Leg
        this.limbs.legL = new THREE.Group();
        this.limbs.legL.position.set(-0.22, 0.9, 0);
        this.mesh.add(this.limbs.legL);

        const legGeo = new THREE.BoxGeometry(0.24, 0.9, 0.24);
        legGeo.translate(0, -0.45, 0);
        const legMeshL = new THREE.Mesh(legGeo, armorMat);
        legMeshL.castShadow = true;
        this.limbs.legL.add(legMeshL);

        // Neon boot strip L
        const bootGeo = new THREE.BoxGeometry(0.25, 0.1, 0.3);
        bootGeo.translate(0, -0.85, 0.05);
        const bootL = new THREE.Mesh(bootGeo, this.glowMat);
        this.limbs.legL.add(bootL);

        // 6. Right Leg
        this.limbs.legR = new THREE.Group();
        this.limbs.legR.position.set(0.22, 0.9, 0);
        this.mesh.add(this.limbs.legR);

        const legMeshR = new THREE.Mesh(legGeo, armorMat);
        legMeshR.castShadow = true;
        this.limbs.legR.add(legMeshR);

        const bootR = new THREE.Mesh(bootGeo, this.glowMat);
        this.limbs.legR.add(bootR);
    }

    initTrail() {
        const maxPoints = 25;
        this.trailPositions = new Float32Array(maxPoints * 3);
        const trailGeo = new THREE.BufferGeometry();
        trailGeo.setAttribute('position', new THREE.BufferAttribute(this.trailPositions, 3));

        const trailMat = new THREE.LineBasicMaterial({
            color: this.themeColor,
            linewidth: 3,
            transparent: true,
            opacity: 0.7,
            blending: THREE.AdditiveBlending
        });

        this.trailLine = new THREE.Line(trailGeo, trailMat);
        this.scene.add(this.trailLine);
    }

    setThemeColor(colorHex) {
        this.themeColor = colorHex;
        if (this.glowMat) this.glowMat.color.setHex(colorHex);
        if (this.trailLine) this.trailLine.material.color.setHex(colorHex);
    }

    // --- Actions ---

    moveLane(direction) {
        if (this.isDead) return;
        // direction: -1 (Left), +1 (Right)
        this.currentLane = Math.max(-1, Math.min(1, this.currentLane + direction));
        this.targetX = this.currentLane * this.laneWidth;
    }

    setLane(laneIndex) {
        if (this.isDead) return;
        this.currentLane = Math.max(-1, Math.min(1, laneIndex));
        this.targetX = this.currentLane * this.laneWidth;
    }

    jump() {
        if (this.isDead) return;
        if (this.isGrounded) {
            this.velocityY = this.jumpForce;
            this.isGrounded = false;
            this.canDoubleJump = true;
            this.isSliding = false;
            window.soundEngine.playJump();
        } else if (this.canDoubleJump) {
            // Double Jump Air Flip!
            this.velocityY = this.doubleJumpForce;
            this.canDoubleJump = false;
            this.isFlipping = true;
            this.flipProgress = 0;
            window.soundEngine.playDoubleJump();
        }
    }

    slide() {
        if (this.isDead) return;
        if (!this.isSliding) {
            this.isSliding = true;
            this.slideTimer = this.slideDuration;
            if (!this.isGrounded) {
                // Slam down fast from air
                this.velocityY = -25;
            }
            window.soundEngine.playSlide();
        }
    }

    toggleSlowMo() {
        if (this.isDead) return;
        if (this.slowMoEnergy > 20 && !this.isSlowMo) {
            this.isSlowMo = true;
            window.soundEngine.setSlowMotion(true);
        } else if (this.isSlowMo) {
            this.isSlowMo = false;
            window.soundEngine.setSlowMotion(false);
        }
    }

    takeDamage() {
        if (this.isInvulnerable || this.isDead) return false;

        this.lives--;
        this.streak = 0;
        this.multiplier = 1;
        this.isInvulnerable = true;
        this.invulnTimer = 1.6; // seconds of i-frames
        window.soundEngine.playWrong();

        if (this.lives <= 0) {
            this.die();
        }
        return true;
    }

    die() {
        this.isDead = true;
        this.speed = 0;
        this.isSlowMo = false;
        window.soundEngine.setSlowMotion(false);
        window.soundEngine.playGameOver();
    }

    heal(amount = 1) {
        this.lives = Math.min(this.maxLives, this.lives + amount);
    }

    addStreak() {
        this.streak++;
        if (this.streak >= 10) this.multiplier = 4;
        else if (this.streak >= 5) this.multiplier = 3;
        else if (this.streak >= 2) this.multiplier = 2;
        else this.multiplier = 1;

        // Refill slow mo energy on correct streak
        this.slowMoEnergy = Math.min(100, this.slowMoEnergy + 20);
    }

    // --- Update & Procedural Animation ---

    update(delta) {
        if (this.isDead) {
            // Death tumble animation
            this.mesh.rotation.x += delta * 4;
            this.mesh.position.y = Math.max(0.3, this.mesh.position.y - delta * 5);
            return;
        }

        // Time dilation for Slow Motion
        const effectiveDelta = this.isSlowMo ? delta * 0.45 : delta;
        if (this.isSlowMo) {
            this.slowMoEnergy -= delta * 28;
            if (this.slowMoEnergy <= 0) {
                this.slowMoEnergy = 0;
                this.isSlowMo = false;
                window.soundEngine.setSlowMotion(false);
            }
        } else {
            // Passive recharge slow-mo energy
            this.slowMoEnergy = Math.min(100, this.slowMoEnergy + delta * 6);
        }

        // 1. Forward Movement
        const currentForwardSpeed = (this.speed * this.speedMultiplier);
        this.mesh.position.z -= currentForwardSpeed * effectiveDelta;
        this.distance = Math.floor(Math.abs(this.mesh.position.z));

        // Gradually increase speed over distance (capped at 42)
        this.speed = Math.min(42, this.baseSpeed + (this.distance / 150) * 1.8);

        // 2. Smooth Lane Transition (X Position)
        this.mesh.position.x = THREE.MathUtils.lerp(this.mesh.position.x, this.targetX, effectiveDelta * 14);

        // Subtle banking lean when changing lanes
        const targetTiltZ = (this.mesh.position.x - this.targetX) * 0.12;
        this.mesh.rotation.z = THREE.MathUtils.lerp(this.mesh.rotation.z, targetTiltZ, 0.2);

        // 3. Vertical Physics (Y Position & Gravity)
        this.velocityY += this.gravity * effectiveDelta;
        this.mesh.position.y += this.velocityY * effectiveDelta;

        const groundLevel = 0;
        if (this.mesh.position.y <= groundLevel) {
            this.mesh.position.y = groundLevel;
            this.velocityY = 0;
            this.isGrounded = true;
            this.canDoubleJump = false;
            this.isFlipping = false;
        }

        // 4. Double Jump Flip Animation
        if (this.isFlipping) {
            this.flipProgress += effectiveDelta * 10;
            this.torso.rotation.x = -this.flipProgress * Math.PI * 2;
            if (this.flipProgress >= 1) {
                this.isFlipping = false;
                this.torso.rotation.x = 0;
            }
        }

        // 5. Sliding State
        if (this.isSliding) {
            this.slideTimer -= effectiveDelta;
            this.torso.position.y = 0.65;
            this.torso.rotation.x = -0.9; // lean down low
            this.limbs.legL.position.y = 0.4;
            this.limbs.legR.position.y = 0.4;
            this.limbs.legL.rotation.x = -1.2;
            this.limbs.legR.rotation.x = -1.2;

            if (this.slideTimer <= 0) {
                this.isSliding = false;
                this.torso.position.y = 1.35;
                this.torso.rotation.x = 0;
                this.limbs.legL.position.y = 0.9;
                this.limbs.legR.position.y = 0.9;
            }
        } else if (!this.isFlipping) {
            // 6. Running Animation when grounded
            if (this.isGrounded) {
                this.animTime += effectiveDelta * (this.speed * 0.65);
                const runCycle = Math.sin(this.animTime);

                // Leg swing
                this.limbs.legL.rotation.x = runCycle * 0.95;
                this.limbs.legR.rotation.x = -runCycle * 0.95;

                // Arm swing (opposing legs)
                this.limbs.armL.rotation.x = -runCycle * 0.95;
                this.limbs.armR.rotation.x = runCycle * 0.95;

                // Body vertical bounce
                this.torso.position.y = 1.35 + Math.abs(Math.cos(this.animTime)) * 0.12;
                this.torso.rotation.x = 0.15; // athletic forward lean
            } else {
                // Mid-air pose
                this.limbs.legL.rotation.x = 0.6;
                this.limbs.legR.rotation.x = -0.4;
                this.limbs.armL.rotation.x = -0.8;
                this.limbs.armR.rotation.x = -0.8;
                this.torso.rotation.x = 0.2;
            }
        }

        // 7. Invulnerability flash
        if (this.isInvulnerable) {
            this.invulnTimer -= delta;
            const flash = Math.floor(this.invulnTimer * 12) % 2 === 0;
            this.mesh.visible = flash;
            if (this.invulnTimer <= 0) {
                this.isInvulnerable = false;
                this.mesh.visible = true;
            }
        }

        // 8. Update Neon Trail
        this.updateTrail();
    }

    updateTrail() {
        if (!this.trailLine) return;
        const positions = this.trailLine.geometry.attributes.position.array;
        const maxPoints = 25;

        // Shift positions
        for (let i = (maxPoints - 1) * 3; i >= 3; i -= 3) {
            positions[i] = positions[i - 3];
            positions[i + 1] = positions[i - 2];
            positions[i + 2] = positions[i - 1];
        }

        // Insert new position from player core
        positions[0] = this.mesh.position.x;
        positions[1] = this.mesh.position.y + 1.2;
        positions[2] = this.mesh.position.z + 0.3;

        this.trailLine.geometry.attributes.position.needsUpdate = true;
    }

    setDifficulty(diff) {
        if (diff === 'easy') {
            this.baseSpeed = 16;
        } else if (diff === 'hard') {
            this.baseSpeed = 24;
        } else if (diff === 'insane') {
            this.baseSpeed = 30;
        } else {
            this.baseSpeed = 19; // medium / normal
        }
        this.speed = this.baseSpeed;
    }

    reset() {
        this.mesh.position.set(0, 0, 0);
        this.mesh.rotation.set(0, 0, 0);
        this.currentLane = 0;
        this.targetX = 0;
        this.speed = this.baseSpeed;
        this.speedMultiplier = 1.0;
        this.velocityY = 0;
        this.isGrounded = true;
        this.canDoubleJump = false;
        this.isSliding = false;
        this.isFlipping = false;
        this.lives = this.maxLives;
        this.score = 0;
        this.streak = 0;
        this.multiplier = 1;
        this.distance = 0;
        this.isInvulnerable = false;
        this.isSlowMo = false;
        this.slowMoEnergy = 100;
        this.isDead = false;
        this.mesh.visible = true;
    }
}

window.CyberPlayer = CyberPlayer;
