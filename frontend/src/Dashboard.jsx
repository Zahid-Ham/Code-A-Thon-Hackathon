import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { ArrowRight, Activity, AlertTriangle, ShieldCheck } from 'lucide-react';
import Sun3D from './components/Sun3D';
import Earth3D from './components/Earth3D';
import Starfield from './components/Starfield';

const Dashboard = () => {
  const [isImpacting, setIsImpacting] = useState(false);
  const [timeline, setTimeline] = useState(0);
  const [solarData, setSolarData] = useState({ classType: 'LOADING...', activeRegionNum: '---' });

  useEffect(() => {
    fetch('http://localhost:5000/api/space-weather')
      .then(res => res.json())
      .then(data => {
        setSolarData(data);
        if (data.isSimulation) {
          console.log('System is in Simulation Mode');
        }
      })
      .catch(err => console.error('Failed to connect to Mother Base (Backend):', err));
  }, []);

  const simulateFlare = () => {
    setIsImpacting(true);
    // Reset after animation
    setTimeout(() => setIsImpacting(false), 5000);
  };

  return (
    <div className="relative min-h-screen text-white bg-void-bg font-sans overflow-hidden">
      <Starfield />

      {/* Header */}
      <header className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-50 pointer-events-none">
        <h1 className="text-2xl font-header font-bold tracking-wider text-holo-cyan drop-shadow-[0_0_8px_rgba(0,240,255,0.8)]">
          EARTH-SPACE MIRROR
        </h1>
        <div className="glass-panel px-4 py-1 rounded-full flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-xs font-mono tracking-widest text-white/80">LIVE FEED_ ACTIVE</span>
        </div>
      </header>

      {/* Split Screen Layout */}
      <main className="grid grid-cols-1 lg:grid-cols-2 h-screen pt-20 pb-20 gap-4 px-4 relative z-10">
        
        {/* Left Zone: The Source (Sun) */}
        <section className="relative flex flex-col items-center justify-center border-r border-white/5">
           {/* Solar Data Card */}
           <motion.div 
             initial={{ x: -20, opacity: 0 }}
             animate={{ x: 0, opacity: 1 }}
             className="absolute top-10 left-10 glass-panel p-4 rounded-lg z-20 w-64 pointer-events-auto"
           >
             <div className="flex items-center gap-2 mb-2 text-holo-cyan">
               <Activity size={16} />
               <h3 className="font-header font-bold text-sm tracking-widest">SOLAR ACTIVITY</h3>
             </div>
             <div className="space-y-2">
               <div className="flex justify-between text-xs text-white/60">
                 <span>FLARE CLASS</span>
                 <span className="text-white font-mono">{solarData.classType}</span>
               </div>
               <div className="flex justify-between text-xs text-white/60">
                 <span>ACTIVE REGION</span>
                 <span className="text-white font-mono">{solarData.activeRegionNum}</span>
               </div>
               <div className="h-1 w-full bg-white/10 rounded-full mt-2 overflow-hidden">
                  <div className="h-full bg-orange-500 w-[75%] shadow-[0_0_10px_orange]" />
               </div>
             </div>
           </motion.div>

           <div className="relative w-full h-[60vh]">
             <Canvas camera={{ position: [0, 0, 4] }} dpr={[1, 1.5]}>
               <Sun3D />
             </Canvas>
           </div>
        </section>

        {/* Right Zone: The Impact (Earth) */}
        <section className="relative flex flex-col items-center justify-center">
            {/* Impact Data Card */}
            <motion.div 
             initial={{ x: 20, opacity: 0 }}
             animate={{ x: 0, opacity: 1 }}
             className="absolute top-10 right-10 glass-panel p-4 rounded-lg z-20 w-64 pointer-events-auto"
           >
             <div className="flex items-center gap-2 mb-2 text-nebula-purple">
               <ShieldCheck size={16} />
               <h3 className="font-header font-bold text-sm tracking-widest">MAGNETOSPHERE</h3>
             </div>
             <div className="space-y-2">
               <div className="flex justify-between text-xs text-white/60">
                 <span>STATUS</span>
                 <span className={`font-mono ${isImpacting ? 'text-red-500 animate-pulse' : 'text-green-400'}`}>
                   {isImpacting ? 'COMPROMISED' : 'STABLE'}
                 </span>
               </div>
               <div className="flex justify-between text-xs text-white/60">
                 <span>KP INDEX</span>
                 <span className="text-white font-mono">{isImpacting ? '8.0 (SEVERE)' : '2.0 (LOW)'}</span>
               </div>
             </div>
           </motion.div>

           <div className="relative w-full h-[60vh] pointer-events-auto cursor-move">
             <Earth3D isImpacted={isImpacting} />
           </div>
        </section>

        {/* Energy Beam Interaction */}
        <AnimatePresence>
          {isImpacting && (
            <motion.div
              initial={{ width: '0%', opacity: 1, left: '25%' }}
              animate={{ width: '50%', opacity: [1, 1, 0], left: '25%' }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, ease: "circIn" }}
              className="absolute top-1/2 left-0 h-2 bg-gradient-to-r from-orange-500 via-yellow-400 to-holo-cyan z-30 blur-sm shadow-[0_0_20px_rgba(255,165,0,0.8)]"
              style={{ transform: 'translateY(-50%)' }}
            />
          )}
        </AnimatePresence>

      </main>

      {/* Controls Footer */}
      <footer className="absolute bottom-0 left-0 w-full p-8 flex flex-col items-center z-50 pointer-events-none">
        <div className="glass-panel p-6 rounded-2xl w-full max-w-2xl flex items-center gap-8 pointer-events-auto shadow-[0_0_50px_rgba(0,0,0,0.5)]">
           <button 
             onClick={simulateFlare}
             disabled={isImpacting}
             className="whitespace-nowrap flex items-center gap-2 px-6 py-3 bg-red-500/20 border border-red-500/50 hover:bg-red-500 hover:text-white text-red-400 rounded-sm font-header font-bold tracking-widest transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed uppercase"
           >
             <AlertTriangle size={18} />
             Simulate Flare
           </button>
           
           <div className="flex-1 flex flex-col gap-2">
             <div className="flex justify-between text-xs font-mono text-white/50">
               <span>T-MINUS 12H</span>
               <span>IMPACT</span>
               <span>T-PLUS 24H</span>
             </div>
             <input 
               type="range" 
               min="0" 
               max="100" 
               value={timeline}
               onChange={(e) => setTimeline(e.target.value)}
               className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-holo-cyan [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-[0_0_10px_#00F0FF]"
             />
           </div>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
