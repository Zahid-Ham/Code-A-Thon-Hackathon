import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, ChevronLeft, Rocket, History, Calendar } from 'lucide-react';

const MissionTimeline = ({
    pastMissions = [],
    presentMissions = [],
    futureMissions = [],
    events = [], // Support direct event array for Celestial Command
    onSelectEvent,
    selectedEventId,
    activeCategory = 'PRESENT',
    horizontal = false // New Prop
}) => {
    const scrollRef = useRef(null);

    // Dynamic Filtering Logic
    const getFilteredMissions = () => {
        if (events && events.length > 0) return events; // Priority to direct events
        switch (activeCategory) {
            case 'PAST': return [...pastMissions];
            case 'FUTURE': return [...futureMissions];
            case 'PRESENT':
            default: return [...presentMissions];
        }
    };

    const displayMissions = getFilteredMissions();

    // Separate effects to ensure stable hook dependency sizes and fix HMR issues
    useEffect(() => {
        if (!horizontal && scrollRef.current) {
            scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [activeCategory]);

    useEffect(() => {
        if (horizontal && scrollRef.current) {
            scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        }
    }, [horizontal]);

    const Card = ({ evt, index }) => {
        const isActive = selectedEventId === evt.id;

        if (horizontal) {
            return (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    onClick={() => onSelectEvent(evt)}
                    className={`
                        relative shrink-0 w-72 p-4 rounded-xl cursor-pointer transition-all duration-300
                        border backdrop-blur-xl group/card
                        ${isActive
                            ? 'bg-[#00F0FF]/15 border-[#00F0FF] shadow-[0_0_30px_rgba(0,240,255,0.2)]'
                            : 'bg-black/40 border-white/10 hover:border-[#00F0FF]/50 hover:bg-white/5'}
                    `}
                >
                    <div className="flex gap-3 items-center">
                        <div className="shrink-0 w-12 h-12 rounded-lg overflow-hidden border border-white/10 bg-black/40">
                            <img
                                src={evt.image || 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=150'}
                                alt=""
                                className={`w-full h-full object-cover transition-all duration-500 ${isActive ? 'grayscale-0' : 'grayscale group-hover/card:grayscale-0'}`}
                                onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=150'; }}
                            />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-[9px] font-mono text-[#00F0FF] mb-0.5">
                                {(() => {
                                    const d = new Date(evt.date);
                                    if (isNaN(d.getTime())) return evt.date || 'TBD';
                                    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
                                })()}
                            </div>
                            <h4 className="text-white font-bold text-sm truncate group-hover/card:text-[#00F0FF] transition-colors">
                                {evt.name || evt.title || evt.label}
                            </h4>
                            <div className="text-[9px] text-white/40 uppercase tracking-wider truncate">
                                {evt.agency || evt.type || 'MISSION'}
                            </div>
                        </div>
                    </div>
                </motion.div>
            );
        }

        const isLeft = index % 2 === 0;
        return (
            <div className="relative flex items-center w-full min-h-[160px] group">
                <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 z-40">
                    <motion.div
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        className={`w-4 h-4 rounded-full border-2 border-black ${isActive ? 'bg-[#2DD4BF] shadow-[0_0_20px_#2DD4BF]' : 'bg-[#2DD4BF]/40'} transition-all duration-300`}
                    />
                </div>

                <div className={`flex w-full ${isLeft ? 'flex-row' : 'flex-row-reverse'}`}>
                    <motion.div
                        initial={{ opacity: 0, x: isLeft ? -40 : 40 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        className="w-1/2 flex items-center px-12"
                    >
                        <div
                            onClick={() => onSelectEvent(evt)}
                            className={`
                                relative w-full p-6 rounded-2xl cursor-pointer transition-all duration-500
                                border-2 backdrop-blur-3xl group/card
                                ${isActive
                                    ? 'bg-[#2DD4BF]/10 border-[#2DD4BF] shadow-[0_0_50px_rgba(45,212,191,0.2)]'
                                    : 'bg-white/[0.03] border-[#2DD4BF]/60 hover:border-[#2DD4BF]/90 hover:bg-white/[0.05]'}
                            `}
                        >
                            <div className="relative z-10 flex gap-4 items-start">
                                <div className="hidden sm:block shrink-0 w-20 h-20 rounded-xl overflow-hidden border border-white/5">
                                    <img
                                        src={evt.image || 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=200'}
                                        alt=""
                                        className="w-full h-full object-cover grayscale group-hover/card:grayscale-0 transition-all duration-500"
                                        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=200'; }}
                                    />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="text-[10px] font-mono text-[#2DD4BF] tracking-[0.2em] font-bold">
                                            {(() => {
                                                const d = new Date(evt.date);
                                                if (isNaN(d.getTime())) return evt.date || 'TBD';
                                                return `${d.getFullYear()} • ${d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
                                            })()}
                                        </div>
                                    </div>

                                    <h4 className="text-white font-header font-bold text-lg leading-tight mb-1 group-hover/card:text-[#2DD4BF] transition-colors truncate">
                                        {evt.name || evt.title || evt.label || 'Unknown Mission'}
                                    </h4>

                                    <div className="flex items-center gap-2 text-[10px] font-mono text-white/40 uppercase tracking-wider">
                                        <span className="truncate">{evt.agency || evt.type || 'In-House'}</span>
                                        <span className="shrink-0 w-1 h-1 rounded-full bg-white/20" />
                                        <span style={{ color: evt.color || '#2DD4BF' }} className="shrink-0">{evt.status || 'Active'}</span>
                                    </div>
                                </div>
                            </div>
                            <div className={`absolute top-1/2 -translate-y-1/2 w-8 h-[1px] bg-gradient-to-r ${isLeft ? 'from-transparent to-[#2DD4BF]/50 -right-8' : 'from-[#2DD4BF]/50 to-transparent -left-8'}`} />
                        </div>
                    </motion.div>
                    <div className="w-1/2" />
                </div>
            </div>
        );
    };

    if (horizontal) {
        return (
            <div className="w-full h-32 relative z-50">
                <div
                    ref={scrollRef}
                    className="flex items-center gap-4 px-8 py-4 overflow-x-auto no-scrollbar scroll-smooth"
                >
                    {displayMissions.map((evt, idx) => (
                        <Card key={evt.id || idx} evt={evt} index={idx} />
                    ))}
                    {displayMissions.length === 0 && (
                        <div className="text-white/20 font-mono text-xs uppercase tracking-widest px-8">
                            SCANNING_SECTOR_FOR_EVENTS...
                        </div>
                    )}
                </div>
                {/* Horizontal Fade Edges */}
                <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-black to-transparent pointer-events-none" />
                <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-black to-transparent pointer-events-none" />
            </div>
        );
    }

    return (
        <div className="w-full h-full flex flex-col">
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto px-4 pb-48 no-scrollbar relative"
            >
                <div
                    className="absolute left-1/2 top-0 bottom-0 w-[4px] bg-[#2DD4BF] transform -translate-x-1/2 pointer-events-none z-30 shadow-[0_0_15px_rgba(45,212,191,0.4)]"
                />

                {displayMissions.length > 0 ? (
                    <div className="relative space-y-4">
                        {displayMissions.map((evt, idx) => (
                            <Card key={evt.id || idx} evt={evt} index={idx} />
                        ))}
                    </div>
                ) : (
                    <div className="h-full flex items-center justify-center">
                        <div className="text-center opacity-20 font-mono text-sm tracking-[0.5em] uppercase px-12 leading-loose">
                            SECTOR EMPTY <br /> ARCHIVE RETRIEVAL PENDING
                        </div>
                    </div>
                )}
            </div>
            <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-black via-black/80 to-transparent z-10 pointer-events-none" />
        </div>
    );
};

export default MissionTimeline;
