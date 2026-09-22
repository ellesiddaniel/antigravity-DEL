/* ==========================================================================
   Ghost of Tsushima - 3D Particle Systems & Cinematic FX
   Atmospheric Guiding Wind, Sakura Petals, Sword Sparks, Blood, Smoke, Lightning
   ========================================================================== */

class ParticleEngine {
  constructor(scene) {
    this.scene = scene;
    this.particles = []; // Temporary combat fx particles
    this.ambientLeaves = null; // Continuous environmental leaves
    this.leafCount = 280;
    this.windDirection = new THREE.Vector3(1.2, -0.4, 0.6);

    this.initAmbientLeaves('autumn'); // Default autumn golden leaves
  }

  // --- Environmental Wind & Falling Leaves (Sakura / Golden Ginkgo / Crimson) ---
  initAmbientLeaves(theme = 'autumn') {
    if (this.ambientLeaves) {
      this.scene.remove(this.ambientLeaves);
      this.ambientLeaves.geometry.dispose();
      this.ambientLeaves.material.dispose();
    }

    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(this.leafCount * 3);
    const rotations = new Float32Array(this.leafCount * 3);
    const scales = new Float32Array(this.leafCount);
    const velocities = new Float32Array(this.leafCount * 3);

    let baseColor = 0xf0c34a; // Autumn Gold
    if (theme === 'sakura') baseColor = 0xffb7c5; // Cherry Blossom Pink
    else if (theme === 'crimson') baseColor = 0xd32f2f; // Red Maple
    else if (theme === 'night') baseColor = 0x81d4fa; // Moonlit Petals

    for (let i = 0; i < this.leafCount; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 60;
      positions[i3 + 1] = Math.random() * 18 + 1;
      positions[i3 + 2] = (Math.random() - 0.5) * 60;

      rotations[i3] = Math.random() * Math.PI;
      rotations[i3 + 1] = Math.random() * Math.PI;
      rotations[i3 + 2] = Math.random() * Math.PI;

      scales[i] = Math.random() * 0.35 + 0.15;

      velocities[i3] = (Math.random() * 0.5 + 0.8) * this.windDirection.x;
      velocities[i3 + 1] = -Math.random() * 0.8 - 0.4;
      velocities[i3 + 2] = (Math.random() * 0.5 + 0.8) * this.windDirection.z;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.leafVelocities = velocities;
    this.leafRotations = rotations;

    // Custom Canvas Texture for Japanese Leaf Shape
    const canvas = document.createElement('canvas');
    canvas.width = 64; canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = theme === 'sakura' ? '#ffb7c5' : (theme === 'crimson' ? '#d32f2f' : '#f0c34a');
    ctx.beginPath();
    ctx.ellipse(32, 32, 28, 14, Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();

    const texture = new THREE.CanvasTexture(canvas);

    const material = new THREE.PointsMaterial({
      size: 0.85,
      map: texture,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
      blending: THREE.NormalBlending
    });

    this.ambientLeaves = new THREE.Points(geometry, material);
    this.scene.add(this.ambientLeaves);
  }

  // --- Dynamic Sword Sparks (Katana Clash / Parry) ---
  createSwordSparks(pos, count = 25) {
    for (let i = 0; i < count; i++) {
      const geom = new THREE.BufferGeometry();
      const p = new Float32Array([pos.x, pos.y, pos.z]);
      geom.setAttribute('position', new THREE.BufferAttribute(p, 3));

      const mat = new THREE.PointsMaterial({
        color: Math.random() > 0.3 ? 0xffea00 : 0xff5722,
        size: 0.3 + Math.random() * 0.25,
        transparent: true,
        opacity: 1.0,
        blending: THREE.AdditiveBlending
      });

      const particle = new THREE.Points(geom, mat);
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 6 + 4;
      const vel = new THREE.Vector3(
        Math.cos(angle) * speed,
        Math.random() * 5 + 2,
        Math.sin(angle) * speed
      );

      this.scene.add(particle);
      this.particles.push({
        mesh: particle,
        vel: vel,
        gravity: -18,
        life: 0.3 + Math.random() * 0.25,
        maxLife: 0.55
      });
    }
  }

  // --- Cinematic Blood Spray on Lethal Strike ---
  createBloodSpray(pos, dir, count = 35) {
    for (let i = 0; i < count; i++) {
      const geom = new THREE.BufferGeometry();
      const p = new Float32Array([pos.x, pos.y, pos.z]);
      geom.setAttribute('position', new THREE.BufferAttribute(p, 3));

      const mat = new THREE.PointsMaterial({
        color: Math.random() > 0.2 ? 0x8a0303 : 0xb71c1c,
        size: 0.25 + Math.random() * 0.25,
        transparent: true,
        opacity: 0.95
      });

      const particle = new THREE.Points(geom, mat);
      const spread = (Math.random() - 0.5) * 1.5;
      const speed = Math.random() * 7 + 3;
      const vel = new THREE.Vector3(
        dir.x * speed + spread,
        Math.random() * 4 + 1.5,
        dir.z * speed + spread
      );

      this.scene.add(particle);
      this.particles.push({
        mesh: particle,
        vel: vel,
        gravity: -22,
        life: 0.4 + Math.random() * 0.3,
        maxLife: 0.7
      });
    }
  }

  // --- Lightning Sparks (Heavenly Strike) ---
  createLightningSparks(pos, count = 40) {
    for (let i = 0; i < count; i++) {
      const geom = new THREE.BufferGeometry();
      const p = new Float32Array([pos.x + (Math.random() - 0.5) * 1.5, pos.y + Math.random() * 2, pos.z + (Math.random() - 0.5) * 1.5]);
      geom.setAttribute('position', new THREE.BufferAttribute(p, 3));

      const mat = new THREE.PointsMaterial({
        color: 0x80d8ff,
        size: 0.4 + Math.random() * 0.3,
        transparent: true,
        opacity: 1.0,
        blending: THREE.AdditiveBlending
      });

      const particle = new THREE.Points(geom, mat);
      const vel = new THREE.Vector3((Math.random() - 0.5) * 12, Math.random() * 8 + 3, (Math.random() - 0.5) * 12);

      this.scene.add(particle);
      this.particles.push({
        mesh: particle,
        vel: vel,
        gravity: -10,
        life: 0.25 + Math.random() * 0.2,
        maxLife: 0.45
      });
    }
  }

  // --- Smoke Bomb Cloud ---
  createSmokeCloud(pos, count = 20) {
    for (let i = 0; i < count; i++) {
      const geom = new THREE.SphereGeometry(0.8 + Math.random() * 0.6, 6, 6);
      const mat = new THREE.MeshBasicMaterial({
        color: 0xcccccc,
        transparent: true,
        opacity: 0.6
      });

      const mesh = new THREE.Mesh(geom, mat);
      mesh.position.set(
        pos.x + (Math.random() - 0.5) * 2,
        pos.y + 0.5 + Math.random() * 1,
        pos.z + (Math.random() - 0.5) * 2
      );

      this.scene.add(mesh);
      this.particles.push({
        mesh: mesh,
        vel: new THREE.Vector3((Math.random() - 0.5) * 1.2, Math.random() * 0.8 + 0.2, (Math.random() - 0.5) * 1.2),
        isMesh: true,
        scaleSpeed: 1.04,
        life: 2.2,
        maxLife: 2.2
      });
    }
  }

  // --- Main Update Loop ---
  update(delta) {
    // 1. Update Ambient Leaves
    if (this.ambientLeaves) {
      const positions = this.ambientLeaves.geometry.attributes.position.array;
      for (let i = 0; i < this.leafCount; i++) {
        const i3 = i * 3;
        positions[i3] += this.leafVelocities[i3] * delta;
        positions[i3 + 1] += this.leafVelocities[i3 + 1] * delta;
        positions[i3 + 2] += this.leafVelocities[i3 + 2] * delta;

        // Reset if ground hit or drifted out of arena bounds
        if (positions[i3 + 1] < 0 || positions[i3] > 30 || positions[i3 + 2] > 30) {
          positions[i3] = (Math.random() - 0.5) * 50 - 15;
          positions[i3 + 1] = Math.random() * 14 + 6;
          positions[i3 + 2] = (Math.random() - 0.5) * 50 - 15;
        }
      }
      this.ambientLeaves.geometry.attributes.position.needsUpdate = true;
    }

    // 2. Update FX Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= delta;

      if (p.life <= 0) {
        this.scene.remove(p.mesh);
        if (p.mesh.geometry) p.mesh.geometry.dispose();
        if (p.mesh.material) p.mesh.material.dispose();
        this.particles.splice(i, 1);
        continue;
      }

      if (p.isMesh) {
        // Volumetric smoke expansion
        p.mesh.position.addScaledVector(p.vel, delta);
        p.mesh.scale.multiplyScalar(p.scaleSpeed);
        p.mesh.material.opacity = (p.life / p.maxLife) * 0.5;
      } else {
        // Point particle physics
        const posAttr = p.mesh.geometry.attributes.position;
        p.vel.y += p.gravity * delta;
        posAttr.array[0] += p.vel.x * delta;
        posAttr.array[1] += p.vel.y * delta;
        posAttr.array[2] += p.vel.z * delta;

        // Bounce on floor
        if (posAttr.array[1] < 0.05) {
          posAttr.array[1] = 0.05;
          p.vel.y *= -0.3;
          p.vel.x *= 0.6;
          p.vel.z *= 0.6;
        }

        posAttr.needsUpdate = true;
        p.mesh.material.opacity = p.life / p.maxLife;
      }
    }
  }
}
