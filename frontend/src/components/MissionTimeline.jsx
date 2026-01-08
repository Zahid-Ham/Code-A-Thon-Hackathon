import React, { useRef, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, ChevronLeft, Rocket, History, Calendar } from 'lucide-react';

const MissionTimeline = ({
    pastMissions = [],
    presentMissions = [],
    futureMissions = [],
    events = [], // For compatibility with EventDashboard
    onSelectEvent,
    selectedEventId,
    activeCategory = 'PRESENT'
}) => {
    const scrollRef = useRef(null);

    // Performance: Memoize filtering logic
    const displayMissions = useMemo(() => {
        // If single events list is provided, use it
        if (events.length > 0) return events;

        switch (activeCategory) {
            case 'PAST':
                return [...pastMissions];
            case 'FUTURE':
                return [...futureMissions];
            case 'PRESENT':
            default:
                return [...presentMissions];
        }
    }, [activeCategory, pastMissions, presentMissions, futureMissions, events]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [activeCategory]);

    const Card = ({ evt, index }) => {
        const isActive = selectedEventId === evt.id;
        const isLeft = index % 2 === 0;

        return (
            <div className="relative flex items-center w-full min-h-[160px] group">
                {/* Central Spine Connection Point */}
                <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 z-20">
                    <motion.div
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        className={`w-4 h-4 rounded-full border-2 border-black ${isActive ? 'bg-[#00F0FF] shadow-[0_0_20px_#00F0FF]' : 'bg-white/20'} transition-all duration-300`}
                    />
                </div>

                {/* Alternating Row Structure */}
                <div className={`flex w-full ${isLeft ? 'flex-row' : 'flex-row-reverse'}`}>
                    {/* Content Side */}
                    <motion.div
                        initial={{ opacity: 0, x: isLeft ? -40 : 40 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-20px" }}
                        transition={{ duration: 0.5 }}
                        className="w-1/2 flex items-center px-12"
                    >
                        <div
                            onClick={() => onSelectEvent(evt)}
                            className={`
                                relative w-full p-6 rounded-2xl cursor-pointer transition-all duration-500
                                border backdrop-blur-3xl group/card
                                ${isActive
                                    ? 'bg-[#00F0FF]/10 border-[#00F0FF] shadow-[0_0_40px_rgba(0,240,255,0.15)]'
                                    : 'bg-white/[0.03] border-white/10 hover:border-white/30 hover:bg-white/[0.05]'}
                            `}
                        >
                            {/* Card Glow Background */}
                            <div className="absolute inset-0 rounded-2xl overflow-hidden opacity-0 group-hover/card:opacity-100 transition-opacity">
                                <div className="absolute top-0 left-0 w-32 h-32 bg-[#00F0FF]/10 blur-3xl -translate-x-1/2 -translate-y-1/2" />
                            </div>

                            <div className="relative z-10 flex gap-4 items-start">
                                {/* Thumbnail */}
                                <div className="hidden sm:block shrink-0 w-20 h-20 rounded-xl overflow-hidden border border-white/5">
                                    <img
                                        src={evt.image || 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=200'}
                                        alt=""
                                        loading="lazy"
                                        className="w-full h-full object-cover grayscale group-hover/card:grayscale-0 transition-all duration-500"
                                        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=200'; }}
                                    />
                                </div>

                                {/* Texts */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="text-[10px] font-mono text-[#00F0FF] tracking-[0.2em] font-bold">
                                            {new Date(evt.date).getFullYear()} • {new Date(evt.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                        </div>
                                    </div>

                                    <h4 className="text-white font-header font-bold text-lg leading-tight mb-1 group-hover/card:text-[#00F0FF] transition-colors truncate">
                                        {evt.name}
                                    </h4>

                                    <div className="flex items-center gap-2 text-[10px] font-mono text-white/40 uppercase tracking-wider">
                                        <span className="truncate">{evt.agency}</span>
                                        <span className="shrink-0 w-1 h-1 rounded-full bg-white/20" />
                                        <span style={{ color: evt.color }} className="shrink-0">{evt.status}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Pointer Arm to Center */}
                            <div className={`absolute top-1/2 -translate-y-1/2 w-8 h-[1px] bg-gradient-to-r ${isLeft ? 'from-transparent to-[#00F0FF]/30 -right-8' : 'from-[#00F0FF]/30 to-transparent -left-8'}`} />
                        </div>
                    </motion.div>

                    {/* Empty Side */}
                    <div className="w-1/2" />
                </div>
            </div>
        );
    };

    return (
        <div className="w-full h-full flex flex-col pt-8">
            {/* Legend / Status Overlay */}
            <div className="px-12 mb-8 flex justify-between items-center bg-white/[0.01] py-4 border-y border-white/5 backdrop-blur-md">
                <div className="flex flex-col">
                    <span className="text-[#00F0FF]/60 font-mono text-[9px] tracking-[0.4em] uppercase mb-1">DATASTREAM</span>
                    <h3 className="text-2xl font-header font-bold text-white tracking-widest uppercase">
                        {activeCategory === 'PAST' && 'PAST ARCHIVES'}
                        {activeCategory === 'PRESENT' && 'PRESENT (ONGOING)'}
                        {activeCategory === 'FUTURE' && 'UPCOMING (FUTURE)'}
                    </h3>
                </div>
                <div className="text-right">
                    <div className="text-[10px] font-mono text-white/40 uppercase tracking-widest mb-1">SEQUENCES LOADED</div>
                    <div className="text-xl font-mono text-[#00F0FF] tabular-nums font-bold">{displayMissions.length}</div>
                </div>
            </div>

            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto px-4 pb-48 no-scrollbar relative"
            >
                {/* Vertical Central Line (The Spine) */}
                <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-white/10 via-white/10 to-transparent transform -translate-x-1/2 pointer-events-none">
                    {/* Animated Pulse on Line */}
                    <motion.div
                        animate={{ top: ['0%', '100%'], opacity: [0, 1, 0] }}
                        transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                        className="absolute w-1 h-20 bg-gradient-to-b from-transparent via-[#00F0FF] to-transparent -left-[1.5px]"
                    />
                </div>

                {displayMissions.length > 0 ? (
                    <div className="relative space-y-4">
                        {displayMissions.map((evt, idx) => (
                            <Card key={evt.id} evt={evt} index={idx} />
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

            {/* Bottom Gradient Fade */}
            <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-black via-black/80 to-transparent z-10 pointer-events-none" />
        </div>
    );
};

export default MissionTimeline;
