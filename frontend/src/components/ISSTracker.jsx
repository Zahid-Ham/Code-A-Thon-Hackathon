import React, { useState, useEffect } from 'react';
import { Clock, Eye, Navigation, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL } from '../services/api';

const ISSTracker = ({ userLocation }) => {
    const [nextPass, setNextPass] = useState(null);
    const [timeRemaining, setTimeRemaining] = useState('');
    const [loading, setLoading] = useState(true);
    const [passActive, setPassActive] = useState(false);

    useEffect(() => {
        if (!userLocation) return;

        const fetchPasses = async () => {
            try {
                // ISS ID = 25544
                const res = await fetch(`${API_BASE_URL}/satellite/visual-passes/25544?lat=${userLocation.lat}&lng=${userLocation.lng}`);
                const data = await res.json();
                
                if (data.passes && data.passes.length > 0) {
                    setNextPass(data.passes[0]);
                }
                setLoading(false);
            } catch (err) {
                console.error("Failed to fetch ISS passes", err);
                setLoading(false);
            }
        };

        fetchPasses();
    }, [userLocation]);

    useEffect(() => {
        if (!nextPass) return;

        const interval = setInterval(() => {
            const now = new Date().getTime();
            const start = nextPass.startUTC * 1000;
            const end = nextPass.endUTC * 1000;

            if (now >= start && now <= end) {
                setPassActive(true);
                setTimeRemaining('OVERHEAD NOW');
            } else if (now < start) {
                const diff = start - now;
                const h = Math.floor(diff / (1000 * 60 * 60));
                const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const s = Math.floor((diff % (1000 * 60)) / 1000);
                setTimeRemaining(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
            } else {
                // Pass passed, should re-fetch strictly speaking, but for now just show passed
                setTimeRemaining('Pass Completed');
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [nextPass]);

    if (loading) {
        return (
            <div className="mt-4 p-4 rounded-xl border border-cyan-500/30 bg-black/40 backdrop-blur-md">
                <div className="flex items-center gap-2 text-cyan-400 animate-pulse">
                    <Clock size={16} />
                    <span className="text-xs font-mono tracking-widest">SCANNING SKIES...</span>
                </div>
            </div>
        );
    }

    if (!nextPass) {
         return (
            <div className="mt-4 p-4 rounded-xl border border-white/10 bg-black/40 backdrop-blur-md">
                <div className="flex items-center gap-2 text-white/50">
                    <AlertCircle size={16} />
                    <span className="text-xs font-mono tracking-widest">NO PASSES DETECTED</span>
                </div>
                <div className="text-[10px] text-white/30 run-in mt-1">
                    No visual passes in next 10 days for your sector.
                </div>
            </div>
        );
    }

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`
                mt-4 p-4 rounded-xl border backdrop-blur-md relative overflow-hidden
                ${passActive ? 'bg-red-900/40 border-red-500 shadow-[0_0_30px_rgba(255,0,0,0.3)]' : 'bg-black/40 border-cyan-500/30'}
            `}
        >
            {/* Radar Scan Effect */}
            <div className="absolute inset-0 pointer-events-none opacity-20">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent animate-scan"></div>
            </div>

            <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                     <div className={`w-2 h-2 rounded-full ${passActive ? 'bg-red-500 animate-ping' : 'bg-cyan-500'}`}></div>
                     <span className={`text-xs font-mono tracking-widest ${passActive ? 'text-red-400' : 'text-cyan-400'}`}>
                        ISSTracker // {passActive ? 'TARGET LOCKED' : 'ACQUISITION'}
                     </span>
                </div>
                {passActive && <AlertCircle size={14} className="text-red-500 animate-pulse" />}
            </div>

            <div className="text-center py-2">
                <div className="text-4xl font-mono font-bold text-white tracking-widest tabular-nums drop-shadow-lg">
                    {timeRemaining}
                </div>
                <div className="text-[10px] text-white/40 uppercase tracking-[0.2em] mt-1">
                    {passActive ? 'VISUAL CONTACT CONFIRMED' : 'TIME TO NEXT VISUAL PASS'}
                </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-white/10 text-center">
                <div>
                     <div className="text-white font-bold">{nextPass.duration}s</div>
                     <div className="text-[9px] text-white/40 uppercase">Duration</div>
                </div>
                <div>
                     <div className="text-white font-bold">{nextPass.mag}</div>
                     <div className="text-[9px] text-white/40 uppercase">Mag</div>
                </div>
                <div>
                     <div className="text-white font-bold">{nextPass.startAzCompass}</div>
                     <div className="text-[9px] text-white/40 uppercase">Look</div>
                </div>
            </div>
            
            <div className="mt-2 text-[10px] text-center text-white/30 italic">
                Wait for {nextPass.startAzCompass}...
            </div>
        </motion.div>
    );
};

export default ISSTracker;
