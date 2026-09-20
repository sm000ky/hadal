import * as THREE from 'three';

export interface OceanSceneOptions {
  canvas: HTMLCanvasElement;
  onReady?: () => void;
}

export class OceanScene {
  private canvas: HTMLCanvasElement;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;

  // Render & Time state
  private isDestroyed = false;
  private animFrameId: number | null = null;
  private clock = new THREE.Clock();

  // Depth & Journey State
  private targetDepth = 0; // 0 to 10994
  private currentDepth = 0;
  private compositionShift = 0; // 0 (centered) to 1 (shifted right for dossier)

  // Submersible Group & Lights
  private submersible: THREE.Group;
  private spotlightLeft: THREE.SpotLight;
  private spotlightRight: THREE.SpotLight;
  private spotlightTarget: THREE.Object3D;
  private ambientLight: THREE.AmbientLight;

  // Volumetric Light Cones
  private beamLeft: THREE.Mesh;
  private beamRight: THREE.Mesh;

  // Trench Walls & Geology
  private trenchLeft: THREE.Mesh;
  private trenchRight: THREE.Mesh;
  private hydrothermalVents: THREE.Points;

  // Marine Snow Particles
  private marineSnow: THREE.Points;
  private snowPositions: Float32Array;
  private snowSpeeds: Float32Array;

  // Bioluminescent Organisms
  private bioJellies: THREE.Group;

  // Water Surface Caustics Grid
  private waterSurface: THREE.Mesh;

  constructor(options: OceanSceneOptions) {
    this.canvas = options.canvas;

    // 1. Renderer Setup (Anti-LMK optimized pixel ratio)
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false,
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;

    // 2. Scene & Fog Setup (Beer-Lambert optical water extinction)
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0e3854); // Surface water color
    this.scene.fog = new THREE.FogExp2(0x0e3854, 0.012);

    // 3. Camera Setup
    this.camera = new THREE.PerspectiveCamera(
      52,
      window.innerWidth / window.innerHeight,
      0.1,
      1200
    );
    this.camera.position.set(0, 1.5, 12);

    // 4. Lighting & Volumetric Beams
    this.ambientLight = new THREE.AmbientLight(0x1a4568, 0.85);
    this.scene.add(this.ambientLight);

    this.spotlightTarget = new THREE.Object3D();
    this.spotlightTarget.position.set(0, -2, -30);
    this.scene.add(this.spotlightTarget);

    this.spotlightLeft = new THREE.SpotLight(0xa5f3fc, 2.5, 90, Math.PI / 7, 0.65, 1.5);
    this.spotlightLeft.position.set(-2.2, 0.2, 1);
    this.spotlightLeft.target = this.spotlightTarget;
    this.scene.add(this.spotlightLeft);

    this.spotlightRight = new THREE.SpotLight(0xa5f3fc, 2.5, 90, Math.PI / 7, 0.65, 1.5);
    this.spotlightRight.position.set(2.2, 0.2, 1);
    this.spotlightRight.target = this.spotlightTarget;
    this.scene.add(this.spotlightRight);

    // Volumetric Beam Cones (simulating light scattering in murky water)
    const coneGeo = new THREE.CylinderGeometry(0.2, 7.5, 45, 24, 1, true);
    coneGeo.translate(0, -22.5, 0);
    coneGeo.rotateX(Math.PI / 2);

    const coneMat = new THREE.ShaderMaterial({
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
      uniforms: {
        uColor: { value: new THREE.Color(0x38bdf8) },
        uIntensity: { value: 0.16 }
      },
      vertexShader: `
        varying float vDepth;
        void main() {
          vDepth = -position.z / 45.0;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        uniform float uIntensity;
        varying float vDepth;
        void main() {
          float falloff = pow(1.0 - clamp(vDepth, 0.0, 1.0), 2.2);
          gl_FragColor = vec4(uColor, falloff * uIntensity);
        }
      `
    });

    this.beamLeft = new THREE.Mesh(coneGeo, coneMat);
    this.beamLeft.position.set(-2.2, 0.2, 1);
    this.scene.add(this.beamLeft);

    this.beamRight = new THREE.Mesh(coneGeo, coneMat.clone());
    this.beamRight.position.set(2.2, 0.2, 1);
    this.scene.add(this.beamRight);

    // 5. Build Submersible Model
    this.submersible = this.createSubmersible();
    this.scene.add(this.submersible);

    // 6. Water Surface Mesh with Caustic Waves (Only visible near 0m)
    const surfaceGeo = new THREE.PlaneGeometry(300, 300, 32, 32);
    surfaceGeo.rotateX(Math.PI / 2);
    const surfaceMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.35,
      roughness: 0.1,
      metalness: 0.2,
      wireframe: false,
    });
    this.waterSurface = new THREE.Mesh(surfaceGeo, surfaceMat);
    this.waterSurface.position.set(0, 10, 0);
    this.scene.add(this.waterSurface);

    // 7. Marine Snow Particle System
    const snowCount = 2800;
    const snowGeo = new THREE.BufferGeometry();
    this.snowPositions = new Float32Array(snowCount * 3);
    this.snowSpeeds = new Float32Array(snowCount);

    for (let i = 0; i < snowCount; i++) {
      this.snowPositions[i * 3] = (Math.random() - 0.5) * 80;
      this.snowPositions[i * 3 + 1] = (Math.random() - 0.5) * 70;
      this.snowPositions[i * 3 + 2] = (Math.random() - 0.5) * 80 - 10;
      this.snowSpeeds[i] = 0.8 + Math.random() * 1.8;
    }
    snowGeo.setAttribute('position', new THREE.BufferAttribute(this.snowPositions, 3));

    const snowMat = new THREE.PointsMaterial({
      color: 0xe0f2fe,
      size: 0.35,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.marineSnow = new THREE.Points(snowGeo, snowMat);
    this.scene.add(this.marineSnow);

    // 8. Mariana Trench Jagged Canyon Walls
    const { leftWall, rightWall } = this.createTrenchWalls();
    this.trenchLeft = leftWall;
    this.trenchRight = rightWall;
    this.scene.add(this.trenchLeft);
    this.scene.add(this.trenchRight);

    // 9. Hydrothermal Vents & Thermal Particles
    this.hydrothermalVents = this.createHydrothermalParticles();
    this.scene.add(this.hydrothermalVents);

    // 10. Bioluminescent Organisms
    this.bioJellies = this.createBioluminescentJellies();
    this.scene.add(this.bioJellies);

    // Bind resize
    window.addEventListener('resize', this.onResize);

    // Start render loop
    this.startLoop();

    if (options.onReady) options.onReady();
  }

  private createSubmersible(): THREE.Group {
    const group = new THREE.Group();

    // Main Titanium Pressure Sphere (Limiting Factor style)
    const sphereGeo = new THREE.SphereGeometry(1.6, 32, 32);
    const titaniumMat = new THREE.MeshStandardMaterial({
      color: 0xd1d5db,
      metalness: 0.88,
      roughness: 0.28,
    });
    const sphereMesh = new THREE.Mesh(sphereGeo, titaniumMat);
    group.add(sphereMesh);

    // Observation Viewport Ring (Gold rim)
    const ringGeo = new THREE.TorusGeometry(0.7, 0.12, 16, 32);
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.95,
      roughness: 0.15,
    });
    const ringMesh = new THREE.Mesh(ringGeo, goldMat);
    ringMesh.position.set(0, 0, -1.5);
    group.add(ringMesh);

    // Heavy Syntactic Foam Fairing Wings (Deepsea Challenger neon green/yellow accents)
    const wingGeo = new THREE.BoxGeometry(4.8, 0.5, 2.2);
    const fairingMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7, // Abyssal Oceanic blue
      roughness: 0.4,
      metalness: 0.3,
    });
    const wingMesh = new THREE.Mesh(wingGeo, fairingMat);
    wingMesh.position.set(0, -0.6, 0.2);
    group.add(wingMesh);

    // Thruster Ducts Left and Right
    const thrusterGeo = new THREE.CylinderGeometry(0.4, 0.45, 1.2, 16);
    thrusterGeo.rotateX(Math.PI / 2);
    const thrusterMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.8,
      roughness: 0.3,
    });

    const thrusterLeft = new THREE.Mesh(thrusterGeo, thrusterMat);
    thrusterLeft.position.set(-2.2, -0.6, 1.2);
    group.add(thrusterLeft);

    const thrusterRight = new THREE.Mesh(thrusterGeo, thrusterMat);
    thrusterRight.position.set(2.2, -0.6, 1.2);
    group.add(thrusterRight);

    // Sensor Mast with Flashing Beacon
    const mastGeo = new THREE.CylinderGeometry(0.06, 0.08, 1.4, 12);
    const mastMesh = new THREE.Mesh(mastGeo, thrusterMat);
    mastMesh.position.set(0, 2.1, -0.2);
    group.add(mastMesh);

    const beaconGeo = new THREE.SphereGeometry(0.14, 16, 16);
    const beaconMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    const beaconMesh = new THREE.Mesh(beaconGeo, beaconMat);
    beaconMesh.position.set(0, 2.8, -0.2);
    group.add(beaconMesh);

    group.position.set(0, 0, 0);
    return group;
  }

  private createTrenchWalls(): { leftWall: THREE.Mesh; rightWall: THREE.Mesh } {
    const wallGeo = new THREE.PlaneGeometry(60, 240, 32, 64);
    const pos = wallGeo.attributes.position;

    // Displace vertices to create craggy volcanic basalt formations
    for (let i = 0; i < pos.count; i++) {
      const z = pos.getZ(i);
      const y = pos.getY(i);
      const displacement = (Math.sin(y * 0.15) + Math.cos(pos.getX(i) * 0.2)) * 3.5;
      pos.setZ(i, z + displacement);
    }
    wallGeo.computeVertexNormals();

    const wallMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.95,
      metalness: 0.1,
      flatShading: true,
    });

    const leftWall = new THREE.Mesh(wallGeo, wallMat);
    leftWall.position.set(-32, -40, -10);
    leftWall.rotation.y = Math.PI / 2.8;

    const rightWall = new THREE.Mesh(wallGeo, wallMat.clone());
    rightWall.position.set(32, -40, -10);
    rightWall.rotation.y = -Math.PI / 2.8;

    return { leftWall, rightWall };
  }

  private createHydrothermalParticles(): THREE.Points {
    const count = 450;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const c1 = new THREE.Color(0xf59e0b); // Amber heat
    const c2 = new THREE.Color(0xef4444); // Magma red

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 6 - 8;
      positions[i * 3 + 1] = -12 - Math.random() * 25;
      positions[i * 3 + 2] = -18 + (Math.random() - 0.5) * 6;

      const mix = Math.random();
      const col = c1.clone().lerp(c2, mix);
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const mat = new THREE.PointsMaterial({
      size: 0.8,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    return new THREE.Points(geo, mat);
  }

  private createBioluminescentJellies(): THREE.Group {
    const group = new THREE.Group();
    const jellyGeo = new THREE.SphereGeometry(0.6, 16, 16);
    jellyGeo.scale(1, 1.4, 1);

    const colors = [0x22d3ee, 0xa855f7, 0x34d399];

    for (let i = 0; i < 9; i++) {
      const col = colors[i % colors.length];
      const mat = new THREE.MeshBasicMaterial({
        color: col,
        transparent: true,
        opacity: 0.65,
        wireframe: true,
      });
      const mesh = new THREE.Mesh(jellyGeo, mat);
      mesh.position.set(
        (Math.random() - 0.5) * 36,
        (Math.random() - 0.5) * 20 - 5,
        -10 - Math.random() * 25
      );
      mesh.userData = {
        seed: Math.random() * 10,
        speed: 0.4 + Math.random() * 0.4,
        origY: mesh.position.y
      };
      group.add(mesh);
    }
    return group;
  }

  /**
   * Updates target depth from master narrative audio clock or slider (0 to 10,994m).
   */
  public setDepth(depthMeters: number): void {
    this.targetDepth = Math.max(0, Math.min(10994, depthMeters));
  }

  /**
   * Sets asymmetric camera frustum composition (0 = centered, 1 = shifted right for dossier).
   */
  public setCompositionShift(shift: number): void {
    this.compositionShift = THREE.MathUtils.clamp(shift, 0, 1);
  }

  private onResize = (): void => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.camera.aspect = width / height;

    // Apply Asymmetric Frustum Shift if shift > 0 (Tilt-Shift Lens principle)
    if (this.compositionShift > 0.001) {
      const offsetX = -(this.compositionShift * 0.38 * width);
      this.camera.setViewOffset(width, height, offsetX, 0, width, height);
    } else {
      this.camera.clearViewOffset();
    }

    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  private startLoop(): void {
    const renderFrame = () => {
      if (this.isDestroyed) return;

      const delta = this.clock.getDelta();
      const time = this.clock.getElapsedTime();

      // 1. Smooth Depth Interpolation (Differential Lerp frame-by-frame)
      this.currentDepth += (this.targetDepth - this.currentDepth) * Math.min(1, delta * 3.5);
      const fraction = this.currentDepth / 10994; // 0.0 (surface) to 1.0 (Challenger Deep)

      // 2. Beer-Lambert Optical Extinction (Dynamic Background & Fog)
      let waterColorHex = 0x0e3854;
      let fogDensity = 0.012;

      if (this.currentDepth < 200) {
        // Epipelagic (Sunlight)
        const t = this.currentDepth / 200;
        waterColorHex = new THREE.Color(0x0e3854).lerp(new THREE.Color(0x071b30), t).getHex();
        fogDensity = 0.012 + t * 0.006;
      } else if (this.currentDepth < 1000) {
        // Mesopelagic (Twilight)
        const t = (this.currentDepth - 200) / 800;
        waterColorHex = new THREE.Color(0x071b30).lerp(new THREE.Color(0x040c1a), t).getHex();
        fogDensity = 0.018 + t * 0.008;
      } else if (this.currentDepth < 4000) {
        // Bathypelagic (Midnight)
        const t = (this.currentDepth - 1000) / 3000;
        waterColorHex = new THREE.Color(0x040c1a).lerp(new THREE.Color(0x02050c), t).getHex();
        fogDensity = 0.026 + t * 0.004;
      } else {
        // Hadal Zone (Aphotic Trench Void)
        waterColorHex = 0x020408;
        fogDensity = 0.030;
      }

      this.scene.background = new THREE.Color(waterColorHex);
      if (this.scene.fog instanceof THREE.FogExp2) {
        this.scene.fog.color.setHex(waterColorHex);
        this.scene.fog.density = fogDensity;
      }

      // 3. Submersible Subsea Sway & Thruster Vibration
      const swayY = Math.sin(time * 1.2) * 0.18;
      const swayRoll = Math.sin(time * 0.9) * 0.04;
      const pitch = Math.cos(time * 0.7) * 0.03;

      this.submersible.position.y = swayY;
      this.submersible.rotation.z = swayRoll;
      this.submersible.rotation.x = pitch;

      // 4. Update Marine Snow Particles
      const snowPos = this.marineSnow.geometry.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < this.snowPositions.length / 3; i++) {
        let y = snowPos.getY(i);
        y -= this.snowSpeeds[i] * delta * 4.2;
        if (y < -35) y = 35; // wrap around
        snowPos.setY(i, y);
      }
      snowPos.needsUpdate = true;

      // 5. Update Hydrothermal Vent Particles
      const ventPos = this.hydrothermalVents.geometry.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < ventPos.count; i++) {
        let y = ventPos.getY(i);
        y += delta * 6.5; // rising plumes
        if (y > 10) y = -12 - Math.random() * 15;
        ventPos.setY(i, y);
      }
      ventPos.needsUpdate = true;

      // Only show vents and trench walls significantly when depth > 5000m
      const hadalFade = THREE.MathUtils.smoothstep(this.currentDepth, 4500, 7500);
      this.trenchLeft.position.x = -32 + (1 - hadalFade) * -60; // canyon narrows in Hadal zone
      this.trenchRight.position.x = 32 + (1 - hadalFade) * 60;
      this.hydrothermalVents.visible = hadalFade > 0.1;

      // 6. Bioluminescent Jellies Pulsing Movement
      this.bioJellies.children.forEach((jelly) => {
        const u = jelly.userData;
        jelly.position.y = u.origY + Math.sin(time * u.speed + u.seed) * 1.2;
        const scalePulse = 1 + Math.sin(time * u.speed * 2 + u.seed) * 0.14;
        jelly.scale.set(scalePulse, scalePulse * 1.2, scalePulse);
      });

      // 7. Water Surface Movement
      if (this.waterSurface.visible) {
        this.waterSurface.position.y = 10 - fraction * 40;
        this.waterSurface.visible = this.currentDepth < 500;
      }

      // 8. Apply Asymmetric Frustum Shift if updated
      this.onResize();

      this.renderer.render(this.scene, this.camera);
      this.animFrameId = requestAnimationFrame(renderFrame);
    };

    this.animFrameId = requestAnimationFrame(renderFrame);
  }

  public dispose(): void {
    this.isDestroyed = true;
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    window.removeEventListener('resize', this.onResize);

    this.renderer.dispose();
    this.scene.clear();
  }
}
