import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

const VisibilityTimeline = ({ events, onPassSelect, selectedPassId }) => {
    const scrollRef = useRef(null);

    // Center "Now" on mount
    useEffect(() => {
        if (scrollRef.current) {
            // Simple center logic: "Now" is at ~20% of the timeline width (6h past / 30h total)
            const width = scrollRef.current.scrollWidth;
            scrollRef.current.scrollLeft = (width * 0.2) - (scrollRef.current.clientWidth / 2);
        }
    }, []);

    if (!events || events.length === 0) return null;

    // Timeline Configuration
    // 30 hours total * 60 mins = 1800 mins
    // Let's say 1 min = 2px width -> Total width = 3600px
    const PIXELS_PER_MIN = 3;
    const START_TIME = new Date(Date.now() - 6 * 60 * 60 * 1000).getTime(); // Match backend
    
    const getPosition = (isoTime) => {
        const time = new Date(isoTime).getTime();
        const diffMins = (time - START_TIME) / 60000;
        return diffMins * PIXELS_PER_MIN;
    };

    const nowPos = getPosition(new Date().toISOString());

    return (
        <div className="relative w-full h-32 bg-black/40 border-t border-white/10 overflow-hidden pointer-events-auto backdrop-blur-md">
            {/* Scroll Container */}
            <div 
                ref={scrollRef}
                className="w-full h-full overflow-x-auto overflow-y-hidden custom-scrollbar relative"
                style={{ scrollBehavior: 'smooth' }}
            >
                <div className="h-full relative" style={{ width: `${30 * 60 * PIXELS_PER_MIN}px` }}>
                    
                    {/* Time Grid (Every Hour) */}
                    {Array.from({ length: 30 }).map((_, i) => (
                        <div 
                            key={i} 
                            className="absolute top-0 bottom-0 border-l border-white/5"
                            style={{ left: `${i * 60 * PIXELS_PER_MIN}px` }}
                        >
                            <span className="text-[9px] text-white/30 ml-1 mt-1 font-mono">
                                {new Date(START_TIME + i * 3600000).getHours()}:00
                            </span>
                        </div>
                    ))}

                    {/* "NOW" Indicator */}
                    <div 
                        className="absolute top-0 bottom-0 border-l-2 border-red-500 z-20 flex flex-col items-center"
                        style={{ left: `${nowPos}px` }}
                    >
                        <div className="w-2 h-2 bg-red-500 rounded-full -ml-[1px]"></div>
                        <span className="text-[8px] bg-red-500 text-black font-bold px-1 rounded mt-1">NOW</span>
                    </div>

                    {/* Events */}
                    {events.map((event) => {
                        const start = getPosition(event.startTime);
                        const end = getPosition(event.endTime);
                        const width = Math.max(20, end - start); // Min width for visibility
                        const isSelected = selectedPassId === event.eventId;

                        // Color Logic
                        const isPast = new Date(event.endTime) < new Date();
                        const isActive = new Date(event.startTime) <= new Date() && new Date(event.endTime) >= new Date();
                        
                        let bgClass = "bg-white/20";
                        if (isActive) bgClass = "bg-green-500/50 border-green-400";
                        else if (isPast) bgClass = "bg-gray-600/30 border-gray-600";
                        else bgClass = "bg-[#00F0FF]/30 border-[#00F0FF]";

                        return (
                            <motion.button
                                key={event.eventId}
                                onClick={() => onPassSelect && onPassSelect(event)}
                                whileHover={{ scaleY: 1.1, zIndex: 10 }}
                                className={`absolute top-1/2 -translate-y-1/2 h-12 rounded border backdrop-blur-sm group flex items-center justify-center overflow-hidden transition-colors
                                    ${bgClass} ${isSelected ? 'border-white ring-1 ring-white' : ''}
                                `}
                                style={{ 
                                    left: `${start}px`, 
                                    width: `${width}px` 
                                }}
                            >
                                <span className="text-[9px] font-mono font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap px-1">
                                    {event.maxElevation}°
                                </span>
                            </motion.button>
                        );
                    })}
                </div>
            </div>
            
            {/* Legend / Overlay Controls (Optional) */}
            <div className="absolute bottom-2 right-4 flex gap-4 pointer-events-none">
                 <div className="flex items-center gap-1"><div className="w-2 h-2 bg-gray-500 rounded-full"></div><span className="text-[9px] text-white/40">PAST</span></div>
                 <div className="flex items-center gap-1"><div className="w-2 h-2 bg-green-500 rounded-full"></div><span className="text-[9px] text-white/40">ACTIVE</span></div>
                 <div className="flex items-center gap-1"><div className="w-2 h-2 bg-[#00F0FF] rounded-full"></div><span className="text-[9px] text-white/40">FUTURE</span></div>
            </div>
        </div>
    );
};

export default VisibilityTimeline;
