import React, {
  useRef,
  useState,
  useMemo,
  useEffect,
  useLayoutEffect,
} from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Stars,
  Cloud,
  ScrollControls,
  Scroll,
  useScroll,
  Html,
  Ring,
} from "@react-three/drei"; // Added Ring
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import * as THREE from "three";
import { useSound } from "../contexts/SoundContext";
import {
  Scan,
  Crosshair,
  Cpu,
  Gauge,
  Info,
  FastForward,
  Zap,
  Shield,
  Radar,
  Activity,
} from "lucide-react"; // More icons
import {
  SCENE_SEQUENCE,
  PLANETARY_SYSTEM,
  NARRATIVE_TEXT,
} from "../config/landingConfig";

// --- VISUAL ASSETS & COMPONENTS ---

// 1. Planet Component (Procedural/Styled)
const Planet = ({ position, size, color, type, name, description }) => {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.1; // Gentle rotation
    }
  });

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[size, 64, 64]} />
        <meshStandardMaterial
          color={color}
          roughness={type === "gas_giant" ? 0.4 : 0.8}
          metalness={0.1}
          emissive={type === "atmosphere" ? color : "#000000"} // Venus glows slightly
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Saturn Rings */}
      {type === "ringed" && (
        <group rotation={[1.5, 0, 0]}>
          <Ring args={[size * 1.4, size * 2.2, 64]}>
            <meshStandardMaterial
              color="#CDB482"
              opacity={0.8}
              transparent
              side={THREE.DoubleSide}
            />
          </Ring>
        </group>
      )}

      {/* Atmosphere Glow for Gas Giants/Venus */}
      {(type === "gas_giant" || type === "atmosphere") && (
        <mesh scale={[1.1, 1.1, 1.1]}>
          <sphereGeometry args={[size, 32, 32]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.05}
            blending={THREE.AdditiveBlending}
            side={THREE.BackSide}
          />
        </mesh>
      )}

      {/* Holographic Label */}
      <Html distanceFactor={15}>
        <div
          className={`
                        pointer-events-none transition-all duration-500 w-64
                        ${
                          hovered
                            ? "opacity-100 scale-100 translate-y-0"
                            : "opacity-0 scale-90 translate-y-2"
                        }
                    `}
        >
          <div className="flex flex-col items-start pl-4 border-l-2 border-cyan-400/50 relative">
            <div className="absolute top-0 left-[-5px] w-[8px] h-[8px] border-t border-l border-cyan-400"></div>
            <div className="absolute bottom-0 left-[-5px] w-[8px] h-[8px] border-b border-l border-cyan-400"></div>

            <h4 className="text-sm font-bold font-header uppercase tracking-widest mb-1 text-cyan-300 drop-shadow-[0_0_5px_rgba(59,235,255,0.5)]">
              {name}
            </h4>
            <div className="h-[1px] w-full bg-cyan-900/50 mb-2"></div>
            <p className="text-[10px] text-cyan-100/70 font-mono leading-relaxed max-w-[200px] uppercase tracking-wide">
              {description}
            </p>
            <p className="text-[9px] text-cyan-500/50 mt-1 font-mono">
              DIST: {(Math.random() * 100).toFixed(2)} AU
            </p>
          </div>
        </div>
      </Html>
    </group>
  );
};

// 2. The Final Earth (Moved deeper)
const Earth = ({ performanceMode }) => {
  const earthRef = useRef();
  useFrame((state, delta) => {
    if (earthRef.current) earthRef.current.rotation.y += delta * 0.05;
  });

  return (
    <group position={[0, -2, -100]} ref={earthRef}>
      {/* Main Planet Body */}
      <mesh>
        <sphereGeometry args={[4, 64, 64]} />
        <meshStandardMaterial
          color="#1c4e80"
          emissive="#001f3f"
          emissiveIntensity={0.2}
          roughness={0.7}
          metalness={0.3}
        />
      </mesh>
      {/* Atmosphere/Glow */}
      {!performanceMode && (
        <mesh scale={[1.1, 1.1, 1.1]}>
          <sphereGeometry args={[4, 64, 64]} />
          <meshBasicMaterial
            color="#4fa3e3"
            transparent
            opacity={0.15}
            side={THREE.BackSide}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      )}
      <pointLight
        position={[10, 5, 10]}
        intensity={2}
        color="#ffffff"
        distance={50}
      />
      <pointLight
        position={[-10, -5, 5]}
        intensity={0.5}
        color="#0044ff"
        distance={50}
      />
    </group>
  );
};

const MovingStars = ({ scrollOffset, performanceMode, isWarping }) => {
  const starsRef = useRef();

  useFrame((state, delta) => {
    if (starsRef.current) {
      if (isWarping) {
        // Warp Effect: Stretch and Fly
        starsRef.current.scale.z = THREE.MathUtils.lerp(
          starsRef.current.scale.z,
          50,
          delta * 2
        );
        starsRef.current.rotation.z += delta * 0.5; // Spin faster
        // Increase FOV for speed sensation
        state.camera.fov = THREE.MathUtils.lerp(state.camera.fov, 120, delta);
        state.camera.updateProjectionMatrix();
      } else {
        const speedMultiplier = Math.max(0.05, 1 - scrollOffset * 2);
        starsRef.current.rotation.y += delta * 0.02 * speedMultiplier;
        starsRef.current.rotation.z += delta * 0.005 * speedMultiplier;
      }
    }
  });

  return (
    <group ref={starsRef}>
      <Stars
        radius={300}
        depth={100}
        count={performanceMode ? 3000 : 20000}
        factor={4}
        saturation={0}
        fade
        speed={isWarping ? 10 : 0.5}
      />
    </group>
  );
};

const NebulaFog = ({ performanceMode }) => {
  if (performanceMode) return null;
  return (
    <>
      <fog attach="fog" args={["#020408", 10, 90]} />
      <ambientLight intensity={0.1} />
      <pointLight position={[20, 20, 20]} intensity={1.5} color="#4c1d95" />
      <Cloud
        opacity={0.2}
        speed={0.2}
        width={60}
        depth={10}
        segments={20}
        position={[10, 0, -40]}
        color="#8b5cf6"
      />
      <Cloud
        opacity={0.1}
        speed={0.2}
        width={60}
        depth={10}
        segments={20}
        position={[-10, 5, -80]}
        color="#3b82f6"
      />
    </>
  );
};

// --- Camera & Path ---
const CameraRig = ({ setScrollOffset }) => {
  const scroll = useScroll();

  // Updated Path: Flies past all planets defined in PLANETARY_SYSTEM
  // Ends at -90 (near Earth at -100)
  const curve = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0, 5), // Start
        new THREE.Vector3(0, 0, -5), // Lift off
        new THREE.Vector3(1, 1, -15), // Near Mercury/Venus
        new THREE.Vector3(-2, 0, -40), // Mid-journey (Mars zone)
        new THREE.Vector3(2, -1, -60), // Outer Giants (Jupiter/Saturn)
        new THREE.Vector3(0, 0, -85), // Approach Earth
        new THREE.Vector3(0, 0, -90), // Orbit Earth
      ]),
    []
  );

  useFrame((state) => {
    const t = scroll.offset;
    setScrollOffset(t);

    // Direct Mapping
    const point = curve.getPointAt(t);
    state.camera.position.copy(point);

    // Look slightly ahead on curve for smooth rotation
    const tangent = curve.getTangentAt(t).normalize();

    // Smooth LookAt (dampened)
    const targetLook = point.clone().add(tangent);

    // Manual lerp for rotation to avoid rigid "on-rails" feel
    // We want the ship to feel like it's turning *towards* the path
    const dummy = new THREE.Object3D();
    dummy.position.copy(point);
    dummy.lookAt(targetLook);
    state.camera.quaternion.slerp(dummy.quaternion, 0.1);

    // Bank based on turn
    state.camera.rotation.z = THREE.MathUtils.lerp(
      state.camera.rotation.z,
      -tangent.x * 0.5,
      0.05
    );

    // Mouse Parallax (Cockpit feel)
    const { x, y } = state.pointer;
    state.camera.rotation.x -= y * 0.05;
    state.camera.rotation.y -= x * 0.05;
  });
  return null;
};

// Helper to determine the active planet based on scroll offset
const getActivePlanet = (scrollOffset) => {
  for (const planet of PLANETARY_SYSTEM) {
    if (
      scrollOffset >= planet.scrollRange[0] &&
      scrollOffset < planet.scrollRange[1]
    ) {
      return planet;
    }
  }
  return null;
};

// --- IMMERSIVE COCKPIT UI ---
const CockpitView = ({ scrollOffset }) => {
  // Opacity Logic
  let opacity = 0;
  if (scrollOffset < 0.1) opacity = scrollOffset * 10;
  else if (scrollOffset > 0.9) opacity = 1 - (scrollOffset - 0.9) * 10;
  else opacity = 1;

  const activePlanet = useMemo(
    () => getActivePlanet(scrollOffset),
    [scrollOffset]
  );

  return (
    <div
      className="absolute inset-0 z-40 pointer-events-none"
      style={{ opacity: Math.max(0, opacity) }}
    >
      {/* 1. The Physical Frame (SVG) */}
      <svg
        className="absolute inset-0 w-full h-full"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="frameGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#020408" />
            <stop offset="50%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#020408" />
          </linearGradient>
        </defs>
        {/* Top Bar */}
        <path
          d="M0,0 L100,0 L100,50 L90,60 L10,60 L0,50 Z"
          fill="url(#frameGrad)"
          className="w-full"
          transform="scale(1, 1)"
          style={{ transformOrigin: "top" }}
        />
        {/* Bottom Dashboard */}
        <path
          d="M0,1000 L1000,1000 L1000,850 L800,800 L200,800 L0,850 Z"
          fill="url(#frameGrad)"
        />
      </svg>

      <div className="absolute inset-0 opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"></div>

      {/* --- ACTIVE SCANNER HUD --- */}
      <AnimatePresence>
        {activePlanet && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.5 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] h-[320px] pointer-events-none flex items-center justify-center"
          >
            {/* Target Reticle */}
            <div className="absolute inset-0 border border-cyan-500/30 rounded-full animate-[spin_10s_linear_infinite]" />
            <div className="absolute inset-0 border-t-2 border-b-2 border-cyan-400/80 rounded-full scale-110" />
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-cyan-400 text-[10px] tracking-[0.3em] bg-black px-2">
              TARGET LOCKED
            </div>

            {/* Data Block */}
            <div className="absolute top-[110%] left-1/2 -translate-x-1/2 bg-black/60 border-l-2 border-cyan-500 p-4 w-64 backdrop-blur-md">
              <h4 className="text-xl font-bold text-cyan-100 uppercase tracking-widest mb-2 border-b border-white/10 pb-1">
                {activePlanet.name}
              </h4>
              <div className="space-y-1 font-mono text-xs text-cyan-300">
                <div className="flex justify-between border-b border-cyan-500/20 pb-1">
                  <span className="opacity-50">TEMP</span>
                  <span>{activePlanet.scanData?.temp || "ANALYZING..."}</span>
                </div>
                <div className="flex justify-between border-b border-cyan-500/20 pb-1">
                  <span className="opacity-50">GRAVITY</span>
                  <span>
                    {activePlanet.scanData?.gravity || "CALCULATING..."}
                  </span>
                </div>
                <div className="flex justify-between border-b border-cyan-500/20 pb-1">
                  <span className="opacity-50">COMPOSITION</span>
                  <span>{activePlanet.scanData?.composition || "UNKNOWN"}</span>
                </div>
                <div className="flex justify-between text-red-400 font-bold pt-1 animate-pulse">
                  <span className="opacity-70">HAZARD</span>
                  <span>{activePlanet.scanData?.hazard || "SCANNING..."}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. Dashboard UI Elements */}
      {/* Top Center: Compass/Status */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-black/80 px-6 py-2 rounded-b-xl border-b border-cyan-900 text-cyan-500 font-mono text-xs shadow-[0_0_20px_rgba(6,182,212,0.2)]">
        <span className="flex items-center gap-2">
          <Shield size={12} className="text-cyan-400" /> SHIELDS: 100%
        </span>
        <span className="w-[1px] h-4 bg-cyan-900"></span>
        <span className="flex items-center gap-2">
          <Zap size={12} className="text-yellow-400" /> POWER: NOMINAL
        </span>
        <span className="w-[1px] h-4 bg-cyan-900"></span>
        <span className="flex items-center gap-2 text-white">
          <Activity size={12} className="animate-pulse" /> CLOCK:{" "}
          {(scrollOffset * 100).toFixed(2)}
        </span>
      </div>

      {/* Bottom Left: Speed/Throttle */}
      <div className="absolute bottom-8 left-8 flex flex-col items-start gap-1 p-4 bg-black/40 backdrop-blur-sm border-l-4 border-cyan-500 rounded-r-lg skew-x-[-10deg]">
        <div className="flex items-end gap-2 text-cyan-400">
          <span className="text-4xl font-bold font-header">
            {Math.max(0, (scrollOffset + 0.1) * 29979).toFixed(0)}
          </span>
          <span className="text-sm font-mono mb-1">M/S</span>
        </div>
        <div className="w-48 h-2 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-600 to-cyan-300"
            style={{ width: `${Math.min(100, scrollOffset * 150)}%` }}
          ></div>
        </div>
        <span className="text-[10px] text-cyan-600 font-mono tracking-widest mt-1">
          THRUST OUTPUT
        </span>
      </div>

      {/* Bottom Right: Radar/Map */}
      <div className="absolute bottom-8 right-8 p-4 bg-black/40 backdrop-blur-sm border-r-4 border-cyan-500 rounded-l-lg skew-x-[10deg] flex flex-col items-end">
        <div className="w-32 h-32 border border-cyan-900/50 rounded-full relative flex items-center justify-center bg-black/60">
          <div className="absolute inset-0 rounded-full border border-cyan-800 opacity-30 animate-ping-slow"></div>
          <Radar size={24} className="text-cyan-600 opacity-50" />
          {/* Fake blips */}
          <div className="absolute top-1/4 right-1/4 w-1 h-1 bg-red-500 rounded-full animate-pulse"></div>
          <div className="absolute bottom-1/3 left-1/3 w-1 h-1 bg-yellow-500 rounded-full"></div>
        </div>
        <span className="text-[10px] text-cyan-600 font-mono tracking-widest mt-2">
          PROXIMITY SCAN
        </span>
      </div>

      {/* Center Reticle */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-60 pointer-events-none">
        <Crosshair
          className="text-cyan-300 w-8 h-8 opacity-80"
          strokeWidth={1}
        />
        {/* Reticle Decor */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-cyan-800/30 rounded-full scale-[0.8]"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-l border-r border-cyan-500/20 rounded-full scale-[1.2]"></div>
      </div>

      {/* Warning Indicator Example */}
      {/* Disabled for now as it clashes with the end screen */}
      {/* {scrollOffset > 0.8 && scrollOffset < 0.95 && (
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 text-red-500 font-mono text-xs border border-red-500/50 px-2 py-1 bg-red-900/20 animate-pulse rounded">
                    ⚠ GRAVITY WELL DETECTED
                </div>
            )} */}
    </div>
  );
};

// --- VISIBILITY HELPERS ---
const getOpacityForRange = (val, start, end, fadeBuffer = 0.05) => {
  if (val < start || val > end) return 0;
  if (val < start + fadeBuffer) return (val - start) / fadeBuffer;
  if (val > end - fadeBuffer) return (end - val) / fadeBuffer;
  return 1;
};

const AsteroidField = ({ performanceMode }) => {
  const meshRef = useRef();
  const count = performanceMode ? 500 : 2000;

  // Generate constant random data for position/rotation/scale
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 60; // Wide spread
      const y = (Math.random() - 0.5) * 20; // Vertical spread
      const z = -35 - Math.random() * 20; // Between Mars (-30) and Jupiter (-50/-60)

      // Exclude path tunnel (roughly cylinder radius 5 around 0,0)
      const dist = Math.sqrt(x * x + y * y);
      if (dist < 4) continue;

      const scale = 0.1 + Math.random() * 0.5;
      temp.push({
        position: [x, y, z],
        scale,
        rotation: [Math.random() * Math.PI, Math.random() * Math.PI, 0],
      });
    }
    return temp;
  }, [count]);

  // Update instances
  useLayoutEffect(() => {
    if (!meshRef.current) return;
    const dummy = new THREE.Object3D();
    particles.forEach((p, i) => {
      dummy.position.set(...p.position);
      dummy.scale.set(p.scale, p.scale, p.scale);
      dummy.rotation.set(...p.rotation);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [particles]);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.z += delta * 0.05; // Entire field rotates slowly
    }
  });

  return (
    <instancedMesh ref={meshRef} args={[null, null, particles.length]}>
      <dodecahedronGeometry args={[0.5, 0]} />
      <meshStandardMaterial color="#666" roughness={0.8} metalness={0.2} />
    </instancedMesh>
  );
};

// --- MAIN COMPONENT ---

const CosmicLanding = () => {
  const navigate = useNavigate();
  const { updateMix } = useSound();
  const [scrollOffset, setScrollOffset] = useState(0);
  const [performanceMode, setPerformanceMode] = useState(false);
  const [isWarping, setIsWarping] = useState(false);

  // Audio Logic
  useEffect(() => {
    const spaceVol = getOpacityForRange(scrollOffset, 0.0, 0.2, 0.1);
    const cockpitVol = getOpacityForRange(scrollOffset, 0.1, 0.8, 0.1);
    const reflectionVol = getOpacityForRange(scrollOffset, 0.7, 1.0, 0.1);

    updateMix({
      space: spaceVol,
      cockpit: cockpitVol,
      reflection: reflectionVol,
    });
  }, [scrollOffset, updateMix]);

  const handleExplore = () => {
    setIsWarping(true);
    // Optional: Play warp sound here if available
    setTimeout(() => {
      navigate("/dashboard");
    }, 2000);
  };

  // UI Opacities
  const introOpacity = getOpacityForRange(scrollOffset, 0.0, 0.08, 0.02);
  const reflect1Opacity = getOpacityForRange(scrollOffset, 0.65, 0.75, 0.03);
  const reflect2Opacity = getOpacityForRange(scrollOffset, 0.75, 0.85, 0.03);
  const finaleOpacity = getOpacityForRange(scrollOffset, 0.85, 0.95, 0.03);
  const ctaOpacity = getOpacityForRange(scrollOffset, 0.95, 1.2, 0.02);

  return (
    <div className="w-full h-screen bg-[#020408] text-white overflow-hidden relative selection:bg-cyan-500/30">
      {/* 1. Immersive Cockpit Overlay */}
      <CockpitView scrollOffset={scrollOffset} />

      {/* Warp Whiteout Overlay */}
      <div
        className={`fixed inset-0 z-[100] bg-white pointer-events-none transition-opacity duration-1000 ease-in ${
          isWarping ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* 2. Controls */}
      <div
        onClick={() => setPerformanceMode(!performanceMode)}
        className="fixed bottom-6 left-6 z-50 p-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 cursor-pointer transition-colors backdrop-blur-md"
        title={
          performanceMode ? "Enable High Quality" : "Enable Performance Mode"
        }
      >
        <Zap
          size={16}
          className={performanceMode ? "text-yellow-400" : "text-gray-500"}
        />
      </div>

      <div
        onClick={handleExplore}
        className="fixed top-6 right-6 z-50 px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-cyan-500/50 cursor-pointer transition-all backdrop-blur-md group flex items-center gap-2"
      >
        <span className="text-[10px] font-mono tracking-widest text-white/50 group-hover:text-white">
          SKIP INTRO
        </span>
        <FastForward
          size={14}
          className="text-white/50 group-hover:text-cyan-400"
        />
      </div>

      {/* 3. The 3D World */}
      <Canvas
        camera={{ position: [0, 0, 5], fov: 75 }}
        gl={{ antialias: !performanceMode }}
        dpr={performanceMode ? 1 : [1, 2]}
      >
        <ScrollControls
          pages={SCENE_SEQUENCE.scrollPages}
          damping={SCENE_SEQUENCE.damping}
        >
          <CameraRig setScrollOffset={setScrollOffset} />
          <MovingStars
            scrollOffset={scrollOffset}
            performanceMode={performanceMode}
            isWarping={isWarping}
          />
          <AsteroidField performanceMode={performanceMode} />
          <NebulaFog performanceMode={performanceMode} />

          {/* Solar System */}
          <Earth performanceMode={performanceMode} />
          {PLANETARY_SYSTEM.map((planet, idx) => (
            <Planet key={idx} {...planet} />
          ))}

          {/* Logic Only */}
          <Scroll html className="pointer-events-none" />
        </ScrollControls>
      </Canvas>

      {/* 4. Narrative Layer (Fixed above cockpit for readability, or below?) */}
      {/* Design choice: Text should obscure the view slightly or be integrated. keeping it on top for now. */}
      <div className="absolute inset-0 z-50 pointer-events-none">
        {/* Scene 1: Intro */}
        <div
          style={{ opacity: introOpacity }}
          className="fixed inset-0 flex flex-col items-center justify-center p-10 transition-opacity duration-100 ease-linear pointer-events-none"
        >
          <div className="max-w-4xl mix-blend-screen text-center">
            <h1 className="text-4xl md:text-6xl font-light tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-100 via-white to-blue-200 mb-6 font-serif italic text-shadow-lg">
              {NARRATIVE_TEXT.introMain}
            </h1>
          </div>
        </div>

        {/* Scenes 2-4: Reflections */}
        <div
          style={{ opacity: reflect1Opacity }}
          className="fixed inset-0 flex items-center justify-center text-center transition-opacity duration-100 ease-linear pointer-events-none"
        >
          <p className="text-3xl md:text-5xl font-light text-cyan-100/90 font-serif italic mb-4 drop-shadow-md">
            {NARRATIVE_TEXT.reflection1}
          </p>
        </div>

        <div
          style={{ opacity: reflect2Opacity }}
          className="fixed inset-0 flex items-center justify-center text-center transition-opacity duration-100 ease-linear pointer-events-none"
        >
          <p className="text-3xl md:text-5xl font-light text-cyan-100/90 font-serif italic mb-4 drop-shadow-md">
            {NARRATIVE_TEXT.reflection2}
          </p>
        </div>

        {/* Scene 5: Finale */}
        <div
          style={{ opacity: finaleOpacity }}
          className="fixed inset-0 flex flex-col items-center justify-center transition-opacity duration-100 ease-linear pointer-events-none"
        >
          <h2 className="text-6xl md:text-8xl font-bold font-header tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-white to-cyan-400 mb-2 drop-shadow-[0_0_50px_rgba(255,255,255,0.3)] animate-pulse-slow">
            {NARRATIVE_TEXT.finale}
          </h2>
        </div>

        {/* Scene 6: CTA */}
        <div
          style={{ opacity: ctaOpacity }}
          className="fixed inset-0 flex flex-col items-center justify-end pb-32 transition-opacity duration-100 ease-linear"
        >
          <h3 className="text-xl md:text-2xl font-light tracking-[0.2em] text-white/90 mb-8 uppercase text-center">
            {NARRATIVE_TEXT.cta}
          </h3>

          <div className="flex justify-center pointer-events-auto">
            <button
              onClick={handleExplore}
              className="group relative px-12 py-5 bg-cyan-900/60 border border-cyan-500 text-white font-mono text-sm tracking-[0.3em] uppercase hover:bg-cyan-500/40 transition-all duration-300 rounded overflow-hidden backdrop-blur-md shadow-[0_0_50px_rgba(6,182,212,0.5)]"
            >
              <span className="relative z-10 font-bold text-cyan-50 group-hover:text-white transition-colors">
                {NARRATIVE_TEXT.button}
              </span>
              <div className="absolute inset-0 bg-cyan-400/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CosmicLanding;
