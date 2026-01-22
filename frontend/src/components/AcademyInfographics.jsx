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

const INFOGRAPHIC_DATA = [
    {
        id: 'sar',
        title: 'Synthetic Aperture Radar',
        summary: 'A form of radar that is used to create two-dimensional images or three-dimensional reconstructions of objects, such as landscapes. SAR uses the motion of the radar antenna over a target region to provide finer spatial resolution than conventional beam-scanning radars.',
        details: {
            specs: [
                { label: 'Wavelength', value: '1cm - 1m' },
                { label: 'Resolution', value: 'Sub-meter' },
                { label: 'Time', value: 'Day/Night' }
            ],
            logic: 'SAR works by transmitting successive pulses of radio waves to "illuminate" a target scene, and the echo of each pulse is received and recorded. The pulses are transmitted and the echoes received using a single beam-forming antenna, with wavelengths of a meter down to millimeters.',
            utility: 'Used extensively for Earth observation, specifically in monitoring forests, ice hazards, and disaster zones where cloud cover obstructs optical sensors.'
        }
    },
    {
        id: 'ndvi',
        title: 'Vegetation Index (NDVI)',
        summary: 'A simple graphical indicator that can be used to analyze remote sensing measurements, typically, but not necessarily, from a space platform, and assess whether the target being observed contains live green vegetation or not.',
        details: {
            specs: [
                { label: 'Bands', value: 'Red, NIR' },
                { label: 'Range', value: '-1.0 to +1.0' },
                { label: 'Revisit', value: 'Daily-Weekly' }
            ],
            logic: 'Live green plants absorb solar radiation in the photosynthetically active radiation (PAR) spectral region, which they use as a source of energy in the process of photosynthesis. Leaf cells have also evolved to scatter (i.e., reflect and transmit) solar radiation in the near-infrared spectral region.',
            utility: 'Critical for global food security, monitoring drought, predicting agricultural famine, and analyzing the health of forests globally.'
        }
    },
    {
        id: 'orbital',
        title: 'Orbital Mechanics',
        summary: 'The application of ballistics and celestial mechanics to the practical problems concerning the motion of rockets and other spacecraft. The study of orbital mechanics is essential for the planning and execution of space missions.',
        details: {
            specs: [
                { label: 'LEO Speed', value: '7.8 km/s' },
                { label: 'GEO Alt', value: '35,786 km' },
                { label: 'Escape v', value: '11.2 km/s' }
            ],
            logic: 'Orbits are the result of a perfect balance between the forward velocity of an object and the gravitational pull of the planet. If the object goes too fast, it escapes; too slow, it crashes.',
            utility: 'Used for satellite deployment, station keeping, interplanetary transfer orbits (Hohmann transfers), and rendezvous maneuvers.'
        }
    },
    {
        id: 'hazards',
        title: 'Space Hazards',
        summary: 'Various environmental dangers existing in space that pose significant risks to spacecraft and astronauts, ranging from microscopic dust particles to massive solar coronal mass ejections.',
        details: {
            specs: [
                { label: 'Debris', value: '>128 Million' },
                { label: 'Radiation', value: 'GCR/SPE' },
                { label: 'Velocity', value: 'High/Hyper' }
            ],
            logic: 'Hazards include orbital debris (junk), micrometeoroids, and space weather (radiation storms). Shielding and tracking systems are employed to mitigate these risks.',
            utility: 'Understanding hazards is crucial for mission assurance, satellite longevity, and human safety in extra-vehicular activities (EVAs).'
        }
    },
    {
        id: 'lasers',
        title: 'LIDAR Scanning',
        summary: 'Light Detection and Ranging is a remote sensing method that uses light in the form of a pulsed laser to measure ranges (variable distances) to the Earth.',
        details: {
            specs: [
                { label: 'Pulse Rate', value: '>100k/sec' },
                { label: 'Accuracy', value: 'Centimeters' },
                { label: 'Output', value: '3D Cloud' }
            ],
            logic: 'A laser system fires rapid pulses of light at a surface and measures how long it takes to return. This time-of-flight data is used to calculate distance and create precise 3D topographic maps.',
            utility: 'Used for mapping terrain height (DEMs), bathymetry, forest canopy density, and atmospheric composition (Aeolus mission).'
        }
    },
    {
        id: 'ai',
        title: 'AI in Space',
        summary: 'Artificial Intelligence is revolutionizing space exploration by enabling autonomous navigation, automated data analysis, and predictive maintenance for spacecraft.',
        details: {
            specs: [
                { label: 'Response', value: '<10ms' },
                { label: 'Autonomy', value: 'Level 4-5' },
                { label: 'Data', value: 'On-Edge' }
            ],
            logic: 'AI algorithms process onboard data in real-time to make split-second decisions without waiting for light-delayed commands from Earth, essential for Mars landings and deep space probes.',
            utility: 'Used in the Perseverance rover for hazard avoidance (AutoNav), verifying exoplanet candidates, and filtering immense data streams from telescopes.'
        }
    },
    {
        id: 'spectro',
        title: 'Spectroscopy',
        summary: 'The study of the interaction between matter and electromagnetic radiation. Historically, spectroscopy originated through the study of visible light dispersed according to its wavelength, by a prism.',
        details: {
            specs: [
                { label: 'Types', value: 'Mass/Optical' },
                { label: 'Target', value: 'Chemicals' },
                { label: 'Range', value: 'Full Spectrum' }
            ],
            logic: 'Every element provides a unique "fingerprint" of lines in the light spectrum. By analyzing these lines, scientists can determine the chemical composition of distant stars and atmospheres.',
            utility: 'Identifying water on the Moon, methane on Mars, and biosignatures on exoplanets.'
        }
    },
    {
        id: 'gnss',
        title: 'GNSS / GPS',
        summary: 'Global Navigation Satellite Systems provide autonomous geo-spatial positioning with global coverage. It allows small electronic receivers to determine their location to high precision.',
        details: {
            specs: [
                { label: 'Sources', value: '4+ Sats' },
                { label: 'Precision', value: '~4 meters' },
                { label: 'Clock', value: 'Atomic' }
            ],
            logic: 'Navigation satellites transmit signals containing the exact time the signal was sent. A receiver compares this to the arrival time to calculate distance. With four signals, 3D position is solved.',
            utility: 'Fundamental for global transportation, timing synchronization for power grids, finance, and disaster response logistics.'
        }
    },
    {
        id: 'cubesat',
        title: 'CubeSats',
        summary: 'A class of research spacecraft called nanosatellites. CubeSats are built to standard dimensions (Units or "U") of 10x10x10 cm. They can be 1U, 2U, 3U, or 6U, and typically weigh less than 1.33 kg per U.',
        details: {
            specs: [
                { label: 'Size', value: '10x10x10cm' },
                { label: 'Cost', value: 'Low' },
                { label: 'Orbit', value: 'LEO' }
            ],
            logic: 'Standardization reduces cost and allows for "ride-sharing" on larger rockets. They use commercial off-the-shelf (COTS) components to democraticize access to space.',
            utility: 'Used for education, technology demonstration, low-cost earth observation constellations (Planet), and even deep space relay (MarCO).'
        }
    },
    {
        id: 'thermal',
        title: 'Thermal Imaging',
        summary: 'Infrared thermography involves using a thermal camera to capture the infrared energy emitted by an object and convert it into a visible image.',
        details: {
            specs: [
                { label: 'Spectrum', value: 'IR (8-15µm)' },
                { label: 'Detects', value: 'Heat' },
                { label: 'Use', value: 'Night/Day' }
            ],
            logic: 'All objects above absolute zero emit infrared radiation. Sensors detect temperature differences, allowing us to "see" heat, even in total darkness.',
            utility: 'Monitoring urban heat islands, volcanic activity, industrial pollution, and tracking ocean currents.'
        }
    },
    {
        id: 'ion',
        title: 'Ion Propulsion',
        summary: 'A form of electric propulsion used for spacecraft propulsion. It creates thrust by accelerating ions using electricity.',
        details: {
            specs: [
                { label: 'Efficiency', value: 'Very High' },
                { label: 'Thrust', value: 'Low' },
                { label: 'Duration', value: 'Years' }
            ],
            logic: 'Electric fields accelerate charged particles (ions) out the back of the engine at high speeds. While the force is weak (like the weight of a sheet of paper), it can build up huge speeds over time.',
            utility: 'Essential for deep space missions (Dawn, BepiColombo) and station-keeping for geostationary satellites to extend mission life.'
        }
    },
    {
        id: 'hyper',
        title: 'Hyperspectral',
        summary: 'Hyperspectral sensors collect information as a set of images. Each image represents a narrow wavelength range of the electromagnetic spectrum, also known as a spectral band.',
        details: {
            specs: [
                { label: 'Bands', value: 'Hundreds' },
                { label: 'Data', value: 'Huge' },
                { label: 'Depth', value: 'Chemical' }
            ],
            logic: 'Unlike human eyes (3 bands: RGB), these sensors see hundreds of bands. This allows them to distinguish between materials that look identical, like real grass vs. camouflage.',
            utility: 'Mineral exploration, identifying specific crop types and diseases, environmental monitoring of complex ecosystems.'
        }
    }
];

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
        // Enriched local data loading simulation
        const loadInfographics = () => {
             const enrichedData = INFOGRAPHIC_DATA.map(item => {
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
            setLoading(false);
        };

        // Small delay to simulate "loading" feel for smooth transition
        const timer = setTimeout(loadInfographics, 800);
        return () => clearTimeout(timer);
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
