import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Map,
  Sun,
  Globe,
  Clock,
  GraduationCap,
  Satellite,
  ArrowRight,
  Box,
  BrainCircuit
} from 'lucide-react';
import SpaceDust from './SpaceDust';
import { useSound } from '../contexts/SoundContext';

// --- Configuration Data ---
const modules = [
  {
    id: 'celestial-command',
    title: 'Earth Events',
    subtitle: 'Hazard Detection',
    description: 'Real-time monitoring of terrestrial and cosmic hazards.',
    icon: Map,
    color: '#00F0FF',
    link: '/events',
    status: 'LIVE FEED'
  },
  {
    id: 'solar-overwatch',
    title: 'Solar Overwatch',
    subtitle: 'Space Weather',
    description: 'Tracking solar flares, CMEs, and geomagnetic storms.',
    icon: Sun,
    color: '#FFD700',
    link: '/solar',
    status: 'ACTIVE'
  },
  {
    id: 'orbital-atlas',
    title: 'Orbital Atlas',
    subtitle: 'Satellite Tracker',
    description: '3D visualization of global satellite network.',
    icon: Globe,
    color: '#00BFFF',
    link: '/orbital',
    status: 'ONLINE'
  },
  {
    id: 'chrono-archive',
    title: 'Chrono-Archive',
    subtitle: 'Mission Timeline',
    description: 'Visual timeline of past, ongoing, and future space missions.',
    icon: Clock,
    color: '#FF0055',
    link: '/timeline',
    status: 'LIVE DATA'
  },
  {
    id: 'academy',
    title: 'Star Academy',
    subtitle: 'Knowledge Base',
    description: 'Interactive quizzes and cosmic Encyclopedia.',
    icon: GraduationCap,
    color: '#00FF99',
    link: '/academy',
    status: 'OPEN'
  },
  {
    id: 'terra-vision',
    title: 'Terra-Vision',
    subtitle: 'Planet Health',
    description: 'Satellite imagery analysis of crop & climate health.',
    icon: Satellite,
    color: '#AA00FF',
    link: '/terra',
    status: 'READY'
  },
  {
    id: 'ar-lab',
    title: 'AR Space Lab',
    subtitle: 'Immersive Mode',
    description: 'Visualize planets in your room.',
    icon: Box,
    color: '#FF4400',
    link: '/ar-lab',
    status: 'BETA'
  },
  {
    id: 'mission-simulator',
    title: 'Mission Simulator',
    subtitle: 'Tactical Scenarios',
    description: 'Test your command skills in simulated space mission scenarios.',
    icon: BrainCircuit,
    color: '#F472B6',
    link: '/mission-simulator',
    status: 'NEW'
  }
];

const TheBridge = () => {
  const [hoveredCard, setHoveredCard] = useState(null);
  const [clickedCard, setClickedCard] = useState(null);
  const { playHover, playWarp } = useSound();
  const navigate = useNavigate();

  const handleMouseEnter = (id) => {
    if (clickedCard) return;
    setHoveredCard(id);
    playHover();
  };

  const handleCardClick = (mod) => {
    setClickedCard(mod.id);
    playWarp();
    setTimeout(() => {
      navigate(mod.link);
    }, 800);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#020408] text-white font-sans selection:bg-cyan-500/30">
      
      {/* 1. Background Visuals */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#0a1525] via-[#020408] to-black z-0" />
      <SpaceDust />

      {/* Cinematic Background Title (Watermark) */}
      <div className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none opacity-5">
        <h1 className="text-[15vw] font-black font-header tracking-tighter text-white whitespace-nowrap blur-sm select-none">
          SPACESCOPE
        </h1>
      </div>

      {/* Central "Reactor" Core Effect (Subtle) */}
      <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
        <div className="w-96 h-96 rounded-full bg-cyan-500/5 blur-[120px] animate-pulse"></div>
      </div>

      {/* HUD Header - Left */}
      <div className="absolute top-8 left-8 z-20 pointer-events-none mix-blend-screen">
        <h1 className="text-white font-header text-4xl tracking-widest uppercase drop-shadow-[0_0_15px_rgba(0,240,255,0.6)]">
          SpaceScope
        </h1>
        <div className="h-0.5 w-24 bg-gradient-to-r from-cyan-500 to-transparent mt-2"></div>
      </div>

      {/* HUD Header - Right */}
      <div className="absolute top-8 right-8 z-20 pointer-events-none text-right mix-blend-screen">
        <h2 className="text-cyan-400 font-mono text-xs tracking-[0.3em] uppercase opacity-80">Nexus Terminal v2.4</h2>
        <h3 className="text-white/60 font-mono text-[10px] tracking-widest mt-1">SYSTEM STATUS: OPTIMAL</h3>
      </div>

      {/* White Flash Overlay for Transition */}
      <AnimatePresence>
        {clickedCard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-white/90 z-50 pointer-events-none mix-blend-overlay"
          />
        )}
      </AnimatePresence>

      {/* 2. Responsive Grid Layout */}
      <div className="absolute inset-0 z-30 flex items-center justify-center p-4 pt-24 pb-12 overflow-y-auto scrollbar-hide">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto w-full">
            {modules.map((mod) => {
                const isHovered = hoveredCard === mod.id;
                const isClicked = clickedCard === mod.id;

                return (
                    <motion.div
                        key={mod.id}
                        layoutId={`card-container-${mod.id}`}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                        onClick={() => handleCardClick(mod)}
                        onMouseEnter={() => handleMouseEnter(mod.id)}
                        onMouseLeave={() => setHoveredCard(null)}
                        className={`
                            group relative h-48 w-full
                            bg-[#0a0f18]/80 backdrop-blur-xl
                            border border-white/5 rounded-xl overflow-hidden
                            shadow-[0_0_20px_rgba(0,0,0,0.5)]
                            hover:border-white/20 hover:shadow-[0_0_30px_rgba(0,240,255,0.15)]
                            cursor-pointer transition-all duration-300
                            ${hoveredCard && !isHovered ? 'blur-[2px] opacity-50 scale-95' : 'opacity-100'}
                        `}
                        style={{
                           borderColor: isHovered ? mod.color : 'rgba(255,255,255,0.05)'
                        }}
                    >
                        {/* Colored Accent Line (Top) */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-white/10">
                            <div
                            className="h-full transition-all duration-500 ease-out"
                            style={{
                                width: isHovered ? '100%' : '0%',
                                backgroundColor: mod.color
                            }}
                            />
                        </div>

                        {/* Content */}
                        <div className="p-6 h-full flex flex-col justify-between relative z-10">
                            <div className="flex justify-between items-start">
                                <div className="p-2 rounded-md bg-white/5 text-white/70 group-hover:bg-white/10 transition-colors" style={{ color: isHovered ? mod.color : undefined }}>
                                    <mod.icon size={24} />
                                </div>
                                <div className="flex items-center gap-2">
                                     <div className={`w-1.5 h-1.5 rounded-full ${isHovered ? 'animate-pulse' : ''}`} style={{ backgroundColor: mod.color }} />
                                     <span className="text-[10px] font-mono font-bold text-white/30 tracking-wider">{mod.status}</span>
                                </div>
                            </div>

                            <div>
                                <div className="text-[10px] font-mono text-white/40 mb-1 tracking-widest uppercase">{mod.subtitle}</div>
                                <h3 className="text-xl font-header font-bold text-white uppercase tracking-wider mb-2 group-hover:text-cyan-100 transition-colors">
                                    {mod.title}
                                </h3>
                                <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
                                    {mod.description}
                                </p>
                            </div>
                        </div>
                        
                         {/* Hover Arrow */}
                         <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
                             <ArrowRight size={18} style={{ color: mod.color }} />
                         </div>
                    </motion.div>
                );
            })}
        </div>
      </div>
      
    </div>
  );
};

export default TheBridge;
