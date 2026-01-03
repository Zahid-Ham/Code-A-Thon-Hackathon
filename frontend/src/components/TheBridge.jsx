import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom'; // Import Link and useNavigate
import {
  Map,
  Sun,
  Clock,
  GraduationCap,
  Satellite,
  ArrowRight
} from 'lucide-react';
import SpaceDust from './SpaceDust';
import { useSound } from '../contexts/SoundContext'; // Import sound context

// --- Configuration Data ---
const modules = [
// ... (modules config remains same, ensure links match routes)
  {
    id: 'celestial-command',
    title: 'Celestial Command',
    description: 'Mapbox Event Dashboard',
    icon: Map,
    angle: 0,
    color: '#00F0FF',
    link: '/events' 
  },
  {
    id: 'solar-overwatch',
    title: 'Solar Overwatch',
    description: 'Cosmic Weather / DONKI',
    icon: Sun,
    angle: 72,
    color: '#FFD700',
    link: '/solar'
  },
  {
    id: 'chrono-archive',
    title: 'Chrono-Archive',
    description: 'Mission Timeline',
    icon: Clock,
    angle: 144,
    color: '#FF0055',
    link: '/timeline'
  },
  {
    id: 'academy',
    title: 'Academy',
    description: 'Learning & Quizzes',
    icon: GraduationCap,
    angle: 216,
    color: '#00FF99',
    link: '/academy'
  },
  {
    id: 'terra-vision',
    title: 'Terra-Vision',
    description: 'Satellite Impact / Crop Health',
    icon: Satellite,
    angle: 288,
    color: '#AA00FF',
    link: '/terra'
  }
];

const TheBridge = () => {
  const [hoveredCard, setHoveredCard] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [clickedCard, setClickedCard] = useState(null); // Track clicked state
  const containerRef = useRef(null);
  const { playHover, playWarp } = useSound(); // Use hooks
  const navigate = useNavigate();

  // --- Parallax Effect ---
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!containerRef.current) return;
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX - innerWidth / 2) / 50; 
      const y = (e.clientY - innerHeight / 2) / 50;
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // --- Interaction Handlers ---
  const handleMouseEnter = (id) => {
    if (clickedCard) return; // Disable hover during transition
    setHoveredCard(id);
    playHover();
  };

  const handleCardClick = (mod) => {
    setClickedCard(mod.id);
    playWarp();
    // Delay navigation to allow zoom animation
    setTimeout(() => {
        navigate(mod.link);
    }, 800); // 0.8s delay matching warp effect
  };

  const radius = 350; 

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen overflow-hidden bg-[#050505] text-white font-sans selection:bg-cyan-500/30"
    >
      {/* 1. Background Visuals */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-[#050505] to-[#050505] z-0" />
      <SpaceDust />

      <AnimatePresence>
        {hoveredCard && !clickedCard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black z-10 pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* 2. Center Content - Hide when clicked */}
      {!clickedCard && (
          <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
            <motion.div
            style={{
                x: mousePos.x * -1,
                y: mousePos.y * -1
            }}
            className="relative z-20 flex flex-col items-center justify-center"
            >
            <motion.h1
                animate={{
                textShadow: [
                    "0 0 20px rgba(0, 240, 255, 0.5)",
                    "0 0 40px rgba(0, 240, 255, 0.8)",
                    "0 0 20px rgba(0, 240, 255, 0.5)"
                ]
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className={`font-['Orbitron'] text-6xl md:text-8xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-white to-cyan-500 uppercase ${hoveredCard ? 'blur-sm scale-95 opacity-50' : ''} transition-all duration-500`}
            >
                SpaceScope
            </motion.h1>
            <p className={`mt-4 text-cyan-200/60 font-mono tracking-[0.5em] text-sm md:text-base ${hoveredCard ? 'opacity-30' : ''} transition-all duration-500`}>
                NEXUS TERMINAL v.2.4
            </p>
            </motion.div>
        </div>
      )}

      {/* 3. Orbiting Modules */}
      <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
        {modules.map((mod, index) => {
          const rad = (mod.angle - 90) * (Math.PI / 180);
          const x = Math.cos(rad) * radius;
          const y = Math.sin(rad) * radius;
          const isClicked = clickedCard === mod.id;
          const isOther = clickedCard && clickedCard !== mod.id;

          return (
            <motion.div
              key={mod.id}
              layoutId={`card-container-${mod.id}`} // For layout expansion
              initial={{ x: 0, y: 0, opacity: 0 }}
              animate={{
                x: isClicked ? 0 : (hoveredCard === mod.id ? 0 : x), // Center if clicked
                y: isClicked ? 0 : (hoveredCard === mod.id ? 0 : y),
                opacity: isOther ? 0 : 1, // Hide others
                scale: isClicked ? 5 : (hoveredCard === mod.id ? 1.1 : 1), // Zoom big if clicked
                zIndex: isClicked || hoveredCard === mod.id ? 50 : 30
              }}
              transition={{
                 type: "spring",
                 stiffness: 60,
                 damping: 15
              }}
              className="absolute pointer-events-auto"
            >
              <div
                onMouseEnter={() => handleMouseEnter(mod.id)}
                onMouseLeave={() => !clickedCard && setHoveredCard(null)}
                onClick={() => handleCardClick(mod)}
                className={`
                  group relative w-64 h-80
                  cursor-pointer transition-all duration-500
                  ${hoveredCard && hoveredCard !== mod.id && !clickedCard ? 'opacity-20 blur-sm scale-90' : 'opacity-100'}
                  ${isClicked ? 'cursor-default' : ''}
                `}
              >
                {/* Card Container */}
                <motion.div
                   layoutId={`card-bg-${mod.id}`}
                   className={`
                     absolute inset-0
                     bg-gray-900/40 backdrop-blur-[20px]
                     border border-white/10
                     rounded-xl overflow-hidden
                     transition-all duration-500
                   `}
                   style={{
                     borderColor: hoveredCard === mod.id || isClicked ? mod.color : 'rgba(255,255,255,0.1)',
                     boxShadow: hoveredCard === mod.id || isClicked ? `0 0 30px ${mod.color}40` : 'none'
                   }}
                >
                   {/* ... Content remains same ... */}
                   {/* Inner Glow Gradient */}
                    <div
                        className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500 bg-gradient-to-t from-transparent to-white"
                        style={{ background: `linear-gradient(to bottom, ${mod.color}20, transparent)` }}
                    />

                    {/* Content */}
                    <div className="absolute inset-0 p-6 flex flex-col items-center justify-between text-center z-10">
                        {/* Top: Icon */}
                        <div
                        className="w-16 h-16 rounded-full flex items-center justify-center bg-white/5 border border-white/10 group-hover:scale-110 transition-transform duration-500"
                        style={{ color: mod.color }}
                        >
                        <mod.icon size={32} />
                        </div>

                        {/* Middle: Text */}
                        <div className="flex flex-col gap-2">
                            <h3 className="font-['Rajdhani'] font-bold text-2xl text-white tracking-wide uppercase group-hover:text-white transition-colors">
                                {mod.title}
                            </h3>
                            <p className="text-sm text-gray-400 font-medium leading-relaxed group-hover:text-gray-300">
                                {mod.description}
                            </p>
                        </div>

                        {/* Bottom: Action Trigger */}
                        <div className={`
                            flex items-center gap-2 text-xs font-bold tracking-widest uppercase
                            transition-all duration-300
                            ${hoveredCard === mod.id ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
                        `}
                        style={{ color: mod.color }}
                        >
                        <span>Engage</span>
                        <ArrowRight size={14} />
                        </div>
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
