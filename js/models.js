/* ==========================================================================
   Ghost of Tsushima - Procedural 3D Mesh Generator & Environment Builder
   Detailed Samurai, Mongol Invaders, Torii Gates, Pagodas, Trees & Lanterns
   ========================================================================== */

class ModelFactory {
  constructor() {
    // Shared Materials to optimize WebGL performance
    this.materials = {
      skin: new THREE.MeshLambertMaterial({ color: 0xdfb48c }),
      sakaiArmor: new THREE.MeshStandardMaterial({ color: 0x1f232b, roughness: 0.4, metalness: 0.6 }),
      sakaiGold: new THREE.MeshStandardMaterial({ color: 0xd4af37, roughness: 0.3, metalness: 0.8 }),
      sakaiHaori: new THREE.MeshLambertMaterial({ color: 0x111317 }),
      katanaSteel: new THREE.MeshStandardMaterial({ color: 0xe0e0e0, roughness: 0.15, metalness: 0.95 }),
      katanaSaya: new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.5 }),
      strawHat: new THREE.MeshLambertMaterial({ color: 0xb59a57 }),
      mongolLeather: new THREE.MeshLambertMaterial({ color: 0x4e3629 }),
      mongolArmor: new THREE.MeshStandardMaterial({ color: 0x3d434d, roughness: 0.5, metalness: 0.7 }),
      mongolRed: new THREE.MeshLambertMaterial({ color: 0x8b1c1c }),
      shieldWood: new THREE.MeshStandardMaterial({ color: 0x5c3a21, roughness: 0.7 }),
      shieldIron: new THREE.MeshStandardMaterial({ color: 0x2b2d30, roughness: 0.3, metalness: 0.8 }),
      spearWood: new THREE.MeshLambertMaterial({ color: 0x6d4c41 }),
      roninBlue: new THREE.MeshLambertMaterial({ color: 0x1a237e }),
      bossGold: new THREE.MeshStandardMaterial({ color: 0xffb300, roughness: 0.3, metalness: 0.9 })
    };
  }

  // --- 1. JIN SAKAI (Samurai Player) ---
  createPlayerMesh() {
    const group = new THREE.Group();

    // Torso / Sakai Armor
    const torsoGeom = new THREE.BoxGeometry(0.7, 0.9, 0.45);
    const torso = new THREE.Mesh(torsoGeom, this.materials.sakaiArmor);
    torso.position.y = 1.25;
    torso.castShadow = true;
    group.add(torso);

    // Gold Chest Crest (Sakai Clan Mon)
    const crestGeom = new THREE.BoxGeometry(0.3, 0.3, 0.48);
    const crest = new THREE.Mesh(crestGeom, this.materials.sakaiGold);
    crest.position.set(0, 1.35, 0);
    group.add(crest);

    // Haori Cape (Coat swaying at back)
    const capeGeom = new THREE.BoxGeometry(0.75, 1.1, 0.08);
    const cape = new THREE.Mesh(capeGeom, this.materials.sakaiHaori);
    cape.position.set(0, 1.15, -0.26);
    cape.rotation.x = 0.08;
    group.add(cape);

    // Shoulder Armor Plates (Sode)
    const sodeGeom = new THREE.BoxGeometry(0.24, 0.38, 0.45);
    const leftSode = new THREE.Mesh(sodeGeom, this.materials.sakaiGold);
    leftSode.position.set(-0.48, 1.5, 0);
    leftSode.rotation.z = -0.15;
    const rightSode = new THREE.Mesh(sodeGeom, this.materials.sakaiGold);
    rightSode.position.set(0.48, 1.5, 0);
    rightSode.rotation.z = 0.15;
    group.add(leftSode);
    group.add(rightSode);

    // Head
    const headGeom = new THREE.BoxGeometry(0.38, 0.42, 0.38);
    const head = new THREE.Mesh(headGeom, this.materials.skin);
    head.position.y = 1.9;
    group.add(head);

    // Samurai Straw Hat (Kasa) / Sakai Headband
    const hatGeom = new THREE.ConeGeometry(0.55, 0.22, 10);
    const hat = new THREE.Mesh(hatGeom, this.materials.strawHat);
    hat.position.y = 2.15;
    group.add(hat);

    // Legs
    const legGeom = new THREE.BoxGeometry(0.24, 0.8, 0.26);
    const leftLeg = new THREE.Mesh(legGeom, this.materials.sakaiArmor);
    leftLeg.position.set(-0.2, 0.4, 0);
    leftLeg.castShadow = true;
    const rightLeg = new THREE.Mesh(legGeom, this.materials.sakaiArmor);
    rightLeg.position.set(0.2, 0.4, 0);
    rightLeg.castShadow = true;
    group.add(leftLeg);
    group.add(rightLeg);

    // Left Arm (Scabbard Saya Holder)
    const armGeom = new THREE.BoxGeometry(0.2, 0.7, 0.2);
    const leftArm = new THREE.Mesh(armGeom, this.materials.sakaiArmor);
    leftArm.position.set(-0.45, 1.25, 0);
    group.add(leftArm);

    // Right Arm (Sword Wielding)
    const rightArm = new THREE.Mesh(armGeom, this.materials.sakaiArmor);
    rightArm.position.set(0.45, 1.25, 0.1);
    rightArm.rotation.x = -0.4;
    group.add(rightArm);

    // Katana & Scabbard (Saya)
    const swordPivot = new THREE.Group();
    swordPivot.position.set(0.45, 0.9, 0.3);

    // Katana Blade
    const bladeGeom = new THREE.BoxGeometry(0.04, 1.3, 0.08);
    const blade = new THREE.Mesh(bladeGeom, this.materials.katanaSteel);
    blade.position.set(0, 0.65, 0);
    blade.rotation.x = -0.1;

    // Tsuba (Golden Handguard)
    const tsubaGeom = new THREE.CylinderGeometry(0.09, 0.09, 0.03, 8);
    const tsuba = new THREE.Mesh(tsubaGeom, this.materials.sakaiGold);
    tsuba.position.set(0, 0, 0);

    // Tsuka (Handle)
    const tsukaGeom = new THREE.CylinderGeometry(0.035, 0.035, 0.35, 6);
    const tsuka = new THREE.Mesh(tsukaGeom, this.materials.katanaSaya);
    tsuka.position.set(0, -0.18, 0);

    swordPivot.add(blade);
    swordPivot.add(tsuba);
    swordPivot.add(tsuka);
    swordPivot.rotation.x = 1.3;
    swordPivot.rotation.y = 0.2;
    group.add(swordPivot);

    // Save references for animation
    group.userData = {
      swordPivot: swordPivot,
      rightArm: rightArm,
      leftArm: leftArm,
      leftLeg: leftLeg,
      rightLeg: rightLeg,
      torso: torso
    };

    return group;
  }

  // --- 2. ENEMY MESHES ---
  createEnemyMesh(type = 'swordsman') {
    const group = new THREE.Group();
    let scale = 1.0;

    if (type === 'brute') scale = 1.38;
    else if (type === 'boss') scale = 1.45;

    // Torso
    const torsoMat = type === 'ronin' ? this.materials.roninBlue :
                    (type === 'boss' ? this.materials.bossGold : this.materials.mongolLeather);
    const torsoGeom = new THREE.BoxGeometry(0.68 * scale, 0.9 * scale, 0.44 * scale);
    const torso = new THREE.Mesh(torsoGeom, torsoMat);
    torso.position.y = 1.25 * scale;
    torso.castShadow = true;
    group.add(torso);

    // Head & Helmet
    const headGeom = new THREE.BoxGeometry(0.38 * scale, 0.4 * scale, 0.38 * scale);
    const head = new THREE.Mesh(headGeom, this.materials.skin);
    head.position.y = 1.85 * scale;
    group.add(head);

    // Enemy Hat/Helmet
    if (type === 'ronin') {
      const kasa = new THREE.Mesh(new THREE.ConeGeometry(0.55 * scale, 0.25 * scale, 10), this.materials.strawHat);
      kasa.position.y = 2.1 * scale;
      group.add(kasa);
    } else if (type === 'brute') {
      const helmet = new THREE.Mesh(new THREE.CylinderGeometry(0.3 * scale, 0.42 * scale, 0.35 * scale, 8), this.materials.mongolArmor);
      helmet.position.y = 2.1 * scale;
      group.add(helmet);
    } else if (type === 'boss') {
      const bossHelmet = new THREE.Mesh(new THREE.ConeGeometry(0.5 * scale, 0.45 * scale, 8), this.materials.bossGold);
      bossHelmet.position.y = 2.2 * scale;
      group.add(bossHelmet);
    } else {
      const nomadHat = new THREE.Mesh(new THREE.ConeGeometry(0.42 * scale, 0.35 * scale, 8), this.materials.mongolRed);
      nomadHat.position.y = 2.05 * scale;
      group.add(nomadHat);
    }

    // Legs
    const legGeom = new THREE.BoxGeometry(0.24 * scale, 0.8 * scale, 0.24 * scale);
    const leftLeg = new THREE.Mesh(legGeom, this.materials.mongolArmor);
    leftLeg.position.set(-0.2 * scale, 0.4 * scale, 0);
    const rightLeg = new THREE.Mesh(legGeom, this.materials.mongolArmor);
    rightLeg.position.set(0.2 * scale, 0.4 * scale, 0);
    group.add(leftLeg);
    group.add(rightLeg);

    // Arms
    const armGeom = new THREE.BoxGeometry(0.2 * scale, 0.7 * scale, 0.2 * scale);
    const leftArm = new THREE.Mesh(armGeom, torsoMat);
    leftArm.position.set(-0.45 * scale, 1.25 * scale, 0);
    const rightArm = new THREE.Mesh(armGeom, torsoMat);
    rightArm.position.set(0.45 * scale, 1.25 * scale, 0);
    group.add(leftArm);
    group.add(rightArm);

    // Weapon Attachment
    const weaponPivot = new THREE.Group();
    weaponPivot.position.set(0.45 * scale, 0.9 * scale, 0.2 * scale);

    if (type === 'shieldman') {
      // Round Heavy Shield on Left Arm
      const shieldGeom = new THREE.CylinderGeometry(0.55, 0.55, 0.08, 12);
      const shield = new THREE.Mesh(shieldGeom, this.materials.shieldWood);
      shield.rotation.z = Math.PI / 2;
      shield.position.set(-0.55, 1.25, 0.35);

      const bossGeom = new THREE.CylinderGeometry(0.18, 0.18, 0.12, 8);
      const shieldBoss = new THREE.Mesh(bossGeom, this.materials.shieldIron);
      shieldBoss.rotation.z = Math.PI / 2;
      shieldBoss.position.set(-0.55, 1.25, 0.38);
      group.add(shield);
      group.add(shieldBoss);

      // Mongol Curved Saber in Right Hand
      const saber = new THREE.Mesh(new THREE.BoxGeometry(0.05, 1.1, 0.1), this.materials.katanaSteel);
      saber.position.y = 0.5;
      weaponPivot.add(saber);
      weaponPivot.rotation.x = 1.0;
    } else if (type === 'spearman') {
      // Long Yari Spear
      const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 2.8, 6), this.materials.spearWood);
      shaft.position.y = 0.8;
      const spearTip = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.45, 6), this.materials.katanaSteel);
      spearTip.position.y = 2.3;
      const tassel = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.15, 6), this.materials.mongolRed);
      tassel.position.y = 2.1;

      weaponPivot.add(shaft);
      weaponPivot.add(spearTip);
      weaponPivot.add(tassel);
      weaponPivot.rotation.x = 1.2;
    } else if (type === 'brute') {
      // Giant Iron Club (Kanabo)
      const club = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.08, 1.8, 8), this.materials.mongolArmor);
      club.position.y = 0.8;
      weaponPivot.add(club);
      weaponPivot.rotation.x = 1.1;
    } else if (type === 'boss') {
      // Legendary Dual-Bladed Naginata
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 3.2, 8), this.materials.bossGold);
      pole.position.y = 0.9;
      const topBlade = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.8, 0.15), this.materials.katanaSteel);
      topBlade.position.y = 2.6;
      weaponPivot.add(pole);
      weaponPivot.add(topBlade);
      weaponPivot.rotation.x = 1.1;
    } else {
      // Standard Mongol Sword / Ronin Katana
      const sword = new THREE.Mesh(new THREE.BoxGeometry(0.04, 1.2, 0.08), this.materials.katanaSteel);
      sword.position.y = 0.55;
      weaponPivot.add(sword);
      weaponPivot.rotation.x = 1.1;
    }

    group.add(weaponPivot);

    // Save animation hooks
    group.userData = {
      weaponPivot: weaponPivot,
      rightArm: rightArm,
      leftArm: leftArm,
      leftLeg: leftLeg,
      rightLeg: rightLeg,
      torso: torso
    };

    return group;
  }

  // --- 3. ENVIRONMENT & ARENA BUILDER ---
  buildArena(scene, theme = 'autumn') {
    const arenaGroup = new THREE.Group();

    // 1. Terrain Ground
    const groundGeom = new THREE.PlaneGeometry(80, 80, 16, 16);
    let groundColor = 0x2e3524; // Autumn Grass
    if (theme === 'sakura') groundColor = 0x3d4a2f;
    else if (theme === 'crimson') groundColor = 0x2d1f1f;
    else if (theme === 'night') groundColor = 0x161b24;

    const groundMat = new THREE.MeshStandardMaterial({
      color: groundColor,
      roughness: 0.9,
      metalness: 0.1
    });
    const ground = new THREE.Mesh(groundGeom, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    arenaGroup.add(ground);

    // Stone Combat Circle / Duel Ring
    const ringGeom = new THREE.RingGeometry(1.5, 14, 32);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0x4a453e,
      roughness: 0.8,
      transparent: true,
      opacity: 0.5
    });
    const ring = new THREE.Mesh(ringGeom, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.02;
    arenaGroup.add(ring);

    // 2. Japanese Torii Gate
    this.addToriiGate(arenaGroup, new THREE.Vector3(0, 0, -18));

    // 3. Stone Lanterns (Toro) with Glowing Fire
    const lanternPositions = [
      [-10, -10], [10, -10], [-10, 10], [10, 10],
      [-15, 0], [15, 0], [-6, -16], [6, -16]
    ];
    lanternPositions.forEach(pos => {
      this.addStoneLantern(arenaGroup, new THREE.Vector3(pos[0], 0, pos[1]));
    });

    // 4. Surrounding Autumn Trees / Sakura Trees
    const treePositions = [
      [-18, -14], [-22, 5], [-16, 18], [18, -16],
      [22, 6], [16, 19], [-8, -24], [8, -24], [-26, -6], [26, -4]
    ];
    treePositions.forEach(pos => {
      this.addJapaneseTree(arenaGroup, new THREE.Vector3(pos[0], 0, pos[1]), theme);
    });

    scene.add(arenaGroup);
    return arenaGroup;
  }

  addToriiGate(parent, pos) {
    const torii = new THREE.Group();
    const woodMat = new THREE.MeshStandardMaterial({ color: 0xa8201a, roughness: 0.6 });
    const blackMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.4 });

    // Main Columns
    const colGeom = new THREE.CylinderGeometry(0.35, 0.4, 7.5, 12);
    const colL = new THREE.Mesh(colGeom, woodMat);
    colL.position.set(-3.6, 3.75, 0);
    const colR = new THREE.Mesh(colGeom, woodMat);
    colR.position.set(3.6, 3.75, 0);

    // Top Curved Lintel (Kasagi)
    const lintelGeom = new THREE.BoxGeometry(10.5, 0.6, 0.8);
    const lintel = new THREE.Mesh(lintelGeom, blackMat);
    lintel.position.set(0, 7.5, 0);

    // Second Crossbeam (Nuki)
    const nukiGeom = new THREE.BoxGeometry(8.8, 0.45, 0.6);
    const nuki = new THREE.Mesh(nukiGeom, woodMat);
    nuki.position.set(0, 6.2, 0);

    torii.add(colL);
    torii.add(colR);
    torii.add(lintel);
    torii.add(nuki);
    torii.position.copy(pos);
    parent.add(torii);
  }

  addStoneLantern(parent, pos) {
    const lantern = new THREE.Group();
    const stoneMat = new THREE.MeshStandardMaterial({ color: 0x6e7075, roughness: 0.8 });
    const fireMat = new THREE.MeshBasicMaterial({ color: 0xffa000 });

    // Base & Post
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.55, 0.5, 6), stoneMat);
    base.position.y = 0.25;
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.22, 1.2, 6), stoneMat);
    post.position.y = 1.1;

    // Light Chamber
    const chamber = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), stoneMat);
    chamber.position.y = 1.85;

    // Fire Core
    const fire = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), fireMat);
    fire.position.y = 1.85;

    // Pagoda Roof Cap
    const cap = new THREE.Mesh(new THREE.ConeGeometry(0.65, 0.4, 6), stoneMat);
    cap.position.y = 2.25;

    lantern.add(base);
    lantern.add(post);
    lantern.add(chamber);
    lantern.add(fire);
    lantern.add(cap);
    lantern.position.copy(pos);
    parent.add(lantern);
  }

  addJapaneseTree(parent, pos, theme = 'autumn') {
    const tree = new THREE.Group();
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x422f1f, roughness: 0.9 });
    
    let leafColor = 0xf0c34a; // Autumn Ginkgo
    if (theme === 'sakura') leafColor = 0xffb7c5;
    else if (theme === 'crimson') leafColor = 0xb71c1c;

    const leafMat = new THREE.MeshStandardMaterial({ color: leafColor, roughness: 0.8 });

    // Curved Trunk
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.6, 5.5, 8), trunkMat);
    trunk.position.y = 2.75;
    trunk.rotation.z = (Math.random() - 0.5) * 0.25;
    tree.add(trunk);

    // Foliage Clusters
    const foliageGeom = new THREE.DodecahedronGeometry(2.4, 1);
    const topLeaf = new THREE.Mesh(foliageGeom, leafMat);
    topLeaf.position.set(0, 5.5, 0);

    const sideLeaf1 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.8, 1), leafMat);
    sideLeaf1.position.set(-1.4, 4.6, 0.8);

    const sideLeaf2 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.9, 1), leafMat);
    sideLeaf2.position.set(1.5, 4.4, -0.6);

    tree.add(topLeaf);
    tree.add(sideLeaf1);
    tree.add(sideLeaf2);

    const s = 0.85 + Math.random() * 0.4;
    tree.scale.set(s, s, s);
    tree.position.copy(pos);
    parent.add(tree);
  }
}

// Global Model Factory
window.modelFactory = new ModelFactory();
