import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Clock, ChevronRight, ChevronLeft } from 'lucide-react';

const MissionTimeline = ({ events, onSelectEvent, selectedEventId }) => {
    const scrollRef = useRef(null);
    // Sort events by date (Mock sort for mixed string formats, ideally use proper Date objects)
    const sortedEvents = [...events].sort((a, b) => a.type === 'HAZARD' ? 1 : -1); 

    const scroll = (direction) => {
        if (scrollRef.current) {
            const { current } = scrollRef;
            const scrollAmount = direction === 'left' ? -300 : 300;
            current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    return (
        <>
            {/* Layer 1: Vignette (Background Gradient) */}
            <div className="absolute bottom-0 left-0 w-full h-64 bg-gradient-to-t from-black via-black/80 to-transparent z-10 pointer-events-none" />

            {/* Layer 2: Interactive UI */}
            <div className="absolute bottom-8 left-0 w-full flex flex-col items-center z-20 pointer-events-none">
                <h3 className="text-[#00F0FF] font-mono text-xs tracking-[0.5em] mb-4 opacity-70 flex items-center gap-4 pointer-events-auto">
                    <button onClick={() => scroll('left')} className="hover:text-white transition-colors p-2"><ChevronLeft /></button>
                    UPCOMING TRAJECTORY
                    <button onClick={() => scroll('right')} className="hover:text-white transition-colors p-2"><ChevronRight /></button>
                </h3>
            
                <div 
                    ref={scrollRef} 
                    className="flex gap-4 overflow-x-auto w-full max-w-6xl px-8 pb-8 pointer-events-auto snap-x scroll-smooth"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }} // Hide scrollbar for cleaner look
                >
                    {sortedEvents.map((evt, i) => {
                        const isActive = selectedEventId === evt.id;
                        return (
                            <motion.div
                                key={evt.id}
                                initial={{ opacity: 0, y: 50 }}
                                animate={{ opacity: 1, y: 0, scale: isActive ? 1.05 : 1, borderColor: isActive ? evt.color : 'rgba(255,255,255,0.1)' }}
                                transition={{ delay: i * 0.1 }}
                                onClick={() => onSelectEvent(evt)}
                                className={`snap-center shrink-0 w-64 p-4 rounded-xl border backdrop-blur-md bg-black/50 hover:bg-black/70 hover:border-[#00F0FF]/50 transition-all cursor-pointer group relative overflow-hidden ${isActive ? 'ring-2 ring-offset-2 ring-offset-black' : 'border-white/10'}`}
                                style={{ '--ring-color': evt.color }}
                            >
                                {/* Hover Glow */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#00F0FF]/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                                
                                <div className="flex justify-between items-start mb-2">
                                    <div className={`w-2 h-2 rounded-full shadow-[0_0_8px]`} style={{ backgroundColor: evt.color, boxShadow: `0 0 8px ${evt.color}` }} />
                                    <span className="text-[10px] font-mono text-white/40">{evt.date}</span>
                                </div>
                                
                                <h4 className="font-header font-bold text-lg text-white group-hover:text-[#00F0FF] transition-colors truncate">
                                    {evt.label}
                                </h4>
                                
                                <div className="mt-2 flex items-center justify-between text-xs text-white/50 group-hover:text-white/80">
                                    <span>{evt.type}</span>
                                    <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </>
    );
};
export default MissionTimeline;
