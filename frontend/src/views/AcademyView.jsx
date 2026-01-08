import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    GraduationCap,
    BookOpen,
    Binary,
    Satellite,
    ArrowLeft,
    ChevronRight,
    TrendingUp,
    Cpu,
    Globe,
    Shield,
    Search
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import EarthImpactSim from '../components/EarthImpactSim';
import SpaceExam from '../components/SpaceExam';
import AcademyInfographics from '../components/AcademyInfographics';
import MissionStoryLine from '../components/MissionStoryLine';
import { missionBriefings } from '../data/learningData';

const AcademyView = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('DASHBOARD'); // DASHBOARD, BREIFING, SIMULATOR, EXAM
    const [selectedBriefing, setSelectedBriefing] = useState(null);
    const [briefings, setBriefings] = useState([]);
    const [briefingsLoading, setBriefingsLoading] = useState(true);
    const [selectedTheme, setSelectedTheme] = useState('Global Guardians');

    useEffect(() => {
        const fetchBriefings = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/academy/briefings');
                const data = await res.json();
                setBriefings(data);
            } catch (err) {
                console.error('Failed to sync briefings');
                setBriefings(missionBriefings); // Use fallback data from learningData.js if API fails
            } finally {
                setBriefingsLoading(false);
            }
        };
        fetchBriefings();
    }, []);

    const themes = useMemo(() => [
        { id: 'Global Guardians', label: 'Disaster Management', icon: Shield, color: 'cyan' },
        { id: 'Cosmic Seekers', label: 'Exploring Life', icon: Search, color: 'purple' }
    ], []);

    const filteredBriefings = useMemo(() =>
        briefings.filter(b => b.theme === selectedTheme),
        [briefings, selectedTheme]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <div className="relative w-full h-screen bg-[#020408] text-white font-sans selection:bg-cyan-500/30 Perspective-1000 overflow-hidden">
            {/* Background Star Ambient */}
            <div className="absolute inset-0 bg-[#020408] z-0 overflow-hidden">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-cyan-500/5 rounded-full blur-[150px] -mr-96 -mt-96" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[120px] -ml-48 -mb-48" />
            </div>

            {/* Header HUD - Now with fixed blur */}
            <header className="absolute top-0 left-0 w-full p-8 flex justify-between items-center z-50 bg-gradient-to-b from-[#020408]/80 to-transparent backdrop-blur-sm">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => activeTab === 'DASHBOARD' ? navigate('/') : setActiveTab('DASHBOARD')}
                        className="p-2 rounded-full border border-white/20 hover:bg-white/10 text-white/60 hover:text-white transition-all group"
                    >
                        <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-header font-bold tracking-widest text-white drop-shadow-[0_0_15px_rgba(0,240,255,0.4)]">
                            STAR ACADEMY
                        </h1>
                        <div className="flex items-center gap-2 mt-1">
                            <div className="h-0.5 w-12 bg-cyan-500"></div>
                            <span className="text-[10px] font-mono text-cyan-400 tracking-[0.3em] uppercase">Tactical Training & Knowledge Base</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-4">
                    <div className="glass-panel px-4 py-2 border border-white/10 hidden md:block">
                        <div className="text-[9px] text-white/40 font-mono tracking-widest">RANK_CERTIFICATION</div>
                        <div className="text-xs font-bold text-white uppercase tracking-wider underline decoration-cyan-500/50 underline-offset-4">UNVERIFIED CADET</div>
                    </div>
                    <div className="glass-panel px-4 py-2 border border-white/10 hidden md:block">
                        <div className="text-[9px] text-white/40 font-mono tracking-widest">MISSION_HOURS</div>
                        <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider">0.00 HRS</div>
                    </div>
                </div>
            </header>

            {/* Main Content Area - Changed h-full to flex-col and added overflow-y-auto */}
            <main className="relative z-10 w-full h-full pt-32 px-8 pb-8 flex overflow-hidden gap-8">

                {/* Navigation Sidebar (Glassmorphism) */}
                <nav className="w-16 md:w-64 h-full flex flex-col gap-2 shrink-0">
                    {[
                        { id: 'DASHBOARD', icon: Cpu, label: 'Overview' },
                        { id: 'BRIEFING', icon: BookOpen, label: 'Mission Briefs' },
                        { id: 'INFOGRAPHICS', icon: Binary, label: 'Infographics' },
                        { id: 'SIMULATOR', icon: Globe, label: 'Data Lab' },
                        { id: 'EXAM', icon: GraduationCap, label: 'Certification' }
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`
                flex items-center gap-4 p-4 rounded-xl border transition-all duration-300
                ${activeTab === item.id
                                    ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400 shadow-[inset_0_0_20px_rgba(0,240,255,0.1)]'
                                    : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10 hover:text-white'}
              `}
                        >
                            <item.icon size={20} />
                            <span className="hidden md:block font-mono text-xs tracking-widest uppercase font-bold text-left">{item.label}</span>
                        </button>
                    ))}

                    <div className="mt-auto p-4 glass-panel border border-white/5 hidden md:block">
                        <div className="text-[9px] text-white/40 font-mono mb-2 uppercase">Systems Status</div>
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                            <span className="text-[10px] text-gray-400 uppercase tracking-tighter">Knowledge Server Online</span>
                        </div>
                    </div>
                </nav>

                {/* View Switcher - ENABLED VERTICAL SCROLLING HERE */}
                <section className="flex-1 h-full relative overflow-y-auto pb-10 pr-2 scrollbar-thin scrollbar-thumb-white/10">
                    <AnimatePresence mode="wait">
                        {activeTab === 'DASHBOARD' && (
                            <motion.div
                                key="dashboard"
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                exit="hidden"
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 h-full content-start"
                            >
                                {/* Stats Summary Panel */}
                                <motion.div variants={itemVariants} className="col-span-full grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                                    <div className="glass-panel p-6 border border-white/10 bg-gradient-to-br from-cyan-500/5 to-transparent">
                                        <TrendingUp className="text-cyan-400 mb-4" size={24} />
                                        <h4 className="text-white/40 text-[10px] font-mono tracking-widest uppercase">Completion Rate</h4>
                                        <div className="text-3xl font-bold">0%</div>
                                    </div>
                                    <div className="glass-panel p-6 border border-white/10">
                                        <Binary className="text-blue-400 mb-4" size={24} />
                                        <h4 className="text-white/40 text-[10px] font-mono tracking-widest uppercase">Technical XP</h4>
                                        <div className="text-3xl font-bold">0 <span className="text-xs text-white/30 font-light">PT</span></div>
                                    </div>
                                </motion.div>

                                {/* Feature Cards */}
                                <motion.div
                                    variants={itemVariants}
                                    onClick={() => setActiveTab('INFOGRAPHICS')}
                                    className="glass-panel group relative overflow-hidden h-72 cursor-pointer border border-white/10 hover:border-green-500/50 transition-all"
                                >
                                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1541447271487-09612b3f49f7?q=80&w=2070&auto=format&fit=crop')] bg-cover opacity-20 filter grayscale-50 group-hover:scale-110 transition-transform duration-700" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#020408] to-transparent" />
                                    <div className="absolute bottom-6 left-6 pr-6">
                                        <h3 className="text-2xl font-bold mb-2 tracking-tight uppercase">Technical Infographics</h3>
                                        <p className="text-xs text-white/50 leading-relaxed">Visual breakdowns of satellite sensors, orbital tiers, and critical space hazards.</p>
                                    </div>
                                </motion.div>

                                <motion.div
                                    variants={itemVariants}
                                    onClick={() => setActiveTab('SIMULATOR')}
                                    className="glass-panel group relative overflow-hidden h-72 cursor-pointer border border-white/10 hover:border-cyan-500/50 transition-all"
                                >
                                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop')] bg-cover opacity-20 filter grayscale-50 group-hover:scale-110 transition-transform duration-700" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#020408] to-transparent" />
                                    <div className="absolute bottom-6 left-6 pr-6">
                                        <div className="text-cyan-400 bg-cyan-400/10 px-2 py-1 rounded text-[9px] font-mono inline-block mb-3">NEW MODULE</div>
                                        <h3 className="text-2xl font-bold mb-2 tracking-tight">Earth Impact Sim</h3>
                                        <p className="text-xs text-white/50 leading-relaxed">Visualize real-world problem solving through satellite data layers. Agriculture, Climate, and Disaster response.</p>
                                    </div>
                                </motion.div>

                                <motion.div
                                    variants={itemVariants}
                                    onClick={() => setActiveTab('BRIEFING')}
                                    className="glass-panel group relative overflow-hidden h-72 cursor-pointer border border-white/10 hover:border-blue-500/50 transition-all"
                                >
                                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?q=80&w=2072&auto=format&fit=crop')] bg-cover opacity-20 group-hover:scale-110 transition-transform duration-700" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#020408] to-transparent" />
                                    <div className="absolute bottom-6 left-6 pr-6">
                                        <h3 className="text-2xl font-bold mb-2 tracking-tight">Mission Briefings</h3>
                                        <p className="text-xs text-white/50 leading-relaxed">Deep dive into orbital mechanics and remote sensing telemetry with technical breakdowns.</p>
                                    </div>
                                </motion.div>

                                <motion.div
                                    variants={itemVariants}
                                    onClick={() => setActiveTab('EXAM')}
                                    className="glass-panel group relative overflow-hidden h-72 cursor-pointer border border-white/10 hover:border-purple-500/50 transition-all"
                                >
                                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1517976487492-5750f3195933?q=80&w=2070&auto=format&fit=crop')] bg-cover opacity-20 group-hover:scale-110 transition-transform duration-700" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#020408] to-transparent" />
                                    <div className="absolute bottom-6 left-6 pr-6">
                                        <h3 className="text-2xl font-bold mb-2 tracking-tight">Advanced Exam</h3>
                                        <p className="text-xs text-white/50 leading-relaxed">Validate your expertise and earn your rank. Serious-level assessments for future mission specialists.</p>
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}

                        {activeTab === 'BRIEFING' && (
                            <motion.div
                                key="briefing"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="h-full flex flex-col gap-6"
                            >
                                {/* Theme Selection Tabs */}
                                <div className="flex gap-4 p-1 bg-white/5 rounded-2xl border border-white/5 w-fit">
                                    {themes.map((theme) => (
                                        <button
                                            key={theme.id}
                                            onClick={() => setSelectedTheme(theme.id)}
                                            className={`
                                                flex items-center gap-3 px-6 py-3 rounded-xl transition-all duration-300
                                                ${selectedTheme === theme.id
                                                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                                                    : 'text-white/40 hover:text-white hover:bg-white/5'}
                                            `}
                                        >
                                            <theme.icon size={18} />
                                            <span className="font-mono text-[10px] tracking-widest uppercase font-bold">{theme.label}</span>
                                        </button>
                                    ))}
                                </div>

                                <div className="flex-1 overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-white/10 no-scrollbar">
                                    {briefingsLoading ? (
                                        <div className="flex flex-col gap-8">
                                            {Array(3).fill(0).map((_, i) => (
                                                <div key={i} className="glass-panel p-8 border border-white/5 animate-pulse h-48 bg-white/[0.01]" />
                                            ))}
                                        </div>
                                    ) : (
                                        <MissionStoryLine
                                            briefings={filteredBriefings}
                                            themeTitle={selectedTheme}
                                        />
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'INFOGRAPHICS' && (
                            <motion.div
                                key="infographics"
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.02 }}
                                className="w-full h-full"
                            >
                                <AcademyInfographics />
                            </motion.div>
                        )}

                        {activeTab === 'SIMULATOR' && (
                            <motion.div
                                key="simulator"
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.02 }}
                                className="w-full h-full"
                            >
                                <EarthImpactSim />
                            </motion.div>
                        )}

                        {activeTab === 'EXAM' && (
                            <motion.div
                                key="exam"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="w-full h-full"
                            >
                                <SpaceExam />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </section>
            </main>

            {/* Decorative Lines */}
            <div className="absolute top-0 right-0 w-[1px] h-full bg-gradient-to-b from-transparent via-white/5 to-transparent pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none" />
        </div>
    );
};

export default AcademyView;
