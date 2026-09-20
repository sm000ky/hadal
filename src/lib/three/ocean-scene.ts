import * as THREE from 'three';

export interface OceanSceneOptions {
  canvas: HTMLCanvasElement;
  onReady?: () => void;
}

export type CameraViewMode = 'CHASE' | 'COCKPIT';

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

  // Submersible Group & Parts
  private submersible: THREE.Group;
  private klaxosaurHorns: THREE.Group;
  private spotlightLeft: THREE.SpotLight;
  private spotlightRight: THREE.SpotLight;
  private spotlightTarget: THREE.Object3D;
  private ambientLight: THREE.AmbientLight;

  // Volumetric Light Cones
  private beamLeft: THREE.Mesh;
  private beamRight: THREE.Mesh;
  private beamMatLeft: THREE.ShaderMaterial;
  private beamMatRight: THREE.ShaderMaterial;

  // Interactive Pointer Aiming
  private targetAim = new THREE.Vector2(0, -2);
  private currentAim = new THREE.Vector2(0, -2);

  // Trench Walls & Geology
  private trenchLeft: THREE.Mesh;
  private trenchRight: THREE.Mesh;
  private hydrothermalVents: THREE.Points;

  // Marine Snow Particles
  private marineSnow: THREE.Points;
  private snowPositions: Float32Array;
  private snowSpeeds: Float32Array;

  // Bioluminescent Organisms & Deep Sea Fauna
  private bioJellies: THREE.Group;
  private snailfishGroup: THREE.Group;
  private anglerfishGroup: THREE.Group;

  // 3D Acoustic Sonar Shockwave
  private sonarShockwave: THREE.Mesh;
  private sonarShockwaveMat: THREE.ShaderMaterial;
  private sonarShockwaveProgress = 1.0; // 0 (start) -> 1 (expired)

  // Camera Modes
  private cameraMode: CameraViewMode = 'CHASE';
  private targetCameraPos = new THREE.Vector3(0, 1.5, 12);
  private targetLookAt = new THREE.Vector3(0, 0, 0);

  // Water Surface Mesh
  private waterSurface: THREE.Mesh;

  // Protocol 002 (Strelizia Overdrive)
  private isProtocol002 = false;

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
    this.scene.background = new THREE.Color(0x0e3854);
    this.scene.fog = new THREE.FogExp2(0x0e3854, 0.012);

    // 3. Camera Setup
    this.camera = new THREE.PerspectiveCamera(
      52,
      window.innerWidth / window.innerHeight,
      0.1,
      1200
    );
    this.camera.position.copy(this.targetCameraPos);

    // 4. Lighting & Volumetric Beams
    this.ambientLight = new THREE.AmbientLight(0x1a4568, 0.85);
    this.scene.add(this.ambientLight);

    this.spotlightTarget = new THREE.Object3D();
    this.spotlightTarget.position.set(0, -2, -30);
    this.scene.add(this.spotlightTarget);

    this.spotlightLeft = new THREE.SpotLight(0xa5f3fc, 2.5, 90, Math.PI / 6.5, 0.65, 1.5);
    this.spotlightLeft.position.set(-2.2, 0.2, 1);
    this.spotlightLeft.target = this.spotlightTarget;
    this.scene.add(this.spotlightLeft);

    this.spotlightRight = new THREE.SpotLight(0xa5f3fc, 2.5, 90, Math.PI / 6.5, 0.65, 1.5);
    this.spotlightRight.position.set(2.2, 0.2, 1);
    this.spotlightRight.target = this.spotlightTarget;
    this.scene.add(this.spotlightRight);

    // Volumetric Beam Cones
    const coneGeo = new THREE.CylinderGeometry(0.25, 8.5, 45, 24, 1, true);
    coneGeo.translate(0, -22.5, 0);
    coneGeo.rotateX(Math.PI / 2);

    const makeBeamMat = () =>
      new THREE.ShaderMaterial({
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
        uniforms: {
          uColor: { value: new THREE.Color(0x38bdf8) },
          uIntensity: { value: 0.16 },
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
        `,
      });

    this.beamMatLeft = makeBeamMat();
    this.beamMatRight = makeBeamMat();

    this.beamLeft = new THREE.Mesh(coneGeo, this.beamMatLeft);
    this.beamLeft.position.set(-2.2, 0.2, 1);
    this.scene.add(this.beamLeft);

    this.beamRight = new THREE.Mesh(coneGeo, this.beamMatRight);
    this.beamRight.position.set(2.2, 0.2, 1);
    this.scene.add(this.beamRight);

    // 5. Build Submersible Model
    const { group: subGroup, horns } = this.createSubmersible();
    this.submersible = subGroup;
    this.klaxosaurHorns = horns;
    this.scene.add(this.submersible);

    // 6. Water Surface Mesh with Caustic Waves
    const surfaceGeo = new THREE.PlaneGeometry(300, 300, 32, 32);
    surfaceGeo.rotateX(Math.PI / 2);
    const surfaceMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.35,
      roughness: 0.1,
      metalness: 0.2,
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

    // 8. Mariana Trench Canyon Walls
    const { leftWall, rightWall } = this.createTrenchWalls();
    this.trenchLeft = leftWall;
    this.trenchRight = rightWall;
    this.scene.add(this.trenchLeft);
    this.scene.add(this.trenchRight);

    // 9. Hydrothermal Vents & Thermal Particles
    this.hydrothermalVents = this.createHydrothermalParticles();
    this.scene.add(this.hydrothermalVents);

    // 10. Bioluminescent Organisms & Deep-Sea Fauna
    this.bioJellies = this.createBioluminescentJellies();
    this.scene.add(this.bioJellies);

    this.snailfishGroup = this.createMarianaSnailfish();
    this.scene.add(this.snailfishGroup);

    this.anglerfishGroup = this.createAnglerfish();
    this.scene.add(this.anglerfishGroup);

    // 11. 3D Expanding Sonar Shockwave Mesh
    const waveGeo = new THREE.RingGeometry(0.8, 1.4, 48);
    waveGeo.rotateX(Math.PI / 2);
    this.sonarShockwaveMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      uniforms: {
        uProgress: { value: 1.0 },
        uColor: { value: new THREE.Color(0x38bdf8) },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uProgress;
        uniform vec3 uColor;
        varying vec2 vUv;
        void main() {
          float alpha = (1.0 - uProgress) * 0.75;
          gl_FragColor = vec4(uColor, alpha);
        }
      `,
    });
    this.sonarShockwave = new THREE.Mesh(waveGeo, this.sonarShockwaveMat);
    this.sonarShockwave.visible = false;
    this.scene.add(this.sonarShockwave);

    // Bind listeners
    window.addEventListener('resize', this.onResize);
    window.addEventListener('pointermove', this.onPointerMove);

    // Start loop
    this.startLoop();

    if (options.onReady) options.onReady();
  }

  private onPointerMove = (e: PointerEvent): void => {
    const x = (e.clientX / window.innerWidth) * 2 - 1;
    const y = -(e.clientY / window.innerHeight) * 2 + 1;
    this.targetAim.set(x * 26, y * 16 - 2);
  };

  private createSubmersible(): { group: THREE.Group; horns: THREE.Group } {
    const group = new THREE.Group();

    // Main Titanium Pressure Sphere
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

    // Heavy Syntactic Foam Fairing Wings
    const wingGeo = new THREE.BoxGeometry(4.8, 0.5, 2.2);
    const fairingMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
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

    // Twin Klaxosaur Horns (Protocol 002 Easter Egg)
    const horns = new THREE.Group();
    const hornGeo = new THREE.ConeGeometry(0.18, 1.4, 16);
    const hornMat = new THREE.MeshStandardMaterial({
      color: 0xff1744,
      emissive: 0xff1744,
      emissiveIntensity: 0.85,
      roughness: 0.2,
      metalness: 0.7,
    });

    const hornLeft = new THREE.Mesh(hornGeo, hornMat);
    hornLeft.position.set(-0.7, 1.8, -0.6);
    hornLeft.rotation.z = Math.PI / 6;
    hornLeft.rotation.x = -Math.PI / 8;
    horns.add(hornLeft);

    const hornRight = new THREE.Mesh(hornGeo, hornMat);
    hornRight.position.set(0.7, 1.8, -0.6);
    hornRight.rotation.z = -Math.PI / 6;
    hornRight.rotation.x = -Math.PI / 8;
    horns.add(hornRight);

    horns.scale.set(0.001, 0.001, 0.001); // Hidden initially
    group.add(horns);

    group.position.set(0, 0, 0);
    return { group, horns };
  }

  private createTrenchWalls(): { leftWall: THREE.Mesh; rightWall: THREE.Mesh } {
    const wallGeo = new THREE.PlaneGeometry(60, 240, 32, 64);
    const pos = wallGeo.attributes.position;

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

    const c1 = new THREE.Color(0xf59e0b);
    const c2 = new THREE.Color(0xef4444);

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
        origY: mesh.position.y,
      };
      group.add(mesh);
    }
    return group;
  }

  /**
   * Mariana Snailfish (Pseudoliparis swirei) 3D Model with S-curve spine motion
   */
  private createMarianaSnailfish(): THREE.Group {
    const group = new THREE.Group();

    // Fish Head & Torso
    const bodyGeo = new THREE.ConeGeometry(0.45, 2.2, 16);
    bodyGeo.rotateX(-Math.PI / 2);

    const fishMat = new THREE.MeshStandardMaterial({
      color: 0xfce7f3, // Pearlescent translucent pinkish-white
      roughness: 0.3,
      metalness: 0.1,
      transparent: true,
      opacity: 0.78,
    });
    const bodyMesh = new THREE.Mesh(bodyGeo, fishMat);
    group.add(bodyMesh);

    // Segmented Tail
    const tailGeo = new THREE.ConeGeometry(0.25, 1.4, 12);
    tailGeo.rotateX(-Math.PI / 2);
    const tailMesh = new THREE.Mesh(tailGeo, fishMat);
    tailMesh.position.set(0, 0, 1.6);
    tailMesh.name = 'tail';
    group.add(tailMesh);

    // Pectoral Wing Fins
    const finGeo = new THREE.PlaneGeometry(0.8, 0.45);
    const finLeft = new THREE.Mesh(finGeo, fishMat);
    finLeft.position.set(-0.55, -0.1, -0.4);
    finLeft.rotation.y = Math.PI / 5;
    finLeft.name = 'finLeft';
    group.add(finLeft);

    const finRight = new THREE.Mesh(finGeo, fishMat);
    finRight.position.set(0.55, -0.1, -0.4);
    finRight.rotation.y = -Math.PI / 5;
    finRight.name = 'finRight';
    group.add(finRight);

    group.position.set(7, -1.8, -12);
    group.rotation.y = -Math.PI / 3.5;
    return group;
  }

  /**
   * Deepsea Anglerfish with glowing lure light in the darkness
   */
  private createAnglerfish(): THREE.Group {
    const group = new THREE.Group();

    // Menacing globular dark body
    const bodyGeo = new THREE.SphereGeometry(0.9, 16, 16);
    bodyGeo.scale(1.2, 0.9, 1.4);
    const anglerMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.9,
      metalness: 0.1,
    });
    const bodyMesh = new THREE.Mesh(bodyGeo, anglerMat);
    group.add(bodyMesh);

    // Dorsal Angler Stalk (Illicium)
    const stalkGeo = new THREE.CylinderGeometry(0.04, 0.05, 1.2, 8);
    const stalkMesh = new THREE.Mesh(stalkGeo, anglerMat);
    stalkMesh.position.set(0, 0.9, -0.6);
    stalkMesh.rotation.x = Math.PI / 4;
    group.add(stalkMesh);

    // Glowing Bioluminescent Lure (Esca)
    const lureGeo = new THREE.SphereGeometry(0.18, 16, 16);
    const lureMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee });
    const lureMesh = new THREE.Mesh(lureGeo, lureMat);
    lureMesh.position.set(0, 1.4, -1.1);
    group.add(lureMesh);

    // Lure Point Light
    const lureLight = new THREE.PointLight(0x22d3ee, 1.8, 12, 1.8);
    lureLight.position.set(0, 1.4, -1.1);
    group.add(lureLight);

    group.position.set(-14, 2.5, -18);
    group.rotation.y = Math.PI / 3;
    return group;
  }

  /**
   * Triggers an expanding 3D sonic shockwave from the sub into the abyss
   */
  public triggerAcousticShockwave(): void {
    this.sonarShockwaveProgress = 0.0;
    this.sonarShockwave.scale.set(1, 1, 1);
    this.sonarShockwave.visible = true;
  }

  /**
   * Toggles Camera View between Chase Third-Person and Cockpit First-Person
   */
  public toggleCameraView(): CameraViewMode {
    this.cameraMode = this.cameraMode === 'CHASE' ? 'COCKPIT' : 'CHASE';
    if (this.cameraMode === 'COCKPIT') {
      this.targetCameraPos.set(0, 0.1, -1.45);
      this.targetLookAt.set(0, -0.5, -35);
    } else {
      this.targetCameraPos.set(0, 1.5, 12);
      this.targetLookAt.set(0, 0, 0);
    }
    return this.cameraMode;
  }

  /**
   * Activates / Deactivates Protocol 002 (Strelizia Klaxosaur Mode)
   */
  public setProtocol002(active: boolean): void {
    this.isProtocol002 = active;
    const targetColor = active ? new THREE.Color(0xff1744) : new THREE.Color(0xa5f3fc);
    const beamColor = active ? new THREE.Color(0xff2255) : new THREE.Color(0x38bdf8);

    this.spotlightLeft.color.copy(targetColor);
    this.spotlightRight.color.copy(targetColor);
    this.beamMatLeft.uniforms.uColor.value.copy(beamColor);
    this.beamMatRight.uniforms.uColor.value.copy(beamColor);
    this.sonarShockwaveMat.uniforms.uColor.value.copy(beamColor);
  }

  public setDepth(depthMeters: number): void {
    this.targetDepth = Math.max(0, Math.min(10994, depthMeters));
  }

  public setCompositionShift(shift: number): void {
    this.compositionShift = THREE.MathUtils.clamp(shift, 0, 1);
  }

  private onResize = (): void => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.camera.aspect = width / height;

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

      // 1. Smooth Depth Interpolation
      this.currentDepth += (this.targetDepth - this.currentDepth) * Math.min(1, delta * 3.5);
      const fraction = this.currentDepth / 10994;

      // 2. Interactive Spotlight Steering with Pointer Lerp
      this.currentAim.lerp(this.targetAim, Math.min(1, delta * 4.5));
      this.spotlightTarget.position.set(this.currentAim.x, this.currentAim.y, -30);

      // Re-orient volumetric cones toward spotlight target
      this.beamLeft.lookAt(this.spotlightTarget.position);
      this.beamRight.lookAt(this.spotlightTarget.position);

      // 3. Smooth Camera Position & LookAt Lerp
      this.camera.position.lerp(this.targetCameraPos, Math.min(1, delta * 4.0));
      this.camera.lookAt(this.targetLookAt);

      // 4. Optical Extinction (Hukum Beer-Lambert)
      let waterColorHex = 0x0e3854;
      let fogDensity = 0.012;

      if (this.isProtocol002) {
        waterColorHex = 0x180308; // Klaxosaur magma tint
        fogDensity = 0.028;
      } else if (this.currentDepth < 200) {
        const t = this.currentDepth / 200;
        waterColorHex = new THREE.Color(0x0e3854).lerp(new THREE.Color(0x071b30), t).getHex();
        fogDensity = 0.012 + t * 0.006;
      } else if (this.currentDepth < 1000) {
        const t = (this.currentDepth - 200) / 800;
        waterColorHex = new THREE.Color(0x071b30).lerp(new THREE.Color(0x040c1a), t).getHex();
        fogDensity = 0.018 + t * 0.008;
      } else if (this.currentDepth < 4000) {
        const t = (this.currentDepth - 1000) / 3000;
        waterColorHex = new THREE.Color(0x040c1a).lerp(new THREE.Color(0x02050c), t).getHex();
        fogDensity = 0.026 + t * 0.004;
      } else {
        waterColorHex = 0x020408;
        fogDensity = 0.030;
      }

      this.scene.background = new THREE.Color(waterColorHex);
      if (this.scene.fog instanceof THREE.FogExp2) {
        this.scene.fog.color.setHex(waterColorHex);
        this.scene.fog.density = fogDensity;
      }

      // 5. Submersible Sway & Klaxosaur Horns Animation
      const swayY = Math.sin(time * 1.2) * 0.18;
      const swayRoll = Math.sin(time * 0.9) * 0.04;
      const pitch = Math.cos(time * 0.7) * 0.03;

      this.submersible.position.y = swayY;
      this.submersible.rotation.z = swayRoll;
      this.submersible.rotation.x = pitch;

      // Horns deployment lerp
      const hornTargetScale = this.isProtocol002 ? 1.0 : 0.001;
      this.klaxosaurHorns.scale.lerp(
        new THREE.Vector3(hornTargetScale, hornTargetScale, hornTargetScale),
        Math.min(1, delta * 5.0)
      );

      // 6. Update Marine Snow Particles
      const snowPos = this.marineSnow.geometry.attributes.position as THREE.BufferAttribute;
      const speedMult = this.isProtocol002 ? 2.5 : 1.0;
      for (let i = 0; i < this.snowPositions.length / 3; i++) {
        let y = snowPos.getY(i);
        y -= this.snowSpeeds[i] * delta * 4.2 * speedMult;
        if (y < -35) y = 35;
        snowPos.setY(i, y);
      }
      snowPos.needsUpdate = true;

      // 7. Update Hydrothermal Vent Particles
      const ventPos = this.hydrothermalVents.geometry.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < ventPos.count; i++) {
        let y = ventPos.getY(i);
        y += delta * 6.5;
        if (y > 10) y = -12 - Math.random() * 15;
        ventPos.setY(i, y);
      }
      ventPos.needsUpdate = true;

      const hadalFade = THREE.MathUtils.smoothstep(this.currentDepth, 4500, 7500);
      this.trenchLeft.position.x = -32 + (1 - hadalFade) * -60;
      this.trenchRight.position.x = 32 + (1 - hadalFade) * 60;
      this.hydrothermalVents.visible = hadalFade > 0.1;

      // 8. Animate Deep-Sea Fauna
      // Snailfish S-curve swimming
      const sf = this.snailfishGroup;
      sf.position.x = 7 + Math.cos(time * 0.6) * 4.5;
      sf.position.y = -1.8 + Math.sin(time * 0.8) * 1.5;
      sf.position.z = -12 + Math.sin(time * 0.5) * 4;
      const tail = sf.getObjectByName('tail');
      if (tail) tail.rotation.y = Math.sin(time * 5.5) * 0.35;
      const finL = sf.getObjectByName('finLeft');
      const finR = sf.getObjectByName('finRight');
      if (finL && finR) {
        finL.rotation.z = Math.sin(time * 4) * 0.25;
        finR.rotation.z = -Math.sin(time * 4) * 0.25;
      }
      sf.visible = this.currentDepth > 6000;

      // Anglerfish stalking movement
      const af = this.anglerfishGroup;
      af.position.x = -14 + Math.sin(time * 0.4) * 3;
      af.position.y = 2.5 + Math.cos(time * 0.5) * 1.2;
      af.visible = this.currentDepth > 1000 && this.currentDepth < 7000;

      // 9. Bioluminescent Jellies
      this.bioJellies.children.forEach((jelly) => {
        const u = jelly.userData;
        jelly.position.y = u.origY + Math.sin(time * u.speed + u.seed) * 1.2;
        const scalePulse = 1 + Math.sin(time * u.speed * 2 + u.seed) * 0.14;
        jelly.scale.set(scalePulse, scalePulse * 1.2, scalePulse);
      });

      // 10. Sonar Shockwave Expansion
      if (this.sonarShockwaveProgress < 1.0) {
        this.sonarShockwaveProgress += delta * 0.42; // ~2.4s expansion
        const scale = 1.0 + this.sonarShockwaveProgress * 55.0;
        this.sonarShockwave.scale.set(scale, scale, scale);
        this.sonarShockwaveMat.uniforms.uProgress.value = this.sonarShockwaveProgress;
        if (this.sonarShockwaveProgress >= 1.0) {
          this.sonarShockwave.visible = false;
        }
      }

      // 11. Water Surface
      if (this.waterSurface.visible) {
        this.waterSurface.position.y = 10 - fraction * 40;
        this.waterSurface.visible = this.currentDepth < 500;
      }

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
    window.removeEventListener('pointermove', this.onPointerMove);

    this.renderer.dispose();
    this.scene.clear();
  }
}
