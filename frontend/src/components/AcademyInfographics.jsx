import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Sun,
    Wifi,
    Layers,
    Zap,
    FastForward,
    Globe,
    X,
    Info,
    TrendingUp,
    Target,
    Sparkles,
    ExternalLink,
    Activity
} from 'lucide-react';

const InfographicCard = ({ title, icon: Icon, color, summary, details, delay, onClick }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, type: "spring", stiffness: 100 }}
        whileHover={{ scale: 1.02, y: -4 }}
        onClick={onClick}
        className="relative glass-panel p-6 border border-white/10 hover:border-white/30 transition-all flex flex-col h-full bg-gradient-to-br from-white/[0.03] to-transparent cursor-pointer group overflow-hidden"
    >
        {/* Animated background glow */}
        <div
            className="absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-0 group-hover:opacity-30 transition-opacity duration-500"
            style={{ backgroundColor: color }}
        />

        {/* Tech grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none"
            style={{
                backgroundImage: `linear-gradient(${color}20 1px, transparent 1px), linear-gradient(90deg, ${color}20 1px, transparent 1px)`,
                backgroundSize: '20px 20px'
            }}
        />

        <div className="relative z-10">
            {/* Icon with animated ring */}
            <div className="relative w-fit mb-6">
                <div
                    className="p-4 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300"
                    style={{ backgroundColor: `${color}15`, border: `1px solid ${color}40`, color }}
                >
                    <Icon size={28} strokeWidth={1.5} />
                </div>
                <motion.div
                    className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    style={{ border: `1px solid ${color}30` }}
                />
            </div>

            {/* Title with accent line */}
            <div className="flex items-center gap-3 mb-4">
                <div className="w-1 h-6 rounded-full" style={{ backgroundColor: color }} />
                <h3 className="text-lg font-bold tracking-tight uppercase" style={{ color }}>{title}</h3>
            </div>

            {/* Summary - truncated for card view */}
            <p className="text-sm text-white/50 leading-relaxed font-light mb-6 line-clamp-3">
                {summary.substring(0, 150)}...
            </p>

            {/* Quick stats preview */}
            {details?.specs?.slice(0, 2).map((spec, i) => (
                <div key={i} className="flex items-center justify-between text-xs mb-2 py-2 px-3 rounded-lg bg-white/[0.02] border border-white/5">
                    <span className="text-white/30 font-mono uppercase tracking-wider">{spec.label}</span>
                    <span className="text-white/70 font-semibold">{spec.value}</span>
                </div>
            ))}

            {/* CTA */}
            <div className="mt-auto pt-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[10px] font-mono opacity-60 group-hover:opacity-100 transition-opacity" style={{ color }}>
                    <Sparkles size={12} />
                    <span>EXPLORE TECHNOLOGY</span>
                </div>
                <ExternalLink size={14} className="text-white/20 group-hover:text-white/60 transition-colors" />
            </div>
        </div>
    </motion.div>
);

const AcademyInfographics = () => {
    const [selectedDetail, setSelectedDetail] = useState(null);
    const [infographics, setInfographics] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInfographics = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/academy/infographics');
                const data = await res.json();

                const enrichedData = data.map(item => {
                    switch (item.id) {
                        case 'sar': return { ...item, icon: Wifi, color: "#00F0FF" };
                        case 'ndvi': return { ...item, icon: Sun, color: "#00FF99" };
                        case 'orbital': return { ...item, icon: Layers, color: "#FFD700" };
                        case 'hazards': return { ...item, icon: Zap, color: "#FF0055" };
                        case 'lasers': return { ...item, icon: FastForward, color: "#AA00FF" };
                        case 'ai': return { ...item, icon: Globe, color: "#FFFFFF" };
                        case 'spectro': return { ...item, icon: TrendingUp, color: "#FF8C00" };
                        case 'gnss': return { ...item, icon: Target, color: "#00BFFF" };
                        case 'cubesat': return { ...item, icon: Layers, color: "#FF69B4" };
                        case 'thermal': return { ...item, icon: Sun, color: "#FF4500" };
                        case 'ion': return { ...item, icon: Zap, color: "#7B68EE" };
                        case 'hyper': return { ...item, icon: FastForward, color: "#32CD32" };
                        default: return { ...item, icon: Info, color: "#00F0FF" };
                    }
                });

                setInfographics(enrichedData);
            } catch (err) {
                console.error('Failed to hydrate infographics');
            } finally {
                setLoading(false);
            }
        };

        fetchInfographics();
    }, []);

    return (
        <div className="h-full relative">
            {/* Section Header */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <div className="text-[10px] font-mono text-cyan-400 tracking-[0.3em] uppercase mb-2">Knowledge_Archive</div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">Space Technology Compendium</h2>
                </div>
                <div className="flex items-center gap-4 text-xs text-white/40">
                    <div className="flex items-center gap-2">
                        <Activity size={14} className="text-green-400" />
                        <span>{infographics.length} Assets</span>
                    </div>
                    <div className="h-4 w-px bg-white/10" />
                    <span>{infographics.reduce((acc, i) => acc + (i.details?.specs?.length || 0), 0)} Specs</span>
                </div>
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 pb-20">
                {loading ? (
                    Array(12).fill(0).map((_, i) => (
                        <div key={i} className="glass-panel p-6 border border-white/5 animate-pulse h-72 bg-white/[0.01]">
                            <div className="w-14 h-14 rounded-2xl bg-white/5 mb-6" />
                            <div className="w-2/3 h-5 bg-white/5 mb-4" />
                            <div className="w-full h-16 bg-white/5 mb-4" />
                            <div className="w-full h-8 bg-white/5" />
                        </div>
                    ))
                ) : (
                    infographics.map((info, i) => (
                        <InfographicCard
                            key={info.id || info.title}
                            {...info}
                            delay={0.05 * i}
                            onClick={() => setSelectedDetail(info)}
                        />
                    ))
                )}
            </div>

            {/* Detail Modal - Fixed z-index for navbar overlap */}
            <AnimatePresence>
                {selectedDetail && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-8"
                        onClick={() => setSelectedDetail(null)}
                    >
                        {/* Backdrop */}
                        <div className="absolute inset-0 bg-[#020408]/90 backdrop-blur-2xl" />

                        {/* Modal Content */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            onClick={(e) => e.stopPropagation()}
                            className="relative w-full max-w-5xl glass-panel border border-white/10 bg-gradient-to-br from-[#0a0f18] to-[#050810] overflow-hidden"
                        >
                            {/* Decorative elements */}
                            <div
                                className="absolute top-0 left-0 w-full h-1"
                                style={{ background: `linear-gradient(90deg, transparent, ${selectedDetail.color}, transparent)` }}
                            />
                            <div
                                className="absolute -top-40 -left-40 w-80 h-80 rounded-full blur-[100px] opacity-20"
                                style={{ backgroundColor: selectedDetail.color }}
                            />

                            <div className="flex flex-col md:flex-row max-h-[85vh]">
                                {/* Left Visual Panel */}
                                <div className="w-full md:w-2/5 bg-gradient-to-br from-white/[0.03] to-transparent p-8 md:p-12 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-white/5 relative overflow-hidden">
                                    {/* Animated rings */}
                                    <motion.div
                                        className="absolute inset-0 flex items-center justify-center"
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                                    >
                                        <div className="w-64 h-64 rounded-full border border-white/5" />
                                    </motion.div>
                                    <motion.div
                                        className="absolute inset-0 flex items-center justify-center"
                                        animate={{ rotate: -360 }}
                                        transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
                                    >
                                        <div className="w-48 h-48 rounded-full border border-white/5" />
                                    </motion.div>

                                    {/* Icon */}
                                    <motion.div
                                        className="relative z-10 p-8 rounded-[40px] mb-8"
                                        animate={{ y: [0, -8, 0] }}
                                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                        style={{
                                            backgroundColor: `${selectedDetail.color}15`,
                                            border: `2px solid ${selectedDetail.color}40`,
                                            color: selectedDetail.color,
                                            boxShadow: `0 0 60px ${selectedDetail.color}30`
                                        }}
                                    >
                                        <selectedDetail.icon size={72} strokeWidth={1} />
                                    </motion.div>

                                    <h3 className="text-2xl md:text-3xl font-bold tracking-tight text-center uppercase relative z-10" style={{ color: selectedDetail.color }}>
                                        {selectedDetail.title}
                                    </h3>

                                    <div className="mt-6 flex gap-2 relative z-10">
                                        {[1, 2, 3, 4, 5].map(i => (
                                            <motion.div
                                                key={i}
                                                className="h-1 w-6 rounded-full"
                                                initial={{ opacity: 0.2 }}
                                                animate={{ opacity: [0.2, 0.8, 0.2] }}
                                                transition={{ duration: 2, delay: i * 0.2, repeat: Infinity }}
                                                style={{ backgroundColor: selectedDetail.color }}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* Right Content Panel */}
                                <div className="flex-1 p-8 md:p-12 relative overflow-y-auto max-h-[60vh] md:max-h-[85vh]">
                                    {/* Close button */}
                                    <button
                                        onClick={() => setSelectedDetail(null)}
                                        className="absolute top-6 right-6 p-3 rounded-full border border-white/10 hover:bg-white/10 text-white/40 hover:text-white transition-all hover:rotate-90 duration-300"
                                    >
                                        <X size={18} />
                                    </button>

                                    {/* Header */}
                                    <div className="mb-10 pr-12">
                                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-mono tracking-widest uppercase mb-4">
                                            <Activity size={10} />
                                            Technical Deep-Dive
                                        </div>
                                        <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight leading-tight mb-4">
                                            How It Works
                                        </h2>
                                        <p className="text-white/50 leading-relaxed text-base">
                                            {selectedDetail.details.logic}
                                        </p>
                                    </div>

                                    {/* Specs Grid */}
                                    <div className="mb-10">
                                        <h4 className="text-xs font-mono text-white/30 tracking-widest uppercase mb-4">Technical Specifications</h4>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                            {selectedDetail.details.specs.map((spec, idx) => (
                                                <motion.div
                                                    key={spec.label}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.1 * idx }}
                                                    className="p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors group"
                                                >
                                                    <div className="text-[9px] text-white/30 font-mono tracking-widest uppercase mb-2">{spec.label}</div>
                                                    <div className="text-sm font-bold tracking-wide group-hover:text-cyan-400 transition-colors" style={{ color: selectedDetail.color }}>
                                                        {spec.value}
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Mission Log */}
                                    <div className="mb-8">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="p-2 rounded-lg" style={{ backgroundColor: `${selectedDetail.color}15` }}>
                                                <Target size={16} style={{ color: selectedDetail.color }} />
                                            </div>
                                            <h4 className="font-mono text-xs tracking-widest uppercase font-bold text-white/80">Mission Log</h4>
                                        </div>
                                        <div className="p-6 rounded-2xl bg-gradient-to-br from-cyan-500/5 to-transparent border border-cyan-500/10">
                                            <p className="text-white/60 leading-relaxed text-sm">
                                                {selectedDetail.details.utility}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div className="pt-6 border-t border-white/5 flex justify-between items-center text-[9px] font-mono text-white/20 uppercase tracking-widest">
                                        <span>Asset ID: SS-{selectedDetail.id?.toUpperCase()}-2026</span>
                                        <span className="flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                            Verified
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AcademyInfographics;
