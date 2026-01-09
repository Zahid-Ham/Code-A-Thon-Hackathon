import React, { useState, useRef, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { XR, createXRStore, XRHitTest } from '@react-three/xr';
import { OrbitControls, useGLTF } from '@react-three/drei';
import { useGesture } from '@use-gesture/react';
import { Box, Scan, ArrowLeft, Globe, Satellite, Zap, RefreshCw, X, Smartphone, Camera } from 'lucide-react';
import { Link } from 'react-router-dom';
import * as THREE from 'three';
import UniversalAR from '../components/UniversalAR';
import { InteractiveModel, LoadingHologram } from '../components/AR/InteractiveModel';

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
      scale: 0.2, 
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

const LogOverlay = ({ logs }) => (
    <div className="absolute top-20 left-4 z-[9999] pointer-events-none p-2 bg-black/60 text-green-400 font-mono text-[10px] w-64 h-32 overflow-hidden rounded border border-green-500/30">
        <div className="font-bold border-b border-green-500/30 mb-1">AR DEBUG LOG</div>
        <div className="flex flex-col-reverse">
            {logs.slice(-8).map((log, i) => ( <div key={i} className="whitespace-nowrap overflow-hidden text-ellipsis">{log}</div> ))}
        </div>
    </div>
);

const ReticleContent = ({ setHitPoint, addLog }) => {
    const ref = useRef();
    const frameCount = useRef(0);
    useFrame(() => {
        if (ref.current) {
            const vec = new THREE.Vector3();
            ref.current.getWorldPosition(vec);
            setHitPoint(vec);
            frameCount.current += 1;
            if (frameCount.current % 120 === 0) { if (addLog) addLog(`Reticle Active: ${vec.x.toFixed(1)}, ${vec.y.toFixed(1)}, ${vec.z.toFixed(1)}`); }
        }
    });
    return ( <group ref={ref}> <mesh position={[0, 0.1, 0]} rotation-x={-Math.PI / 2}> <sphereGeometry args={[0.1, 16, 16]} /> <meshBasicMaterial color="#00ffff" wireframe transparent opacity={0.6} /> </mesh> <mesh rotation-x={-Math.PI / 2}> <ringGeometry args={[0.08, 0.1, 32]} /> <meshBasicMaterial color="white" opacity={0.8} transparent /> </mesh> <mesh rotation-x={-Math.PI / 2}> <circleGeometry args={[0.02, 32]} /> <meshBasicMaterial color="cyan" /> </mesh> </group> );
};

class ErrorBoundary extends React.Component {
    constructor(props) { super(props); this.state = { hasError: false }; }
    static getDerivedStateFromError(error) { console.error("[AR-DEBUG] ErrorBoundary Caught Error:", error); return { hasError: true }; }
    render() { if (this.state.hasError) return this.props.fallback || null; return this.props.children; }
}

const ARScene = ({ activeModel, isPlaced, setIsPlaced, placedPosition, setPlacedPosition, modelRotation, modelScale, onModelSelect, setHitPoint, addLog }) => {
    const isPresenting = useThree((state) => state.gl.xr.isPresenting);
    return (
        <>
            <ambientLight intensity={1} />
            <directionalLight position={[5, 10, 5]} intensity={2} />
            {!isPresenting && ( <ErrorBoundary fallback={<mesh position={[0,0,-2]}><boxGeometry/><meshBasicMaterial color="red"/></mesh>}> <Suspense fallback={null}> <InteractiveModel url={activeModel.url} initialScale={activeModel.scale} position={[0, 0, -2]} rotation={modelRotation} scaleFactor={modelScale} onSelect={onModelSelect} /> </Suspense> </ErrorBoundary> )}
            {isPresenting && !isPlaced && ( <XRHitTest mode="point" onSelect={() => { if (addLog) addLog("NATIVE HIT-TEST SELECT TRIGGERED"); }}> <ReticleContent setHitPoint={setHitPoint} addLog={addLog} /> </XRHitTest> )}
            {isPresenting && isPlaced && placedPosition && ( <ErrorBoundary fallback={null}> <Suspense fallback={<LoadingHologram position={placedPosition} />}> <InteractiveModel url={activeModel.url} initialScale={activeModel.scale} position={placedPosition} rotation={modelRotation} scaleFactor={modelScale} onSelect={onModelSelect} /> </Suspense> </ErrorBoundary> )}
        </>
    );
};

// ... InfoPanel Component ...
const InfoPanel = ({ model, onClose }) => {
    if (!model) return null;
    return (
        <div className="absolute bottom-0 left-0 w-full p-4 z-50 animate-slide-up">
            <div className="bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-white shadow-2xl relative overflow-hidden">
                <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="absolute top-4 right-4 p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors pointer-events-auto"> <X size={20} /> </button>
                <div className="flex flex-col gap-2 relative z-10">
                    <div className="inline-flex items-center gap-2"> <span className="px-2 py-0.5 roundedElement bg-cyan-500/20 text-cyan-300 text-[10px] uppercase font-mono tracking-wider border border-cyan-500/30"> {model.type} </span> </div>
                    <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400"> {model.name} </h2>
                    <div className="h-px w-full bg-gradient-to-r from-white/20 to-transparent my-1" />
                    <div className="grid grid-cols-1 gap-4 mt-2"> <div> <h3 className="text-xs font-mono text-gray-400 uppercase tracking-widest mb-1">Mission / Purpose</h3> <p className="text-sm font-light leading-relaxed">{model.purpose}</p> </div> <div> <h3 className="text-xs font-mono text-cyan-400 uppercase tracking-widest mb-1">Human Impact</h3> <p className="text-sm font-light leading-relaxed text-gray-200">{model.impact}</p> </div> </div>
                </div>
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-blue-600" />
            </div>
            <style>{` @keyframes slide-up { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } } .animate-slide-up { animation: slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; } `}</style>
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

const ARSpaceLabView = () => {
  /* State */
  const [isARSupported, setIsARSupported] = useState(false);
  const [activeCategory, setActiveCategory] = useState('Planets');
  const [activeModel, setActiveModel] = useState(AR_MODELS['Planets'][0]);
  const [isPlaced, setIsPlaced] = useState(false);
  const [placedPosition, setPlacedPosition] = useState(null);
  
  // New: Universal Mode State
  const [showUniversalAR, setShowUniversalAR] = useState(false);
  
  const [showInfo, setShowInfo] = useState(false);
  const [isInAR, setIsInAR] = useState(false); 
  const [logs, setLogs] = useState([]); 

  const addLog = (msg) => { setLogs(prev => [...prev.slice(-10), msg]); console.log("[AR-LOG]", msg); };
  const hitPointRef = useRef(null);
  const setHitPoint = (point) => { hitPointRef.current = point; };
  const [modelRotation, setModelRotation] = useState([0, 0, 0]);
  const [modelScale, setModelScale] = useState(1);
  const gesturesEnabled = !showInfo;

  // ... (Binding Logic) ...
  const bind = useGesture({
    onDrag: ({ offset: [x, y], pinching }) => { if (pinching) return; setModelRotation([y * 0.01, x * 0.01, 0]); },
    onPinch: ({ offset: [s] }) => { setModelScale(s); },
    onClick: ({ event }) => {
        addLog("TAP DETECTED");
        if (isInAR && !isPlaced && hitPointRef.current) {
            addLog(`PLACING AT: ${hitPointRef.current.x.toFixed(2)}`);
            setPlacedPosition(hitPointRef.current);
            setIsPlaced(true);
        }
    }
  }, { drag: { from: () => [modelRotation[1] * 100, modelRotation[0] * 100] }, pinch: { scaleBounds: { min: 0.2, max: 10 }, rubberband: true }, enabled: gesturesEnabled });

  useEffect(() => {
    if ('xr' in navigator) {
      navigator.xr.isSessionSupported('immersive-ar').then((supported) => { console.log("XR Supported:", supported); setIsARSupported(supported); }).catch((e) => console.error("XR Check Error:", e));
    }
  }, []);

  const handleEnterAR = async () => {
      addLog("Entering Native AR...");
      try {
          await store.enterAR();
          setIsInAR(true);
      } catch (e) {
         addLog("Native AR Fail. Trying Universal.");
         setShowUniversalAR(true); // Fallback automatically if native fails
      }
  };

  const handleReset = () => { setIsPlaced(false); setPlacedPosition(null); hitPointRef.current = null; setModelRotation([0,0,0]); setModelScale(1); setShowInfo(false); addLog("Reset"); };
  const onModelSelect = () => { setShowInfo(true); };

  // --- RENDER ---
  // If Universal Mode is Active, render ONLY that component (FullScreen)
  if (showUniversalAR) {
      return <UniversalAR activeModel={activeModel} onClose={() => setShowUniversalAR(false)} />;
  }

  return (
    <div {...bind()} className="relative w-full h-screen bg-black overflow-hidden font-sans touch-none">
      
      {/* HUD: Back & Info */}
      <LogOverlay logs={logs} />
      
      <div className="absolute top-0 left-0 w-full p-6 z-40 pointer-events-none">
        <div className="flex justify-between items-start pointer-events-auto" onPointerDown={(e) => e.stopPropagation()}>
             <Link to="/dashboard" className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors bg-black/50 px-3 py-1 rounded-lg backdrop-blur-sm">
                <ArrowLeft size={16} /> <span className="font-mono text-xs tracking-widest">EXIT</span>
            </Link>
             {isPlaced && ( <button onClick={handleReset} className="flex items-center gap-2 text-white hover:text-cyan-400 transition-colors bg-black/50 px-3 py-1 rounded-lg backdrop-blur-sm"> <RefreshCw size={14} /> <span className="font-mono text-xs tracking-widest">RESET</span> </button>)}
        </div>
      </div>
      
       {showInfo && ( <div className="absolute inset-0 z-50 flex items-end pointer-events-auto" onPointerDown={(e) => e.stopPropagation()} onTouchStart={(e) => e.stopPropagation()}> <InfoPanel model={activeModel} onClose={() => setShowInfo(false)} /> </div> )}

       <div className={`absolute bottom-24 left-0 w-full z-40 px-4 flex flex-col gap-4 pointer-events-none transition-opacity ${showInfo ? 'opacity-0' : 'opacity-100'}`} >
          <div className="flex justify-center gap-2 pointer-events-auto overflow-x-auto pb-2 scrollbar-hide" onPointerDown={(e) => e.stopPropagation()}>
              <CategoryTab label="Planets" icon={Globe} active={activeCategory === 'Planets'} onClick={() => setActiveCategory('Planets')} />
              <CategoryTab label="Satellites" icon={Satellite} active={activeCategory === 'Satellites'} onClick={() => setActiveCategory('Satellites')} />
              <CategoryTab label="Stations" icon={Zap} active={activeCategory === 'Stations'} onClick={() => setActiveCategory('Stations')} />
          </div>

          <div className="flex justify-center gap-3 pointer-events-auto overflow-x-auto pb-2 scrollbar-hide snap-x" onPointerDown={(e) => e.stopPropagation()}>
               {AR_MODELS[activeCategory].map(model => (
                   <ModelCard key={model.id} model={model} active={activeModel.id === model.id} onClick={(e) => { e.stopPropagation(); setActiveModel(model); setIsPlaced(false); setModelRotation([0,0,0]); setModelScale(1); setShowInfo(false); }} />
               ))}
          </div>
      </div>

      {/* AR ACTION BUTTONS */}
      {!showInfo && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-50 flex gap-4 w-full justify-center px-4">
           {/* Primary: Native AR (if supported) */}
           {isARSupported && (
               <button 
                 onClick={(e) => { e.stopPropagation(); handleEnterAR(); }}
                 className="flex-1 max-w-[160px] px-4 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all text-sm tracking-wider flex items-center justify-center gap-2"
               >
                 <Smartphone size={18} /> NATIVE AR
               </button>
           )}

           {/* Secondary/Fallback: Universal Camera Mode */}
           <button 
             onClick={(e) => { e.stopPropagation(); setShowUniversalAR(true); }}
             className={`flex-1 max-w-[160px] px-4 py-3 ${isARSupported ? 'bg-white/10 border border-white/20' : 'bg-gradient-to-r from-purple-600 to-pink-600 shadow-[0_0_20px_rgba(255,0,255,0.4)]'} text-white font-bold rounded-xl backdrop-blur-md transition-all text-sm tracking-wider flex items-center justify-center gap-2`}
           >
             <Camera size={18} /> {isARSupported ? "MANUAL" : "CAMERA MODE"}
           </button>
        </div>
      )}

      {/* Main Canvas (For Desktop "Simulation Mode" and Native AR) */}
      <Canvas dpr={1} gl={{ antialias: false, precision: 'mediump' }}>
        <XR store={store}>
            <ARScene activeModel={activeModel} isPlaced={isPlaced} setIsPlaced={setIsPlaced} placedPosition={placedPosition} setPlacedPosition={setPlacedPosition} modelRotation={modelRotation} modelScale={modelScale} onModelSelect={onModelSelect} setHitPoint={setHitPoint} addLog={addLog} />
            {!store.inAR && !gesturesEnabled && <OrbitControls makeDefault />} 
            {!store.inAR && !gesturesEnabled && <gridHelper args={[20, 20]} position={[0, -1, 0]} />}
        </XR>
      </Canvas>

      {!isARSupported && !showUniversalAR && (
          <div className="absolute top-20 right-6 text-right pointer-events-none">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-md"> <Scan size={12} className="text-amber-500" /> <span className="text-[10px] font-mono text-amber-500">SIMULATION MODE</span> </div>
          </div>
      )}
    </div>
  );
};

export default ARSpaceLabView;
