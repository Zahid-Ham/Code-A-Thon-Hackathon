import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, Binary, Shield, Search, ExternalLink, Image as ImageIcon, ArrowRight, RefreshCcw } from 'lucide-react';

const MissionImage = ({ src, alt, isRight }) => {
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(true);

    return (
        <div className="relative group w-full h-full">
            {/* Decorative Elements */}
            <div className="absolute -inset-4 border border-cyan-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
            <div className="absolute -top-2 -left-2 w-8 h-8 border-t-2 border-l-2 border-cyan-500/40 rounded-tl-xl pointer-events-none" />
            <div className="absolute -bottom-2 -right-2 w-8 h-8 border-b-2 border-r-2 border-cyan-500/40 rounded-br-xl pointer-events-none" />

            <div className="aspect-video rounded-xl overflow-hidden border border-white/10 shadow-2xl relative bg-[#0a0f18]">
                {loading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/[0.02] animate-pulse">
                        <Rocket className="text-cyan-500/20 animate-bounce" size={40} />
                    </div>
                )}

                {error ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-cyan-500/5 transition-colors">
                        <ImageIcon className="text-cyan-500/20" size={48} />
                        <span className="text-[10px] font-mono text-cyan-500/40 tracking-widest uppercase text-center px-8">
                            Imagery Stream Interrupted<br />Check Orbital Feed
                        </span>
                    </div>
                ) : (
                    <img
                        src={src}
                        alt={alt}
                        loading="lazy"
                        className={`w-full h-full object-cover transition-all duration-1000 ${loading ? 'opacity-0 scale-110' : 'opacity-100 scale-100'} grayscale-[20%] group-hover:grayscale-0 group-hover:scale-105`}
                        onLoad={() => setLoading(false)}
                        onError={() => {
                            setError(true);
                            setLoading(false);
                        }}
                    />
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-[#020408] via-transparent to-transparent opacity-60" />

                <div className="absolute bottom-4 left-4 flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${error ? 'bg-red-500' : 'bg-cyan-500 animate-ping'}`} />
                    <span className="text-[10px] font-mono text-white/60 tracking-widest uppercase">
                        {error ? 'Telemetry Failure' : 'Visual Confirmation Sync'}
                    </span>
                </div>
            </div>

            {/* Image Tech Label */}
            <div className={`absolute -bottom-6 ${isRight ? 'left-0' : 'right-0'} text-[8px] font-mono text-white/20 uppercase tracking-widest`}>
                Source: {error ? 'null_pointer' : 'orbital_telemetry_v5.raw'}
            </div>
        </div>
    );
};

const MissionStoryLine = ({ briefings, themeTitle }) => {
    const topRef = useRef(null);

    // Performance: Memoize sorting to prevent recalculation on every render
    const sortedBriefings = useMemo(() =>
        [...briefings].sort((a, b) => a.sequence - b.sequence),
        [briefings]);

    // Performance: Memoize grouping by Era
    const eras = useMemo(() => {
        return sortedBriefings.reduce((acc, brief) => {
            const era = brief.era || 'Unknown';
            if (!acc[era]) acc[era] = [];
            acc[era].push(brief);
            return acc;
        }, {});
    }, [sortedBriefings]);

    // Cache sequence indexes to avoid re-finding in loop
    const sequenceMap = useMemo(() => {
        const map = new Map();
        sortedBriefings.forEach((b, idx) => map.set(b.id, idx));
        return map;
    }, [sortedBriefings]);

    // Scroll to top when theme/briefings change
    useEffect(() => {
        if (topRef.current) {
            topRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [themeTitle, briefings.length]);

    const getIcon = (theme) => {
        if (theme === 'Global Guardians') return <Shield size={24} />;
        return <Search size={24} />;
    };

    return (
        <div ref={topRef} className="flex flex-col gap-16 py-10 relative">
            {/* Visual Header Milestone */}
            <div className="flex items-center gap-6 mb-8 relative z-10 px-4 md:px-0">
                <div className="w-16 h-16 rounded-full bg-cyan-500/20 border-2 border-cyan-500/40 flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.2)]">
                    <Rocket size={32} className="text-cyan-400 rotate-45" />
                </div>
                <div>
                    <h2 className="text-4xl font-bold tracking-tighter text-white uppercase italic leading-tight">
                        {themeTitle}
                    </h2>
                    <div className="flex items-center gap-2 mt-1">
                        <div className="h-1 w-12 bg-cyan-500 rounded-full"></div>
                        <p className="text-white/40 font-mono text-[10px] tracking-[0.4em] uppercase font-bold">Chronological Chain of Discovery</p>
                    </div>
                </div>

                <div className="ml-auto hidden sm:block glass-panel px-4 py-2 border border-cyan-500/20 bg-cyan-500/5">
                    <span className="text-[10px] font-mono text-cyan-400 tracking-widest uppercase font-bold">Origin Point</span>
                </div>
            </div>

            {/* Main Timeline Content */}
            <div className="relative px-4 md:px-0">
                {/* Continuous Vertical Line */}
                <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-[2px] bg-gradient-to-b from-cyan-500/20 via-cyan-500/60 to-cyan-500/20 hidden md:block" />

                {Object.entries(eras).map(([era, missions]) => (
                    <div key={era} className="mb-32 last:mb-0">
                        {/* Era Divider */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-4 mb-20"
                        >
                            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/10" />
                            <div className="px-8 py-2 rounded-full border border-white/10 bg-[#0a0f18] backdrop-blur-md shadow-[0_0_20px_rgba(255,255,255,0.02)]">
                                <span className="text-[10px] font-mono text-white/50 tracking-[0.6em] uppercase font-black">
                                    {era} ERA
                                </span>
                            </div>
                            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/10" />
                        </motion.div>

                        <div className="flex flex-col gap-48">
                            {missions.map((brief) => {
                                // Performance: Use pre-calculated sequenceMap
                                const globalIndex = sequenceMap.get(brief.id);
                                const isRight = globalIndex % 2 !== 0;

                                return (
                                    <div key={brief.id} className="relative">
                                        {/* Timeline Node */}
                                        <div className="absolute left-8 md:left-1/2 top-10 w-6 h-6 -ml-3 rounded-full border-4 border-cyan-500 bg-[#020408] shadow-[0_0_20px_rgba(6,182,212,0.6)] z-30 flex items-center justify-center">
                                            <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
                                        </div>

                                        <div className={`flex flex-col md:flex-row gap-16 md:gap-32 items-center ${isRight ? 'md:flex-row-reverse' : ''}`}>
                                            {/* Info Card */}
                                            <motion.div
                                                initial={{ opacity: 0, x: isRight ? 50 : -50 }}
                                                whileInView={{ opacity: 1, x: 0 }}
                                                viewport={{ once: true, margin: "-50px" }}
                                                transition={{ duration: 0.6, ease: "easeOut" }}
                                                className="flex-1 w-full"
                                            >
                                                <div className={`glass-panel p-8 border border-white/10 bg-white/[0.02] hover:border-cyan-500/30 transition-all group relative z-10 ${isRight ? 'text-right' : 'text-left'}`}>
                                                    <div className="absolute inset-0 bg-cyan-500/0 group-hover:bg-cyan-500/[0.03] transition-colors duration-500 -z-10" />

                                                    <div className={`flex flex-col mb-6 ${isRight ? 'items-end' : 'items-start'}`}>
                                                        <div className="flex items-center gap-4 mb-2">
                                                            {!isRight && <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">{getIcon(brief.theme)}</div>}
                                                            <h3 className="text-2xl font-black tracking-tight group-hover:text-cyan-400 transition-colors uppercase leading-none">
                                                                {brief.title}
                                                            </h3>
                                                            {isRight && <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">{getIcon(brief.theme)}</div>}
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <span className="text-[9px] font-mono px-2 py-1 rounded bg-white/5 border border-white/10 text-white/40 uppercase font-bold tracking-widest">
                                                                {brief.difficulty}
                                                            </span>
                                                            <span className="text-[9px] font-mono px-2 py-1 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 uppercase font-bold tracking-widest">
                                                                {brief.duration} READ
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <p className="text-sm text-white/60 leading-relaxed mb-8 font-light">
                                                        {brief.content}
                                                    </p>

                                                    {/* Specs Grid */}
                                                    <div className={`grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8 ${isRight ? 'ml-auto' : ''}`}>
                                                        {Object.entries(brief.technicalData).map(([key, val]) => (
                                                            <div key={key} className="p-3 border border-white/5 bg-white/[0.01] rounded-xl hover:bg-white/[0.03] transition-colors">
                                                                <div className="text-[8px] text-white/30 font-mono tracking-widest uppercase mb-1">{key}</div>
                                                                <div className="text-xs font-bold text-cyan-400 tracking-tight">{val}</div>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    <div className={`flex items-center gap-4 ${isRight ? 'justify-end' : ''}`}>
                                                        <a
                                                            href={brief.officialLink}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="relative z-30 pointer-events-auto flex items-center gap-2 px-5 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[10px] font-black tracking-widest uppercase hover:bg-cyan-500/20 hover:scale-105 transition-all text-cyan-400 cursor-pointer"
                                                        >
                                                            Know More <ExternalLink size={12} />
                                                        </a>
                                                        <div className="text-[9px] font-mono text-cyan-500/40 tracking-tighter uppercase font-bold italic">
                                                            PHASE_{String(brief.sequence).padStart(2, '0')}
                                                        </div>
                                                    </div>

                                                    {/* Consecutive Link Established Badge */}
                                                    <div className={`
                                                        absolute -bottom-3 bg-cyan-500 text-[#020408] px-3 py-1 rounded-sm
                                                        text-[9px] font-black tracking-tighter uppercase transform shadow-lg
                                                        ${isRight ? 'right-8 -rotate-1' : 'left-8 rotate-1'}
                                                    `}>
                                                        Consecutive Link Established
                                                    </div>
                                                </div>
                                            </motion.div>

                                            {/* Mission Image (Opposite Side) */}
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.9, x: isRight ? -50 : 50 }}
                                                whileInView={{ opacity: 1, scale: 1, x: 0 }}
                                                viewport={{ once: true, margin: "-100px" }}
                                                transition={{ duration: 1, ease: "easeOut" }}
                                                className="flex-1 w-full"
                                            >
                                                <MissionImage src={brief.imageUrl} alt={brief.title} isRight={isRight} />
                                            </motion.div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {/* Visual Footer Milestone */}
            <div className="flex flex-col items-center gap-6 mt-32 pb-40 relative z-10">
                <div className="w-14 h-14 rounded-full border border-white/10 flex items-center justify-center bg-white/5 hover:bg-white/10 transition-colors group cursor-default shadow-xl">
                    <Binary size={24} className="text-white/30 group-hover:text-cyan-400 transition-colors" />
                </div>
                <div className="text-center">
                    <h3 className="text-2xl font-black tracking-[0.3em] text-white uppercase italic">Timeline Integrity Secured</h3>
                    <p className="text-[10px] font-mono text-cyan-500/50 tracking-[0.5em] mt-2 uppercase font-bold animate-pulse">Awaiting Next Sequence Activation...</p>
                </div>
                <div className="w-[1px] h-48 bg-gradient-to-b from-cyan-500/40 via-cyan-500/10 to-transparent mt-8" />
            </div>
        </div>
    );
};

export default MissionStoryLine;
