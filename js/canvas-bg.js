/* ==========================================================================
   CANVAS-BG.JS - Fantastic 3D Neural Nexus & Quantum Horizon (Three.js)
   Hardware-accelerated 3D WebGL Neural Matrix for Esuru Dhanaraj Portfolio
   ========================================================================== */

(function () {
  'use strict';

  const canvas = document.getElementById('neural-canvas');
  if (!canvas) return;

  // Check WebGL availability
  function isWebGLAvailable() {
    try {
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      return !!(window.WebGLRenderingContext && gl);
    } catch (e) {
      return false;
    }
  }

  if (typeof THREE === 'undefined' || !isWebGLAvailable()) {
    initFallback2D();
    return;
  }

  // --- THREE.JS 3D SCENE SETUP ---
  let scene, camera, renderer;
  let width = window.innerWidth;
  let height = window.innerHeight;

  // Layer objects
  let wavePoints, waveGeometry, wavePositions, waveColors;
  let waveLineSegments, waveLineGeometry;
  let nexusGroup, nexusNodes, nexusConnections, impulseParticles;
  let dustPoints, dustPositions;
  let glowTexture;

  // Wave Grid Configuration
  const GRID_COLS = 54;
  const GRID_ROWS = 54;
  const GRID_COUNT = GRID_COLS * GRID_ROWS;
  const GRID_WIDTH = 2600;
  const GRID_DEPTH = 2400;

  // Mouse & Scroll interaction
  const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
  let scrollProgress = 0;
  let targetCameraZ = 550;
  let targetCameraY = 160;
  let targetCameraX = 0;

  // Neural Nexus data
  const NEXUS_COUNT = 90;
  const NEXUS_RADIUS = 360;
  let nexusNodeData = [];
  let impulses = [];

  // Permanent Single Color Palette (High-Contrast 3D Visualization)
  const PALETTE = {
    fog: 0xffffff,
    crestColor: new THREE.Color(0x0284c7), // Sky 600
    slopeColor: new THREE.Color(0x4f46e5), // Electric Indigo 600
    troughColor: new THREE.Color(0x7c3aed), // Violet 600
    lineColor: new THREE.Color(0x0284c7),
    lineOpacity: 0.22,
    nodeColorA: new THREE.Color(0x0284c7),
    nodeColorB: new THREE.Color(0x9333ea),
    synapseColor: new THREE.Color(0x4f46e5),
    synapseOpacity: 0.25,
    impulseColor: new THREE.Color(0x0284c7),
    dustColor: new THREE.Color(0x64748b),
    dustOpacity: 0.4,
    pointSize: 18,
  };

  // Create soft radial glow sprite texture
  function createGlowTexture() {
    const texCanvas = document.createElement('canvas');
    texCanvas.width = 64;
    texCanvas.height = 64;
    const ctx = texCanvas.getContext('2d');

    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.2, 'rgba(2, 132, 199, 0.85)');
    gradient.addColorStop(0.55, 'rgba(124, 58, 237, 0.35)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);

    const texture = new THREE.CanvasTexture(texCanvas);
    texture.needsUpdate = true;
    return texture;
  }

  function init() {
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(PALETTE.fog, 0.00065);

    camera = new THREE.PerspectiveCamera(58, width / height, 1, 4200);
    camera.position.set(0, 180, 550);
    camera.lookAt(0, -50, -400);

    renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);

    glowTexture = createGlowTexture();

    // Build layers
    buildWaveHorizon(PALETTE);
    buildNeuralNexus(PALETTE);
    buildVolumetricDust(PALETTE);

    // Event Listeners
    window.addEventListener('resize', onResize);
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('visibilitychange', onVisibilityChange);

    animate(0);
  }

  // --- LAYER 1: 3D QUANTUM LOSS HORIZON (WAVE SURFACE) ---
  function buildWaveHorizon(colors) {
    waveGeometry = new THREE.BufferGeometry();
    wavePositions = new Float32Array(GRID_COUNT * 3);
    waveColors = new Float32Array(GRID_COUNT * 3);

    let idx = 0;
    for (let iz = 0; iz < GRID_ROWS; iz++) {
      for (let ix = 0; ix < GRID_COLS; ix++) {
        const x = (ix / (GRID_COLS - 1) - 0.5) * GRID_WIDTH;
        const z = (iz / (GRID_ROWS - 1) - 0.5) * GRID_DEPTH - 700;
        const y = -140;

        wavePositions[idx * 3] = x;
        wavePositions[idx * 3 + 1] = y;
        wavePositions[idx * 3 + 2] = z;

        waveColors[idx * 3] = colors.slopeColor.r;
        waveColors[idx * 3 + 1] = colors.slopeColor.g;
        waveColors[idx * 3 + 2] = colors.slopeColor.b;
        idx++;
      }
    }

    waveGeometry.setAttribute('position', new THREE.BufferAttribute(wavePositions, 3));
    waveGeometry.setAttribute('color', new THREE.BufferAttribute(waveColors, 3));

    const waveMaterial = new THREE.PointsMaterial({
      size: colors.pointSize,
      map: glowTexture,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
      blending: THREE.NormalBlending,
      depthWrite: false,
    });

    wavePoints = new THREE.Points(waveGeometry, waveMaterial);
    scene.add(wavePoints);

    // Wave Wireframe Lines (Grid connecting lines)
    const lineIndices = [];
    for (let iz = 0; iz < GRID_ROWS; iz++) {
      for (let ix = 0; ix < GRID_COLS; ix++) {
        const current = iz * GRID_COLS + ix;
        if (ix < GRID_COLS - 1) {
          lineIndices.push(current, current + 1);
        }
        if (iz < GRID_ROWS - 1) {
          lineIndices.push(current, current + GRID_COLS);
        }
      }
    }

    waveLineGeometry = new THREE.BufferGeometry();
    waveLineGeometry.setAttribute('position', new THREE.BufferAttribute(wavePositions, 3));
    waveLineGeometry.setIndex(lineIndices);

    const waveLineMaterial = new THREE.LineBasicMaterial({
      color: colors.lineColor,
      transparent: true,
      opacity: colors.lineOpacity,
      blending: THREE.NormalBlending,
      depthWrite: false,
    });

    waveLineSegments = new THREE.LineSegments(waveLineGeometry, waveLineMaterial);
    scene.add(waveLineSegments);
  }

  // --- LAYER 2: 3D INTERACTIVE SYNAPTIC NEXUS (AI BRAIN CORE) ---
  function buildNeuralNexus(colors) {
    nexusGroup = new THREE.Group();
    nexusGroup.position.set(0, 110, -420);

    nexusNodeData = [];
    const nodePositions = new Float32Array(NEXUS_COUNT * 3);
    const nodeColors = new Float32Array(NEXUS_COUNT * 3);

    // Generate geodesic / spherical cluster with organic dispersion
    for (let i = 0; i < NEXUS_COUNT; i++) {
      const phi = Math.acos(-1 + (2 * i) / NEXUS_COUNT);
      const theta = Math.sqrt(NEXUS_COUNT * Math.PI) * phi;
      const radius = NEXUS_RADIUS * (0.65 + Math.random() * 0.45);

      const x = radius * Math.cos(theta) * Math.sin(phi);
      const y = radius * Math.sin(theta) * Math.sin(phi) * 0.75;
      const z = radius * Math.cos(phi);

      nodePositions[i * 3] = x;
      nodePositions[i * 3 + 1] = y;
      nodePositions[i * 3 + 2] = z;

      const mixFactor = Math.random();
      const nodeCol = colors.nodeColorA.clone().lerp(colors.nodeColorB, mixFactor);
      nodeColors[i * 3] = nodeCol.r;
      nodeColors[i * 3 + 1] = nodeCol.g;
      nodeColors[i * 3 + 2] = nodeCol.b;

      nexusNodeData.push({
        baseX: x,
        baseY: y,
        baseZ: z,
        phase: Math.random() * Math.PI * 2,
        speed: 0.6 + Math.random() * 0.8,
        connections: [],
      });
    }

    const nodeGeo = new THREE.BufferGeometry();
    nodeGeo.setAttribute('position', new THREE.BufferAttribute(nodePositions, 3));
    nodeGeo.setAttribute('color', new THREE.BufferAttribute(nodeColors, 3));

    const nodeMat = new THREE.PointsMaterial({
      size: colors.pointSize * 1.3,
      map: glowTexture,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.NormalBlending,
      depthWrite: false,
    });

    nexusNodes = new THREE.Points(nodeGeo, nodeMat);
    nexusGroup.add(nexusNodes);

    // Connect close nodes with synaptic line segments
    const synapseIndices = [];
    const maxDistance = 165;

    for (let i = 0; i < NEXUS_COUNT; i++) {
      for (let j = i + 1; j < NEXUS_COUNT; j++) {
        const dx = nodePositions[i * 3] - nodePositions[j * 3];
        const dy = nodePositions[i * 3 + 1] - nodePositions[j * 3 + 1];
        const dz = nodePositions[i * 3 + 2] - nodePositions[j * 3 + 2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (dist < maxDistance) {
          synapseIndices.push(i, j);
          nexusNodeData[i].connections.push(j);
          nexusNodeData[j].connections.push(i);
        }
      }
    }

    const synapseGeo = new THREE.BufferGeometry();
    synapseGeo.setAttribute('position', new THREE.BufferAttribute(nodePositions, 3));
    synapseGeo.setIndex(synapseIndices);

    const synapseMat = new THREE.LineBasicMaterial({
      color: colors.synapseColor,
      transparent: true,
      opacity: colors.synapseOpacity,
      blending: THREE.NormalBlending,
      depthWrite: false,
    });

    nexusConnections = new THREE.LineSegments(synapseGeo, synapseMat);
    nexusGroup.add(nexusConnections);

    // Dynamic Travelling Action Potential Impulses (Signal Packets)
    const IMPULSE_COUNT = 16;
    impulses = [];
    const impulsePositions = new Float32Array(IMPULSE_COUNT * 3);

    for (let i = 0; i < IMPULSE_COUNT; i++) {
      const startNode = Math.floor(Math.random() * NEXUS_COUNT);
      const conns = nexusNodeData[startNode].connections;
      const targetNode = conns.length > 0 ? conns[Math.floor(Math.random() * conns.length)] : startNode;

      impulses.push({
        from: startNode,
        to: targetNode,
        progress: Math.random(),
        speed: 0.007 + Math.random() * 0.012,
      });

      impulsePositions[i * 3] = nodePositions[startNode * 3];
      impulsePositions[i * 3 + 1] = nodePositions[startNode * 3 + 1];
      impulsePositions[i * 3 + 2] = nodePositions[startNode * 3 + 2];
    }

    const impulseGeo = new THREE.BufferGeometry();
    impulseGeo.setAttribute('position', new THREE.BufferAttribute(impulsePositions, 3));

    const impulseMat = new THREE.PointsMaterial({
      size: colors.pointSize * 1.5,
      map: glowTexture,
      color: colors.impulseColor,
      transparent: true,
      opacity: 0.85,
      blending: THREE.NormalBlending,
      depthWrite: false,
    });

    impulseParticles = new THREE.Points(impulseGeo, impulseMat);
    nexusGroup.add(impulseParticles);

    scene.add(nexusGroup);
  }

  // --- LAYER 3: VOLUMETRIC STARDUST (ATMOSPHERE & DEPTH) ---
  function buildVolumetricDust(colors) {
    const DUST_COUNT = 650;
    dustPositions = new Float32Array(DUST_COUNT * 3);

    for (let i = 0; i < DUST_COUNT; i++) {
      dustPositions[i * 3] = (Math.random() - 0.5) * 3200;
      dustPositions[i * 3 + 1] = (Math.random() - 0.5) * 1800 + 100;
      dustPositions[i * 3 + 2] = (Math.random() - 0.5) * 2600 - 600;
    }

    const dustGeo = new THREE.BufferGeometry();
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));

    const dustMat = new THREE.PointsMaterial({
      size: colors.pointSize * 0.75,
      map: glowTexture,
      color: colors.dustColor,
      transparent: true,
      opacity: colors.dustOpacity,
      blending: THREE.NormalBlending,
      depthWrite: false,
    });

    dustPoints = new THREE.Points(dustGeo, dustMat);
    scene.add(dustPoints);
  }

  // --- INTERACTIVE EVENTS ---
  function onMouseMove(e) {
    mouse.targetX = (e.clientX / width - 0.5) * 2;
    mouse.targetY = -(e.clientY / height - 0.5) * 2;
  }

  function onScroll() {
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    scrollProgress = Math.min(1, Math.max(0, window.scrollY / maxScroll));
  }

  function onResize() {
    width = window.innerWidth;
    height = window.innerHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }

  let isPaused = false;
  function onVisibilityChange() {
    isPaused = document.hidden;
  }

  // --- ANIMATION LOOP ---
  let lastTime = 0;

  function animate(timestamp) {
    requestAnimationFrame(animate);
    if (isPaused) return;

    const time = timestamp * 0.001;
    const delta = Math.min(time - lastTime, 0.1);
    lastTime = time;

    // Smooth mouse lerp
    mouse.x += (mouse.targetX - mouse.x) * 0.045;
    mouse.y += (mouse.targetY - mouse.y) * 0.045;

    // Dynamic Camera Flight based on Scroll & Mouse
    targetCameraX = mouse.x * 220;
    targetCameraY = 160 + mouse.y * 120 - scrollProgress * 150;
    targetCameraZ = 550 - scrollProgress * 320;

    camera.position.x += (targetCameraX - camera.position.x) * 0.04;
    camera.position.y += (targetCameraY - camera.position.y) * 0.04;
    camera.position.z += (targetCameraZ - camera.position.z) * 0.04;
    camera.lookAt(0, -40 - scrollProgress * 60, -400);

    // 1. Update 3D Wave Horizon
    let idx = 0;
    for (let iz = 0; iz < GRID_ROWS; iz++) {
      for (let ix = 0; ix < GRID_COLS; ix++) {
        const x = wavePositions[idx * 3];
        const z = wavePositions[idx * 3 + 2];

        // Complex multi-frequency quantum wave formula
        let y =
          Math.sin(x * 0.0028 + time * 1.1) * 42 +
          Math.cos(z * 0.0028 + time * 0.9) * 34 +
          Math.sin((x + z) * 0.0018 + time * 0.7) * 26 +
          Math.cos((x - z) * 0.0022 + time * 0.5) * 16 -
          140;

        // Interactive mouse distortion ripple
        const dx = x - mouse.x * 600;
        const dz = z - (-400 + mouse.y * 300);
        const dist = Math.sqrt(dx * dx + dz * dz);
        if (dist < 480) {
          y += Math.sin(dist * 0.03 - time * 4) * (1 - dist / 480) * 45;
        }

        wavePositions[idx * 3 + 1] = y;

        // Dynamic Altitude Color Interpolation (Cyan Crests -> Purple Valleys)
        const normY = Math.min(1, Math.max(0, (y + 220) / 160));
        let vertColor;
        if (normY > 0.5) {
          vertColor = PALETTE.slopeColor.clone().lerp(PALETTE.crestColor, (normY - 0.5) * 2);
        } else {
          vertColor = PALETTE.troughColor.clone().lerp(PALETTE.slopeColor, normY * 2);
        }

        waveColors[idx * 3] = vertColor.r;
        waveColors[idx * 3 + 1] = vertColor.g;
        waveColors[idx * 3 + 2] = vertColor.b;

        idx++;
      }
    }

    waveGeometry.attributes.position.needsUpdate = true;
    waveGeometry.attributes.color.needsUpdate = true;
    if (waveLineGeometry) {
      waveLineGeometry.attributes.position.needsUpdate = true;
    }

    // 2. Rotate & Animate Neural Nexus Core
    if (nexusGroup) {
      nexusGroup.rotation.y = time * 0.12 + mouse.x * 0.35;
      nexusGroup.rotation.x = Math.sin(time * 0.25) * 0.08 - mouse.y * 0.2;
      nexusGroup.position.y = 110 + Math.sin(time * 0.8) * 14;

      // Update impulse action potentials traveling through synapses
      const nodePosAttr = nexusNodes.geometry.attributes.position.array;
      const impPosAttr = impulseParticles.geometry.attributes.position.array;

      for (let i = 0; i < impulses.length; i++) {
        const imp = impulses[i];
        imp.progress += imp.speed;

        if (imp.progress >= 1) {
          imp.progress = 0;
          imp.from = imp.to;
          const conns = nexusNodeData[imp.from].connections;
          imp.to = conns.length > 0 ? conns[Math.floor(Math.random() * conns.length)] : Math.floor(Math.random() * NEXUS_COUNT);
        }

        const fx = nodePosAttr[imp.from * 3];
        const fy = nodePosAttr[imp.from * 3 + 1];
        const fz = nodePosAttr[imp.from * 3 + 2];

        const tx = nodePosAttr[imp.to * 3];
        const ty = nodePosAttr[imp.to * 3 + 1];
        const tz = nodePosAttr[imp.to * 3 + 2];

        impPosAttr[i * 3] = fx + (tx - fx) * imp.progress;
        impPosAttr[i * 3 + 1] = fy + (ty - fy) * imp.progress;
        impPosAttr[i * 3 + 2] = fz + (tz - fz) * imp.progress;
      }
      impulseParticles.geometry.attributes.position.needsUpdate = true;
    }

    // 3. Slowly drift Volumetric Stardust
    if (dustPoints) {
      dustPoints.rotation.y = time * 0.02;
      dustPoints.rotation.x = Math.cos(time * 0.015) * 0.03;
    }

    renderer.render(scene, camera);
  }

  // --- FALLBACK 2D CANVAS IF WEBGL IS DISABLED ---
  function initFallback2D() {
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const particles = [];
    const particleCount = Math.min(Math.floor(width / 16), 65);

    class FallbackParticle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.8;
        this.vy = (Math.random() - 0.5) * 0.8;
        this.radius = Math.random() * 2 + 1;
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#00f2fe';
        ctx.fill();
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > width) this.vx = -this.vx;
        if (this.y < 0 || this.y > height) this.vy = -this.vy;
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new FallbackParticle());
    }

    function animate2D() {
      ctx.clearRect(0, 0, width, height);
      particles.forEach((p) => {
        p.update();
        p.draw();
      });
      requestAnimationFrame(animate2D);
    }
    animate2D();
  }

  // Start 3D Engine
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
