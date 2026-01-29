import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket } from 'lucide-react';

const RocketOverlay = ({ isFlying }) => {
    return (
        <AnimatePresence>
            {isFlying && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-[60] pointer-events-none flex items-center justify-center overflow-hidden"
                >
                    {/* Warp Speed Lines - Radial Gradient Burst */}
                    <div className="absolute inset-0 bg-gradient-radial from-transparent to-black/20" />
                    
                    {/* CSS Animation for Stars/Lines passing by */}
                    <div className="absolute inset-0 warp-speed-effect opacity-50" />

                    {/* Central Rocket */}
                    <motion.div
                        initial={{ scale: 0.5, y: 100 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 1.5, y: -200, opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="relative z-10 p-4"
                    >
                        <div className="relative">
                            <Rocket size={64} className="text-[#00F0FF] fill-black/50 rotate-45" />
                            {/* Thruster Flame */}
                            <div className="absolute -bottom-4 -left-4 w-8 h-8 bg-orange-500 rounded-full blur-md animate-pulse" />
                            <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-yellow-300 rounded-full blur-sm" />
                        </div>
                    </motion.div>

                    {/* Minimal HUD overlay */}
                    <div className="absolute bottom-32 text-[#00F0FF] font-mono text-xs tracking-[0.5em] animate-pulse">
                        W A R P___E N G A G E D
                    </div>
                    
                    {/* Styles for Warp Effect (Injected here or assume in index.css, injecting style tag for portability) */}
                    <style>{`
                        .warp-speed-effect {
                            background: 
                                linear-gradient(90deg, transparent 0%, rgba(0, 240, 255, 0.5) 50%, transparent 100%);
                            background-size: 200% 100%;
                            animation: warpMove 0.2s linear infinite;
                            transform: skewX(-20deg);
                        }
                        @keyframes warpMove {
                            0% { background-position: 100% 0; }
                            100% { background-position: -100% 0; }
                        }
                    `}</style>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default RocketOverlay;
