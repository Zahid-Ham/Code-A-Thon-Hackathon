import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import Sun3D from './components/Sun3D';
import CosmicWeatherPanel from './components/CosmicWeatherPanel';
import { useCosmicWeather } from './contexts/CosmicWeatherContext';

const SolarOverwatch = () => {
  const { globalSeverity } = useCosmicWeather();

  // Dynamic background style based on severity?
  // For now, keep it deep space black/void
  
  return (
    <div className="w-full h-screen bg-black relative overflow-hidden text-white">
      {/* 3D Scene */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
          <ambientLight intensity={0.1} />
          <Stars radius={300} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
          <Sun3D />
          <OrbitControls 
            enableZoom={true} 
            minDistance={4} 
            maxDistance={20} 
            autoRotate 
            autoRotateSpeed={0.5} 
          />
        </Canvas>
      </div>

      {/* UI Overlay */}
      <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-start pointer-events-none z-10">
         {/* Left Header & Context Panel */}
         <div className="pointer-events-auto flex flex-col gap-6 max-w-md">
            <div>
                <Link to="/" className="flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-4">
                    <ArrowLeft size={20} />
                    <span>Return to Bridge</span>
                </Link>
                <h1 className="text-4xl font-['Orbitron'] font-bold tracking-widest text-[#FFD700] drop-shadow-[0_0_15px_rgba(255,215,0,0.5)]">
                    SOLAR OVERWATCH
                </h1>
                <p className="font-mono text-sm text-white/60 tracking-[0.2em]">
                    REAL-TIME HELIOPHYSICS TELEMETRY
                </p>
            </div>

            {/* Contextual Explanation Panel */}
            <div className="bg-black/40 backdrop-blur-md border-l-2 border-[#FFD700] p-6 rounded-r-xl">
                <h3 className="text-[#FFD700] font-bold tracking-widest text-xs mb-2 uppercase">Current Solar State</h3>
                <p className="text-lg text-white leading-relaxed font-light">
                   You are viewing a real-time model of the Sun based on data from NASA's SDO and STEREO satellites. 
                   The surface distortion represents active solar fluctuations.
                </p>
                <div className="mt-4 flex gap-4 text-xs font-mono text-white/40">
                   <div>
                      <span className="block text-[#FFD700]">DATA SOURCE</span>
                      NASA DONKI API
                   </div>
                   <div>
                      <span className="block text-[#FFD700]">UPDATE FREQUENCY</span>
                      Every 60 Seconds
                   </div>
                </div>
            </div>
         </div>
      </div>

      {/* Cosmic Weather Panel (Right Side) */}
      <CosmicWeatherPanel />

      {/* Footer Status */}
      <div className="absolute bottom-6 left-6 pointer-events-none">
         <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full animate-pulse ${globalSeverity === 'EXTREME' ? 'bg-red-500 shadow-[0_0_10px_red]' : 'bg-green-400 shadow-[0_0_10px_lime]'}`} />
            <span className="font-mono text-xs text-white/80">
                SYSTEM STATUS: {globalSeverity === 'EXTREME' ? 'CRITICAL ALERT' : 'NOMINAL'}
            </span>
         </div>
      </div>
    </div>
  );
};

export default SolarOverwatch;
