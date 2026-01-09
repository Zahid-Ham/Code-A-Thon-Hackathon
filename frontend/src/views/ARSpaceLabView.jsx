import React, { useState, useRef, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { XR, createXRStore, XRHitTest } from '@react-three/xr';
import { OrbitControls, Text, useGLTF, DeviceOrientationControls } from '@react-three/drei';
import { useGesture } from '@use-gesture/react';
import { Box, Scan, ArrowLeft, Globe, Satellite, Zap, RefreshCw, X } from 'lucide-react';
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
      impact: 'The most likely candidate for future human colonization. Contains water ice and signs of ancient rivers.',
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

// OPTIMIZATION: Removed aggressive pre-loading of 50MB+ assets to prevent network congestion.
// Assets will load on-demand with a beautiful "Constructing..." state.

// Material Downgrade Utility for Mobile Performance
const optimizeMaterials = (scene) => {
    scene.traverse((child) => {
        if (child.isMesh) {
            // Disable expensive shadows
            child.castShadow = false;
            child.receiveShadow = false;

            // Simplify materials
            if (child.material) {
                // Lower precision
                child.material.precision = 'mediump';
                // Disable extensive lighting calcs if possible
                child.material.flatShading = false;
                
                // Reduce texture quality overhead
                if (child.material.map) {
                    child.material.map.anisotropy = 1; // Disable anisotropic filtering
                    child.material.map.generateMipmaps = false; 
                    child.material.map.minFilter = THREE.LinearFilter; // Faster sampling
                }
            }
        }
    });
};

const InteractiveModel = ({ url, initialScale, position, rotation, scaleFactor, onSelect }) => {
  const { scene } = useGLTF(url);
  const ref = useRef();
  
  // Optimize scene ONCE when loaded
  React.useLayoutEffect(() => {
      optimizeMaterials(scene);
  }, [scene]);

  const finalScale = initialScale * scaleFactor;

  // Clone scene to allow independent instances if needed, or just use primitive if single instance
  // Using primitive with the cached scene is more memory efficient if we don't need unique mutations per instance
  
  return (
    <primitive 
      ref={ref}
      object={scene} 
      position={position} 
      rotation={rotation}
      scale={[finalScale, finalScale, finalScale]}
      onClick={(e) => {
          e.stopPropagation();
          onSelect();
      }}
    />
  );
};

// Loading State: A pulsing "Constructing" hologram that appears while the heavy model downloads
const LoadingHologram = ({ position, scale = 1 }) => {
    const ref = useRef();
    useFrame((state) => {
        if (ref.current) {
            // Spin and Pulse
            ref.current.rotation.y += 0.05;
            ref.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 5) * 0.1);
        }
    });

    return (
        <group position={position}>
             <mesh ref={ref}>
                <sphereGeometry args={[0.2, 16, 16]} />
                <meshBasicMaterial color="#00ffff" wireframe transparent opacity={0.3} />
            </mesh>
            {/* "Loading" text could go here, or just the visual cue */}
             <mesh rotation-x={-Math.PI / 2}>
                <ringGeometry args={[0.15, 0.16, 32]} />
                <meshBasicMaterial color="cyan" transparent opacity={0.5} />
            </mesh>
        </group>
    );
};

// Reticle Component: Lives INSIDE XRHitTest component to visualize position
// and reports world position to parent for "Tap Anywhere" logic via Ref.
const ReticleContent = ({ setHitPoint }) => {
    const ref = useRef();
    
    // Continuously update the shared ref with current reticle position
    useFrame(() => {
        if (ref.current) {
            const vec = new THREE.Vector3();
            ref.current.getWorldPosition(vec);
            // Update the global ref so the click handler knows where to place
            setHitPoint(vec);
        }
    });

    return (
        <group ref={ref}>
             {/* Performance Optimization: Lightweight Ghost (Wireframe Sphere) */}
            <mesh position={[0, 0.1, 0]} rotation-x={-Math.PI / 2}>
                <sphereGeometry args={[0.1, 16, 16]} />
                <meshBasicMaterial color="#00ffff" wireframe transparent opacity={0.6} />
            </mesh>
             {/* Ground Marker */}
             <mesh rotation-x={-Math.PI / 2}>
                <ringGeometry args={[0.08, 0.1, 32]} />
                <meshBasicMaterial color="white" opacity={0.8} transparent />
            </mesh>
            <mesh rotation-x={-Math.PI / 2}>
                    <circleGeometry args={[0.02, 32]} />
                    <meshBasicMaterial color="cyan" />
            </mesh>
        </group>
    );
};


// Error Boundary
class ErrorBoundary extends React.Component {
    constructor(props) { super(props); this.state = { hasError: false }; }
    static getDerivedStateFromError(error) { return { hasError: true }; }
    render() { if (this.state.hasError) return this.props.fallback || null; return this.props.children; }
}

const ARScene = ({ activeModel, isPlaced, setIsPlaced, placedPosition, setPlacedPosition, modelRotation, modelScale, onModelSelect, setHitPoint }) => {
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
                <XRHitTest mode="point" onSelect={() => {
                   // Global handler preferred
                }}>
                    <ReticleContent setHitPoint={setHitPoint} />
                </XRHitTest>
            )}

            {isPresenting && isPlaced && placedPosition && (
                 <ErrorBoundary fallback={null}>
                     {/* Progressive Loading: Show "Constructing" hologram while fetching 35MB model */}
                     <Suspense fallback={<LoadingHologram position={placedPosition} />}>
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

// ... InfoPanel Component ...
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

  // Hit Point Ref for Reticle communication
  const hitPointRef = useRef(null);
  const setHitPoint = (point) => {
      hitPointRef.current = point;
  };

  // Lifted State for Interactions
  const [modelRotation, setModelRotation] = useState([0, 0, 0]);
  const [modelScale, setModelScale] = useState(1);

  // Global Interaction Bindings
  const gesturesEnabled = !showInfo;

  const bind = useGesture({
    onDrag: ({ offset: [x, y], pinching }) => {
      if (pinching) return;
      setModelRotation([y * 0.01, x * 0.01, 0]);
    },
    onPinch: ({ offset: [s] }) => {
      setModelScale(s);
    },
    // Handle Tap for Placement - GLOBAL LISTENER on the container
    onClick: ({ event }) => {
        // If in AR, not placed, and we have a valid hit point -> PLACE IT.
        if (isInAR && !isPlaced && hitPointRef.current) {
            console.log("Tap Detected via useGesture! Placing Model at:", hitPointRef.current);
            setPlacedPosition(hitPointRef.current);
            setIsPlaced(true);
        }
    }
  }, {
    drag: { from: () => [modelRotation[1] * 100, modelRotation[0] * 100] }, 
    pinch: { scaleBounds: { min: 0.2, max: 10 }, rubberband: true },
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
      hitPointRef.current = null; // Reset reticle tracking
      setModelRotation([0,0,0]);
      setModelScale(1);
      setShowInfo(false);
  };

  const onModelSelect = () => {
      console.log("Model Selected! Showing Info...");
      setShowInfo(true);
  };

  return (
    <div {...bind()} className="relative w-full h-screen bg-black overflow-hidden font-sans touch-none">
      
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
      
       {/* Info Panel Overlay */}
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

      {/* Force low DPR and disable Antialiasing for performance on mobile AR */}
      <Canvas dpr={1} gl={{ antialias: false, precision: 'mediump' }}>
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
                setHitPoint={setHitPoint}
            />
            {/* Controls Logic */}
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
