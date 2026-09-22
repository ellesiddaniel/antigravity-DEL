/**
 * Subway Surfers 3D - Procedural 3D Mesh Generator & Asset Factory
 * Uses Three.js geometries, materials, and canvas-generated graffiti textures.
 */

class ModelFactory {
  constructor() {
    this.materials = {};
    this.textures = {};
    this.initSharedMaterials();
  }

  initSharedMaterials() {
    // Canvas procedural textures
    this.textures.graffiti = this.createGraffitiTexture();
    this.textures.trainWindows = this.createTrainWindowTexture();
    this.textures.buildingFacade = this.createBuildingTexture();
    this.textures.railBallast = this.createBallastTexture();

    // Standard high-performance materials
    this.materials.rail = new THREE.MeshStandardMaterial({
      color: 0x99aab5,
      metalness: 0.8,
      roughness: 0.2
    });

    this.materials.sleeper = new THREE.MeshStandardMaterial({
      color: 0x4a3728,
      roughness: 0.9
    });

    this.materials.ballast = new THREE.MeshLambertMaterial({
      map: this.textures.railBallast,
      roughness: 1.0
    });

    this.materials.goldCoin = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      metalness: 0.9,
      roughness: 0.1,
      emissive: 0xffaa00,
      emissiveIntensity: 0.35
    });

    this.materials.trainBodyRed = new THREE.MeshStandardMaterial({
      color: 0xdd2c00,
      metalness: 0.3,
      roughness: 0.4
    });

    this.materials.trainBodySilver = new THREE.MeshStandardMaterial({
      color: 0xdcdde1,
      metalness: 0.6,
      roughness: 0.3
    });

    this.materials.trainRoof = new THREE.MeshStandardMaterial({
      color: 0x718093,
      roughness: 0.6
    });

    this.materials.trainGlow = new THREE.MeshBasicMaterial({
      color: 0xfffa65
    });

    this.materials.barrierYellow = new THREE.MeshStandardMaterial({
      color: 0xffcc00,
      roughness: 0.4
    });

    this.materials.barrierStripe = new THREE.MeshStandardMaterial({
      color: 0x111111,
      roughness: 0.5
    });

    this.materials.gantrySteel = new THREE.MeshStandardMaterial({
      color: 0x2f3640,
      metalness: 0.7,
      roughness: 0.4
    });
  }

  // ==========================================
  // TEXTURE GENERATORS (NO EXTERNAL IMAGES)
  // ==========================================
  createGraffitiTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#1e272e';
    ctx.fillRect(0, 0, 512, 256);

    // Brick pattern
    ctx.strokeStyle = '#2f3542';
    ctx.lineWidth = 2;
    for (let y = 0; y < 256; y += 16) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(512, y);
      ctx.stroke();
      const offset = (y / 16) % 2 === 0 ? 0 : 16;
      for (let x = offset; x < 512; x += 32) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + 16);
        ctx.stroke();
      }
    }

    // Graffiti text / shapes
    ctx.font = 'bold 54px Impact, sans-serif';
    ctx.fillStyle = '#ff007f';
    ctx.fillText('SUBWAY', 30, 90);
    ctx.fillStyle = '#00d2ff';
    ctx.fillText('SURF', 160, 160);
    ctx.fillStyle = '#ffcc00';
    ctx.fillText('RUN!', 330, 120);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }

  createTrainWindowTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(0, 0, 256, 64);

    ctx.fillStyle = '#74b9ff';
    for (let x = 12; x < 256; x += 40) {
      ctx.fillRect(x, 10, 28, 44);
    }

    return new THREE.CanvasTexture(canvas);
  }

  createBuildingTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#1e2022';
    ctx.fillRect(0, 0, 256, 512);

    for (let y = 20; y < 512; y += 36) {
      for (let x = 16; x < 256; x += 36) {
        const isLit = Math.random() > 0.4;
        ctx.fillStyle = isLit ? (Math.random() > 0.2 ? '#ffeaa7' : '#74b9ff') : '#2d3436';
        ctx.fillRect(x, y, 20, 24);
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }

  createBallastTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#2f3542';
    ctx.fillRect(0, 0, 256, 256);

    for (let i = 0; i < 600; i++) {
      const shade = Math.floor(Math.random() * 80 + 40);
      ctx.fillStyle = `rgb(${shade},${shade},${shade})`;
      ctx.beginPath();
      ctx.arc(Math.random() * 256, Math.random() * 256, Math.random() * 3 + 1, 0, Math.PI * 2);
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 8);
    return texture;
  }

  // ==========================================
  // TRACK & ENVIRONMENT MESHES
  // ==========================================
  createTrackChunk(length = 60) {
    const chunk = new THREE.Group();

    // Ground gravel ballast bed
    const groundGeo = new THREE.PlaneGeometry(14, length);
    const ground = new THREE.Mesh(groundGeo, this.materials.ballast);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    chunk.add(ground);

    // 3 Tracks (Lanes: -3.2, 0, 3.2)
    const lanes = [-3.2, 0, 3.2];
    const railGeo = new THREE.BoxGeometry(0.12, 0.2, length);

    lanes.forEach(laneX => {
      // Left and Right steel rails
      const leftRail = new THREE.Mesh(railGeo, this.materials.rail);
      leftRail.position.set(laneX - 0.75, 0.1, 0);
      leftRail.castShadow = true;
      chunk.add(leftRail);

      const rightRail = new THREE.Mesh(railGeo, this.materials.rail);
      rightRail.position.set(laneX + 0.75, 0.1, 0);
      rightRail.castShadow = true;
      chunk.add(rightRail);

      // Wooden Sleepers/Ties every 2 units
      const sleeperGeo = new THREE.BoxGeometry(2.0, 0.12, 0.4);
      for (let z = -length / 2 + 1; z < length / 2; z += 2) {
        const sleeper = new THREE.Mesh(sleeperGeo, this.materials.sleeper);
        sleeper.position.set(laneX, 0.04, z);
        sleeper.receiveShadow = true;
        chunk.add(sleeper);
      }
    });

    // Side Graffiti Walls
    const wallGeo = new THREE.BoxGeometry(1, 4.5, length);
    const wallMat = new THREE.MeshStandardMaterial({
      map: this.textures.graffiti,
      roughness: 0.8
    });

    const leftWall = new THREE.Mesh(wallGeo, wallMat);
    leftWall.position.set(-7.5, 2.25, 0);
    leftWall.receiveShadow = true;
    chunk.add(leftWall);

    const rightWall = new THREE.Mesh(wallGeo, wallMat);
    rightWall.position.set(7.5, 2.25, 0);
    rightWall.receiveShadow = true;
    chunk.add(rightWall);

    // Background Skyscrapers
    const buildingMat = new THREE.MeshStandardMaterial({
      map: this.textures.buildingFacade,
      roughness: 0.7
    });

    [-18, -12, 12, 18].forEach(xPos => {
      for (let z = -length / 2 + 15; z < length / 2; z += 30) {
        const height = Math.random() * 25 + 20;
        const bldgGeo = new THREE.BoxGeometry(8, height, 18);
        const bldg = new THREE.Mesh(bldgGeo, buildingMat);
        bldg.position.set(xPos, height / 2, z);
        chunk.add(bldg);
      }
    });

    // Overhead Gantry with wires & streetlights every 30m
    for (let z = -length / 2 + 15; z < length / 2; z += 30) {
      const gantry = this.createGantry();
      gantry.position.set(0, 0, z);
      chunk.add(gantry);
    }

    return chunk;
  }

  createGantry() {
    const gantry = new THREE.Group();

    // Left & Right Pillars
    const pillarGeo = new THREE.BoxGeometry(0.35, 6.5, 0.35);
    const leftPillar = new THREE.Mesh(pillarGeo, this.materials.gantrySteel);
    leftPillar.position.set(-6.8, 3.25, 0);
    gantry.add(leftPillar);

    const rightPillar = new THREE.Mesh(pillarGeo, this.materials.gantrySteel);
    rightPillar.position.set(6.8, 3.25, 0);
    gantry.add(rightPillar);

    // Overhead Crossbeam Truss
    const beamGeo = new THREE.BoxGeometry(14, 0.4, 0.4);
    const beam = new THREE.Mesh(beamGeo, this.materials.gantrySteel);
    beam.position.set(0, 6.3, 0);
    gantry.add(beam);

    // Traffic Signal lights over each lane
    [-3.2, 0, 3.2].forEach(laneX => {
      const lampHousingGeo = new THREE.BoxGeometry(0.4, 0.8, 0.3);
      const housing = new THREE.Mesh(lampHousingGeo, this.materials.barrierStripe);
      housing.position.set(laneX, 5.7, 0);
      gantry.add(housing);

      const lightGeo = new THREE.SphereGeometry(0.12, 8, 8);
      const isGreen = Math.random() > 0.3;
      const lightMat = new THREE.MeshBasicMaterial({
        color: isGreen ? 0x00ff88 : 0xff3366
      });
      const light = new THREE.Mesh(lightGeo, lightMat);
      light.position.set(laneX, 5.7, 0.16);
      gantry.add(light);
    });

    return gantry;
  }

  // ==========================================
  // SUBWAY TRAINS
  // ==========================================
  createTrain(length = 22, hasRamp = false) {
    const train = new THREE.Group();
    train.userData = { type: 'train', length: length, hasRamp: hasRamp };

    const width = 2.4;
    const height = 3.6;

    // Main Train Body
    const bodyGeo = new THREE.BoxGeometry(width, height, length);
    const body = new THREE.Mesh(bodyGeo, this.materials.trainBodySilver);
    body.position.set(0, height / 2 + 0.3, 0);
    body.castShadow = true;
    body.receiveShadow = true;
    train.add(body);

    // Red Racing Stripe
    const stripeGeo = new THREE.BoxGeometry(width + 0.05, 0.8, length + 0.02);
    const stripe = new THREE.Mesh(stripeGeo, this.materials.trainBodyRed);
    stripe.position.set(0, height / 2, 0);
    train.add(stripe);

    // Roof Curves & Details
    const roofGeo = new THREE.BoxGeometry(width - 0.2, 0.4, length - 0.2);
    const roof = new THREE.Mesh(roofGeo, this.materials.trainRoof);
    roof.position.set(0, height + 0.3, 0);
    train.add(roof);

    // Front Cabin Windows (Front Face at +Z or -Z)
    const frontWindshieldGeo = new THREE.BoxGeometry(width - 0.4, 1.2, 0.2);
    const frontWindshieldMat = new THREE.MeshStandardMaterial({
      color: 0x111122,
      roughness: 0.1,
      metalness: 0.9
    });
    const frontWindow = new THREE.Mesh(frontWindshieldGeo, frontWindshieldMat);
    frontWindow.position.set(0, height * 0.7, length / 2 + 0.02);
    train.add(frontWindow);

    // Bright Headlights
    const lightGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.1, 16);
    lightGeo.rotateX(Math.PI / 2);

    [-0.7, 0.7].forEach(x => {
      const headlight = new THREE.Mesh(lightGeo, this.materials.trainGlow);
      headlight.position.set(x, 1.0, length / 2 + 0.05);
      train.add(headlight);
    });

    // Wheels / Bogies
    [-length / 3, length / 3].forEach(z => {
      const wheelGeo = new THREE.CylinderGeometry(0.35, 0.35, width + 0.2, 12);
      wheelGeo.rotateZ(Math.PI / 2);
      const wheel = new THREE.Mesh(wheelGeo, this.materials.barrierStripe);
      wheel.position.set(0, 0.35, z);
      train.add(wheel);
    });

    // Front Ramp (if climbable train)
    if (hasRamp) {
      const rampLength = 6.0;
      const rampGeo = new THREE.BoxGeometry(width - 0.2, 0.2, rampLength);
      const ramp = new THREE.Mesh(rampGeo, this.materials.barrierYellow);
      // Angle the ramp from ground (0.1) to train roof (height + 0.4)
      const angle = Math.atan2(height + 0.3, rampLength);
      ramp.rotation.x = angle;
      ramp.position.set(0, (height + 0.4) / 2, length / 2 + rampLength / 2 - 0.2);
      ramp.castShadow = true;
      ramp.receiveShadow = true;
      train.add(ramp);
      train.userData.ramp = ramp;
    }

    return train;
  }

  // ==========================================
  // BARRIERS & OBSTACLES
  // ==========================================
  createLowBarrier() {
    const barrier = new THREE.Group();
    barrier.userData = { type: 'barrier_low', height: 1.1 };

    // Feet
    const footGeo = new THREE.BoxGeometry(0.3, 0.1, 0.8);
    const leftFoot = new THREE.Mesh(footGeo, this.materials.barrierStripe);
    leftFoot.position.set(-1.1, 0.05, 0);
    barrier.add(leftFoot);

    const rightFoot = new THREE.Mesh(footGeo, this.materials.barrierStripe);
    rightFoot.position.set(1.1, 0.05, 0);
    barrier.add(rightFoot);

    // Posts
    const postGeo = new THREE.BoxGeometry(0.15, 1.0, 0.15);
    const leftPost = new THREE.Mesh(postGeo, this.materials.barrierYellow);
    leftPost.position.set(-1.1, 0.55, 0);
    barrier.add(leftPost);

    const rightPost = new THREE.Mesh(postGeo, this.materials.barrierYellow);
    rightPost.position.set(1.1, 0.55, 0);
    barrier.add(rightPost);

    // Crossboard (Yellow and black caution bar)
    const boardGeo = new THREE.BoxGeometry(2.5, 0.5, 0.12);
    const board = new THREE.Mesh(boardGeo, this.materials.barrierYellow);
    board.position.set(0, 0.85, 0);
    board.castShadow = true;
    barrier.add(board);

    // Caution text/stripes
    const stripeGeo = new THREE.BoxGeometry(0.3, 0.52, 0.14);
    [-0.8, -0.2, 0.4, 1.0].forEach(x => {
      const stripe = new THREE.Mesh(stripeGeo, this.materials.barrierStripe);
      stripe.position.set(x, 0.85, 0);
      barrier.add(stripe);
    });

    return barrier;
  }

  createHighBarrier() {
    const barrier = new THREE.Group();
    barrier.userData = { type: 'barrier_high', height: 2.5, slideClearance: 1.3 };

    // Tall side pillars
    const pillarGeo = new THREE.BoxGeometry(0.2, 2.8, 0.2);
    const leftPillar = new THREE.Mesh(pillarGeo, this.materials.gantrySteel);
    leftPillar.position.set(-1.2, 1.4, 0);
    barrier.add(leftPillar);

    const rightPillar = new THREE.Mesh(pillarGeo, this.materials.gantrySteel);
    rightPillar.position.set(1.2, 1.4, 0);
    barrier.add(rightPillar);

    // Overhead Traffic Sign / Board (Player slides under this)
    const signGeo = new THREE.BoxGeometry(2.6, 1.2, 0.2);
    const signMat = new THREE.MeshStandardMaterial({ color: 0x0984e3, roughness: 0.3 });
    const sign = new THREE.Mesh(signGeo, signMat);
    sign.position.set(0, 2.2, 0);
    sign.castShadow = true;
    barrier.add(sign);

    // Caution border
    const borderGeo = new THREE.BoxGeometry(2.7, 0.15, 0.22);
    const border = new THREE.Mesh(borderGeo, this.materials.barrierYellow);
    border.position.set(0, 1.55, 0);
    barrier.add(border);

    return barrier;
  }

  createFullBlockade() {
    const barrier = new THREE.Group();
    barrier.userData = { type: 'barrier_full', height: 2.2 };

    const boxGeo = new THREE.BoxGeometry(2.6, 2.0, 0.5);
    const boxMat = new THREE.MeshStandardMaterial({ color: 0xd63031, roughness: 0.5 });
    const box = new THREE.Mesh(boxGeo, boxMat);
    box.position.set(0, 1.0, 0);
    box.castShadow = true;
    barrier.add(box);

    // White stripes
    const stripeGeo = new THREE.BoxGeometry(0.4, 2.02, 0.52);
    const whiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
    [-0.8, 0, 0.8].forEach(x => {
      const stripe = new THREE.Mesh(stripeGeo, whiteMat);
      stripe.position.set(x, 1.0, 0);
      barrier.add(stripe);
    });

    return barrier;
  }

  // ==========================================
  // COLLECTIBLES & POWER-UPS
  // ==========================================
  createCoin() {
    const coin = new THREE.Group();
    coin.userData = { type: 'coin', radius: 0.5 };

    const coinGeo = new THREE.CylinderGeometry(0.45, 0.45, 0.12, 20);
    coinGeo.rotateX(Math.PI / 2);
    const mesh = new THREE.Mesh(coinGeo, this.materials.goldCoin);
    mesh.castShadow = true;
    coin.add(mesh);

    // Star / Inner Ring Emblem
    const starGeo = new THREE.TorusGeometry(0.28, 0.05, 8, 16);
    const starMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const star = new THREE.Mesh(starGeo, starMat);
    coin.add(star);

    return coin;
  }

  createPowerup(type) {
    const powerup = new THREE.Group();
    powerup.userData = { type: type, radius: 0.8 };

    const haloGeo = new THREE.RingGeometry(0.7, 0.9, 16);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.6
    });
    const halo = new THREE.Mesh(haloGeo, haloMat);
    halo.position.y = 1.0;
    powerup.add(halo);

    if (type === 'magnet') {
      // Red & Silver Horseshoe Magnet
      const magnetGeo = new THREE.TorusGeometry(0.5, 0.15, 12, 24, Math.PI);
      const redMat = new THREE.MeshStandardMaterial({ color: 0xff3366, metalness: 0.5 });
      const horseshoe = new THREE.Mesh(magnetGeo, redMat);
      horseshoe.rotation.z = Math.PI;
      horseshoe.position.y = 1.0;
      powerup.add(horseshoe);

      // Silver tips
      const tipGeo = new THREE.BoxGeometry(0.3, 0.35, 0.3);
      const silverMat = new THREE.MeshStandardMaterial({ color: 0xeeeeee, metalness: 0.9 });
      const tipL = new THREE.Mesh(tipGeo, silverMat);
      tipL.position.set(-0.5, 1.0, 0);
      powerup.add(tipL);

      const tipR = new THREE.Mesh(tipGeo, silverMat);
      tipR.position.set(0.5, 1.0, 0);
      powerup.add(tipR);

    } else if (type === 'jetpack') {
      // Twin Rocket Thrusters
      const tankGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.9, 12);
      const tankMat = new THREE.MeshStandardMaterial({ color: 0xff9900, metalness: 0.7 });
      
      const tankL = new THREE.Mesh(tankGeo, tankMat);
      tankL.position.set(-0.3, 1.0, 0);
      powerup.add(tankL);

      const tankR = new THREE.Mesh(tankGeo, tankMat);
      tankR.position.set(0.3, 1.0, 0);
      powerup.add(tankR);

      const coneGeo = new THREE.ConeGeometry(0.2, 0.3, 12);
      const flameMat = new THREE.MeshBasicMaterial({ color: 0xff3300 });
      const nozzleL = new THREE.Mesh(coneGeo, flameMat);
      nozzleL.rotation.x = Math.PI;
      nozzleL.position.set(-0.3, 0.45, 0);
      powerup.add(nozzleL);

      const nozzleR = new THREE.Mesh(coneGeo, flameMat);
      nozzleR.rotation.x = Math.PI;
      nozzleR.position.set(0.3, 0.45, 0);
      powerup.add(nozzleR);

    } else if (type === 'sneakers') {
      // Spring High-Tops
      const shoeGeo = new THREE.BoxGeometry(0.4, 0.4, 0.7);
      const shoeMat = new THREE.MeshStandardMaterial({ color: 0x00ff88, roughness: 0.3 });
      const shoe = new THREE.Mesh(shoeGeo, shoeMat);
      shoe.position.set(0, 1.1, 0);
      powerup.add(shoe);

      const springGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.4, 8);
      const springMat = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.8 });
      const spring = new THREE.Mesh(springGeo, springMat);
      spring.position.set(0, 0.75, 0);
      powerup.add(spring);

    } else if (type === 'multiplier') {
      // 2X Star Badge
      const starGeo = new THREE.OctahedronGeometry(0.5, 0);
      const starMat = new THREE.MeshStandardMaterial({
        color: 0x9d4edd,
        emissive: 0x7928ca,
        emissiveIntensity: 0.6,
        metalness: 0.8
      });
      const star = new THREE.Mesh(starGeo, starMat);
      star.position.set(0, 1.0, 0);
      powerup.add(star);

    } else if (type === 'key') {
      // Glowing Cyan Revive Key
      const keyGeo = new THREE.TorusGeometry(0.3, 0.08, 8, 16);
      const keyMat = new THREE.MeshStandardMaterial({
        color: 0x00d2ff,
        emissive: 0x00d2ff,
        emissiveIntensity: 0.7,
        metalness: 0.9
      });
      const keyRing = new THREE.Mesh(keyGeo, keyMat);
      keyRing.position.set(0, 1.2, 0);
      powerup.add(keyRing);

      const stemGeo = new THREE.BoxGeometry(0.1, 0.5, 0.08);
      const stem = new THREE.Mesh(stemGeo, keyMat);
      stem.position.set(0, 0.8, 0);
      powerup.add(stem);
    }

    return powerup;
  }

  // ==========================================
  // RUNNER CHARACTER (RIGGED PROCEDURAL 3D)
  // ==========================================
  createCharacter(skin = 'jake') {
    const character = new THREE.Group();
    character.userData = { skin: skin };

    // Palettes based on skin
    let shirtColor = 0x00a8ff;
    let pantsColor = 0x273c75;
    let capColor = 0xe84118;
    let skinTone = 0xffd1a4;
    let shoeColor = 0xf5f6fa;

    if (skin === 'tricky') {
      shirtColor = 0xff6b81;
      pantsColor = 0x2f3542;
      capColor = 0xff4757;
      skinTone = 0xffe0b2;
      shoeColor = 0xffa502;
    } else if (skin === 'cyber') {
      shirtColor = 0x1e272e;
      pantsColor = 0x0a0f1d;
      capColor = 0x00d2ff;
      skinTone = 0xdcdde1;
      shoeColor = 0x00d2ff;
    } else if (skin === 'ninja') {
      shirtColor = 0x111111;
      pantsColor = 0x111111;
      capColor = 0xd63031;
      skinTone = 0xf8c291;
      shoeColor = 0xd63031;
    }

    const skinMat = new THREE.MeshLambertMaterial({ color: skinTone });
    const shirtMat = new THREE.MeshStandardMaterial({ color: shirtColor, roughness: 0.5 });
    const pantsMat = new THREE.MeshStandardMaterial({ color: pantsColor, roughness: 0.6 });
    const capMat = new THREE.MeshStandardMaterial({ color: capColor, roughness: 0.4 });
    const shoeMat = new THREE.MeshStandardMaterial({ color: shoeColor, roughness: 0.3 });

    // Root Group for animations
    const bodyRoot = new THREE.Group();
    bodyRoot.position.y = 1.0;
    character.add(bodyRoot);

    // Torso / Hoodie
    const torsoGeo = new THREE.BoxGeometry(0.75, 0.85, 0.45);
    const torso = new THREE.Mesh(torsoGeo, shirtMat);
    torso.position.y = 0.45;
    torso.castShadow = true;
    bodyRoot.add(torso);

    // Head
    const headGeo = new THREE.BoxGeometry(0.48, 0.5, 0.48);
    const head = new THREE.Mesh(headGeo, skinMat);
    head.position.y = 1.15;
    head.castShadow = true;
    bodyRoot.add(head);

    // Cap / Beanie (Backwards cap with visor)
    const capGeo = new THREE.BoxGeometry(0.52, 0.25, 0.52);
    const cap = new THREE.Mesh(capGeo, capMat);
    cap.position.set(0, 1.35, 0);
    bodyRoot.add(cap);

    const visorGeo = new THREE.BoxGeometry(0.48, 0.08, 0.35);
    const visor = new THREE.Mesh(visorGeo, capMat);
    visor.position.set(0, 1.32, -0.38); // Turned backwards
    bodyRoot.add(visor);

    // Jetpack backpack (toggleable)
    const jetpackGroup = new THREE.Group();
    const jpTankGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.65, 8);
    const jpMat = new THREE.MeshStandardMaterial({ color: 0xff7700, metalness: 0.6 });
    const jptank1 = new THREE.Mesh(jpTankGeo, jpMat);
    jptank1.position.set(-0.2, 0.45, -0.32);
    const jptank2 = new THREE.Mesh(jpTankGeo, jpMat);
    jptank2.position.set(0.2, 0.45, -0.32);
    jetpackGroup.add(jptank1, jptank2);
    jetpackGroup.visible = false;
    bodyRoot.add(jetpackGroup);

    // Left Leg & Shoe
    const leftLegGroup = new THREE.Group();
    leftLegGroup.position.set(-0.22, 0.05, 0);
    const legGeo = new THREE.BoxGeometry(0.24, 0.7, 0.24);
    const leftLeg = new THREE.Mesh(legGeo, pantsMat);
    leftLeg.position.y = -0.35;
    leftLeg.castShadow = true;
    leftLegGroup.add(leftLeg);

    const shoeGeo = new THREE.BoxGeometry(0.26, 0.22, 0.45);
    const leftShoe = new THREE.Mesh(shoeGeo, shoeMat);
    leftShoe.position.set(0, -0.7, 0.08);
    leftShoe.castShadow = true;
    leftLegGroup.add(leftShoe);
    bodyRoot.add(leftLegGroup);

    // Right Leg & Shoe
    const rightLegGroup = new THREE.Group();
    rightLegGroup.position.set(0.22, 0.05, 0);
    const rightLeg = new THREE.Mesh(legGeo, pantsMat);
    rightLeg.position.y = -0.35;
    rightLeg.castShadow = true;
    rightLegGroup.add(rightLeg);

    const rightShoe = new THREE.Mesh(shoeGeo, shoeMat);
    rightShoe.position.set(0, -0.7, 0.08);
    rightShoe.castShadow = true;
    rightLegGroup.add(rightShoe);
    bodyRoot.add(rightLegGroup);

    // Left Arm
    const armGeo = new THREE.BoxGeometry(0.2, 0.65, 0.2);
    const leftArmGroup = new THREE.Group();
    leftArmGroup.position.set(-0.48, 0.8, 0);
    const leftArm = new THREE.Mesh(armGeo, shirtMat);
    leftArm.position.y = -0.3;
    leftArm.castShadow = true;
    leftArmGroup.add(leftArm);
    bodyRoot.add(leftArmGroup);

    // Right Arm
    const rightArmGroup = new THREE.Group();
    rightArmGroup.position.set(0.48, 0.8, 0);
    const rightArm = new THREE.Mesh(armGeo, shirtMat);
    rightArm.position.y = -0.3;
    rightArm.castShadow = true;
    rightArmGroup.add(rightArm);
    bodyRoot.add(rightArmGroup);

    // Hoverboard under character (hidden by default)
    const hoverboard = this.createHoverboard('classic');
    hoverboard.position.set(0, -0.85, 0);
    hoverboard.visible = false;
    character.add(hoverboard);

    // Store references for animations
    character.rig = {
      bodyRoot,
      head,
      torso,
      leftLegGroup,
      rightLegGroup,
      leftArmGroup,
      rightArmGroup,
      jetpackGroup,
      hoverboard
    };

    return character;
  }

  // ==========================================
  // HOVERBOARD
  // ==========================================
  createHoverboard(style = 'classic') {
    const board = new THREE.Group();

    let boardColor = 0x00d2ff;
    let glowColor = 0x00f2fe;

    if (style === 'starburst') {
      boardColor = 0xff007f;
      glowColor = 0xff77aa;
    } else if (style === 'lava') {
      boardColor = 0xff3838;
      glowColor = 0xff9f1a;
    } else if (style === 'cyber') {
      boardColor = 0x00ff88;
      glowColor = 0x55e6c1;
    }

    const boardMat = new THREE.MeshStandardMaterial({
      color: boardColor,
      metalness: 0.6,
      roughness: 0.2
    });

    const glowMat = new THREE.MeshBasicMaterial({ color: glowColor });

    // Deck
    const deckGeo = new THREE.BoxGeometry(0.8, 0.1, 2.0);
    const deck = new THREE.Mesh(deckGeo, boardMat);
    deck.castShadow = true;
    board.add(deck);

    // Curved Nose and Tail
    const noseGeo = new THREE.BoxGeometry(0.7, 0.1, 0.35);
    const nose = new THREE.Mesh(noseGeo, boardMat);
    nose.rotation.x = -0.25;
    nose.position.set(0, 0.05, 1.05);
    board.add(nose);

    const tail = new THREE.Mesh(noseGeo, boardMat);
    tail.rotation.x = 0.25;
    tail.position.set(0, 0.05, -1.05);
    board.add(tail);

    // Under-glow Neon Thrusters
    const thrusterGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.08, 12);
    [-0.5, 0.5].forEach(z => {
      const thruster = new THREE.Mesh(thrusterGeo, glowMat);
      thruster.position.set(0, -0.06, z);
      board.add(thruster);
    });

    return board;
  }

  // ==========================================
  // CHASER: INSPECTOR & GUARD DOG
  // ==========================================
  createInspector() {
    const chaser = new THREE.Group();

    // Officer Body
    const uniformMat = new THREE.MeshStandardMaterial({ color: 0x192a56, roughness: 0.6 });
    const skinMat = new THREE.MeshLambertMaterial({ color: 0xf8c291 });
    const capMat = new THREE.MeshStandardMaterial({ color: 0x0c2461, roughness: 0.4 });
    const badgeMat = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.9 });

    const torsoGeo = new THREE.BoxGeometry(0.95, 1.0, 0.6);
    const torso = new THREE.Mesh(torsoGeo, uniformMat);
    torso.position.y = 1.35;
    torso.castShadow = true;
    chaser.add(torso);

    const badgeGeo = new THREE.BoxGeometry(0.18, 0.22, 0.05);
    const badge = new THREE.Mesh(badgeGeo, badgeMat);
    badge.position.set(0.25, 1.55, 0.32);
    chaser.add(badge);

    const headGeo = new THREE.BoxGeometry(0.55, 0.55, 0.55);
    const head = new THREE.Mesh(headGeo, skinMat);
    head.position.y = 2.1;
    head.castShadow = true;
    chaser.add(head);

    const policeCapGeo = new THREE.BoxGeometry(0.65, 0.28, 0.65);
    const policeCap = new THREE.Mesh(policeCapGeo, capMat);
    policeCap.position.y = 2.4;
    chaser.add(policeCap);

    // Legs
    const legGeo = new THREE.BoxGeometry(0.3, 0.85, 0.3);
    const leftLeg = new THREE.Mesh(legGeo, uniformMat);
    leftLeg.position.set(-0.25, 0.45, 0);
    chaser.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeo, uniformMat);
    rightLeg.position.set(0.25, 0.45, 0);
    chaser.add(rightLeg);

    chaser.userData = { leftLeg, rightLeg };

    // Guard Dog
    const dog = new THREE.Group();
    const dogMat = new THREE.MeshStandardMaterial({ color: 0x8d5b4c, roughness: 0.8 });

    const dogBodyGeo = new THREE.BoxGeometry(0.45, 0.45, 0.9);
    const dogBody = new THREE.Mesh(dogBodyGeo, dogMat);
    dogBody.position.set(0, 0.45, 0);
    dog.add(dogBody);

    const dogHeadGeo = new THREE.BoxGeometry(0.35, 0.35, 0.4);
    const dogHead = new THREE.Mesh(dogHeadGeo, dogMat);
    dogHead.position.set(0, 0.7, 0.45);
    dog.add(dogHead);

    const collarGeo = new THREE.BoxGeometry(0.38, 0.08, 0.1);
    const collarMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const collar = new THREE.Mesh(collarGeo, collarMat);
    collar.position.set(0, 0.65, 0.25);
    dog.add(collar);

    dog.position.set(0.9, 0, 0.6);
    chaser.add(dog);

    return chaser;
  }
}

window.modelFactory = new ModelFactory();
