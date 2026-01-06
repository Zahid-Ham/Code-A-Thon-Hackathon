import React, { useState } from 'react';
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
    Target
} from 'lucide-react';

const InfographicCard = ({ title, icon: Icon, color, summary, details, delay, onClick }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay }}
        onClick={onClick}
        className="glass-panel p-6 border border-white/10 hover:border-white/30 transition-all flex flex-col h-full bg-white/[0.02] cursor-pointer group"
    >
        <div className={`p-4 rounded-2xl w-fit mb-6 shadow-lg group-hover:scale-110 transition-transform`} style={{ backgroundColor: `${color}15`, border: `1px solid ${color}30`, color }}>
            <Icon size={32} />
        </div>
        <h3 className="text-xl font-bold mb-4 tracking-tight uppercase" style={{ color }}>{title}</h3>
        <div className="text-sm text-white/60 leading-relaxed font-light mb-6">
            {summary}
        </div>

        <div className="mt-auto flex items-center gap-2 text-[10px] font-mono text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity">
            <Info size={12} /> CLICK FOR TECHNICAL SPECS
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

                // Add icons and colors back to the dynamic data
                const enrichedData = data.map(item => {
                    switch (item.id) {
                        case 'sar': return { ...item, icon: Wifi, color: "#00F0FF" };
                        case 'ndvi': return { ...item, icon: Sun, color: "#00FF99" };
                        case 'orbital': return { ...item, icon: Layers, color: "#FFD700" };
                        case 'hazards': return { ...item, icon: Zap, color: "#FF0055" };
                        case 'lasers': return { ...item, icon: FastForward, color: "#AA00FF" };
                        case 'ai': return { ...item, icon: Globe, color: "#FFFFFF" };
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 h-full pb-20">
                {loading ? (
                    Array(6).fill(0).map((_, i) => (
                        <div key={i} className="glass-panel p-6 border border-white/5 animate-pulse h-64 bg-white/[0.01]">
                            <div className="w-16 h-16 rounded-2xl bg-white/5 mb-6" />
                            <div className="w-2/3 h-6 bg-white/5 mb-4" />
                            <div className="w-full h-12 bg-white/5" />
                        </div>
                    ))
                ) : (
                    infographics.map((info, i) => (
                        <InfographicCard
                            key={info.id || info.title}
                            {...info}
                            delay={0.1 * i}
                            onClick={() => setSelectedDetail(info)}
                        />
                    ))
                )}
            </div>

            <AnimatePresence shadow>
                {selectedDetail && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-8 bg-[#020408]/80 backdrop-blur-xl">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="w-full max-w-4xl glass-panel border border-white/10 bg-[#0a0f18] overflow-hidden flex flex-col md:flex-row h-auto max-h-[90vh]"
                        >
                            {/* Left Visual Side */}
                            <div className="w-full md:w-1/3 bg-gradient-to-br from-white/5 to-transparent p-12 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-white/5">
                                <div className="p-8 rounded-[40px] mb-8" style={{ backgroundColor: `${selectedDetail.color}10`, border: `2px solid ${selectedDetail.color}40`, color: selectedDetail.color }}>
                                    <selectedDetail.icon size={80} strokeWidth={1} />
                                </div>
                                <h3 className="text-3xl font-bold tracking-tighter text-center uppercase" style={{ color: selectedDetail.color }}>{selectedDetail.title}</h3>
                                <div className="mt-4 flex gap-1">
                                    {[1, 2, 3].map(i => <div key={i} className="h-1 w-8 rounded-full" style={{ backgroundColor: selectedDetail.color, opacity: 0.2 }} />)}
                                </div>
                            </div>

                            {/* Right Content Side */}
                            <div className="flex-1 p-12 relative overflow-y-auto overflow-x-hidden">
                                <button
                                    onClick={() => setSelectedDetail(null)}
                                    className="absolute top-8 right-8 p-2 rounded-full border border-white/10 hover:bg-white/10 text-white/40 hover:text-white transition-all"
                                >
                                    <X size={20} />
                                </button>

                                <div className="mb-12">
                                    <div className="text-[10px] font-mono text-cyan-400 mb-2 tracking-[0.4em] uppercase">Technical_Architecture</div>
                                    <h2 className="text-4xl font-bold text-white tracking-widest leading-none mb-6">EXPLORATION LOG</h2>
                                    <p className="text-white/60 leading-relaxed text-lg font-light italic">
                                        "{selectedDetail.details.logic}"
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                                    {selectedDetail.details.specs.map(spec => (
                                        <div key={spec.label} className="p-4 rounded-xl border border-white/5 bg-white/[0.02]">
                                            <div className="text-[9px] text-white/30 font-mono tracking-widest uppercase mb-1">{spec.label}</div>
                                            <div className="text-sm font-bold text-white tracking-wide">{spec.value}</div>
                                        </div>
                                    ))}
                                </div>

                                <div>
                                    <div className="flex items-center gap-3 mb-4 text-cyan-400">
                                        <Target size={20} />
                                        <h4 className="font-mono text-xs tracking-widest uppercase font-bold">Operational Utility</h4>
                                    </div>
                                    <div className="p-6 rounded-2xl bg-cyan-500/5 border border-cyan-500/10 text-white/70 leading-relaxed">
                                        {selectedDetail.details.utility}
                                    </div>
                                </div>

                                <div className="mt-12 pt-8 border-t border-white/5 flex justify-between items-center text-[9px] font-mono text-white/20 uppercase tracking-widest">
                                    <span>Verified Knowledge Asset: SS-2026-X</span>
                                    <span>Class: Restricted</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AcademyInfographics;
