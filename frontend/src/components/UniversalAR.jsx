import React, { useState, useRef, Suspense } from 'react';
import Webcam from 'react-webcam';
import { Canvas, useFrame } from '@react-three/fiber';
import { DeviceOrientationControls, PerspectiveCamera } from '@react-three/drei';
import { useGesture } from '@use-gesture/react';
import { Scan, Check, Lock, Move, RotateCw, ZoomIn } from 'lucide-react';
import { InteractiveModel, LoadingHologram } from './AR/InteractiveModel';

// --- Manual Calibration Component ---
// Allows the user to Drag/Scale/Rotate the model relative to the camera 
// BEFORE locking it into world space.
const CalibrationRig = ({ children, isLocked, onLock }) => {
    const [position, setPosition] = useState([0, -1, -3]); // Start slightly below eye level, 3m away
    const [rotation, setRotation] = useState([0, 0, 0]);
    const [scale, setScale] = useState(1);

    // Bind gestures to the container (Screen Overlay)
    useGesture({
        onDrag: ({ offset: [x, y], pinching }) => {
            if (isLocked || pinching) return;
            // Drag moves the model in X/Y plane relative to camera view
            setPosition(p => [p[0] + x * 0.0005, p[1] - y * 0.0005, p[2]]);
        },
        onPinch: ({ offset: [s] }) => {
            if (isLocked) return;
            setScale(s);
        },
        onWheel: ({ delta: [, y] }) => {
            if (isLocked) return;
             // Push/Pull (Z-axis)
             setPosition(p => [p[0], p[1], p[2] - y * 0.005]);
        }
    }, {
        target: window, // Bind to window for full-screen touch
        drag: { from: () => [0, 0] },
        pinch: { scaleBounds: { min: 0.5, max: 5 }, rubberband: true },
        eventOptions: { passive: false } // Critical for preventing default browser behavior
    });

    return (
        <group position={position} rotation={rotation} scale={scale}>
            {children}
            {!isLocked && (
                // Setup Guide Visuals
                <group>
                    <mesh rotation-x={-Math.PI / 2} position={[0, -0.01, 0]}>
                        <ringGeometry args={[0.5, 0.52, 32]} />
                        <meshBasicMaterial color="#00ffff" opacity={0.5} transparent />
                    </mesh>
                    <gridHelper args={[2, 10, 0x00ffff, 0x00ffff]} position={[0, -0.01, 0]} />
                </group>
            )}
        </group>
    );
};

// --- Main Component ---
const UniversalAR = ({ activeModel, onClose }) => {
    const [isLocked, setIsLocked] = useState(false);
    
    // Webcam Constraints
    const videoConstraints = {
        facingMode: "environment" // Use back camera
    };

    return (
        // touch-action: none is CRITICAL to prevent browser zoom/scroll
        <div className="fixed inset-0 z-50 bg-black touch-none" style={{ touchAction: 'none' }}>
            {/* 1. Background: Live Camera Feed */}
            <Webcam
                audio={false}
                videoConstraints={videoConstraints}
                className="absolute inset-0 w-full h-full object-cover"
                style={{ zIndex: 0 }}
            />

            {/* 2. Foreground: 3D Scene */}
            <div className="absolute inset-0 z-10">
                <Canvas>
                    <ambientLight intensity={1} />
                    <directionalLight position={[0, 10, 5]} intensity={2} />
                    
                    {/* Camera controlled by Gyroscope */}
                    <Suspense fallback={null}>
                       <DeviceOrientationControls />
                       <PerspectiveCamera makeDefault position={[0, 0, 0]} fov={75} />
                       
                       {/* The Model Logic */}
                        <CalibrationRig isLocked={isLocked}>
                            <Suspense fallback={<LoadingHologram />}>
                                <InteractiveModel 
                                    url={activeModel?.url}
                                    initialScale={activeModel?.scale || 1}
                                    position={[0,0,0]}
                                    rotation={[0,0,0]}
                                    scaleFactor={1}
                                    onSelect={() => {}}
                                />
                            </Suspense>
                        </CalibrationRig>
                    </Suspense>
                </Canvas>
            </div>

            {/* 3. UI Overlay */}
            <div className="absolute inset-0 z-20 pointer-events-none flex flex-col justify-between p-6">
                
                {/* Header */}
                <div className="flex justify-between items-start">
                    <div className="bg-black/60 backdrop-blur-md p-3 rounded-lg border border-white/10">
                        <h3 className="text-white font-bold text-sm flex items-center gap-2">
                            <Scan size={16} className="text-cyan-400" /> 
                            UNIVERSAL MODE
                        </h3>
                        <p className="text-xs text-gray-400 mt-1">
                            {isLocked ? "Look around with your phone." : "Drag model to floor. Pinch to scale."}
                        </p>
                    </div>
                    <button onClick={onClose} className="pointer-events-auto p-2 bg-black/60 rounded-full text-white hover:bg-white/10">
                        Close
                    </button>
                </div>

                {/* Footer Controls */}
                <div className="flex justify-center pointer-events-auto pb-8">
                    {!isLocked ? (
                        <button 
                            onClick={() => setIsLocked(true)}
                            className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold py-3 px-8 rounded-full shadow-[0_0_20px_rgba(0,255,255,0.4)] flex items-center gap-2 transition-all"
                        >
                            <Check size={20} /> LOCK POSITION
                        </button>
                    ) : (
                        <button 
                            onClick={() => setIsLocked(false)}
                            className="bg-black/60 border border-white/20 text-white font-bold py-3 px-8 rounded-full flex items-center gap-2 hover:bg-white/10 transition-all"
                        >
                            <Move size={20} /> MOVE MODEL
                        </button>
                    )}
                </div>
            </div>
            
            {/* Interaction Hints (Only when unlocked) */}
            {!isLocked && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none opacity-50 flex flex-col items-center gap-4">
                    <div className="flex gap-8">
                         <div className="flex flex-col items-center animate-pulse">
                            <Move size={32} className="text-white" />
                            <span className="text-[10px] text-white font-mono mt-1">DRAG</span>
                        </div>
                         <div className="flex flex-col items-center animate-pulse delay-75">
                            <ZoomIn size={32} className="text-white" />
                            <span className="text-[10px] text-white font-mono mt-1">PINCH</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UniversalAR;
