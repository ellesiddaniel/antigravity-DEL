/**
 * Subway Surfers 3D - Main Game Engine
 * Features: Procedural Chunk Generation, 3-Lane Physics, Trains, Obstacles, Power-ups,
 * Particle Systems, Dynamic Camera, and Collision Detection.
 */

class SubwaySurfersGame {
  constructor() {
    this.container = document.getElementById('game-container');
    this.canvas = document.getElementById('three-canvas');

    // Game States
    this.state = 'MENU'; // 'MENU', 'PLAYING', 'PAUSED', 'GAMEOVER'
    this.score = 0;
    this.coins = 0;
    this.distance = 0;
    this.baseSpeed = 26;
    this.currentSpeed = 26;
    this.maxSpeed = 58;
    this.scoreMultiplier = 1;

    // Lane Settings
    this.lanes = [-3.2, 0, 3.2];
    this.currentLaneIdx = 1; // Middle lane
    this.playerX = 0;
    this.playerY = 0;
    this.playerZ = 0;
    this.velocityY = 0;
    this.gravity = -48;
    this.jumpForce = 14.5;
    this.isGrounded = true;
    this.isSliding = false;
    this.slideTimer = 0;
    this.slideDuration = 0.75;
    this.groundLevel = 0; // Can be 0 (rail) or 3.9 (train roof)

    // Active Power-ups: { magnet: time, jetpack: time, sneakers: time, multiplier: time, hoverboard: time }
    this.activePowerups = {
      magnet: 0,
      jetpack: 0,
      sneakers: 0,
      multiplier: 0,
      hoverboard: 0
    };

    // World & Chunks
    this.chunks = [];
    this.chunkLength = 60;
    this.activeObstacles = [];
    this.activeCoins = [];
    this.activePowerupItems = [];
    this.activeMovingTrains = [];
    this.nextChunkZ = 0;

    // Particles
    this.particles = [];

    // Chaser
    this.inspectorDistance = 12; // Distance behind player
    this.inspectorTargetDist = 12;

    this.clock = new THREE.Clock();
    this.animTime = 0;

    this.initThree();
    this.initScene();
    this.bindEvents();
    this.animate();
  }

  // ==========================================
  // INITIALIZATION
  // ==========================================
  initThree() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0e17);
    this.scene.fog = new THREE.Fog(0x0a0e17, 35, 140);

    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 200);
    this.camera.position.set(0, 4.0, 7.5);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;
  }

  initScene() {
    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    this.scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xfffaed, 1.2);
    dirLight.position.set(20, 40, 20);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 100;
    dirLight.shadow.camera.left = -20;
    dirLight.shadow.camera.right = 20;
    dirLight.shadow.camera.top = 20;
    dirLight.shadow.camera.bottom = -20;
    this.scene.add(dirLight);

    // Player Character
    this.createPlayer();

    // Inspector & Dog Chaser
    this.inspector = window.modelFactory.createInspector();
    this.inspector.position.set(0, 0, 10);
    this.scene.add(this.inspector);

    // Generate initial track chunks
    this.resetWorld();
  }

  createPlayer() {
    if (this.playerMesh) {
      this.scene.remove(this.playerMesh);
    }
    const currentSkin = (window.shopManager && window.shopManager.data.selectedCharacter) || 'jake';
    this.playerMesh = window.modelFactory.createCharacter(currentSkin);
    this.playerMesh.position.set(0, 0, 0);
    this.scene.add(this.playerMesh);
  }

  reloadCharacter() {
    this.createPlayer();
  }

  resetWorld() {
    // Clear old chunks & items
    this.chunks.forEach(c => this.scene.remove(c));
    this.chunks = [];

    this.activeObstacles.forEach(o => this.scene.remove(o));
    this.activeObstacles = [];

    this.activeCoins.forEach(c => this.scene.remove(c));
    this.activeCoins = [];

    this.activePowerupItems.forEach(p => this.scene.remove(p));
    this.activePowerupItems = [];

    this.activeMovingTrains.forEach(t => this.scene.remove(t));
    this.activeMovingTrains = [];

    this.playerZ = 0;
    this.nextChunkZ = 0;

    // Spawn 5 chunks ahead
    for (let i = 0; i < 5; i++) {
      this.spawnChunk(i === 0); // First chunk has no obstacles
    }
  }

  // ==========================================
  // PROCEDURAL GENERATION & CHUNK RECYCLING
  // ==========================================
  spawnChunk(isSafe = false) {
    const chunkZ = this.nextChunkZ;
    const chunk = window.modelFactory.createTrackChunk(this.chunkLength);
    chunk.position.set(0, 0, chunkZ - this.chunkLength / 2);
    this.scene.add(chunk);
    this.chunks.push(chunk);

    if (!isSafe) {
      this.populateChunk(chunkZ);
    }

    this.nextChunkZ -= this.chunkLength;
  }

  populateChunk(startZ) {
    const isJetpack = this.activePowerups.jetpack > 0;
    const centerZ = startZ - this.chunkLength / 2;

    // Pick a procedural scenario pattern
    const pattern = Math.floor(Math.random() * 5);

    if (isJetpack) {
      // Sky Coin Rainbow Runway
      [-3.2, 0, 3.2].forEach(laneX => {
        for (let z = startZ - 5; z > startZ - this.chunkLength + 5; z -= 3) {
          this.spawnCoin(laneX, 12, z);
        }
      });
      return;
    }

    // Lane configurations
    const lanes = [-3.2, 0, 3.2];
    const blockedLanes = [];

    if (pattern === 0) {
      // Barrier & Coins mix
      const randLane = lanes[Math.floor(Math.random() * lanes.length)];
      const barrierType = Math.random() > 0.5 ? 'low' : 'high';
      this.spawnBarrier(randLane, centerZ, barrierType);
      blockedLanes.push(randLane);

      // Coins in other lanes
      lanes.filter(l => l !== randLane).forEach(l => {
        for (let z = centerZ + 8; z > centerZ - 8; z -= 2.5) {
          this.spawnCoin(l, 1.0, z);
        }
      });

    } else if (pattern === 1) {
      // Stationary Train with Ramp & Coins on roof
      const trainLane = lanes[Math.floor(Math.random() * lanes.length)];
      this.spawnTrain(trainLane, centerZ, false, true);
      blockedLanes.push(trainLane);

      // Coins on train roof
      for (let z = centerZ + 8; z > centerZ - 8; z -= 2.5) {
        this.spawnCoin(trainLane, 4.6, z);
      }

      // Barrier on another lane
      const otherLanes = lanes.filter(l => l !== trainLane);
      const secondLane = otherLanes[0];
      this.spawnBarrier(secondLane, centerZ - 4, 'low');
      blockedLanes.push(secondLane);

    } else if (pattern === 2) {
      // Moving Commuter Train
      const movingLane = lanes[Math.floor(Math.random() * lanes.length)];
      this.spawnTrain(movingLane, centerZ - 15, true, false);
      blockedLanes.push(movingLane);

      // Coin arc in a free lane
      const freeLane = lanes.find(l => !blockedLanes.includes(l)) || 0;
      this.spawnCoinArc(freeLane, centerZ);

    } else if (pattern === 3) {
      // Double Obstacles & Power-up Spawner
      const lane1 = lanes[0];
      const lane2 = lanes[2];
      this.spawnBarrier(lane1, centerZ, 'low');
      this.spawnBarrier(lane2, centerZ, 'high');

      // Power-up in middle lane
      const powerTypes = ['magnet', 'jetpack', 'sneakers', 'multiplier', 'key'];
      const chosenPower = powerTypes[Math.floor(Math.random() * powerTypes.length)];
      this.spawnPowerupItem(lanes[1], 1.2, centerZ, chosenPower);

    } else {
      // Coin Arcs & Jump Ramps
      lanes.forEach(l => {
        if (Math.random() > 0.4) {
          this.spawnCoinArc(l, centerZ);
        }
      });
    }
  }

  spawnBarrier(laneX, z, type) {
    let barrier;
    if (type === 'low') {
      barrier = window.modelFactory.createLowBarrier();
    } else if (type === 'high') {
      barrier = window.modelFactory.createHighBarrier();
    } else {
      barrier = window.modelFactory.createFullBlockade();
    }
    barrier.position.set(laneX, 0, z);
    this.scene.add(barrier);
    this.activeObstacles.push(barrier);
  }

  spawnTrain(laneX, z, isMoving = false, hasRamp = false) {
    const train = window.modelFactory.createTrain(22, hasRamp);
    train.position.set(laneX, 0, z);
    train.userData.isMoving = isMoving;
    train.userData.speed = isMoving ? 14 : 0;
    this.scene.add(train);
    this.activeObstacles.push(train);

    if (isMoving) {
      this.activeMovingTrains.push(train);
      if (window.audioManager && Math.random() > 0.4) {
        window.audioManager.playTrainHorn();
      }
    }
  }

  spawnCoin(x, y, z) {
    const coin = window.modelFactory.createCoin();
    coin.position.set(x, y, z);
    this.scene.add(coin);
    this.activeCoins.push(coin);
  }

  spawnCoinArc(laneX, centerZ) {
    const count = 7;
    for (let i = 0; i < count; i++) {
      const progress = i / (count - 1);
      const z = centerZ + 8 - progress * 16;
      const height = 1.0 + Math.sin(progress * Math.PI) * 2.8;
      this.spawnCoin(laneX, height, z);
    }
  }

  spawnPowerupItem(x, y, z, type) {
    const item = window.modelFactory.createPowerup(type);
    item.position.set(x, y, z);
    this.scene.add(item);
    this.activePowerupItems.push(item);
  }

  // ==========================================
  // GAMEPLAY CONTROLS & PHYSICS
  // ==========================================
  moveLane(dir) {
    if (this.state !== 'PLAYING') return;
    const newIdx = this.currentLaneIdx + dir;
    if (newIdx >= 0 && newIdx < this.lanes.length) {
      this.currentLaneIdx = newIdx;
      if (window.audioManager) window.audioManager.playJump();
    }
  }

  jump() {
    if (this.state !== 'PLAYING') return;
    if (this.isGrounded) {
      const isSuper = this.activePowerups.sneakers > 0;
      this.velocityY = isSuper ? this.jumpForce * 1.4 : this.jumpForce;
      this.isGrounded = false;
      this.isSliding = false;
      if (window.audioManager) window.audioManager.playJump(isSuper);
    }
  }

  slide() {
    if (this.state !== 'PLAYING') return;
    this.isSliding = true;
    this.slideTimer = this.slideDuration;

    // Fast drop if in mid-air
    if (!this.isGrounded) {
      this.velocityY = -28;
    }

    if (window.audioManager) window.audioManager.playSlide();
  }

  activateHoverboard() {
    if (this.state !== 'PLAYING') return;
    if (this.activePowerups.hoverboard <= 0) {
      this.activePowerups.hoverboard = 25; // 25s shield
      if (window.audioManager) window.audioManager.playHoverboard();
      this.showFloatingText('🛹 HOVERBOARD ACTIVE!', '#00d2ff');
    }
  }

  togglePause() {
    if (this.state === 'PLAYING') {
      this.state = 'PAUSED';
      document.getElementById('pause-modal').classList.remove('hidden');
      if (window.audioManager) window.audioManager.stopBGM();
    } else if (this.state === 'PAUSED') {
      this.resumeGame();
    }
  }

  resumeGame() {
    this.state = 'PLAYING';
    document.getElementById('pause-modal').classList.add('hidden');
    if (window.audioManager) window.audioManager.startBGM();
  }

  // ==========================================
  // GAME LOOP & UPDATES
  // ==========================================
  startGame() {
    this.state = 'PLAYING';
    this.score = 0;
    this.coins = 0;
    this.distance = 0;
    this.currentSpeed = this.baseSpeed;
    this.currentLaneIdx = 1;
    this.playerX = 0;
    this.playerY = 0;
    this.playerZ = 0;
    this.velocityY = 0;
    this.isGrounded = true;
    this.isSliding = false;
    this.groundLevel = 0;
    this.inspectorDistance = 12;

    Object.keys(this.activePowerups).forEach(k => this.activePowerups[k] = 0);

    this.resetWorld();

    document.querySelectorAll('.modal-backdrop').forEach(m => m.classList.add('hidden'));

    if (window.audioManager) {
      window.audioManager.ensureContext();
      window.audioManager.startBGM();
    }
  }

  update(delta) {
    if (this.state !== 'PLAYING') return;

    this.animTime += delta;

    // Speed progression
    this.currentSpeed = Math.min(this.maxSpeed, this.baseSpeed + this.distance * 0.008);

    // Jetpack speed boost
    const effectiveSpeed = this.activePowerups.jetpack > 0 ? this.currentSpeed * 1.5 : this.currentSpeed;

    // Move player forward
    this.playerZ -= effectiveSpeed * delta;
    this.distance += effectiveSpeed * delta;

    // Multiplier calculation
    const currentMultiplier = (this.activePowerups.multiplier > 0 ? 2 : 1) * this.scoreMultiplier;
    this.score += Math.floor(effectiveSpeed * delta * 1.5 * currentMultiplier);

    // Lateral (Lane) Interpolation
    const targetX = this.lanes[this.currentLaneIdx];
    this.playerX += (targetX - this.playerX) * 16 * delta;

    // Jetpack elevation vs Normal Gravity
    if (this.activePowerups.jetpack > 0) {
      const targetJetY = 12;
      this.playerY += (targetJetY - this.playerY) * 6 * delta;
      this.isGrounded = false;
      this.isSliding = false;
      this.createJetpackParticles();
    } else {
      // Normal vertical physics
      this.playerY += this.velocityY * delta;
      this.velocityY += this.gravity * delta;

      if (this.playerY <= this.groundLevel) {
        this.playerY = this.groundLevel;
        this.velocityY = 0;
        this.isGrounded = true;
      }
    }

    // Sliding timer
    if (this.isSliding) {
      this.slideTimer -= delta;
      if (this.slideTimer <= 0) {
        this.isSliding = false;
      }
    }

    // Update Player Mesh Position & Rig Animation
    this.playerMesh.position.set(this.playerX, this.playerY, this.playerZ);
    this.animatePlayerMesh(delta);

    // Update Moving Trains
    this.updateMovingTrains(delta);

    // Update Power-ups & Durations
    this.updatePowerups(delta);

    // Collectibles (Coins & Power-up items)
    this.updateCoins(delta);
    this.updatePowerupItems(delta);

    // Collisions
    this.checkCollisions();

    // Inspector & Dog Chaser
    this.updateInspector(delta);

    // Update Particles
    this.updateParticles(delta);

    // Camera follow with dynamic smoothing & tilt
    this.updateCamera(delta);

    // Chunk generation & cleanup
    if (this.playerZ - 120 < this.nextChunkZ) {
      this.spawnChunk();
    }
    this.cleanupOldObjects();

    // Update UI HUD
    this.updateHUD();
  }

  animatePlayerMesh(delta) {
    if (!this.playerMesh.rig) return;
    const rig = this.playerMesh.rig;
    const isJet = this.activePowerups.jetpack > 0;
    const isBoard = this.activePowerups.hoverboard > 0;

    rig.jetpackGroup.visible = isJet;
    rig.hoverboard.visible = isBoard && !isJet;

    // Lateral tilt when moving lanes
    const targetX = this.lanes[this.currentLaneIdx];
    const tilt = (targetX - this.playerX) * 0.15;
    this.playerMesh.rotation.z = -tilt;

    if (isJet) {
      // Jetpack flying pose
      rig.bodyRoot.rotation.x = 0.5;
      rig.leftLegGroup.rotation.x = 0.3;
      rig.rightLegGroup.rotation.x = 0.3;
      rig.leftArmGroup.rotation.x = -0.5;
      rig.rightArmGroup.rotation.x = -0.5;
    } else if (isBoard) {
      // Surfing pose
      rig.bodyRoot.rotation.x = 0;
      this.playerMesh.rotation.y = 0.5;
      rig.leftLegGroup.rotation.x = -0.3;
      rig.rightLegGroup.rotation.x = 0.3;
      rig.leftArmGroup.rotation.x = 0.8;
      rig.rightArmGroup.rotation.x = -0.8;
    } else if (this.isSliding) {
      // Crouching / Slide pose
      this.playerMesh.rotation.y = 0;
      rig.bodyRoot.rotation.x = -0.8;
      rig.leftLegGroup.rotation.x = 1.2;
      rig.rightLegGroup.rotation.x = 1.2;
      rig.leftArmGroup.rotation.x = 0.5;
      rig.rightArmGroup.rotation.x = 0.5;
    } else if (!this.isGrounded) {
      // Jumping pose
      this.playerMesh.rotation.y = 0;
      rig.bodyRoot.rotation.x = 0.15;
      rig.leftLegGroup.rotation.x = 0.7;
      rig.rightLegGroup.rotation.x = 0.7;
      rig.leftArmGroup.rotation.x = -1.2;
      rig.rightArmGroup.rotation.x = -1.2;
    } else {
      // Normal running cycle
      this.playerMesh.rotation.y = 0;
      rig.bodyRoot.rotation.x = 0.12;
      const legCycle = Math.sin(this.animTime * 18);
      rig.leftLegGroup.rotation.x = legCycle * 0.9;
      rig.rightLegGroup.rotation.x = -legCycle * 0.9;
      rig.leftArmGroup.rotation.x = -legCycle * 0.9;
      rig.rightArmGroup.rotation.x = legCycle * 0.9;
    }
  }

  updateMovingTrains(delta) {
    this.activeMovingTrains.forEach(train => {
      train.position.z += train.userData.speed * delta; // Moves towards the runner
    });
  }

  updatePowerups(delta) {
    let hasActive = false;
    Object.keys(this.activePowerups).forEach(type => {
      if (this.activePowerups[type] > 0) {
        this.activePowerups[type] -= delta;
        hasActive = true;
        if (this.activePowerups[type] <= 0) {
          this.activePowerups[type] = 0;
          if (type === 'jetpack' && window.audioManager) {
            window.audioManager.stopJetpackLoop();
          }
        }
      }
    });

    const speedVignette = document.getElementById('speed-vignette');
    if (speedVignette) {
      speedVignette.classList.toggle('active', this.activePowerups.jetpack > 0 || this.currentSpeed > 40);
    }
  }

  updateCoins(delta) {
    const isMagnet = this.activePowerups.magnet > 0;
    const magnetRange = 14;

    for (let i = this.activeCoins.length - 1; i >= 0; i--) {
      const coin = this.activeCoins[i];
      coin.rotation.y += delta * 4;

      const dx = this.playerX - coin.position.x;
      const dy = this.playerY + 0.8 - coin.position.y;
      const dz = this.playerZ - coin.position.z;
      const dist = Math.hypot(dx, dy, dz);

      // Magnet pull
      if (isMagnet && dist < magnetRange) {
        coin.position.x += dx * 12 * delta;
        coin.position.y += dy * 12 * delta;
        coin.position.z += dz * 12 * delta;
      }

      // Collect coin
      if (dist < 1.4) {
        this.collectCoin(coin, i);
      }
    }
  }

  collectCoin(coin, index) {
    this.scene.remove(coin);
    this.activeCoins.splice(index, 1);
    this.coins++;
    this.score += 60;

    if (window.audioManager) window.audioManager.playCoin();
    this.createCoinParticles(coin.position);
  }

  updatePowerupItems(delta) {
    for (let i = this.activePowerupItems.length - 1; i >= 0; i--) {
      const item = this.activePowerupItems[i];
      item.rotation.y += delta * 3;

      const dist = Math.hypot(
        this.playerX - item.position.x,
        this.playerY + 0.8 - item.position.y,
        this.playerZ - item.position.z
      );

      if (dist < 1.6) {
        const type = item.userData.type;
        this.scene.remove(item);
        this.activePowerupItems.splice(i, 1);

        if (type === 'key') {
          if (window.shopManager) window.shopManager.addKeys(1);
          if (window.audioManager) window.audioManager.playPowerup();
          this.showFloatingText('+1 REVIVE KEY!', '#00d2ff');
        } else {
          const duration = (window.shopManager && window.shopManager.getPowerupDuration(type)) || 12;
          this.activePowerups[type] = duration;

          if (type === 'jetpack' && window.audioManager) {
            window.audioManager.startJetpackLoop();
          }
          if (window.audioManager) window.audioManager.playPowerup();

          const names = {
            magnet: '🧲 COIN MAGNET',
            jetpack: '🚀 JETPACK BOOST',
            sneakers: '👟 SUPER SNEAKERS',
            multiplier: '⭐ 2X MULTIPLIER'
          };
          this.showFloatingText(names[type] || 'POWER-UP!', '#ffe600');
        }
      }
    }
  }

  // ==========================================
  // COLLISION DETECTION
  // ==========================================
  checkCollisions() {
    if (this.activePowerups.jetpack > 0) return; // Jetpack flies safely above everything

    let onTrainRoof = false;
    const playerBox = {
      minX: this.playerX - 0.5,
      maxX: this.playerX + 0.5,
      minY: this.playerY,
      maxY: this.playerY + (this.isSliding ? 1.0 : 2.0),
      minZ: this.playerZ - 0.5,
      maxZ: this.playerZ + 0.5
    };

    for (let i = 0; i < this.activeObstacles.length; i++) {
      const obs = this.activeObstacles[i];
      const type = obs.userData.type;

      if (type === 'train') {
        const trainLength = obs.userData.length || 22;
        const trainWidth = 2.4;
        const trainHeight = 3.6;

        const trainBox = {
          minX: obs.position.x - trainWidth / 2,
          maxX: obs.position.x + trainWidth / 2,
          minY: obs.position.y,
          maxY: obs.position.y + trainHeight,
          minZ: obs.position.z - trainLength / 2,
          maxZ: obs.position.z + trainLength / 2
        };

        // Check if player is on the ramp
        if (obs.userData.hasRamp) {
          const rampStart = trainBox.maxZ;
          const rampEnd = trainBox.maxZ + 5.5;
          if (
            this.playerX > trainBox.minX &&
            this.playerX < trainBox.maxX &&
            this.playerZ >= trainBox.maxZ &&
            this.playerZ <= rampEnd
          ) {
            const rampProgress = 1 - (this.playerZ - trainBox.maxZ) / 5.5;
            this.groundLevel = rampProgress * 3.9;
            onTrainRoof = true;
            continue;
          }
        }

        // Check if player is on top of train
        if (
          this.playerX > trainBox.minX &&
          this.playerX < trainBox.maxX &&
          this.playerZ >= trainBox.minZ &&
          this.playerZ <= trainBox.maxZ
        ) {
          if (this.playerY >= trainHeight - 0.4) {
            this.groundLevel = 3.9;
            onTrainRoof = true;
            continue;
          } else {
            // Front / Side Train Crash!
            this.handleCrash();
            return;
          }
        }

      } else if (type === 'barrier_low') {
        // Low barrier: Must jump over
        const dx = Math.abs(this.playerX - obs.position.x);
        const dz = Math.abs(this.playerZ - obs.position.z);
        if (dx < 1.2 && dz < 0.8) {
          if (this.playerY < 1.1) {
            this.handleCrash();
            return;
          }
        }

      } else if (type === 'barrier_high') {
        // High barrier: Must slide under
        const dx = Math.abs(this.playerX - obs.position.x);
        const dz = Math.abs(this.playerZ - obs.position.z);
        if (dx < 1.2 && dz < 0.8) {
          if (!this.isSliding && this.playerY < 2.4) {
            this.handleCrash();
            return;
          }
        }

      } else if (type === 'barrier_full') {
        const dx = Math.abs(this.playerX - obs.position.x);
        const dz = Math.abs(this.playerZ - obs.position.z);
        if (dx < 1.2 && dz < 0.8) {
          this.handleCrash();
          return;
        }
      }
    }

    if (!onTrainRoof) {
      this.groundLevel = 0;
    }
  }

  handleCrash() {
    // If Hoverboard is active, consume it and protect the runner!
    if (this.activePowerups.hoverboard > 0) {
      this.activePowerups.hoverboard = 0;
      if (window.audioManager) window.audioManager.playCrash();
      this.showFloatingText('💥 SHIELD SAVED YOU!', '#ff3366');
      this.createCrashParticles(new THREE.Vector3(this.playerX, this.playerY + 1, this.playerZ));
      return;
    }

    // Game Over Crash
    this.gameOver();
  }

  gameOver() {
    this.state = 'GAMEOVER';
    if (window.audioManager) {
      window.audioManager.stopBGM();
      window.audioManager.playCrash();
    }

    // Save coins & highscore
    if (window.shopManager) {
      window.shopManager.addCoins(this.coins);
      const isNewRecord = window.shopManager.setHighscore(this.score);

      const recordBadge = document.getElementById('new-record-badge');
      if (recordBadge) recordBadge.style.display = isNewRecord ? 'inline-block' : 'none';
    }

    // Update Game Over Modal
    document.getElementById('final-score').textContent = this.score.toLocaleString();
    document.getElementById('final-coins').textContent = `+${this.coins.toLocaleString()}`;
    document.getElementById('final-distance').textContent = `${Math.floor(this.distance)}m`;

    const canRevive = window.shopManager && window.shopManager.data.keys >= 1;
    const btnRevive = document.getElementById('btn-revive-key');
    if (btnRevive) {
      btnRevive.style.display = canRevive ? 'flex' : 'none';
    }

    document.getElementById('gameover-modal').classList.remove('hidden');
  }

  revive() {
    if (window.shopManager && window.shopManager.data.keys >= 1) {
      window.shopManager.addKeys(-1);
      document.getElementById('gameover-modal').classList.add('hidden');
      this.state = 'PLAYING';
      this.activePowerups.hoverboard = 10; // Free shield after revive
      this.playerY = 2.0;
      this.velocityY = 10;
      if (window.audioManager) {
        window.audioManager.startBGM();
        window.audioManager.playPowerup();
      }
      this.showFloatingText('✨ REVIVED!', '#00ff88');
    }
  }

  // ==========================================
  // CHASER (INSPECTOR & DOG)
  // ==========================================
  updateInspector(delta) {
    if (!this.inspector) return;
    const targetZ = this.playerZ + this.inspectorDistance;
    this.inspector.position.z += (targetZ - this.inspector.position.z) * 5 * delta;
    this.inspector.position.x += (this.playerX - this.inspector.position.x) * 8 * delta;
    this.inspector.position.y = this.playerY;

    if (this.inspector.userData.leftLeg) {
      const legCycle = Math.sin(this.animTime * 16);
      this.inspector.userData.leftLeg.rotation.x = legCycle * 0.8;
      this.inspector.userData.rightLeg.rotation.x = -legCycle * 0.8;
    }
  }

  // ==========================================
  // PARTICLES
  // ==========================================
  createCoinParticles(pos) {
    for (let i = 0; i < 8; i++) {
      const geo = new THREE.SphereGeometry(0.12, 6, 6);
      const mat = new THREE.MeshBasicMaterial({ color: 0xffe600 });
      const p = new THREE.Mesh(geo, mat);
      p.position.copy(pos);
      p.userData = {
        vx: (Math.random() - 0.5) * 6,
        vy: Math.random() * 6 + 2,
        vz: (Math.random() - 0.5) * 6,
        life: 0.5
      };
      this.scene.add(p);
      this.particles.push(p);
    }
  }

  createJetpackParticles() {
    if (Math.random() > 0.3) return;
    const geo = new THREE.SphereGeometry(0.2, 6, 6);
    const mat = new THREE.MeshBasicMaterial({ color: Math.random() > 0.5 ? 0xff4400 : 0xffcc00 });
    const p = new THREE.Mesh(geo, mat);
    p.position.set(this.playerX + (Math.random() - 0.5) * 0.4, this.playerY + 0.4, this.playerZ + 0.4);
    p.userData = {
      vx: (Math.random() - 0.5) * 2,
      vy: -Math.random() * 4 - 2,
      vz: Math.random() * 4 + 4,
      life: 0.35
    };
    this.scene.add(p);
    this.particles.push(p);
  }

  createCrashParticles(pos) {
    for (let i = 0; i < 20; i++) {
      const geo = new THREE.BoxGeometry(0.2, 0.2, 0.2);
      const mat = new THREE.MeshBasicMaterial({ color: 0x00d2ff });
      const p = new THREE.Mesh(geo, mat);
      p.position.copy(pos);
      p.userData = {
        vx: (Math.random() - 0.5) * 12,
        vy: Math.random() * 10,
        vz: (Math.random() - 0.5) * 12,
        life: 0.7
      };
      this.scene.add(p);
      this.particles.push(p);
    }
  }

  updateParticles(delta) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.userData.life -= delta;
      p.position.x += p.userData.vx * delta;
      p.position.y += p.userData.vy * delta;
      p.position.z += p.userData.vz * delta;

      if (p.userData.life <= 0) {
        this.scene.remove(p);
        this.particles.splice(i, 1);
      }
    }
  }

  // ==========================================
  // CAMERA
  // ==========================================
  updateCamera(delta) {
    const isJet = this.activePowerups.jetpack > 0;
    const targetCamY = isJet ? this.playerY + 5.0 : Math.max(4.2, this.playerY + 3.8);
    const targetCamZ = this.playerZ + 7.8;
    const targetCamX = this.playerX * 0.45; // Subtle lane tracking

    this.camera.position.x += (targetCamX - this.camera.position.x) * 10 * delta;
    this.camera.position.y += (targetCamY - this.camera.position.y) * 8 * delta;
    this.camera.position.z = targetCamZ;

    const lookTarget = new THREE.Vector3(
      this.playerX * 0.3,
      isJet ? this.playerY : Math.max(1.8, this.playerY + 1.2),
      this.playerZ - 15
    );
    this.camera.lookAt(lookTarget);
  }

  cleanupOldObjects() {
    const cutoffZ = this.playerZ + 30;

    // Clean old chunks
    for (let i = this.chunks.length - 1; i >= 0; i--) {
      if (this.chunks[i].position.z > cutoffZ) {
        this.scene.remove(this.chunks[i]);
        this.chunks.splice(i, 1);
      }
    }

    // Clean old obstacles
    for (let i = this.activeObstacles.length - 1; i >= 0; i--) {
      if (this.activeObstacles[i].position.z > cutoffZ) {
        this.scene.remove(this.activeObstacles[i]);
        this.activeObstacles.splice(i, 1);
      }
    }

    // Clean old coins
    for (let i = this.activeCoins.length - 1; i >= 0; i--) {
      if (this.activeCoins[i].position.z > cutoffZ) {
        this.scene.remove(this.activeCoins[i]);
        this.activeCoins.splice(i, 1);
      }
    }

    // Clean old power-ups
    for (let i = this.activePowerupItems.length - 1; i >= 0; i--) {
      if (this.activePowerupItems[i].position.z > cutoffZ) {
        this.scene.remove(this.activePowerupItems[i]);
        this.activePowerupItems.splice(i, 1);
      }
    }
  }

  // ==========================================
  // HUD & FLOATING TEXT
  // ==========================================
  updateHUD() {
    const scoreVal = document.getElementById('hud-score-val');
    const coinVal = document.getElementById('hud-coin-val');
    if (scoreVal) scoreVal.textContent = this.score.toLocaleString();
    if (coinVal) coinVal.textContent = this.coins.toLocaleString();

    // Power-up Tray
    const tray = document.getElementById('powerups-tray');
    if (tray) {
      tray.innerHTML = '';
      Object.keys(this.activePowerups).forEach(type => {
        const time = this.activePowerups[type];
        if (time > 0) {
          const pill = document.createElement('div');
          pill.className = `powerup-pill ${type}`;
          const pct = Math.min(100, (time / 15) * 100);
          pill.innerHTML = `
            <span>${this.getPowerupIcon(type)}</span>
            <div class="powerup-bar-bg"><div class="powerup-bar-fill" style="width:${pct}%"></div></div>
          `;
          tray.appendChild(pill);
        }
      });
    }

    // Hoverboard Button Ready state
    const boardBtn = document.getElementById('btn-board-trigger');
    if (boardBtn) {
      boardBtn.classList.toggle('ready', this.activePowerups.hoverboard <= 0);
    }
  }

  getPowerupIcon(type) {
    switch (type) {
      case 'magnet': return '🧲';
      case 'jetpack': return '🚀';
      case 'sneakers': return '👟';
      case 'multiplier': return '⭐';
      case 'hoverboard': return '🛹';
      default: return '⚡';
    }
  }

  showFloatingText(text, color = '#ffe600') {
    const popup = document.createElement('div');
    popup.className = 'floating-popup';
    popup.style.color = color;
    popup.style.left = `${window.innerWidth / 2}px`;
    popup.style.top = `${window.innerHeight / 2 - 60}px`;
    popup.textContent = text;
    document.body.appendChild(popup);

    setTimeout(() => popup.remove(), 800);
  }

  // ==========================================
  // EVENT BINDINGS & ANIMATION LOOP
  // ==========================================
  bindEvents() {
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Menu Play Button
    const btnPlay = document.getElementById('btn-play');
    if (btnPlay) btnPlay.addEventListener('click', () => this.startGame());

    // Restart / Retry Buttons
    const btnRetry = document.getElementById('btn-retry');
    if (btnRetry) btnRetry.addEventListener('click', () => this.startGame());

    const btnRevive = document.getElementById('btn-revive-key');
    if (btnRevive) btnRevive.addEventListener('click', () => this.revive());

    // Pause / Resume Buttons
    const btnResume = document.getElementById('btn-resume');
    if (btnResume) btnResume.addEventListener('click', () => this.resumeGame());

    const btnQuit = document.getElementById('btn-quit');
    if (btnQuit) btnQuit.addEventListener('click', () => {
      this.state = 'MENU';
      document.querySelectorAll('.modal-backdrop').forEach(m => m.classList.add('hidden'));
      document.getElementById('menu-modal').classList.remove('hidden');
      if (window.shopManager) window.shopManager.updateHUD();
    });

    // Shop Open / Close
    const btnShop = document.getElementById('btn-shop');
    const btnCloseShop = document.getElementById('btn-close-shop');
    const shopModal = document.getElementById('shop-modal');

    if (btnShop) btnShop.addEventListener('click', () => {
      if (window.audioManager) window.audioManager.playButton();
      shopModal.classList.remove('hidden');
      if (window.shopManager) {
        window.shopManager.updateHUD();
        window.shopManager.renderCharacters();
      }
    });

    if (btnCloseShop) btnCloseShop.addEventListener('click', () => {
      if (window.audioManager) window.audioManager.playButton();
      shopModal.classList.add('hidden');
    });

    // How to Play / Tutorial
    const btnTutorial = document.getElementById('btn-tutorial');
    const btnCloseTutorial = document.getElementById('btn-close-tutorial');
    const tutorialModal = document.getElementById('tutorial-modal');

    if (btnTutorial) btnTutorial.addEventListener('click', () => {
      if (window.audioManager) window.audioManager.playButton();
      tutorialModal.classList.remove('hidden');
    });

    if (btnCloseTutorial) btnCloseTutorial.addEventListener('click', () => {
      if (window.audioManager) window.audioManager.playButton();
      tutorialModal.classList.add('hidden');
    });

    // Audio Mute Toggle
    const btnAudio = document.getElementById('btn-audio-toggle');
    if (btnAudio) btnAudio.addEventListener('click', () => {
      if (window.audioManager) {
        const isMuted = window.audioManager.toggleMute();
        btnAudio.textContent = isMuted ? '🔇' : '🔊';
      }
    });
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const delta = Math.min(this.clock.getDelta(), 0.1);
    this.update(delta);
    this.renderer.render(this.scene, this.camera);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.game = new SubwaySurfersGame();
});
