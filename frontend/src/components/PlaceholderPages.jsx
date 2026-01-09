import React from 'react';
import { motion } from 'framer-motion';

const pages = [
  { id: 'celestial-command', title: 'Celestial Command', path: '/events', color: '#00F0FF' },
  { id: 'solar-overwatch', title: 'Solar Overwatch', path: '/solar', color: '#FFD700' },
  { id: 'chrono-archive', title: 'Chrono-Archive', path: '/timeline', color: '#FF0055' },
  { id: 'academy', title: 'Academy', path: '/academy', color: '#00FF99' },
  { id: 'terra-vision', title: 'Terra-Vision', path: '/terra', color: '#AA00FF' },
];

const PlaceholderPage = ({ title, color }) => (
  <div className="w-full h-screen flex flex-col items-center justify-center bg-black text-white relative overflow-hidden">
    <div className="absolute inset-0 opacity-20" style={{ background: `radial-gradient(circle at center, ${color}, transparent 70%)` }} />
    <motion.h1
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="font-['Orbitron'] text-5xl md:text-7xl font-bold uppercase z-10 text-center"
      style={{ textShadow: `0 0 30px ${color}` }}
    >
      {title}
    </motion.h1>
    <p className="mt-4 font-mono text-gray-400 z-10">Destination Module Loaded</p>
    <a href="/dashboard" className="mt-8 px-6 py-2 border border-white/20 rounded-full hover:bg-white/10 transition-colors z-10">
      Return to Bridge
    </a>
  </div>
);

export const TerraVisionPlaceholder = () => <PlaceholderPage title="Terra-Vision" color="#AA00FF" />;
