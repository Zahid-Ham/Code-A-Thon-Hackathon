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
                        onClick={() => activeTab === 'DASHBOARD' ? navigate('/dashboard') : setActiveTab('DASHBOARD')}
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

                                {/* Feature Cards - Abstract Pattern Design */}
                                <motion.div
                                    variants={itemVariants}
                                    onClick={() => setActiveTab('INFOGRAPHICS')}
                                    className="glass-panel group relative overflow-hidden h-64 cursor-pointer border border-white/10 hover:border-white/30 transition-all duration-300"
                                >
                                    {/* Grid pattern background - MORE VISIBLE */}
                                    <div className="absolute inset-0 opacity-100"
                                        style={{
                                            backgroundImage: 'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
                                            backgroundSize: '24px 24px'
                                        }}
                                    />
                                    {/* Large floating orb */}
                                    <div className="absolute -top-20 -right-20 w-56 h-56 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/5 blur-3xl group-hover:scale-110 transition-transform duration-700" />
                                    {/* Bottom gradient */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#020408] via-transparent to-transparent" />

                                    <div className="absolute inset-0 p-6 flex flex-col justify-between relative z-10">
                                        <div className="flex justify-between items-start">
                                            <Binary size={20} className="text-white/40 group-hover:text-white/70 transition-colors" />
                                            <span className="text-[9px] font-mono text-white/30 uppercase tracking-widest">12 Assets</span>
                                        </div>

                                        <div>
                                            <h3 className="text-xl font-bold mb-2 tracking-tight text-white/90 group-hover:text-white transition-colors">Technical Infographics</h3>
                                            <p className="text-xs text-white/40 leading-relaxed group-hover:text-white/60 transition-colors">Visual breakdowns of satellite sensors, orbital tiers, and critical space hazards.</p>
                                        </div>
                                    </div>

                                    <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-cyan-500/50 group-hover:w-full transition-all duration-500" />
                                </motion.div>

                                <motion.div
                                    variants={itemVariants}
                                    onClick={() => setActiveTab('SIMULATOR')}
                                    className="glass-panel group relative overflow-hidden h-64 cursor-pointer border border-white/10 hover:border-white/30 transition-all duration-300"
                                >
                                    {/* Orbital rings pattern - MORE VISIBLE */}
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full border border-white/10 group-hover:scale-110 transition-transform duration-700" />
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-52 h-52 rounded-full border border-cyan-500/10 group-hover:border-cyan-500/20 transition-all duration-500" />
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border border-white/5" />
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-cyan-500/30 group-hover:bg-cyan-500/50 transition-colors" />
                                    {/* Bottom gradient */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#020408] via-transparent to-transparent" />

                                    <div className="absolute inset-0 p-6 flex flex-col justify-between relative z-10">
                                        <div className="flex justify-between items-start">
                                            <Globe size={20} className="text-white/40 group-hover:text-white/70 transition-colors" />
                                            <span className="text-[9px] font-mono text-cyan-400/70 uppercase tracking-widest border border-cyan-500/30 px-2 py-0.5 rounded">New</span>
                                        </div>

                                        <div>
                                            <h3 className="text-xl font-bold mb-2 tracking-tight text-white/90 group-hover:text-white transition-colors">Earth Impact Sim</h3>
                                            <p className="text-xs text-white/40 leading-relaxed group-hover:text-white/60 transition-colors">Visualize real-world problem solving through satellite data layers.</p>
                                        </div>
                                    </div>

                                    <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-cyan-500/50 group-hover:w-full transition-all duration-500" />
                                </motion.div>

                                <motion.div
                                    variants={itemVariants}
                                    onClick={() => setActiveTab('BRIEFING')}
                                    className="glass-panel group relative overflow-hidden h-64 cursor-pointer border border-white/10 hover:border-white/30 transition-all duration-300"
                                >
                                    {/* Diagonal lines pattern - MORE VISIBLE */}
                                    <div className="absolute inset-0"
                                        style={{
                                            backgroundImage: 'repeating-linear-gradient(135deg, transparent, transparent 30px, rgba(255,255,255,0.03) 30px, rgba(255,255,255,0.03) 31px)'
                                        }}
                                    />
                                    {/* Multiple floating elements */}
                                    <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-gradient-to-tr from-blue-500/15 to-transparent blur-2xl" />
                                    <div className="absolute top-8 right-8 w-24 h-24 rounded-full bg-gradient-to-bl from-white/5 to-transparent" />
                                    {/* Bottom gradient */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#020408] via-transparent to-transparent" />

                                    <div className="absolute inset-0 p-6 flex flex-col justify-between relative z-10">
                                        <div className="flex justify-between items-start">
                                            <BookOpen size={20} className="text-white/40 group-hover:text-white/70 transition-colors" />
                                            <span className="text-[9px] font-mono text-white/30 uppercase tracking-widest">2 Themes</span>
                                        </div>

                                        <div>
                                            <h3 className="text-xl font-bold mb-2 tracking-tight text-white/90 group-hover:text-white transition-colors">Mission Briefings</h3>
                                            <p className="text-xs text-white/40 leading-relaxed group-hover:text-white/60 transition-colors">Deep dive into orbital mechanics and remote sensing telemetry.</p>
                                        </div>
                                    </div>

                                    <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-cyan-500/50 group-hover:w-full transition-all duration-500" />
                                </motion.div>

                                <motion.div
                                    variants={itemVariants}
                                    onClick={() => setActiveTab('EXAM')}
                                    className="glass-panel group relative overflow-hidden h-64 cursor-pointer border border-white/10 hover:border-white/30 transition-all duration-300"
                                >
                                    {/* Dot pattern - MORE VISIBLE */}
                                    <div className="absolute inset-0"
                                        style={{
                                            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)',
                                            backgroundSize: '20px 20px'
                                        }}
                                    />
                                    {/* Achievement glow - larger */}
                                    <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-gradient-to-bl from-purple-500/15 to-transparent blur-2xl" />
                                    <div className="absolute bottom-12 left-12 w-32 h-32 rounded-full bg-gradient-to-tr from-cyan-500/10 to-transparent blur-xl" />
                                    {/* Bottom gradient */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#020408] via-transparent to-transparent" />

                                    <div className="absolute inset-0 p-6 flex flex-col justify-between relative z-10">
                                        <div className="flex justify-between items-start">
                                            <GraduationCap size={20} className="text-white/40 group-hover:text-white/70 transition-colors" />
                                            <span className="text-[9px] font-mono text-white/30 uppercase tracking-widest">Certification</span>
                                        </div>

                                        <div>
                                            <h3 className="text-xl font-bold mb-2 tracking-tight text-white/90 group-hover:text-white transition-colors">Advanced Exam</h3>
                                            <p className="text-xs text-white/40 leading-relaxed group-hover:text-white/60 transition-colors">Validate your expertise and earn your rank as a mission specialist.</p>
                                        </div>
                                    </div>

                                    <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-cyan-500/50 group-hover:w-full transition-all duration-500" />
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
