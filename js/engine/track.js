/**
 * Procedural 3D Track, Obstacles, Bounce Pads, and Collectible Gems
 */
class TrackManager {
    constructor(scene, quizGateManager) {
        this.scene = scene;
        this.gateManager = quizGateManager;

        this.chunkLength = 60;
        this.trackWidth = 11.0;
        this.lanePositions = [-3.2, 0, 3.2];

        this.chunks = [];
        this.obstacles = [];
        this.collectibles = [];
        this.boostPads = [];

        this.lastChunkZ = 0;
        this.nextQuizDistance = -60;
        this.quizInterval = 85; // units between quiz gates

        this.initMaterials();
    }

    initMaterials() {
        this.trackMat = new THREE.MeshStandardMaterial({
            color: 0x0a0f24,
            roughness: 0.25,
            metalness: 0.85
        });

        this.trackGlowMat = new THREE.MeshBasicMaterial({
            color: 0x00f3ff
        });

        this.obstacleMat = new THREE.MeshStandardMaterial({
            color: 0x1f0e2b,
            roughness: 0.3,
            metalness: 0.8
        });

        this.laserMat = new THREE.MeshBasicMaterial({
            color: 0xff0044,
            transparent: true,
            opacity: 0.85,
            blending: THREE.AdditiveBlending
        });

        this.gemMat = new THREE.MeshStandardMaterial({
            color: 0x00ff88,
            roughness: 0.1,
            metalness: 0.9,
            emissive: 0x00ff88,
            emissiveIntensity: 0.6
        });

        this.boostMat = new THREE.MeshBasicMaterial({
            color: 0xffb700
        });
    }

    createInitialTrack() {
        this.clear();
        this.lastChunkZ = 30;
        // Spawn first 6 chunks ahead (approx 360 units)
        for (let i = 0; i < 6; i++) {
            this.spawnChunk(this.lastChunkZ);
            this.lastChunkZ -= this.chunkLength;
        }
    }

    spawnChunk(zPos) {
        const chunkGroup = new THREE.Group();
        chunkGroup.position.z = zPos;

        // 1. Road Mesh
        const roadGeo = new THREE.BoxGeometry(this.trackWidth, 0.4, this.chunkLength);
        const roadMesh = new THREE.Mesh(roadGeo, this.trackMat);
        roadMesh.position.set(0, -0.2, -this.chunkLength / 2);
        roadMesh.receiveShadow = true;
        chunkGroup.add(roadMesh);

        // 2. Glowing Side Curbs (Left & Right)
        const curbGeo = new THREE.BoxGeometry(0.35, 0.3, this.chunkLength);
        const curbL = new THREE.Mesh(curbGeo, this.trackGlowMat);
        curbL.position.set(-this.trackWidth / 2, 0.1, -this.chunkLength / 2);
        const curbR = new THREE.Mesh(curbGeo, this.trackGlowMat);
        curbR.position.set(this.trackWidth / 2, 0.1, -this.chunkLength / 2);
        chunkGroup.add(curbL, curbR);

        // 3. Lane Divider Dashes
        for (let l = -1; l <= 1; l += 2) {
            const laneX = l * (this.lanePositions[1] - this.lanePositions[0]) / 2;
            for (let d = 0; d < this.chunkLength; d += 6) {
                const dashGeo = new THREE.PlaneGeometry(0.12, 3);
                dashGeo.rotateX(-Math.PI / 2);
                const dash = new THREE.Mesh(dashGeo, this.trackGlowMat);
                dash.position.set(laneX, 0.02, -d - 1.5);
                chunkGroup.add(dash);
            }
        }

        this.scene.add(chunkGroup);
        this.chunks.push({
            group: chunkGroup,
            zStart: zPos,
            zEnd: zPos - this.chunkLength
        });

        // 4. Populate Obstacles & Items (skip near origin start zone)
        if (zPos < -40) {
            this.populateChunkItems(zPos);
        }
    }

    populateChunkItems(chunkZ) {
        // Randomly spawn obstacles in lanes, leaving at least 1 lane open or jumpable
        const itemsToSpawn = Math.floor(Math.random() * 3) + 2;

        for (let i = 0; i < itemsToSpawn; i++) {
            const localZ = chunkZ - (Math.random() * (this.chunkLength - 16) + 8);
            const laneIdx = Math.floor(Math.random() * 3);
            const laneX = this.lanePositions[laneIdx];

            // Check if this position is within 25 units of a quiz gate
            const isNearQuizGate = this.gateManager.activeGateGroups.some(
                g => Math.abs(g.userData.zPos - localZ) < 30
            );

            if (isNearQuizGate) {
                // Only spawn friendly collectible gems near quiz gates, no blocking hurdles/lasers!
                if (Math.random() < 0.5) {
                    this.spawnGem(laneX, localZ);
                }
                continue;
            }

            const itemType = Math.random();
            if (itemType < 0.28) {
                // Low barrier: Jump over!
                this.spawnHurdle(laneX, localZ);
            } else if (itemType < 0.52) {
                // Laser Beam: Slide under!
                this.spawnLaser(laneX, localZ);
            } else if (itemType < 0.70) {
                // Bounce Springboard
                this.spawnBouncePad(laneX, localZ);
            } else if (itemType < 0.85) {
                // Speed Boost Pad
                this.spawnSpeedPad(laneX, localZ);
            } else {
                // Gem Arc
                this.spawnGem(laneX, localZ);
            }
        }
    }

    spawnHurdle(x, z) {
        const hGroup = new THREE.Group();
        hGroup.position.set(x, 0, z);

        const barGeo = new THREE.BoxGeometry(2.4, 0.7, 0.35);
        const barMesh = new THREE.Mesh(barGeo, this.obstacleMat);
        barMesh.position.y = 0.35;
        barMesh.castShadow = true;
        hGroup.add(barMesh);

        // Neon warning stripe
        const stripeGeo = new THREE.BoxGeometry(2.45, 0.12, 0.38);
        const stripeMat = new THREE.MeshBasicMaterial({ color: 0xff0077 });
        const stripe = new THREE.Mesh(stripeGeo, stripeMat);
        stripe.position.y = 0.65;
        hGroup.add(stripe);

        this.scene.add(hGroup);
        this.obstacles.push({
            group: hGroup,
            type: 'hurdle', // Must jump over
            x: x,
            z: z,
            minY: 0,
            maxY: 0.9,
            passed: false
        });
    }

    spawnLaser(x, z) {
        const laserGroup = new THREE.Group();
        laserGroup.position.set(x, 0, z);

        // Posts on sides of lane
        const postGeo = new THREE.CylinderGeometry(0.08, 0.08, 2.2);
        const postL = new THREE.Mesh(postGeo, this.obstacleMat);
        postL.position.set(-1.3, 1.1, 0);
        const postR = new THREE.Mesh(postGeo, this.obstacleMat);
        postR.position.set(1.3, 1.1, 0);
        laserGroup.add(postL, postR);

        // Glowing Laser Beam at Y = 1.35 (Head height - must slide!)
        const beamGeo = new THREE.CylinderGeometry(0.05, 0.05, 2.6);
        beamGeo.rotateZ(Math.PI / 2);
        const beam = new THREE.Mesh(beamGeo, this.laserMat);
        beam.position.set(0, 1.35, 0);
        laserGroup.add(beam);

        this.scene.add(laserGroup);
        this.obstacles.push({
            group: laserGroup,
            type: 'laser', // Must slide under
            x: x,
            z: z,
            minY: 0.85,
            maxY: 1.8,
            passed: false
        });
    }

    spawnBouncePad(x, z) {
        const padGroup = new THREE.Group();
        padGroup.position.set(x, 0, z);

        const baseGeo = new THREE.BoxGeometry(2.2, 0.15, 2.2);
        const baseMesh = new THREE.Mesh(baseGeo, this.boostMat);
        baseMesh.position.y = 0.07;
        padGroup.add(baseMesh);

        // Spring icon / chevron
        const arrowGeo = new THREE.ConeGeometry(0.4, 0.5, 4);
        const arrowMesh = new THREE.Mesh(arrowGeo, new THREE.MeshBasicMaterial({ color: 0xffffff }));
        arrowMesh.position.y = 0.4;
        padGroup.add(arrowMesh);

        this.scene.add(padGroup);
        this.boostPads.push({
            group: padGroup,
            type: 'bounce',
            x: x,
            z: z,
            used: false
        });
    }

    spawnSpeedPad(x, z) {
        const padGroup = new THREE.Group();
        padGroup.position.set(x, 0, z);

        const baseGeo = new THREE.PlaneGeometry(2.0, 3.5);
        baseGeo.rotateX(-Math.PI / 2);
        const padMesh = new THREE.Mesh(baseGeo, new THREE.MeshBasicMaterial({
            color: 0x00f3ff,
            transparent: true,
            opacity: 0.8
        }));
        padMesh.position.y = 0.03;
        padGroup.add(padMesh);

        this.scene.add(padGroup);
        this.boostPads.push({
            group: padGroup,
            type: 'speed',
            x: x,
            z: z,
            used: false
        });
    }

    spawnGem(x, z) {
        const gemGeo = new THREE.OctahedronGeometry(0.35);
        const gem = new THREE.Mesh(gemGeo, this.gemMat);
        gem.position.set(x, 1.2, z);
        this.scene.add(gem);

        this.collectibles.push({
            mesh: gem,
            x: x,
            z: z,
            collected: false
        });
    }

    update(player, delta) {
        const playerZ = player.mesh.position.z;
        const playerX = player.mesh.position.x;
        const playerY = player.mesh.position.y;

        // 1. Procedural Track Chunks: Spawn new chunks ahead
        if (playerZ - 240 < this.lastChunkZ) {
            this.spawnChunk(this.lastChunkZ);
            this.lastChunkZ -= this.chunkLength;
        }

        // 2. Remove old chunks far behind
        for (let i = this.chunks.length - 1; i >= 0; i--) {
            const chunk = this.chunks[i];
            if (chunk.zEnd > playerZ + 40) {
                this.scene.remove(chunk.group);
                this.chunks.splice(i, 1);
            }
        }

        // 3. Quiz Spawning trigger - Spawn 100-120 units ahead so player has 5+ seconds to read and prepare!
        if (playerZ <= this.nextQuizDistance) {
            const qData = window.quizEngine.getNextQuestion();
            const gateZ = this.nextQuizDistance - 95; // 95 units ahead of trigger point!
            qData.gateZ = gateZ;
            this.gateManager.spawnGateSet(gateZ, qData);
            this.nextQuizDistance -= this.quizInterval;
        }

        // 4. Obstacle Collision Checking
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const obs = this.obstacles[i];

            // Distance check in Z
            if (!obs.passed && Math.abs(playerZ - obs.z) < 1.0) {
                // Lane check in X
                if (Math.abs(playerX - obs.x) < 1.4) {
                    let hit = false;

                    if (obs.type === 'hurdle') {
                        // Player must jump above hurdle
                        if (playerY < obs.maxY) {
                            hit = true;
                        }
                    } else if (obs.type === 'laser') {
                        // Player must slide under laser
                        if (!player.isSliding && playerY >= obs.minY) {
                            hit = true;
                        }
                    }

                    if (hit) {
                        obs.passed = true;
                        player.takeDamage();
                    }
                }
            }

            // Cleanup old obstacles
            if (obs.z > playerZ + 25) {
                this.scene.remove(obs.group);
                this.obstacles.splice(i, 1);
            }
        }

        // 5. Boost & Bounce Pad Collision
        for (let i = this.boostPads.length - 1; i >= 0; i--) {
            const pad = this.boostPads[i];
            if (!pad.used && Math.abs(playerZ - pad.z) < 1.4 && Math.abs(playerX - pad.x) < 1.3) {
                pad.used = true;
                if (pad.type === 'bounce') {
                    // Super launch into air
                    player.velocityY = 24;
                    player.isGrounded = false;
                    player.canDoubleJump = true;
                    window.soundEngine.playBounce();
                } else if (pad.type === 'speed') {
                    // Turbo speed burst
                    player.speedMultiplier = 1.4;
                    window.soundEngine.playSpeedBoost();
                    setTimeout(() => {
                        player.speedMultiplier = 1.0;
                    }, 2000);
                }
            }

            if (pad.z > playerZ + 25) {
                this.scene.remove(pad.group);
                this.boostPads.splice(i, 1);
            }
        }

        // 6. Collectible Gems Animation & Pick-up
        for (let i = this.collectibles.length - 1; i >= 0; i--) {
            const gem = this.collectibles[i];
            gem.mesh.rotation.y += delta * 3;
            gem.mesh.position.y = 1.2 + Math.sin(Date.now() * 0.005 + gem.z) * 0.2;

            if (!gem.collected && Math.abs(playerZ - gem.z) < 1.2 && Math.abs(playerX - gem.x) < 1.3 && Math.abs(playerY + 1.0 - gem.mesh.position.y) < 1.5) {
                gem.collected = true;
                player.score += 50 * player.multiplier;
                window.soundEngine.playCoin();
                this.scene.remove(gem.mesh);
                this.collectibles.splice(i, 1);
                continue;
            }

            if (gem.z > playerZ + 25) {
                this.scene.remove(gem.mesh);
                this.collectibles.splice(i, 1);
            }
        }
    }

    clear() {
        this.chunks.forEach(c => this.scene.remove(c.group));
        this.chunks = [];
        this.obstacles.forEach(o => this.scene.remove(o.group));
        this.obstacles = [];
        this.boostPads.forEach(b => this.scene.remove(b.group));
        this.boostPads = [];
        this.collectibles.forEach(g => this.scene.remove(g.mesh));
        this.collectibles = [];
        this.nextQuizDistance = -30;
        this.quizInterval = 130; // Ample spacing between questions
    }
}

window.TrackManager = TrackManager;
