import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  Map,
  Sun,
  Globe,
  Clock,
  GraduationCap,
  Satellite,
  ArrowRight,
  Zap,
  Activity,
  Layers
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
    angle: 0,
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
    angle: 60,
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
    angle: 120,
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
    angle: 180,
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
    angle: 240,
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
    angle: 300,
    color: '#AA00FF',
    link: '/terra',
    status: 'READY'
  }
];

const TheBridge = () => {
  const [hoveredCard, setHoveredCard] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [clickedCard, setClickedCard] = useState(null);
  const containerRef = useRef(null);
  const { playHover, playWarp } = useSound();
  const navigate = useNavigate();

  // --- Parallax Effect ---
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!containerRef.current) return;
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX - innerWidth / 2) / 40;
      const y = (e.clientY - innerHeight / 2) / 40;
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // --- Interaction Handlers ---
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

  const radiusX = 450;
  const radiusY = 250;

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen overflow-hidden bg-[#020408] text-white font-sans selection:bg-cyan-500/30 Perspective-1000"
    >
      {/* 1. Background Visuals */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#0a1525] via-[#020408] to-black z-0" />
      <SpaceDust />

      {/* Cinematic Background Title (Watermark) */}
      <div className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none opacity-10">
        <motion.div
          style={{ x: mousePos.x * 0.5, y: mousePos.y * 0.5 }}
          className="text-[12vw] font-black font-header tracking-tighter text-white whitespace-nowrap blur-sm select-none"
        >
          SPACESCOPE
        </motion.div>
      </div>

      {/* Central "Reactor" Core */}
      <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
        <div className="w-64 h-64 rounded-full bg-cyan-500/5 blur-[100px] animate-pulse"></div>
        <div className="w-1 h-full bg-gradient-to-b from-transparent via-cyan-500/10 to-transparent absolute"></div>
        <div className="h-1 w-full bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent absolute"></div>
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

      {/* Footer Instruction */}
      <div className="absolute bottom-8 w-full text-center z-20 pointer-events-none">
        <span className="text-[10px] font-mono tracking-[0.5em] text-cyan-500/60 uppercase animate-pulse">Initialize Mission Module</span>
      </div>

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

      {/* 2. Orbiting Modules */}
      <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
        {modules.map((mod, index) => {
          const rad = (mod.angle - 90) * (Math.PI / 180);
          const x = Math.cos(rad) * radiusX;
          const y = Math.sin(rad) * radiusY;
          const isClicked = clickedCard === mod.id;
          const isOther = clickedCard && clickedCard !== mod.id;
          const isHovered = hoveredCard === mod.id;

          return (
            <motion.div
              key={mod.id}
              layoutId={`card-container-${mod.id}`}
              initial={{ x: 0, y: 0, opacity: 0 }}
              animate={{
                x: isClicked ? 0 : x + mousePos.x,
                y: isClicked ? 0 : y + mousePos.y,
                opacity: isOther ? 0 : 1,
                scale: isClicked ? 4 : (isHovered ? 1.15 : 1),
                zIndex: isClicked || isHovered ? 50 : 30
              }}
              transition={{
                type: "spring", stiffness: 50, damping: 15
              }}
              className="absolute pointer-events-auto"
            >
              <div
                onMouseEnter={() => handleMouseEnter(mod.id)}
                onMouseLeave={() => !clickedCard && setHoveredCard(null)}
                onClick={() => handleCardClick(mod)}
                className={`
                  group relative w-72 h-44
                  cursor-pointer transition-all duration-300
                  ${hoveredCard && !isHovered && !clickedCard ? 'opacity-30 blur-[2px] scale-95' : 'opacity-100'}
                  ${isClicked ? 'cursor-default' : ''}
                `}
              >
                {/* Visual Connector Line to Center */}
                {!clickedCard && !hoveredCard && (
                  <div
                    className="absolute top-1/2 left-1/2 h-[1px] bg-gradient-to-r from-transparent to-white/10 origin-left -z-10"
                    style={{
                      transform: `rotate(${mod.angle + 180}deg)`,
                      width: `${Math.hypot(x, y)}px` // Dynamic width based on ellipse position
                    }}
                  />
                )}

                {/* Card Body */}
                <motion.div
                  className={`
                     absolute inset-0
                     bg-[#0a0f18]/80 backdrop-blur-xl
                     border border-white/5
                     rounded-lg overflow-hidden
                     shadow-[0_0_20px_rgba(0,0,0,0.5)]
                     group-hover:border-white/20
                     group-hover:shadow-[0_0_30px_rgba(0,240,255,0.15)]
                     transition-all duration-500
                   `}
                  style={{
                    borderColor: isHovered ? mod.color : 'rgba(255,255,255,0.1)'
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

                  {/* Content Layout */}
                  <div className="p-5 h-full flex flex-col justify-between">
                    {/* Header: Icon + Status */}
                    <div className="flex justify-between items-start">
                      <div
                        className="p-2 rounded-md bg-white/5 text-white/70 group-hover:text-white group-hover:bg-white/10 transition-colors"
                        style={{ color: isHovered ? mod.color : undefined }}
                      >
                        <mod.icon size={24} />
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${isHovered ? 'animate-pulse' : ''}`} style={{ backgroundColor: mod.color }}></div>
                        <span className="text-[10px] font-mono font-bold text-white/30 tracking-wider">{mod.status}</span>
                      </div>
                    </div>

                    {/* Footer: Title & Arrow */}
                    <div>
                      <div className="text-[10px] font-mono text-white/40 mb-1">{mod.subtitle}</div>
                      <h3 className="text-xl font-header font-bold text-white uppercase tracking-wider group-hover:text-white transition-colors mb-2">
                        {mod.title}
                      </h3>

                      <div className="overflow-hidden h-0 group-hover:h-auto transition-all duration-300">
                        <p className="text-xs text-gray-400 line-clamp-2">{mod.description}</p>
                      </div>
                    </div>
                  </div>

                  {/* Hover Tech Decor */}
                  <div className="absolute bottom-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <ArrowRight size={16} style={{ color: mod.color }} />
                  </div>
                </motion.div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default TheBridge;
