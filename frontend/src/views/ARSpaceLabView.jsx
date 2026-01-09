import React, { useState, useRef, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { XR, createXRStore, XRHitTest } from '@react-three/xr'; // Use Component
import { OrbitControls, Text, useGLTF, DeviceOrientationControls } from '@react-three/drei';
import { useDrag } from '@use-gesture/react';
import { Box, Scan, ArrowLeft, Globe, Satellite, Zap, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import * as THREE from 'three';

// --- XR Store ---
const store = createXRStore({
  features: ['hit-test', 'dom-overlay'],
  domOverlay: true
});

// --- Configuration ---
const AR_MODELS = {
  Planets: [
    { 
      id: 'earth', 
      name: 'Earth', 
      url: '/models/earth.glb', 
      scale: 0.2, // Reduced for table-top
      type: 'Terrestrial Planet',
      purpose: 'Sustaining Life',
      impact: 'The only known astronomical object to harbor life. Its magnetic field protects us from solar radiation.'
    },
    { 
      id: 'moon', 
      name: 'Moon', 
      url: '/models/moon.glb', 
      scale: 0.15,
      type: 'Natural Satellite',
      purpose: 'Tides & Stability',
      impact: 'Stabilizes Earth\'s axial tilt, creating a stable climate. Controls ocean tides.'
    },
    { 
      id: 'mars', 
      name: 'Mars', 
      url: '/models/mars.glb', 
      scale: 0.18,
      type: 'Terrestrial Planet',
      purpose: 'Potential Habitation',
      impact: 'The most likely candidate for future human colonization. Contains water ice and signs of ancient rivers.'
    }
  ],
  Satellites: [
    { 
      id: 'hubble', 
      name: 'Hubble', 
      url: '/models/hubble.glb', 
      scale: 0.1,
      type: 'Space Telescope',
      purpose: 'Deep Space Observation',
      impact: 'Revolutionized astronomy by capturing iconic images of nebulae, galaxies, and the deep universe.'
    },
    { 
      id: 'gps', 
      name: 'GPS', 
      url: '/models/gps.glb', 
      scale: 0.1,
      type: 'Navigation Satellite',
      purpose: 'Global Positioning',
      impact: 'Enables precise navigation for cars, phones, and planes across the globe.'
    }
  ],
  Stations: [
    { 
      id: 'iss', 
      name: 'ISS', 
      url: '/models/iss.glb', 
      scale: 0.08,
      type: 'Space Station',
      purpose: 'Scientific Research',
      impact: 'A microgravity lab where international crews conduct experiments not possible on Earth.'
    }
  ]
};

// --- Components ---

// Update imports to include useGesture
import { useGesture } from '@use-gesture/react';
import { X } from 'lucide-react';

const InteractiveModel = ({ url, initialScale, position, rotation, scaleFactor, onSelect, isGhost = false }) => {
  const { scene } = useGLTF(url);
  const ref = useRef();
  
  const finalScale = initialScale * scaleFactor;

  // Clone scene for Ghost to avoid modifying cached GLTF
  const ghostScene = React.useMemo(() => {
      if (!isGhost) return scene;
      const clone = scene.clone();
      clone.traverse((child) => {
          if (child.isMesh) {
              child.material = child.material.clone();
              child.material.transparent = true;
              child.material.opacity = 0.5;
              child.material.color.setHex(0x00ffff); // Cyan tint
              child.material.wireframe = true; // Optional: Wireframe for "Hologram" feel
          }
      });
      return clone;
  }, [scene, isGhost]);

  return (
    <primitive 
      ref={ref}
      object={isGhost ? ghostScene : scene} 
      position={position} 
      rotation={rotation}
      scale={[finalScale, finalScale, finalScale]}
      onClick={(e) => {
          if (isGhost) return;
          e.stopPropagation();
          onSelect();
      }}
    >
      {/* Selection Highlight (optional, simplified) */}
    </primitive>
  );
};

// Error Boundary
class ErrorBoundary extends React.Component {
    constructor(props) { super(props); this.state = { hasError: false }; }
    static getDerivedStateFromError(error) { return { hasError: true }; }
    render() { if (this.state.hasError) return this.props.fallback || null; return this.props.children; }
}

const ARScene = ({ activeModel, isPlaced, setIsPlaced, placedPosition, setPlacedPosition, modelRotation, modelScale, onModelSelect }) => {
    const isPresenting = useThree((state) => state.gl.xr.isPresenting);

    return (
        <>
            <ambientLight intensity={1} />
            <directionalLight position={[5, 10, 5]} intensity={2} />
            
            {/* Simulation Mode (Desktop): Show model immediately */}
            {!isPresenting && (
                <ErrorBoundary fallback={<mesh position={[0,0,-2]}><boxGeometry/><meshBasicMaterial color="red"/></mesh>}>
                    <Suspense fallback={null}>
                        <InteractiveModel 
                            url={activeModel.url} 
                            initialScale={activeModel.scale} 
                            position={[0, 0, -2]}
                            rotation={modelRotation}
                            scaleFactor={modelScale}
                            onSelect={onModelSelect}
                        />
                    </Suspense>
                </ErrorBoundary>
            )}

            {/* AR Mode */}
            {isPresenting && !isPlaced && (
                <XRHitTest 
                    mode="point" 
                    onSelect={(e) => {
                         // This fires when user taps automatically if hit test is valid
                         // The event typically contains the hit matrix, but R3F XR component handles positioning its children.
                         // We just need to capture the current position. 
                         // However, XRHitTest children are *inside* the hit group.
                         // So we just set setIsPlaced(true) and maybe capture world position?
                         // Actually, simplify: Just setIsPlaced(true).
                         // We need to know WHERE. 
                         // The e.target is the hit test source? 
                         // In R3F XR v6, to place efficiently, we often use the matrices.
                         // But for simplicity in this codebase, let's assume grabbing E.point (world position) works if available.
                         // If not, we might need a different approach.
                         // Let's rely on `placedPosition` update logic if we had one, 
                         // OR: We use the fact that <XRHitTest> moves its children.
                         // So if we tap, we want to STOP using XRHitTest and START rendering normally at that location.
                         // PROBLEM: 'e.point' might not be available on SelectEvent directly in all implementations.
                         // WORKAROUND: We can use a ref in the Ghost logic to capture its world position on every frame?
                         // Better: e.point IS usually available in hit-test results.
                         if (e.point) {
                            setPlacedPosition(e.point);
                            setIsPlaced(true);
                         }
                    }}
                >
                    {/* Ghost Model Preview */}
                     <Suspense fallback={null}>
                        <InteractiveModel 
                            url={activeModel.url} 
                            initialScale={activeModel.scale} 
                            position={[0, 0, 0]} // Relative to hit test
                            rotation={[0, 0, 0]}
                            scaleFactor={1}
                            onSelect={() => {}} // No select on ghost
                            isGhost={true}
                        />
                    </Suspense>
                    <mesh rotation-x={-Math.PI / 2}>
                        <circleGeometry args={[0.05, 32]} />
                        <meshBasicMaterial color="white" opacity={0.5} transparent />
                    </mesh>
                </XRHitTest>
            )}

            {isPresenting && isPlaced && placedPosition && (
                 <ErrorBoundary fallback={null}>
                     <Suspense fallback={null}>
                         <InteractiveModel 
                            url={activeModel.url} 
                            initialScale={activeModel.scale} 
                            position={placedPosition}
                            rotation={modelRotation}
                            scaleFactor={modelScale}
                            onSelect={onModelSelect}
                         />
                     </Suspense>
                 </ErrorBoundary>
            )}
        </>
    );
};

// --- Info Panel Component ---
const InfoPanel = ({ model, onClose }) => {
    if (!model) return null;

    return (
        <div className="absolute bottom-0 left-0 w-full p-4 z-50 animate-slide-up">
            <div className="bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-white shadow-2xl relative overflow-hidden">
                {/* Close Button */}
                <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="absolute top-4 right-4 p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors pointer-events-auto">
                    <X size={20} />
                </button>

                {/* Content */}
                <div className="flex flex-col gap-2 relative z-10">
                    <div className="inline-flex items-center gap-2">
                        <span className="px-2 py-0.5 roundedElement bg-cyan-500/20 text-cyan-300 text-[10px] uppercase font-mono tracking-wider border border-cyan-500/30">
                            {model.type}
                        </span>
                    </div>
                    
                    <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                        {model.name}
                    </h2>

                    <div className="h-px w-full bg-gradient-to-r from-white/20 to-transparent my-1" />

                    <div className="grid grid-cols-1 gap-4 mt-2">
                        <div>
                            <h3 className="text-xs font-mono text-gray-400 uppercase tracking-widest mb-1">Mission / Purpose</h3>
                            <p className="text-sm font-light leading-relaxed">{model.purpose}</p>
                        </div>
                        <div>
                            <h3 className="text-xs font-mono text-cyan-400 uppercase tracking-widest mb-1">Human Impact</h3>
                            <p className="text-sm font-light leading-relaxed text-gray-200">{model.impact}</p>
                        </div>
                    </div>
                </div>

                {/* Decorative Background Elements */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-blue-600" />
            </div>
            
            <style>{`
                @keyframes slide-up {
                    from { transform: translateY(100%); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .animate-slide-up {
                    animation: slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
            `}</style>
        </div>
    );
};

const ARSpaceLabView = () => {
  /* State */
  const [isARSupported, setIsARSupported] = useState(false);
  const [activeCategory, setActiveCategory] = useState('Planets');
  const [activeModel, setActiveModel] = useState(AR_MODELS['Planets'][0]);
  const [isPlaced, setIsPlaced] = useState(false);
  const [placedPosition, setPlacedPosition] = useState(null);
  const [useGyro, setUseGyro] = useState(false); // Fallback mode
  const [showInfo, setShowInfo] = useState(false);
  const [isInAR, setIsInAR] = useState(false); // Track AR session state

  // Lifted State for Interactions
  const [modelRotation, setModelRotation] = useState([0, 0, 0]);
  const [modelScale, setModelScale] = useState(1);

  // Global Interaction Bindings
  // Enable custom gestures in all modes (Desktop, Gyro, AR) unless Info Panel is open.
  const gesturesEnabled = !showInfo;

  const bind = useGesture({
    onDrag: ({ offset: [x, y], pinching }) => {
      if (pinching) return;
      setModelRotation([y * 0.01, x * 0.01, 0]);
    },
    onPinch: ({ offset: [s] }) => {
      setModelScale(s);
    }
  }, {
    drag: { from: () => [modelRotation[1] * 100, modelRotation[0] * 100] }, 
    pinch: { scaleBounds: { min: 0.5, max: 3 }, rubberband: true },
    enabled: gesturesEnabled 
  });

  useEffect(() => {
    if ('xr' in navigator) {
      navigator.xr.isSessionSupported('immersive-ar')
        .then((supported) => {
             console.log("XR Supported:", supported);
             setIsARSupported(supported);
        })
        .catch((e) => console.error("XR Check Error:", e));
    } else {
        console.log("WebXR not found in navigator");
    }
  }, []);

  const handleEnterAR = async () => {
      console.log("Attempting to enter AR...");
      try {
          await store.enterAR();
          setIsInAR(true); // Enable custom gestures
          console.log("Entered AR Session");
      } catch (e) {
          console.error("Failed to enter AR:", e);
          const confirmFallback = window.confirm(
              "ARCore not found on this device.\n\nSwitch to '3D Gyro Mode' instead? (You can move your phone to look around)"
          );
          if (confirmFallback) {
              setUseGyro(true);
          }
      }
  };

  const handleReset = () => {
      setIsPlaced(false);
      setPlacedPosition(null);
      setModelRotation([0,0,0]);
      setModelScale(1);
      setShowInfo(false);
      // Don't reset isInAR or useGyro here potentially? 
      // If user resets Placement, they are still in AR session.
  };

  const onModelSelect = () => {
      console.log("Model Selected! Showing Info...");
      setShowInfo(true);
  };

  return (
    <div {...bind()} className="relative w-full h-screen bg-black overflow-hidden font-sans touch-none">
      
      {/* UI Layer - Pointer Events managed carefully */}
      
      {/* HUD: Back & Info */}
      <div className="absolute top-0 left-0 w-full p-6 z-40 pointer-events-none">
        <div className="flex justify-between items-start pointer-events-auto" onPointerDown={(e) => e.stopPropagation()}>
             <Link to="/dashboard" className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors bg-black/50 px-3 py-1 rounded-lg backdrop-blur-sm">
                <ArrowLeft size={16} />
                <span className="font-mono text-xs tracking-widest">EXIT</span>
            </Link>
             {isPlaced && (
                <button onClick={handleReset} className="flex items-center gap-2 text-white hover:text-cyan-400 transition-colors bg-black/50 px-3 py-1 rounded-lg backdrop-blur-sm">
                    <RefreshCw size={14} />
                    <span className="font-mono text-xs tracking-widest">RESET</span>
                </button>
            )}
        </div>
      </div>
      
       {/* Info Panel Overlay - Stop Propagation to prevent gestures */}
       {showInfo && (
           <div className="absolute inset-0 z-50 flex items-end pointer-events-auto" onPointerDown={(e) => e.stopPropagation()} onTouchStart={(e) => e.stopPropagation()}>
               <InfoPanel model={activeModel} onClose={() => setShowInfo(false)} />
           </div>
       )}

       {/* Bottom Selection UI */}
       <div 
            className={`absolute bottom-24 left-0 w-full z-40 px-4 flex flex-col gap-4 pointer-events-none transition-opacity ${showInfo ? 'opacity-0' : 'opacity-100'}`}
       >
          <div className="flex justify-center gap-2 pointer-events-auto overflow-x-auto pb-2 scrollbar-hide" onPointerDown={(e) => e.stopPropagation()}>
              <CategoryTab label="Planets" icon={Globe} active={activeCategory === 'Planets'} onClick={() => setActiveCategory('Planets')} />
              <CategoryTab label="Satellites" icon={Satellite} active={activeCategory === 'Satellites'} onClick={() => setActiveCategory('Satellites')} />
              <CategoryTab label="Stations" icon={Zap} active={activeCategory === 'Stations'} onClick={() => setActiveCategory('Stations')} />
          </div>

          <div className="flex justify-center gap-3 pointer-events-auto overflow-x-auto pb-2 scrollbar-hide snap-x" onPointerDown={(e) => e.stopPropagation()}>
               {AR_MODELS[activeCategory].map(model => (
                   <ModelCard 
                        key={model.id} 
                        model={model} 
                        active={activeModel.id === model.id} 
                        onClick={(e) => {
                            e.stopPropagation(); // Prevent drag triggering
                            setActiveModel(model);
                            setIsPlaced(false);
                            setModelRotation([0,0,0]);
                            setModelScale(1);
                            setShowInfo(false);
                        }} 
                    />
               ))}
          </div>
      </div>

      {isARSupported && !useGyro && !showInfo && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-50">
           <button 
             onClick={(e) => { e.stopPropagation(); handleEnterAR(); }}
             className="px-6 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-full shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all text-sm tracking-wider border-none cursor-pointer"
           >
             ENTER AR
           </button>
        </div>
      )}

      {useGyro && (
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none">
             <div className="bg-cyan-900/50 backdrop-blur px-4 py-2 rounded-full border border-cyan-400/30 text-cyan-200 text-xs font-mono">
                 GYRO MODE ACTIVE
             </div>
          </div>
      )}

      {/* Force low DPR for performance on mobile AR */}
      <Canvas dpr={1}>
        <XR store={store}>
            <ARScene 
                activeModel={activeModel} 
                isPlaced={isPlaced} 
                setIsPlaced={setIsPlaced}
                placedPosition={placedPosition}
                setPlacedPosition={setPlacedPosition}
                modelRotation={modelRotation}
                modelScale={modelScale}
                onModelSelect={onModelSelect}
            />
            {/* Controls Logic */}
            {/* Simulation Mode: If using custom gestures (gesturesEnabled), we disable OrbitControls rotation so drag rotates the MODEL, not the CAMERA. */}
            {/* But we might want Zoom? Custom gestures handle pinch zoom. Desktop scroll zoom is OrbitControls. */}
            {/* Let's try: Enable OrbitControls but disable ROTATE if gestures are on? No, useGestures captures drag. */}
            {/* Safest bet: If gesturesEnabled, NO OrbitControls. User cannot move camera, only rotate object. This matches "Laboratory" feel. */}
            {!store.inAR && !useGyro && !gesturesEnabled && <OrbitControls makeDefault />} 
            {!store.inAR && useGyro && <DeviceOrientationControls />}
        </XR>
      </Canvas>

      {!isARSupported && !useGyro && (
          <div className="absolute top-20 right-6 text-right pointer-events-none">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-md">
                 <Scan size={12} className="text-amber-500" />
                 <span className="text-[10px] font-mono text-amber-500">SIMULATION MODE</span>
              </div>
          </div>
      )}
    </div>
  );
};


// Keep helpers exact same
const CategoryTab = ({ label, icon: Icon, active, onClick }) => (
    <button onClick={onClick} className={`flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md transition-all pointer-events-auto ${active ? 'bg-cyan-500/20 border border-cyan-400 text-white' : 'bg-black/40 border border-white/10 text-white/50 hover:bg-white/10'}`}>
        <Icon size={16} /> <span className="text-xs font-mono uppercase tracking-wider">{label}</span>
    </button>
);
const ModelCard = ({ model, active, onClick }) => (
    <button onClick={onClick} className={`flex flex-col items-center p-3 rounded-xl backdrop-blur-md transition-all w-24 border pointer-events-auto ${active ? 'bg-cyan-500/20 border-cyan-400' : 'bg-black/40 border-white/5 hover:border-white/20'}`}>
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-900 to-black mb-2 flex items-center justify-center"><Box size={16} className={active ? "text-cyan-300" : "text-gray-500"} /></div>
        <span className={`text-[10px] font-mono text-center leading-tight ${active ? 'text-white' : 'text-gray-400'}`}>{model.name}</span>
    </button>
);

export default ARSpaceLabView;
