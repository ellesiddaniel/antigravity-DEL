/**
 * 3D Holographic Quiz Gates & Answer Billboard System
 */
class QuizGateManager {
    constructor(scene) {
        this.scene = scene;
        this.activeGateGroups = [];
        this.gateWidth = 2.8;
        this.gateHeight = 4.2;
        this.lanePositions = [-3.2, 0, 3.2];
        this.particlePool = [];
    }

    createGateTexture(text, letter, isHighlight = false) {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');

        // Background Glass Gradient
        const grad = ctx.createLinearGradient(0, 0, 0, 256);
        grad.addColorStop(0, isHighlight ? 'rgba(0, 243, 255, 0.45)' : 'rgba(15, 23, 42, 0.85)');
        grad.addColorStop(1, isHighlight ? 'rgba(0, 255, 136, 0.65)' : 'rgba(8, 12, 28, 0.95)');
        ctx.fillStyle = grad;
        ctx.roundRect(10, 10, 492, 236, 24);
        ctx.fill();

        // Neon Border
        ctx.lineWidth = 8;
        ctx.strokeStyle = isHighlight ? '#00ff88' : '#00f3ff';
        ctx.shadowColor = isHighlight ? '#00ff88' : '#00f3ff';
        ctx.shadowBlur = 15;
        ctx.stroke();

        // Option Letter Badge (A / B / C)
        ctx.shadowBlur = 0;
        ctx.fillStyle = isHighlight ? '#00ff88' : '#00f3ff';
        ctx.beginPath();
        ctx.arc(65, 128, 40, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#060814';
        ctx.font = 'bold 44px Orbitron, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(letter, 65, 128);

        // Answer Text
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 36px Outfit, sans-serif';
        ctx.textAlign = 'left';
        
        // Truncate text if too long
        let displayText = text;
        if (displayText.length > 24) {
            displayText = displayText.substring(0, 22) + '...';
        }
        ctx.fillText(displayText, 125, 128);

        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;
        return texture;
    }

    createQuestionBannerTexture(questionText, categoryName) {
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');

        // Cyber Hologram Banner Background
        const grad = ctx.createLinearGradient(0, 0, 1024, 0);
        grad.addColorStop(0, 'rgba(255, 0, 119, 0.7)');
        grad.addColorStop(0.5, 'rgba(121, 40, 202, 0.85)');
        grad.addColorStop(1, 'rgba(0, 243, 255, 0.7)');
        ctx.fillStyle = grad;
        ctx.roundRect(10, 10, 1004, 236, 20);
        ctx.fill();

        ctx.lineWidth = 6;
        ctx.strokeStyle = '#00f3ff';
        ctx.shadowColor = '#00f3ff';
        ctx.shadowBlur = 20;
        ctx.stroke();

        // Category Tag
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#ffb700';
        ctx.font = 'bold 26px Orbitron, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`⚡ SOAL KUIS: ${categoryName.toUpperCase()} ⚡`, 512, 50);

        // Main Question Text (wraps up to 2 lines)
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 38px Outfit, sans-serif';

        const words = questionText.split(' ');
        let line1 = '';
        let line2 = '';
        let currentLine = 1;

        for (let word of words) {
            const testLine = (currentLine === 1 ? line1 + ' ' + word : line2 + ' ' + word).trim();
            if (testLine.length > 40 && currentLine === 1) {
                currentLine = 2;
                line2 = word;
            } else {
                if (currentLine === 1) line1 = testLine;
                else line2 = testLine;
            }
        }

        if (line2) {
            ctx.fillText(line1, 512, 120);
            ctx.fillText(line2, 512, 180);
        } else {
            ctx.fillText(line1, 512, 145);
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;
        return texture;
    }

    spawnGateSet(zPos, quizData) {
        const gateGroup = new THREE.Group();
        gateGroup.position.z = zPos;
        gateGroup.userData = {
            quizData: quizData,
            passed: false,
            correctLane: quizData.correctLane, // 0 = Left, 1 = Center, 2 = Right
            zPos: zPos
        };

        const letters = ['A', 'B', 'C'];
        gateGroup.userData.laneGates = [];

        // 1. Spawning 3 Gates for each lane
        this.lanePositions.forEach((xPos, idx) => {
            const singleGate = new THREE.Group();
            singleGate.position.set(xPos, 0, 0);

            // Gate Frame Arch (Left, Right, Top bars)
            const frameMat = new THREE.MeshStandardMaterial({
                color: 0x151c38,
                roughness: 0.2,
                metalness: 0.9
            });

            const neonLineMat = new THREE.MeshBasicMaterial({
                color: idx === quizData.correctLane ? 0x00f3ff : 0xff0077
            });

            // Pillars
            const pillarGeo = new THREE.BoxGeometry(0.2, this.gateHeight, 0.2);
            const pillarL = new THREE.Mesh(pillarGeo, frameMat);
            pillarL.position.set(-this.gateWidth / 2, this.gateHeight / 2, 0);
            const pillarR = new THREE.Mesh(pillarGeo, frameMat);
            pillarR.position.set(this.gateWidth / 2, this.gateHeight / 2, 0);

            // Neon glow strip along pillars
            const stripGeo = new THREE.BoxGeometry(0.06, this.gateHeight, 0.22);
            const stripL = new THREE.Mesh(stripGeo, neonLineMat);
            stripL.position.set(-this.gateWidth / 2, this.gateHeight / 2, 0);
            const stripR = new THREE.Mesh(stripGeo, neonLineMat);
            stripR.position.set(this.gateWidth / 2, this.gateHeight / 2, 0);

            // Top Arch Bar
            const topBarGeo = new THREE.BoxGeometry(this.gateWidth + 0.2, 0.25, 0.2);
            const topBar = new THREE.Mesh(topBarGeo, frameMat);
            topBar.position.set(0, this.gateHeight, 0);

            singleGate.add(pillarL, pillarR, stripL, stripR, topBar);

            // Hologram Answer Billboard
            const billboardGeo = new THREE.PlaneGeometry(this.gateWidth * 0.95, 1.25);
            const textTexture = this.createGateTexture(quizData.options[idx], letters[idx]);
            const billboardMat = new THREE.MeshBasicMaterial({
                map: textTexture,
                transparent: true,
                side: THREE.DoubleSide
            });
            const billboard = new THREE.Mesh(billboardGeo, billboardMat);
            billboard.position.set(0, this.gateHeight * 0.65, 0);
            singleGate.add(billboard);

            // Translucent Hologram Energy Field in Gate
            const fieldGeo = new THREE.PlaneGeometry(this.gateWidth * 0.9, this.gateHeight * 0.95);
            const fieldMat = new THREE.MeshBasicMaterial({
                color: 0x00f3ff,
                transparent: true,
                opacity: 0.18,
                side: THREE.DoubleSide,
                blending: THREE.AdditiveBlending
            });
            const field = new THREE.Mesh(fieldGeo, fieldMat);
            field.position.set(0, this.gateHeight * 0.48, 0);
            singleGate.add(field);

            singleGate.userData = {
                billboardMat: billboardMat,
                fieldMat: fieldMat,
                neonLineMat: neonLineMat,
                isCorrect: idx === quizData.correctLane
            };

            gateGroup.add(singleGate);
            gateGroup.userData.laneGates.push(singleGate);
        });

        // 2. Giant Overhead Question Banner (spans across all 3 lanes)
        const bannerGeo = new THREE.PlaneGeometry(10.5, 2.6);
        const bannerTexture = this.createQuestionBannerTexture(quizData.question, quizData.category || "UMUM");
        const bannerMat = new THREE.MeshBasicMaterial({
            map: bannerTexture,
            transparent: true,
            side: THREE.DoubleSide
        });
        const banner = new THREE.Mesh(bannerGeo, bannerMat);
        banner.position.set(0, this.gateHeight + 1.8, 0);
        gateGroup.add(banner);

        this.scene.add(gateGroup);
        this.activeGateGroups.push(gateGroup);
        return gateGroup;
    }

    checkCollisions(player, onCorrect, onWrong) {
        const playerZ = player.mesh.position.z;
        const playerLaneIdx = player.currentLane + 1; // map -1, 0, 1 -> 0, 1, 2

        for (let i = this.activeGateGroups.length - 1; i >= 0; i--) {
            const gateGroup = this.activeGateGroups[i];

            // Trigger when player passes through the gate's Z plane
            if (!gateGroup.userData.passed && playerZ <= gateGroup.userData.zPos + 0.5 && playerZ >= gateGroup.userData.zPos - 3.0) {
                gateGroup.userData.passed = true;
                const correctLane = gateGroup.userData.correctLane;

                if (playerLaneIdx === correctLane) {
                    // CORRECT ANSWER!
                    this.triggerSuccessEffect(gateGroup.userData.zPos, player.mesh.position.x);
                    player.addStreak();
                    player.score += 1000 * player.multiplier;
                    window.soundEngine.playCorrect();
                    window.soundEngine.playSpeedBoost();

                    if (onCorrect) onCorrect(gateGroup.userData.quizData);
                } else {
                    // WRONG ANSWER!
                    this.triggerFailEffect(gateGroup.userData.zPos, player.mesh.position.x);
                    player.takeDamage();
                    if (onWrong) onWrong(gateGroup.userData.quizData);
                }
            }

            // Remove gates that are far behind player (20 units behind)
            if (gateGroup.userData.zPos > playerZ + 35) {
                this.scene.remove(gateGroup);
                this.activeGateGroups.splice(i, 1);
            }
        }
    }

    triggerSuccessEffect(zPos, xPos) {
        // Create particle explosion
        const particleCount = 45;
        const pGeo = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const velocities = [];

        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = xPos + (Math.random() - 0.5) * 2;
            positions[i * 3 + 1] = 2 + Math.random() * 2.5;
            positions[i * 3 + 2] = zPos + (Math.random() - 0.5) * 2;

            velocities.push({
                x: (Math.random() - 0.5) * 15,
                y: Math.random() * 12 + 4,
                z: (Math.random() - 0.5) * 15
            });
        }

        pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const pMat = new THREE.PointsMaterial({
            size: 0.45,
            color: 0x00ff88,
            transparent: true,
            opacity: 1.0,
            blending: THREE.AdditiveBlending
        });

        const pSystem = new THREE.Points(pGeo, pMat);
        this.scene.add(pSystem);

        this.particlePool.push({
            mesh: pSystem,
            velocities: velocities,
            life: 1.0
        });
    }

    triggerFailEffect(zPos, xPos) {
        const particleCount = 35;
        const pGeo = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const velocities = [];

        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = xPos + (Math.random() - 0.5) * 2;
            positions[i * 3 + 1] = 1.8 + Math.random() * 2;
            positions[i * 3 + 2] = zPos;

            velocities.push({
                x: (Math.random() - 0.5) * 12,
                y: (Math.random() - 0.5) * 10,
                z: (Math.random() - 0.5) * 12
            });
        }

        pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const pMat = new THREE.PointsMaterial({
            size: 0.4,
            color: 0xff0044,
            transparent: true,
            opacity: 1.0,
            blending: THREE.AdditiveBlending
        });

        const pSystem = new THREE.Points(pGeo, pMat);
        this.scene.add(pSystem);

        this.particlePool.push({
            mesh: pSystem,
            velocities: velocities,
            life: 0.8
        });
    }

    update(delta) {
        // Animate particles
        for (let i = this.particlePool.length - 1; i >= 0; i--) {
            const p = this.particlePool[i];
            p.life -= delta * 1.5;
            p.mesh.material.opacity = p.life;

            const pos = p.mesh.geometry.attributes.position.array;
            for (let j = 0; j < p.velocities.length; j++) {
                pos[j * 3] += p.velocities[j].x * delta;
                pos[j * 3 + 1] += p.velocities[j].y * delta;
                pos[j * 3 + 2] += p.velocities[j].z * delta;
                p.velocities[j].y -= 9.8 * delta; // gravity
            }
            p.mesh.geometry.attributes.position.needsUpdate = true;

            if (p.life <= 0) {
                this.scene.remove(p.mesh);
                this.particlePool.splice(i, 1);
            }
        }
    }

    clear() {
        this.activeGateGroups.forEach(g => this.scene.remove(g));
        this.activeGateGroups = [];
        this.particlePool.forEach(p => this.scene.remove(p.mesh));
        this.particlePool = [];
    }
}

window.QuizGateManager = QuizGateManager;
