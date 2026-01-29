import React, { useState, useRef, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Stars, PerspectiveCamera } from '@react-three/drei';
import { Box, ArrowLeft, Globe, Satellite, Zap, RefreshCw, X, RotateCcw, ZoomIn, Move } from 'lucide-react';
import { Link } from 'react-router-dom';
import { InteractiveModel, LoadingHologram } from '../components/AR/InteractiveModel';

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
      name: 'Hubble Telescope', 
      url: '/models/hubble_space_telescope.glb', 
      scale: 0.1, // Reduced from 1.5 to fit screen
      type: 'Space Observatories',
      purpose: 'Deep Space Exploration',
      impact: 'Captured the "Pillars of Creation" and confirmed the Universe is expanding.'
    }
  ],
  Stations: [
    { 
      id: 'iss', 
      name: 'Int. Space Station', 
      url: '/models/iss.glb', 
      scale: 0.8, // Increased for visibility
      type: 'Orbital Laboratory',
      purpose: 'Scientific Research',
      impact: 'A microgravity lab where international crews conduct experiments not possible on Earth.'
    }
  ]
};

import SpaceChatbot from '../components/SpaceChatbot';

// --- Components ---

const InfoPanel = ({ model, onClose }) => {
    if (!model) return null;
    return (
        <div className="absolute inset-x-0 bottom-0 md:bottom-12 md:right-12 md:left-auto md:w-[450px] z-50 animate-slide-up p-4">
            <div className="bg-black/90 backdrop-blur-2xl border border-white/20 rounded-3xl p-8 text-white shadow-[0_0_50px_rgba(0,255,255,0.1)] relative overflow-hidden">
                
                {/* Close Button - Larger Hit Area */}
                <button 
                    onClick={(e) => { 
                        e.stopPropagation(); 
                        onClose(); 
                    }} 
                    className="absolute top-4 right-4 p-3 bg-white/10 rounded-full hover:bg-red-500/20 hover:text-red-400 transition-all pointer-events-auto z-20 group"
                > 
                    <X size={24} className="group-hover:rotate-90 transition-transform"/> 
                </button>

                <div className="flex flex-col gap-4 relative z-10 select-none">
                    
                    {/* Header Badge */}
                    <div className="inline-flex items-center gap-2"> 
                        <span className="px-3 py-1 rounded-md bg-cyan-500/20 text-cyan-300 text-xs uppercase font-mono tracking-widest border border-cyan-500/30 shadow-[0_0_10px_rgba(0,255,255,0.2)]"> 
                            {model.type} 
                        </span> 
                    </div>
                    
                    {/* Title */}
                    <h2 className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-500 tracking-tight"> 
                        {model.name} 
                    </h2>
                    
                    <div className="h-px w-full bg-gradient-to-r from-cyan-500/50 to-transparent my-2" />
                    
                    {/* Detailed Stats */}
                    <div className="space-y-6"> 
                        <div> 
                            <h3 className="text-xs font-mono text-cyan-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></span> Mission Objective
                            </h3> 
                            <p className="text-lg font-light leading-relaxed text-gray-100">{model.purpose}</p> 
                        </div> 
                        
                        <div> 
                            <h3 className="text-xs font-mono text-purple-400 uppercase tracking-widest mb-2">Galactic Impact</h3> 
                            <p className="text-sm font-light leading-relaxed text-gray-300 border-l-2 border-purple-500/30 pl-4">
                                {model.impact}
                            </p> 
                        </div> 
                    </div>
                </div>

                {/* Decorative Background Elements */}
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600" />
            </div>
            <style>{` @keyframes slide-up { from { transform: translateY(100px); opacity: 0; } to { transform: translateY(0); opacity: 1; } } .animate-slide-up { animation: slide-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; } `}</style>
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
  const [activeCategory, setActiveCategory] = useState('Planets');
  const [activeModel, setActiveModel] = useState(AR_MODELS['Planets'][0]);
  const [showInfo, setShowInfo] = useState(false);
  const [modelRotation, setModelRotation] = useState([0, 0, 0]);
  const [modelScale, setModelScale] = useState(1);

  const handleReset = () => { 
      setModelRotation([0,0,0]); 
      setModelScale(1); 
      setShowInfo(false); 
  };
  
  const onModelSelect = () => { setShowInfo(true); };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden font-sans">
      
      {/* 1. Header & Exit */}
      <div className="absolute top-0 left-0 w-full p-6 z-40 pointer-events-none">
        <div className="flex justify-between items-start pointer-events-auto">
             <Link to="/dashboard" className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors bg-black/50 px-3 py-1 rounded-lg backdrop-blur-sm border border-cyan-500/20">
                <ArrowLeft size={16} /> <span className="font-mono text-xs tracking-widest">EXIT LAB</span>
            </Link>
             <button onClick={handleReset} className="flex items-center gap-2 text-white hover:text-cyan-400 transition-colors bg-black/50 px-3 py-1 rounded-lg backdrop-blur-sm border border-white/10"> 
                 <RefreshCw size={14} /> <span className="font-mono text-xs tracking-widest">RESET VIEW</span> 
             </button>
        </div>
      </div>
      
      {/* 2. Info Panel Overlay */}
       {showInfo && <InfoPanel model={activeModel} onClose={() => setShowInfo(false)} />}

       {/* 3. Bottom Controls */}
       <div className="absolute bottom-0 left-0 w-full z-40 p-4 flex flex-col gap-4 pointer-events-none bg-gradient-to-t from-black via-black/80 to-transparent pt-12" >
          
          <div className="flex justify-center gap-2 pointer-events-auto overflow-x-auto pb-2 scrollbar-hide">
              <CategoryTab label="Planets" icon={Globe} active={activeCategory === 'Planets'} onClick={() => setActiveCategory('Planets')} />
              <CategoryTab label="Satellites" icon={Satellite} active={activeCategory === 'Satellites'} onClick={() => setActiveCategory('Satellites')} />
              <CategoryTab label="Stations" icon={Zap} active={activeCategory === 'Stations'} onClick={() => setActiveCategory('Stations')} />
          </div>

          <div className="flex justify-center gap-3 pointer-events-auto overflow-x-auto pb-6 scrollbar-hide snap-x">
               {AR_MODELS[activeCategory].map(model => (
                   <ModelCard key={model.id} model={model} active={activeModel.id === model.id} onClick={() => { setActiveModel(model); setIsPlaced(false); setModelRotation([0,0,0]); setModelScale(1); setShowInfo(false); }} />
               ))}
          </div>
      </div>
      
      {/* 4. Interaction Hints */}
        <div className="absolute top-1/2 right-8 transform -translate-y-1/2 flex flex-col gap-6 opacity-40 pointer-events-none">
             <div className="flex flex-col items-center">
                <RotateCcw size={20} className="text-white mb-1" />
                <span className="text-[9px] text-white font-mono">DRAG</span>
            </div>
             <div className="flex flex-col items-center">
                <ZoomIn size={20} className="text-white mb-1" />
                <span className="text-[9px] text-white font-mono">SCROLL</span>
            </div>
             <div className="flex flex-col items-center">
                <Move size={20} className="text-white mb-1" />
                <span className="text-[9px] text-white font-mono">PAN</span>
            </div>
        </div>

      {/* 5. Main Canvas (Simple 3D Viewer) */}
      <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 4], fov: 45 }}>
        <color attach="background" args={['#050505']} />
        <ambientLight intensity={1.5} />
        <directionalLight position={[10, 10, 5]} intensity={2} />
        <pointLight position={[-10, -10, -10]} intensity={1} color="cyan" />
        
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

        <Suspense fallback={null}>
             <OrbitControls 
                 makeDefault 
                 minDistance={0.5} 
                 maxDistance={10} 
                 enablePan={true}
                 enableZoom={true}
                 autoRotate={!showInfo}
                 autoRotateSpeed={0.5}
             />
             <InteractiveModel 
                url={activeModel.url} 
                initialScale={activeModel.scale} 
                position={[0, 0, 0]} 
                rotation={[0,0,0]} 
                scaleFactor={1.5} 
                onSelect={onModelSelect} 
            />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default ARSpaceLabView;
