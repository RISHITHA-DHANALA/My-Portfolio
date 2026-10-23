import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

// Procedural Circuit / Noise Canvas Texture for PBR Surface Details
function createProceduralCircuitTexture() {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  // Dark metallic background
  ctx.fillStyle = "#111827";
  ctx.fillRect(0, 0, size, size);

  // Micro circuit grid
  ctx.strokeStyle = "#1f2937";
  ctx.lineWidth = 1;
  const step = 32;
  for (let x = 0; x < size; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, size);
    ctx.stroke();
  }
  for (let y = 0; y < size; y += step) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(size, y);
    ctx.stroke();
  }

  // Cyan and ice blue conductive trace paths
  ctx.strokeStyle = "#7cc4ff";
  ctx.lineWidth = 2;
  ctx.shadowColor = "#38bdf8";
  ctx.shadowBlur = 6;

  for (let i = 0; i < 28; i++) {
    const x0 = (Math.floor(Math.random() * (size / step)) * step);
    const y0 = (Math.floor(Math.random() * (size / step)) * step);
    const len = (Math.floor(Math.random() * 4) + 2) * step;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    if (Math.random() > 0.5) {
      ctx.lineTo(x0 + len, y0);
      ctx.lineTo(x0 + len, y0 + step);
    } else {
      ctx.lineTo(x0, y0 + len);
      ctx.lineTo(x0 + step, y0 + len);
    }
    ctx.stroke();

    // Node solder pads
    ctx.fillStyle = "#e0f2fe";
    ctx.beginPath();
    ctx.arc(x0, y0, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Procedural Soft Radial Contact Shadow Texture
function createContactShadowTexture() {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, "rgba(0, 0, 0, 0.65)");
  gradient.addColorStop(0.35, "rgba(0, 0, 0, 0.35)");
  gradient.addColorStop(0.7, "rgba(0, 0, 0, 0.12)");
  gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

const FINISHES = {
  midnight: {
    name: "Midnight Titanium",
    metalness: 0.95,
    roughness: 0.18,
    primaryColor: 0x1e293b,
    accentColor: 0x7cc4ff,
    crystalColor: 0x93c5fd,
    emissive: 0x0284c7,
  },
  gold: {
    name: "Cyber Gold",
    metalness: 0.92,
    roughness: 0.22,
    primaryColor: 0xd97706,
    accentColor: 0xfde047,
    crystalColor: 0xfef08a,
    emissive: 0xb45309,
  },
  chrome: {
    name: "Obsidian Platinum",
    metalness: 0.98,
    roughness: 0.1,
    primaryColor: 0x0f172a,
    accentColor: 0xa5f3fc,
    crystalColor: 0x6ee7b7,
    emissive: 0x059669,
  },
};

export default function ThreeDScene({ isFullScreen = false, onClose }) {
  const containerRef = useRef(null);
  const [exploded, setExploded] = useState(0); // 0 to 1
  const [finishKey, setFinishKey] = useState("midnight");
  const [lightingMode, setLightingMode] = useState("studio"); // studio | cyber | space
  const [autoRotate, setAutoRotate] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Mutable refs for animation loop (Zero GC)
  const animRef = useRef({
    targetExploded: 0,
    currentExploded: 0,
    autoRotate: true,
  });

  const partsRef = useRef([]);
  const materialsRef = useRef({});
  const lightsRef = useRef({});
  const controlsRef = useRef(null);
  const cameraRef = useRef(null);

  useEffect(() => {
    animRef.current.targetExploded = exploded;
  }, [exploded]);

  useEffect(() => {
    animRef.current.autoRotate = autoRotate;
  }, [autoRotate]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Detect software WebGL guard
    const isSoftwareGl = (() => {
      const gl = document.createElement("canvas").getContext("webgl2");
      if (!gl) return true;
      const ext = gl.getExtension("WEBGL_debug_renderer_info");
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // 2. Setup Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x070d1f);
    scene.fog = new THREE.FogExp2(0x070d1f, 0.045);

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || 550;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(4.5, 3.2, 5.2);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // 3. Studio Environment Reflection (RoomEnvironment + PMREMGenerator)
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 4. OrbitControls with silky exponential damping
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.06;
    controls.maxDistance = 14;
    controls.minDistance = 2.2;
    controls.maxPolarAngle = Math.PI / 2 + 0.05; // Don't go below ground
    controls.target.set(0, 1.2, 0);
    controlsRef.current = controls;

    // 5. Studio Lighting Rig (Key, Fill, Rim)
    const keyLight = new THREE.DirectionalLight(0xfff6e6, 2.4);
    keyLight.position.set(5, 7, 4);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 20;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    const d = 3.5;
    keyLight.shadow.camera.left = -d;
    keyLight.shadow.camera.right = d;
    keyLight.shadow.camera.top = d;
    keyLight.shadow.camera.bottom = -d;
    scene.add(keyLight);

    const hemiLight = new THREE.HemisphereLight(0x7cc4ff, 0x0a1128, 1.0);
    scene.add(hemiLight);

    const rimLight = new THREE.PointLight(0x38bdf8, 3.5, 12);
    rimLight.position.set(-4, 3, -3);
    scene.add(rimLight);

    lightsRef.current = { keyLight, hemiLight, rimLight };

    // 6. Assemble Composite 3–12 Part Procedural Model (THREE.Group)
    // "Quantum Neural Processor / DRISHTI-XAI Quantum Core"
    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    const circuitTex = createProceduralCircuitTexture();
    const shadowTex = createContactShadowTexture();

    // Material definitions with PBR physical properties
    const activeFinish = FINISHES.midnight;
    const chassisMat = new THREE.MeshStandardMaterial({
      color: activeFinish.primaryColor,
      metalness: activeFinish.metalness,
      roughness: activeFinish.roughness,
      map: circuitTex,
    });

    const ringMat = new THREE.MeshStandardMaterial({
      color: activeFinish.accentColor,
      metalness: 0.9,
      roughness: 0.25,
    });

    const crystalMat = new THREE.MeshPhysicalMaterial({
      color: activeFinish.crystalColor,
      transmission: isSoftwareGl ? 0 : 0.92,
      transparent: true,
      opacity: isSoftwareGl ? 0.45 : 1,
      roughness: 0.08,
      ior: 1.76,
      thickness: 1.4,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      emissive: activeFinish.emissive,
      emissiveIntensity: 0.35,
    });

    const glowEmitterMat = new THREE.MeshBasicMaterial({
      color: 0x7cc4ff,
    });

    materialsRef.current = { chassisMat, ringMat, crystalMat, glowEmitterMat };

    // Part 1: Heavy Pedestal Base (Grounded flush with ground Y=0, pivot at bottom)
    const baseGroup = new THREE.Group();
    const baseGeo = new THREE.CylinderGeometry(1.6, 1.85, 0.25, 36);
    const baseMesh = new THREE.Mesh(baseGeo, chassisMat);
    baseMesh.position.y = 0.125;
    baseMesh.receiveShadow = true;
    baseMesh.castShadow = !isSoftwareGl;
    baseGroup.add(baseMesh);

    // Base Chamfer Bevel Ring
    const bevelGeo = new THREE.TorusGeometry(1.6, 0.04, 16, 64);
    bevelGeo.rotateX(Math.PI / 2);
    const bevelMesh = new THREE.Mesh(bevelGeo, ringMat);
    bevelMesh.position.y = 0.25;
    baseGroup.add(bevelMesh);

    rootGroup.add(baseGroup);

    // Part 2: Superconducting Magnetic Flux Ring
    const fluxGroup = new THREE.Group();
    const fluxGeo = new THREE.TorusGeometry(1.3, 0.08, 16, 48);
    fluxGeo.rotateX(Math.PI / 2);
    const fluxMesh = new THREE.Mesh(fluxGeo, ringMat);
    fluxMesh.position.y = 0.38;
    fluxGroup.add(fluxMesh);
    rootGroup.add(fluxGroup);

    // Part 3: Lower Tripod Pylon Struts (3 curved supporting arms)
    const strutsGroup = new THREE.Group();
    for (let i = 0; i < 3; i++) {
      const angle = (i * Math.PI * 2) / 3;
      const strutGeo = new THREE.CylinderGeometry(0.06, 0.09, 0.9, 16);
      const strutMesh = new THREE.Mesh(strutGeo, chassisMat);
      strutMesh.position.set(Math.cos(angle) * 1.05, 0.72, Math.sin(angle) * 1.05);
      strutMesh.rotation.z = Math.cos(angle) * 0.22;
      strutMesh.rotation.x = -Math.sin(angle) * 0.22;
      strutMesh.castShadow = !isSoftwareGl;
      strutsGroup.add(strutMesh);
    }
    rootGroup.add(strutsGroup);

    // Part 4: Outer Gimbal Ring (Rotates in animation)
    const outerGimbalGroup = new THREE.Group();
    outerGimbalGroup.position.y = 1.35;
    const outerRingGeo = new THREE.TorusGeometry(1.15, 0.05, 16, 64);
    const outerRingMesh = new THREE.Mesh(outerRingGeo, ringMat);
    outerRingMesh.castShadow = !isSoftwareGl;
    outerGimbalGroup.add(outerRingMesh);
    rootGroup.add(outerGimbalGroup);

    // Part 5: Inner Counter-Rotating Gimbal Ring
    const innerGimbalGroup = new THREE.Group();
    innerGimbalGroup.position.y = 1.35;
    const innerRingGeo = new THREE.TorusGeometry(0.92, 0.045, 16, 64);
    innerRingGeo.rotateY(Math.PI / 2);
    const innerRingMesh = new THREE.Mesh(innerRingGeo, ringMat);
    innerGimbalGroup.add(innerRingMesh);
    rootGroup.add(innerGimbalGroup);

    // Part 6: Hexagonal Neural Containment Cage
    const cageGroup = new THREE.Group();
    cageGroup.position.y = 1.35;
    const cageGeo = new THREE.CylinderGeometry(0.68, 0.68, 0.7, 6, 1, true);
    const cageMesh = new THREE.Mesh(cageGeo, chassisMat);
    cageMesh.castShadow = !isSoftwareGl;
    cageGroup.add(cageMesh);
    rootGroup.add(cageGroup);

    // Part 7: Central Optical Sapphire Crystal (Neural Matrix)
    const crystalGroup = new THREE.Group();
    crystalGroup.position.y = 1.35;
    const crystalGeo = new THREE.OctahedronGeometry(0.48, 0);
    const crystalMesh = new THREE.Mesh(crystalGeo, crystalMat);
    crystalMesh.castShadow = !isSoftwareGl;
    crystalGroup.add(crystalMesh);

    // Small glowing interior core point light
    const coreLight = new THREE.PointLight(0x7cc4ff, 1.8, 4);
    crystalGroup.add(coreLight);
    rootGroup.add(crystalGroup);

    // Part 8: Multi-Directional Laser Collimator Nozzles (6 radial cones)
    const nozzlesGroup = new THREE.Group();
    nozzlesGroup.position.y = 1.35;
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI * 2) / 6;
      const nozzleGeo = new THREE.ConeGeometry(0.06, 0.22, 16);
      nozzleGeo.rotateZ(-Math.PI / 2);
      const nozzleMesh = new THREE.Mesh(nozzleGeo, ringMat);
      nozzleMesh.position.set(Math.cos(angle) * 0.76, 0, Math.sin(angle) * 0.76);
      nozzleMesh.rotation.y = -angle;
      nozzlesGroup.add(nozzleMesh);
    }
    rootGroup.add(nozzlesGroup);

    // Part 9: Floating Magnetic Flux Pins (Instanced hovering orbital rods)
    const pinsGroup = new THREE.Group();
    pinsGroup.position.y = 1.35;
    const pinCount = 8;
    const pinGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.25, 8);
    for (let i = 0; i < pinCount; i++) {
      const angle = (i * Math.PI * 2) / pinCount;
      const pinMesh = new THREE.Mesh(pinGeo, ringMat);
      pinMesh.position.set(Math.cos(angle) * 1.45, (i % 2 === 0 ? 0.12 : -0.12), Math.sin(angle) * 1.45);
      pinsGroup.add(pinMesh);
    }
    rootGroup.add(pinsGroup);

    // Part 10: Ground Contact Shadow (Soft radial shadow grounded flush at Y = 0.005)
    const shadowGeo = new THREE.PlaneGeometry(4.2, 4.2);
    shadowGeo.rotateX(-Math.PI / 2);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
      opacity: 0.6,
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.position.y = 0.005;
    scene.add(shadowMesh);

    // Store parts with original positions and exploded displacement vectors
    partsRef.current = [
      { group: baseGroup, origY: 0, dirY: -0.2, dirR: 0 },
      { group: fluxGroup, origY: 0.38, dirY: -0.4, dirR: 0 },
      { group: strutsGroup, origY: 0, dirY: -0.6, dirR: 0.3 },
      { group: outerGimbalGroup, origY: 1.35, dirY: 0.3, dirR: 0.9 },
      { group: innerGimbalGroup, origY: 1.35, dirY: 0.6, dirR: 0.6 },
      { group: cageGroup, origY: 1.35, dirY: 1.1, dirR: 0 },
      { group: crystalGroup, origY: 1.35, dirY: 0, dirR: 0 },
      { group: nozzlesGroup, origY: 1.35, dirY: 0.2, dirR: 0.8 },
      { group: pinsGroup, origY: 1.35, dirY: 0, dirR: 1.2 },
    ];

    // 7. Lossless 60fps Loop with Exponential Damping & Zero GC
    let lastTime = performance.now();
    let frameId = 0;

    const clock = new THREE.Clock();

    function tick() {
      const now = performance.now();
      const delta = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;
      const elapsedTime = clock.getElapsedTime();

      // Smooth exponential damping on exploded view separation
      const targetExp = animRef.current.targetExploded;
      animRef.current.currentExploded = THREE.MathUtils.damp(
        animRef.current.currentExploded,
        targetExp,
        6.5,
        delta
      );

      const expVal = animRef.current.currentExploded;

      // Apply dynamic exploded transforms to parts
      partsRef.current.forEach(({ group, origY, dirY, dirR }) => {
        group.position.y = origY + dirY * expVal * 1.5;
        if (dirR !== 0) {
          const scale = 1 + dirR * expVal * 0.45;
          group.scale.set(scale, scale, scale);
        }
      });

      // Ambient mechanical kinematics
      outerGimbalGroup.rotation.x = elapsedTime * 0.45;
      outerGimbalGroup.rotation.y = elapsedTime * 0.2;

      innerGimbalGroup.rotation.y = -elapsedTime * 0.6;
      innerGimbalGroup.rotation.z = elapsedTime * 0.3;

      crystalGroup.rotation.y = elapsedTime * 0.8;
      crystalGroup.rotation.x = Math.sin(elapsedTime * 1.2) * 0.15;

      // Floating pins orbital kinematics
      pinsGroup.children.forEach((pin, idx) => {
        pin.position.y = (idx % 2 === 0 ? 0.12 : -0.12) + Math.sin(elapsedTime * 2 + idx) * 0.08;
      });

      // Silky OrbitControls update
      controls.autoRotate = animRef.current.autoRotate;
      controls.autoRotateSpeed = 1.2;
      controls.update();

      renderer.render(scene, camera);
      frameId = requestAnimationFrame(tick);
    }

    frameId = requestAnimationFrame(tick);

    // 8. Handle Resize
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || 550;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    // Keyboard shortcut 'H' to toggle HUD
    const handleKeyDown = (e) => {
      if (e.key === "h" || e.key === "H") {
        setIsCollapsed((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    // Cleanup on unmount
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("keydown", handleKeyDown);
      controls.dispose();
      renderer.dispose();
      scene.clear();
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Update Finishes (Material Swatches)
  const applyFinish = (key) => {
    setFinishKey(key);
    const finish = FINISHES[key];
    const { chassisMat, ringMat, crystalMat } = materialsRef.current;
    if (!finish || !chassisMat) return;

    chassisMat.color.setHex(finish.primaryColor);
    chassisMat.metalness = finish.metalness;
    chassisMat.roughness = finish.roughness;

    ringMat.color.setHex(finish.accentColor);
    ringMat.metalness = finish.metalness;

    crystalMat.color.setHex(finish.crystalColor);
    crystalMat.emissive.setHex(finish.emissive);
  };

  // Update Lighting Presets
  const applyLighting = (mode) => {
    setLightingMode(mode);
    const { keyLight, hemiLight, rimLight } = lightsRef.current;
    if (!keyLight) return;

    if (mode === "studio") {
      keyLight.color.setHex(0xfff6e6);
      keyLight.intensity = 2.4;
      hemiLight.color.setHex(0x7cc4ff);
      hemiLight.groundColor.setHex(0x0a1128);
      hemiLight.intensity = 1.0;
      rimLight.color.setHex(0x38bdf8);
      rimLight.intensity = 3.5;
    } else if (mode === "cyber") {
      keyLight.color.setHex(0x06b6d4);
      keyLight.intensity = 3.2;
      hemiLight.color.setHex(0xa855f7);
      hemiLight.groundColor.setHex(0x050814);
      hemiLight.intensity = 1.2;
      rimLight.color.setHex(0xec4899);
      rimLight.intensity = 4.5;
    } else if (mode === "space") {
      keyLight.color.setHex(0xf8fafc);
      keyLight.intensity = 3.8;
      hemiLight.color.setHex(0x1e293b);
      hemiLight.groundColor.setHex(0x020617);
      hemiLight.intensity = 0.4;
      rimLight.color.setHex(0x60a5fa);
      rimLight.intensity = 5.0;
    }
  };

  // Camera preset views
  const setCameraView = (type) => {
    const controls = controlsRef.current;
    const camera = cameraRef.current;
    if (!controls || !camera) return;

    if (type === "iso") {
      camera.position.set(4.5, 3.2, 5.2);
      controls.target.set(0, 1.2, 0);
    } else if (type === "top") {
      camera.position.set(0.01, 7.5, 0.01);
      controls.target.set(0, 1.35, 0);
    } else if (type === "front") {
      camera.position.set(0, 1.35, 5.0);
      controls.target.set(0, 1.35, 0);
    }
    controls.update();
  };

  return (
    <div
      className={`threed-viewport-container ${isFullScreen ? "fullscreen" : ""}`}
      style={{
        position: isFullScreen ? "fixed" : "relative",
        inset: isFullScreen ? 0 : "auto",
        width: "100%",
        height: isFullScreen ? "100vh" : "550px",
        overflow: "hidden",
        borderRadius: isFullScreen ? "0" : "20px",
        background: "#070d1f",
        border: isFullScreen ? "none" : "1px solid var(--line)",
        zIndex: isFullScreen ? 100 : 1,
      }}
    >
      {/* Three.js Canvas Mount */}
      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />

      {/* Top Header Badge (Minimal, Non-distracting, Static typography) */}
      <div
        className="threed-top-spec"
        style={{
          position: "absolute",
          top: "16px",
          left: "20px",
          display: "flex",
          alignItems: "center",
          gap: "0.8rem",
          background: "rgba(13, 24, 56, 0.85)",
          border: "1px solid var(--line)",
          padding: "0.45rem 0.9rem",
          borderRadius: "12px",
          color: "var(--text)",
          pointerEvents: "auto",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: "0.74rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--accent)" }}>
            Procedural 3D Model
          </span>
          <strong style={{ fontSize: "0.95rem", fontFamily: "var(--fd)" }}>
            Quantum Neural Processor (DRISHTI-XAI)
          </strong>
        </div>

        {isFullScreen && onClose && (
          <button
            type="button"
            className="iconbtn"
            onClick={onClose}
            style={{ marginLeft: "1rem", padding: "0.3rem 0.7rem", fontSize: "0.82rem" }}
          >
            ✕ Exit 3D View
          </button>
        )}
      </div>

      {/* Consolidated Ergonomic Bottom Dock (Zero Viewport Occlusion, <= 15% footprint) */}
      <div
        className={`threed-dock-wrap ${isCollapsed ? "collapsed" : ""}`}
        style={{
          position: "absolute",
          bottom: "18px",
          left: "50%",
          transform: isCollapsed ? "translate(-50%, calc(100% - 38px))" : "translate(-50%, 0)",
          transition: "transform 0.28s cubic-bezier(0.16, 1, 0.3, 1)",
          width: "min(920px, 94vw)",
          zIndex: 10,
          pointerEvents: "auto",
        }}
      >
        {/* Cinema / Zen Mode Collapse/Expand Toggle Tab */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "-1px" }}>
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            style={{
              background: "rgba(13, 24, 56, 0.95)",
              border: "1px solid var(--line)",
              borderBottom: "none",
              color: "var(--muted)",
              fontSize: "0.78rem",
              fontWeight: 600,
              padding: "0.3rem 0.9rem",
              borderRadius: "10px 10px 0 0",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.35rem",
            }}
          >
            {isCollapsed ? "▴ Show Controls (H)" : "▾ Collapse Controls (H)"}
          </button>
        </div>

        {/* Unified Bottom Control Panel */}
        <div
          style={{
            background: "rgba(13, 24, 56, 0.92)",
            border: "1px solid var(--line)",
            borderRadius: "16px",
            padding: "0.85rem 1.2rem",
            boxShadow: "0 20px 40px rgba(0, 0, 0, 0.5)",
            display: "flex",
            flexWrap: "wrap",
            gap: "1.2rem",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* 1. Exploded View Slider */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", minWidth: "220px", flex: "1" }}>
            <span style={{ fontSize: "0.82rem", color: "var(--muted)", whiteSpace: "nowrap" }}>
              Exploded View:
            </span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={exploded}
              onChange={(e) => setExploded(parseFloat(e.target.value))}
              style={{
                flex: 1,
                accentColor: "var(--accent)",
                cursor: "pointer",
              }}
              aria-label="Exploded view distance"
            />
            <span style={{ fontSize: "0.8rem", color: "var(--accent)", minWidth: "35px", fontVariantNumeric: "tabular-nums" }}>
              {Math.round(exploded * 100)}%
            </span>
          </div>

          {/* 2. Material Finishes */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ fontSize: "0.82rem", color: "var(--muted)" }}>Finish:</span>
            {Object.keys(FINISHES).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => applyFinish(key)}
                style={{
                  background: finishKey === key ? "var(--accent)" : "rgba(255, 255, 255, 0.06)",
                  color: finishKey === key ? "var(--on)" : "var(--text)",
                  border: "1px solid var(--line)",
                  borderRadius: "8px",
                  padding: "0.3rem 0.6rem",
                  fontSize: "0.78rem",
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                {FINISHES[key].name.split(" ")[0]}
              </button>
            ))}
          </div>

          {/* 3. Camera View Angles */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <span style={{ fontSize: "0.82rem", color: "var(--muted)" }}>View:</span>
            <button
              type="button"
              onClick={() => setCameraView("iso")}
              className="iconbtn"
              style={{ padding: "0.3rem 0.55rem", fontSize: "0.76rem" }}
            >
              Perspective
            </button>
            <button
              type="button"
              onClick={() => setCameraView("front")}
              className="iconbtn"
              style={{ padding: "0.3rem 0.55rem", fontSize: "0.76rem" }}
            >
              Front
            </button>
            <button
              type="button"
              onClick={() => setCameraView("top")}
              className="iconbtn"
              style={{ padding: "0.3rem 0.55rem", fontSize: "0.76rem" }}
            >
              Top
            </button>
          </div>

          {/* 4. Controls: Auto-Rotate & Lighting */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}>
            <button
              type="button"
              onClick={() => setAutoRotate(!autoRotate)}
              style={{
                background: autoRotate ? "rgba(124, 196, 255, 0.15)" : "transparent",
                color: autoRotate ? "var(--accent)" : "var(--muted)",
                border: "1px solid var(--line)",
                borderRadius: "8px",
                padding: "0.3rem 0.65rem",
                fontSize: "0.78rem",
                cursor: "pointer",
              }}
            >
              {autoRotate ? "Auto-Rotate ON" : "Rotate OFF"}
            </button>

            <select
              value={lightingMode}
              onChange={(e) => applyLighting(e.target.value)}
              aria-label="Lighting rig preset"
              style={{
                background: "rgba(13, 24, 56, 0.95)",
                color: "var(--text)",
                border: "1px solid var(--line)",
                borderRadius: "8px",
                padding: "0.28rem 0.55rem",
                fontSize: "0.78rem",
                cursor: "pointer",
              }}
            >
              <option value="studio">Studio Light</option>
              <option value="cyber">Cyber Neon</option>
              <option value="space">Deep Space</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
