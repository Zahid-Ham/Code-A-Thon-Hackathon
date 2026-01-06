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

    const infographics = [
        {
            title: "SAR Technology",
            icon: Wifi,
            color: "#00F0FF",
            summary: "Synthetic Aperture Radar (SAR) is an active sensor that sends microwave pulses to Earth, seeing through clouds and darkness.",
            details: {
                logic: "Active Microwave pulses bounce off surfaces and return to the sensor. Phase differences create 3D terrain maps.",
                specs: [
                    { label: "FREQUENCY", value: "C-Band (5.4 GHz)" },
                    { label: "RESOLUTION", value: "5m to 25m" },
                    { label: "SWATH WIDTH", value: "250 km" }
                ],
                utility: "Ideal for flood monitoring, deforestation tracking, and ice-shelf movement where optical visibility is low."
            }
        },
        {
            title: "NDVI Vegetation",
            icon: Sun,
            color: "#00FF99",
            summary: "Measures plant health by comparing Red and Near-Infrared light reflectance. Essential for global food security.",
            details: {
                logic: "Chlorophyll reflects NIR but absorbs Red. Healthy plants show a high ratio between these two bands.",
                specs: [
                    { label: "ALGORITHM", value: "(NIR-RED)/(NIR+RED)" },
                    { label: "DATA RANGE", value: "-1.0 to +1.0" },
                    { label: "HEALTHY", value: "> 0.6" }
                ],
                utility: "Drought early warning, crop yield prediction, and precision agriculture."
            }
        },
        {
            title: "Orbital Tiers",
            icon: Layers,
            color: "#FFD700",
            summary: "The different altitudes where satellites reside, from 160km to 35,786km, each serving specific purposes.",
            details: {
                logic: "Higher altitude means slower orbital velocity and wider field of view.",
                specs: [
                    { label: "LEO ALTITUDE", value: "160 - 2,000 km" },
                    { label: "MEO ALTITUDE", value: "20,200 km" },
                    { label: "GEO ALTITUDE", value: "35,786 km" }
                ],
                utility: "LEO: Earth Obs; MEO: GPS/Navigation; GEO: Comms/TV."
            }
        },
        {
            title: "Space Hazards",
            icon: Zap,
            color: "#FF0055",
            summary: "Solar flares, CMEs, and cosmic radiation pose severe risks to satellite electronics and power systems.",
            details: {
                logic: "Solar particles can cause 'Single Event Upsets' (SEU) in microchips, leading to bit-flips or hardware death.",
                specs: [
                    { label: "FLARE SPEED", value: "Speed of Light" },
                    { label: "CME SPEED", value: "500-2,000 km/s" },
                    { label: "WARNING TIME", value: "8 min to 3 days" }
                ],
                utility: "Shielding, radiation-hardened electronics, and safe-mode protocols are critical during G5 storms."
            }
        },
        {
            title: "Laser Relays",
            icon: FastForward,
            color: "#AA00FF",
            summary: "Optical Inter-Satellite Links (OISL) allow data transfer in a vacuum via lasers, reducing latency significantly.",
            details: {
                logic: "Lasers transmit more data than RF and travel faster in vacuum vs fiber optics.",
                specs: [
                    { label: "BANDWIDTH", value: "100 Gbps+" },
                    { label: "RANGE", value: "5,000 km+" },
                    { label: "POWER SAVING", value: "40% vs RF" }
                ],
                utility: "Mega-constellations (Starlink, Kuiper) use this to bypass ground stations for global low-latency internet."
            }
        },
        {
            title: "AI On-Edge",
            icon: Globe,
            color: "#FFFFFF",
            summary: "Processing satellite data in orbit using machine learning to send only relevant alerts (e.g., wildfire detection).",
            details: {
                logic: "Reduces downlink bandwidth by filtering 90% of 'empty' images on the satellite itself.",
                specs: [
                    { label: "CHIP TYPE", value: "NPU / FPGA" },
                    { label: "LATENCY REDUX", value: "95%" },
                    { label: "DETECT TIME", value: "< 5 Sec" }
                ],
                utility: "Wildfire detection, illegal fishing tracking, and real-time disaster alerts."
            }
        }
    ];

    return (
        <div className="h-full relative">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 h-full pb-20">
                {infographics.map((info, i) => (
                    <InfographicCard
                        key={info.title}
                        {...info}
                        delay={0.1 * i}
                        onClick={() => setSelectedDetail(info)}
                    />
                ))}
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
