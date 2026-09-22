/**
 * Three.js Scene Setup, Cyberpunk Environment, Lighting & Camera
 */
class GameScene {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.cityBuildings = [];
        this.particles = null;
        this.shakeIntensity = 0;
        this.shakeDecay = 0.9;
        this.targetFOV = 65;
        this.baseFOV = 65;
        this.cameraMode = 'third_person'; // 'third_person' or 'first_person'
        this.gridGround = null;

        this.init();
    }

    init() {
        // 1. Scene & Fog
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x060814);
        this.scene.fog = new THREE.FogExp2(0x080a1c, 0.012);

        // 2. Camera
        const aspect = window.innerWidth / window.innerHeight;
        this.camera = new THREE.PerspectiveCamera(this.baseFOV, aspect, 0.1, 1000);
        this.camera.position.set(0, 5, 8);

        // 3. Renderer
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            powerPreference: "high-performance",
            alpha: false
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.15;
        this.container.appendChild(this.renderer.domElement);

        // 4. Lighting
        this.setupLights();

        // 5. Futuristic City & Cyber Environment
        this.createCyberCity();
        this.createAmbientParticles();
        this.createCyberGridFloor();

        // 6. Resize listener
        window.addEventListener('resize', () => this.onWindowResize());
    }

    setupLights() {
        // Ambient Light
        const ambient = new THREE.AmbientLight(0x223355, 0.8);
        this.scene.add(ambient);

        // Directional Sun / Cyber Moon
        this.dirLight = new THREE.DirectionalLight(0x00f3ff, 1.2);
        this.dirLight.position.set(20, 40, 20);
        this.dirLight.castShadow = true;
        this.dirLight.shadow.mapSize.width = 1024;
        this.dirLight.shadow.mapSize.height = 1024;
        this.dirLight.shadow.camera.near = 0.5;
        this.dirLight.shadow.camera.far = 150;
        this.dirLight.shadow.camera.left = -25;
        this.dirLight.shadow.camera.right = 25;
        this.dirLight.shadow.camera.top = 25;
        this.dirLight.shadow.camera.bottom = -25;
        this.scene.add(this.dirLight);

        // Secondary Magenta Rim Light
        const rimLight = new THREE.DirectionalLight(0xff0077, 0.9);
        rimLight.position.set(-25, 15, -20);
        this.scene.add(rimLight);

        // Dynamic Runner PointLight
        this.playerGlowLight = new THREE.PointLight(0x00f3ff, 2.5, 18);
        this.playerGlowLight.position.set(0, 3, 0);
        this.scene.add(this.playerGlowLight);
    }

    createCyberGridFloor() {
        // Grid floor far below the floating track (Y = -25)
        const size = 1000;
        const divisions = 100;
        const gridHelper = new THREE.GridHelper(size, divisions, 0x00f3ff, 0x111c38);
        gridHelper.position.y = -22;
        this.scene.add(gridHelper);
        this.gridGround = gridHelper;
    }

    createCyberCity() {
        const buildingGeo = new THREE.BoxGeometry(1, 1, 1);
        const palette = [0x0b112c, 0x080f24, 0x120e2e, 0x051a2e];
        const neonPalette = [0x00f3ff, 0xff0077, 0x7928ca, 0x00ff88, 0xffb700];

        // Left and Right skyline buildings
        for (let i = 0; i < 70; i++) {
            const side = i % 2 === 0 ? -1 : 1;
            const xDist = (Math.random() * 60 + 22) * side;
            const zDist = (Math.random() * 500) - 100;
            const width = Math.random() * 14 + 10;
            const height = Math.random() * 90 + 35;
            const depth = Math.random() * 14 + 10;

            const baseColor = palette[Math.floor(Math.random() * palette.length)];
            const buildingMat = new THREE.MeshStandardMaterial({
                color: baseColor,
                roughness: 0.3,
                metalness: 0.8
            });

            const building = new THREE.Mesh(buildingGeo, buildingMat);
            building.scale.set(width, height, depth);
            building.position.set(xDist, height / 2 - 25, zDist);
            this.scene.add(building);
            this.cityBuildings.push(building);

            // Add glowing neon stripes / billboards on buildings
            if (Math.random() < 0.6) {
                const neonColor = neonPalette[Math.floor(Math.random() * neonPalette.length)];
                const stripeGeo = new THREE.PlaneGeometry(width * 0.8, Math.random() * 3 + 1);
                const stripeMat = new THREE.MeshBasicMaterial({
                    color: neonColor,
                    side: THREE.DoubleSide
                });
                const stripe = new THREE.Mesh(stripeGeo, stripeMat);
                stripe.position.set(xDist + (side < 0 ? width / 2 + 0.1 : -width / 2 - 0.1), Math.random() * (height * 0.6) + 5, zDist);
                stripe.rotation.y = side < 0 ? Math.PI / 2 : -Math.PI / 2;
                this.scene.add(stripe);
                this.cityBuildings.push(stripe);
            }
        }
    }

    createAmbientParticles() {
        const particleCount = 600;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);

        const color1 = new THREE.Color(0x00f3ff);
        const color2 = new THREE.Color(0xff0077);

        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 80;
            positions[i * 3 + 1] = Math.random() * 35 - 5;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 250;

            const c = Math.random() < 0.5 ? color1 : color2;
            colors[i * 3] = c.r;
            colors[i * 3 + 1] = c.g;
            colors[i * 3 + 2] = c.b;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
            size: 0.35,
            vertexColors: true,
            transparent: true,
            opacity: 0.85,
            blending: THREE.AdditiveBlending
        });

        this.particles = new THREE.Points(geometry, material);
        this.scene.add(this.particles);
    }

    updateParticles(playerZ) {
        if (!this.particles) return;
        const positions = this.particles.geometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
            // If particle gets behind player, wrap it ahead
            if (positions[i + 2] > playerZ + 20) {
                positions[i + 2] = playerZ - 200 - Math.random() * 50;
            }
        }
        this.particles.geometry.attributes.position.needsUpdate = true;
    }

    triggerScreenShake(intensity = 0.4) {
        this.shakeIntensity = intensity;
    }

    setSpeedFOV(speedFactor) {
        // Dynamic speed warp
        this.targetFOV = this.baseFOV + (speedFactor - 1) * 15;
    }

    updateCamera(player, delta) {
        if (!player || !player.mesh) return;

        const pPos = player.mesh.position;

        // Follow player pointlight
        this.playerGlowLight.position.set(pPos.x, pPos.y + 2, pPos.z);
        this.dirLight.position.set(pPos.x + 20, pPos.y + 35, pPos.z + 15);
        this.dirLight.target = player.mesh;

        // Move grid ground along player Z
        if (this.gridGround) {
            this.gridGround.position.z = pPos.z;
        }

        // Camera position lerping
        let targetCamX, targetCamY, targetCamZ;

        if (this.cameraMode === 'first_person') {
            targetCamX = pPos.x;
            targetCamY = pPos.y + 1.6;
            targetCamZ = pPos.z - 0.2;
            this.camera.position.set(targetCamX, targetCamY, targetCamZ);
            this.camera.lookAt(pPos.x, pPos.y + 1.5, pPos.z - 25);
        } else {
            // Third Person Over-The-Shoulder
            targetCamX = THREE.MathUtils.lerp(this.camera.position.x, pPos.x * 0.4, 0.1);
            targetCamY = THREE.MathUtils.lerp(this.camera.position.y, Math.max(3.8, pPos.y + 3.2), 0.12);
            targetCamZ = pPos.z + 7.5;

            // Apply screen shake
            if (this.shakeIntensity > 0.005) {
                targetCamX += (Math.random() - 0.5) * this.shakeIntensity;
                targetCamY += (Math.random() - 0.5) * this.shakeIntensity;
                this.shakeIntensity *= this.shakeDecay;
            } else {
                this.shakeIntensity = 0;
            }

            this.camera.position.set(targetCamX, targetCamY, targetCamZ);
            this.camera.lookAt(pPos.x * 0.2, pPos.y + 1.2, pPos.z - 15);
        }

        // Smooth FOV transition
        this.camera.fov = THREE.MathUtils.lerp(this.camera.fov, this.targetFOV, 0.1);
        this.camera.updateProjectionMatrix();

        // Update atmospheric particles
        this.updateParticles(pPos.z);
    }

    setCameraMode(mode) {
        this.cameraMode = mode;
    }

    onWindowResize() {
        if (!this.camera || !this.renderer) return;
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }
}

window.GameScene = GameScene;
