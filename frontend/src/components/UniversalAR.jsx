import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Stars } from '@react-three/drei';
import { X, ZoomIn, Move, RotateCcw } from 'lucide-react';
import { InteractiveModel, LoadingHologram } from './AR/InteractiveModel';

// --- Simple 3D Model Viewer ---
// Replaces the complex AR/Webcam view with a standard clean generic 3D viewer.
const UniversalAR = ({ activeModel, onClose }) => {
    return (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl">
            {/* 3D Scene */}
            <div className="absolute inset-0 z-10">
                <Canvas>
                    <ambientLight intensity={1.2} />
                    <directionalLight position={[5, 5, 5]} intensity={2} />
                    <pointLight position={[-5, -5, -5]} intensity={1} />
                    
                    <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
                    
                    <Suspense fallback={null}>
                       <PerspectiveCamera makeDefault position={[0, 0, 4]} fov={50} />
                       <OrbitControls 
                           enablePan={true} 
                           enableZoom={true} 
                           enableRotate={true}
                           minDistance={2}
                           maxDistance={10}
                           autoRotate={true}
                           autoRotateSpeed={0.5}
                       />
                       
                       <Suspense fallback={<LoadingHologram />}>
                            <InteractiveModel 
                                url={activeModel?.url}
                                initialScale={activeModel?.scale || 1}
                                position={[0,0,0]}
                                rotation={[0,0,0]}
                                scaleFactor={1.5} // Slightly larger for detail view
                                onSelect={() => {}}
                            />
                       </Suspense>
                    </Suspense>
                </Canvas>
            </div>

            {/* UI Overlay */}
            <div className="absolute inset-0 z-20 pointer-events-none flex flex-col justify-between p-8">
                
                {/* Header */}
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-4xl font-bold text-white tracking-widest">{activeModel?.name?.toUpperCase()}</h2>
                        <p className="text-cyan-400 font-mono text-sm mt-2">INTERACTIVE 3D VIEW</p>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="pointer-events-auto p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all backdrop-blur-md border border-white/10"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Footer Controls / Hints */}
                <div className="flex justify-center gap-8 pb-8 opacity-60">
                     <div className="flex flex-col items-center">
                        <RotateCcw size={24} className="text-white mb-2" />
                        <span className="text-[10px] text-white font-mono">DRAG TO ROTATE</span>
                    </div>
                     <div className="flex flex-col items-center">
                        <ZoomIn size={24} className="text-white mb-2" />
                        <span className="text-[10px] text-white font-mono">SCROLL / PINCH</span>
                    </div>
                     <div className="flex flex-col items-center">
                        <Move size={24} className="text-white mb-2" />
                        <span className="text-[10px] text-white font-mono">RIGHT CLICK PAN</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UniversalAR;
