import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { fetchMissions, fetchNasaApod, fetchMissionsByYear, fetchMissionIntel } from '../services/api';
import { AnimatePresence } from 'framer-motion';
import MissionTimeline from '../components/MissionTimeline';
import Starfield from '../components/Starfield';
import { ChevronLeft, Search, History, Zap, FastForward, Layers, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const MissionTimelineView = () => {
    const [missions, setMissions] = useState({ past: [], present: [], future: [] });
    const [loading, setLoading] = useState(true);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [backgroundImage, setBackgroundImage] = useState(null);
    const [activeCategory, setActiveCategory] = useState('PRESENT');
    const [searchYear, setSearchYear] = useState('');
    const [searchLoading, setSearchLoading] = useState(false);
    const [intelModalOpen, setIntelModalOpen] = useState(false);
    const [missionIntel, setMissionIntel] = useState(null);
    const [intelLoading, setIntelLoading] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            const missionData = await fetchMissions();
            const apodData = await fetchNasaApod();

            setMissions(missionData);
            if (missionData.present.length > 0) {
                setSelectedEvent(missionData.present[0]);
            }
            if (apodData && apodData.media_type === 'image') {
                setBackgroundImage(apodData.hdurl || apodData.url);
            }
            setLoading(false);
        };
        loadData();
    }, []);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchYear || searchYear.length !== 4) return;

        setSearchLoading(true);
        const results = await fetchMissionsByYear(searchYear);
        setMissions(prev => ({ ...prev, past: results }));
        if (results.length > 0) {
            setSelectedEvent(results[0]);
        }
        setSearchLoading(false);
    };

    const handleLearnMore = async () => {
        if (!selectedEvent) return;
        setIntelLoading(true);
        setIntelModalOpen(true);
        setMissionIntel(null);

        const intel = await fetchMissionIntel(selectedEvent);
        setMissionIntel(intel);
        setIntelLoading(false);
    };

    const categories = [
        { id: 'PAST', label: 'History', sub: 'Past Archives', color: '#FF0055', icon: History },
        { id: 'PRESENT', label: 'Activity', sub: 'Current Epoch', color: '#00F0FF', icon: Zap },
        { id: 'FUTURE', label: 'Trajectory', sub: 'Future Missions', color: '#A020F0', icon: FastForward },
    ];

    return (
        <div className="relative w-full h-screen bg-black text-white overflow-hidden flex flex-col font-sans">
            {/* Background Layers */}
            <div className="absolute inset-0 z-0">
                <Starfield />
                {backgroundImage && (
                    <div
                        className="absolute inset-0 opacity-20 bg-cover bg-center transition-opacity duration-1000"
                        style={{ backgroundImage: `url(${backgroundImage})` }}
                    />
                )}
                <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black/90" />
            </div>

            {/* Header / Nav */}
            <div className="relative z-50 p-6 flex flex-col md:flex-row justify-between items-center gap-6 bg-gradient-to-b from-black/80 to-transparent">
                <div className="flex items-center gap-4">
            <Link to="/dashboard" className="p-2 rounded-full border border-white/10 hover:bg-white/10 text-white/70 hover:text-[#00F0FF] transition-colors">
                        <ChevronLeft size={24} />
                    </Link>
                    <div>
                        <h1 className="font-header text-2xl md:text-3xl font-bold tracking-widest uppercase text-transparent bg-clip-text bg-gradient-to-r from-white to-[#00F0FF]">
                            Chrono-Archive
                        </h1>
                        <p className="font-mono text-[9px] text-[#00F0FF]/60 tracking-[0.3em] uppercase">SYSTEM.DATABASE_QUERY</p>
                    </div>
                </div>

                {/* Categories / Filter Tabs */}
                <div className="flex bg-white/5 backdrop-blur-md p-1.5 rounded-xl border border-white/10 overflow-x-auto max-w-full">
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={`flex flex-col items-center justify-center px-6 py-3 rounded-lg min-w-[120px] transition-all duration-500 relative group
                                ${activeCategory === cat.id
                                    ? 'bg-white/10 text-white shadow-[0_0_20px_rgba(255,255,255,0.05)]'
                                    : 'text-white/40 hover:text-white/70'
                                } `}
                        >
                            <cat.icon size={18} className="mb-1 transition-transform group-hover:scale-110" style={{ color: activeCategory === cat.id ? cat.color : undefined }} />
                            <span className="text-xs font-header font-bold tracking-widest uppercase">{cat.label}</span>
                            <span className="text-[9px] font-mono tracking-tighter opacity-60 uppercase">{cat.sub}</span>

                            {activeCategory === cat.id && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute bottom-0 left-0 right-0 h-0.5"
                                    style={{ backgroundColor: cat.color }}
                                />
                            )}
                        </button>
                    ))}
                </div>

                {/* Search / Status */}
                <div className="flex items-center gap-4">
                    {activeCategory === 'PAST' && (
                        <form onSubmit={handleSearch} className="relative flex items-center group">
                            <input
                                type="text"
                                placeholder="SEARCH YEAR (e.g. 1969)"
                                value={searchYear}
                                onChange={(e) => setSearchYear(e.target.value)}
                                className="bg-black/40 border border-[#2DD4BF]/60 rounded-full py-2 px-6 pl-12 text-xs font-mono text-white placeholder-white/20 focus:outline-none focus:border-[#2DD4BF] focus:ring-1 focus:ring-[#2DD4BF]/50 w-full transition-all group-hover:border-[#2DD4BF]/80"
                                maxLength={4}
                            />
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#2DD4BF]/60 group-hover:text-[#2DD4BF] transition-colors" size={16} />
                            <button type="submit" disabled={searchLoading} className="absolute right-4 top-1/2 -translate-y-1/2">
                                <FastForward size={16} className={searchLoading ? 'animate-spin text-[#2DD4BF]' : 'text-[#2DD4BF]/60 group-hover:text-[#2DD4BF] transition-colors'} />
                            </button>
                        </form>
                    )}

                    <div className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-full border border-[#2DD4BF]/30 bg-[#2DD4BF]/5">
                        <div className={`w-1.5 h-1.5 rounded-full ${loading || searchLoading ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'} `} />
                        <span className="text-[9px] font-mono font-bold text-[#2DD4BF]">{loading ? 'SYNCING...' : 'VOID.ACTIVE'}</span>
                    </div>
                </div>
            </div>

            {/* Main Content Area: Split side-by-side */}
            <div className="relative z-10 flex-1 flex flex-col md:flex-row h-[calc(100vh-140px)]">

                {/* Left: Selected Event Details */}
                <div className="w-full md:w-1/2 p-4 md:p-8 flex flex-col justify-center items-center overflow-y-auto no-scrollbar">
                    {selectedEvent ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            key={selectedEvent.id}
                            className="bg-black/40 backdrop-blur-3xl border-2 border-[#2DD4BF]/60 p-5 md:p-7 rounded-3xl w-full max-w-2xl shadow-[0_0_60px_rgba(45,212,191,0.1)] border-t-[#2DD4BF]/60"
                        >
                            {/* Technical Header */}
                            <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-3">
                                <div className="flex flex-col">
                                    <span className="text-[9px] font-mono text-[#00F0FF] tracking-widest uppercase">MISSION LOG</span>
                                    <span className="text-[8px] font-mono text-white/50 truncate max-w-[120px]">{selectedEvent.id}</span>
                                </div>
                                <div className="text-right">
                                    <span className="text-[9px] font-mono text-white/50 block uppercase">STAMP</span>
                                    <span className="text-white font-header font-bold text-base">{new Date(selectedEvent.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })}</span>
                                </div>
                            </div>

                            {/* Image Visualizer - Reduced Aspect Ratio */}
                            <div className="w-full aspect-[16/7] bg-gradient-to-br from-gray-900 to-black rounded-xl overflow-hidden relative border border-white/5 mb-3 group">
                                {selectedEvent.image ? (
                                    <img
                                        src={selectedEvent.image}
                                        alt={selectedEvent.name}
                                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-700 hover:scale-105 transition-transform"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = selectedEvent.type === 'HISTORY'
                                                ? 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&q=80&w=800'
                                                : 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800';
                                        }}
                                    />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden">
                                        <img
                                            src={selectedEvent.type === 'HISTORY'
                                                ? 'https://images.unsplash.com/photo-1517976487492-5750f3195933?auto=format&fit=crop&q=80&w=800'
                                                : 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&q=80&w=800'}
                                            alt="Fallback"
                                            className="absolute inset-0 w-full h-full object-cover opacity-30 brightness-50 grayscale hover:grayscale-0 transition-all duration-1000"
                                        />
                                        <div className="relative z-10 flex flex-col items-center gap-2">
                                            <Layers size={36} className="text-[#00F0FF]/40 animate-pulse" />
                                            <span className="text-[7px] tracking-[0.4em] font-mono uppercase text-white/40">{selectedEvent.type === 'HISTORY' ? 'ARCHIVE_VISUAL_RECON' : 'IMAGE_NOT_FOUND'}</span>
                                        </div>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
                            </div>

                            {/* Core Info */}
                            <div className="space-y-4">
                                <div>
                                    <h2 className="text-2xl md:text-3xl font-header font-bold text-white mb-1 leading-tight uppercase tracking-wide">
                                        {selectedEvent.name}
                                    </h2>
                                    <div className="flex items-center gap-3">
                                        <div className="h-[2px] w-6 translate-y-[1px]" style={{ backgroundColor: selectedEvent.color }} />
                                        <span className="text-[#00F0FF] font-mono text-[10px] tracking-[0.4em] uppercase font-bold">{selectedEvent.agency}</span>
                                    </div>
                                </div>

                                <div className="relative group/desc">
                                    <p className="text-white/60 leading-relaxed text-[11px] md:text-xs font-light h-14 overflow-hidden italic line-clamp-3">
                                        "{selectedEvent.description}"
                                    </p>
                                    <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-black/40 to-transparent" />
                                </div>

                                {/* Technical Specs Grid - Optimized for space */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5 pt-0.5">
                                    <div className="p-2 bg-white/5 border border-white/10 rounded-lg">
                                        <span className="block text-[8px] font-mono text-white/70 uppercase tracking-widest mb-0.5">Launcher</span>
                                        <span className="block text-[10px] font-header font-bold text-white truncate">{selectedEvent.rocket}</span>
                                    </div>
                                    <div className="p-2 bg-white/5 border border-white/10 rounded-lg">
                                        <span className="block text-[8px] font-mono text-white/70 uppercase tracking-widest mb-0.5">State</span>
                                        <span className="block text-[10px] font-header font-bold tracking-widest uppercase truncate" style={{ color: selectedEvent.color }}>
                                            {selectedEvent.status}
                                        </span>
                                    </div>
                                    <div className="p-2 bg-white/5 border border-white/10 rounded-lg">
                                        <span className="block text-[8px] font-mono text-white/70 uppercase tracking-widest mb-0.5">Time</span>
                                        <span className="block text-[10px] font-header font-bold text-white uppercase truncate">{selectedEvent.launchTime || 'N/A'}</span>
                                    </div>

                                    <button
                                        onClick={handleLearnMore}
                                        className="p-2 bg-[#2DD4BF]/20 border border-[#2DD4BF]/40 rounded-lg hover:bg-[#2DD4BF]/30 transition-all flex flex-col items-center justify-center group"
                                    >
                                        <Layers size={12} className="text-[#2DD4BF] mb-0.5 group-hover:scale-110 transition-transform" />
                                        <span className="text-[9px] font-bold text-white uppercase tracking-tighter">Learn More</span>
                                    </button>
                                </div>
                                {selectedEvent.rocketStatus && (
                                    <div className="p-2 bg-white/10 border border-[#2DD4BF]/20 rounded-lg backdrop-blur-sm">
                                        <span className="block text-[8px] font-mono text-[#2DD4BF] uppercase tracking-widest mb-0.5">Systems</span>
                                        <span className="block text-[10px] font-header font-bold text-white uppercase truncate">{selectedEvent.rocketStatus}</span>
                                    </div>
                                )}
                                {selectedEvent.price && selectedEvent.price !== 'N/A' && (
                                    <div className="p-2 bg-white/10 border border-green-500/20 rounded-lg backdrop-blur-sm">
                                        <span className="block text-[8px] font-mono text-green-400 uppercase tracking-widest mb-0.5">Asset</span>
                                        <span className="block text-[10px] font-header font-bold text-white uppercase">${selectedEvent.price}M</span>
                                    </div>
                                )}
                                <div className="p-2 bg-white/5 border border-white/10 rounded-lg col-span-2">
                                    <span className="block text-[8px] font-mono text-white/70 uppercase tracking-widest mb-0.5">Deployment Zone</span>
                                    <span className="block text-[10px] font-header font-bold text-white truncate">{selectedEvent.location}</span>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <div className="text-center space-y-4 opacity-50 select-none">
                            <motion.div
                                animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.6, 0.3] }}
                                transition={{ repeat: Infinity, duration: 4 }}
                                className="text-5xl text-[#00F0FF]/20 font-header font-bold"
                            >
                                MISSION SELECT
                            </motion.div>
                            <p className="text-white/40 font-mono tracking-widest text-xs">AWAITING ARCHIVE SELECTION</p>
                        </div>
                    )}
                </div>

                {/* Right: Vertical Timeline List */}
                <div className="w-full md:w-1/2 h-full relative border-l border-white/5 bg-white/[0.02] flex flex-col">
                    <div className="p-6 border-b border-white/5 bg-black/40 backdrop-blur-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-header font-bold text-white tracking-widest uppercase flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: categories.find(c => c.id === activeCategory)?.color }}></span>
                                    {categories.find(c => c.id === activeCategory)?.sub}
                                </h3>
                                <span className="text-[8px] font-mono text-white/50 tracking-[0.5em] uppercase">SEQUENTIAL DATASTREAM</span>
                            </div>
                            <div className="text-right">
                                <span className="text-[10px] font-mono text-[#00F0FF]">{missions[activeCategory.toLowerCase()].length}</span>
                                <span className="text-[8px] font-mono text-white/40 block tracking-widest">FILES</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-hidden">
                        {!loading && (
                            <MissionTimeline
                                pastMissions={missions.past}
                                presentMissions={missions.present}
                                futureMissions={missions.future}
                                onSelectEvent={setSelectedEvent}
                                selectedEventId={selectedEvent?.id}
                                activeCategory={activeCategory}
                            />
                        )}
                    </div>
                </div>
            </div>

            {/* Mission Intelligence Modal */}
            <AnimatePresence>
                {intelModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIntelModalOpen(false)}
                            className="absolute inset-0 bg-black/90 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative bg-[#050B14]/80 border border-[#2DD4BF]/30 rounded-[2rem] w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-[0_0_100px_rgba(45,212,191,0.15)] backdrop-blur-3xl flex flex-col"
                        >
                            {/* Decorative Background Elements */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#2DD4BF] to-transparent opacity-50" />
                            <div className="absolute top-[-100px] right-[-100px] w-[300px] h-[300px] bg-[#2DD4BF]/5 rounded-full blur-[100px]" />
                            <div className="absolute bottom-[-100px] left-[-100px] w-[300px] h-[300px] bg-[#FF0055]/5 rounded-full blur-[100px]" />

                            <div className="p-8 md:px-12 md:py-10 relative z-10 flex-shrink-0 border-b border-white/5 bg-black/20">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-3">
                                            <div className="w-1.5 h-1.5 rounded-full bg-[#00F0FF] animate-pulse" />
                                            <h3 className="text-[#00F0FF] font-mono text-xs tracking-[0.5em] uppercase font-bold">Intelligence Feed // Active</h3>
                                        </div>
                                        <h2 className="text-4xl md:text-5xl font-header font-bold text-white uppercase tracking-tighter leading-none">
                                            {selectedEvent?.name}
                                        </h2>
                                        <div className="text-xs font-mono text-white/60 uppercase tracking-[0.2em]">
                                            Sector: {selectedEvent?.agency} // Reference: {selectedEvent?.id?.toString().slice(0, 8)}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setIntelModalOpen(false)}
                                        className="group flex items-center gap-3 text-white/40 hover:text-white transition-all py-2 px-5 border border-white/10 rounded-xl hover:border-[#00F0FF]/50 bg-white/5 backdrop-blur-md self-start"
                                    >
                                        <span className="font-mono text-xs tracking-widest uppercase group-hover:text-[#00F0FF]">Terminate_Link</span>
                                        <X size={16} className="group-hover:rotate-90 transition-transform" />
                                    </button>
                                </div>
                            </div>

                            <div className="p-8 md:p-12 pt-6 overflow-y-auto custom-scrollbar flex-1">
                                <div className="space-y-10">

                                    {intelLoading ? (
                                        <div className="py-32 flex flex-col items-center justify-center space-y-6">
                                            <div className="relative">
                                                <div className="w-20 h-20 border-2 border-[#00F0FF]/20 rounded-full" />
                                                <div className="absolute inset-0 w-20 h-20 border-t-2 border-[#00F0FF] rounded-full animate-spin" />
                                                <Zap size={24} className="absolute inset-0 m-auto text-[#00F0FF] animate-pulse" />
                                            </div>
                                            <div className="flex flex-col items-center gap-1">
                                                <span className="text-[10px] font-mono text-[#00F0FF] animate-pulse uppercase tracking-[0.3em]">Querying Groq Neural Link...</span>
                                                <span className="text-[8px] font-mono text-white/40 uppercase">Analyzing mission trajectory data</span>
                                            </div>
                                        </div>
                                    ) : missionIntel ? (
                                        <div className="grid md:grid-cols-[1.2fr,1fr] gap-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                                            {/* Left Column: Summary & Achievements */}
                                            <div className="space-y-12">
                                                <section className="space-y-6">
                                                    <div className="flex items-center gap-4">
                                                        <h4 className="text-xs font-mono text-[#00F0FF] uppercase tracking-[0.3em] font-bold">Executive_Summary</h4>
                                                        <div className="h-[1px] flex-1 bg-gradient-to-r from-[#00F0FF]/30 to-transparent" />
                                                    </div>
                                                    <div className="relative">
                                                        <div className="absolute -left-4 top-0 bottom-0 w-[2px] bg-gradient-to-b from-[#00F0FF]/50 to-transparent" />
                                                        <p className="text-white/90 leading-relaxed text-xl font-light italic pl-4">
                                                            "{typeof missionIntel.summary === 'string' ? missionIntel.summary : 'Summary data unavailable.'}"
                                                        </p>
                                                    </div>
                                                </section>

                                                <section className="space-y-8">
                                                    <div className="flex items-center gap-4">
                                                        <h4 className="text-xs font-mono text-[#00F0FF] uppercase tracking-[0.3em] font-bold">Mission_Milestones</h4>
                                                        <div className="h-[1px] flex-1 bg-gradient-to-r from-[#00F0FF]/30 to-transparent" />
                                                    </div>

                                                    <div className="relative pl-6 space-y-10">
                                                        {/* Vertical Timeline Line */}
                                                        <div className="absolute left-[7px] top-2 bottom-2 w-[1px] bg-white/10" />

                                                        {(Array.isArray(missionIntel.keyEvents) ? missionIntel.keyEvents : []).map((evt, i) => {
                                                            const isObj = typeof evt === 'object' && evt !== null;
                                                            const title = isObj ? (evt.title || evt.event || `Milestone ${i + 1} `) : evt;
                                                            const desc = isObj ? (evt.description || evt.desc) : null;
                                                            const time = isObj ? (evt.time || evt.timestamp) : null;

                                                            return (
                                                                <motion.div
                                                                    key={i}
                                                                    initial={{ opacity: 0, x: -10 }}
                                                                    animate={{ opacity: 1, x: 0 }}
                                                                    transition={{ delay: i * 0.15 }}
                                                                    className="relative group"
                                                                >
                                                                    {/* Timeline Dot */}
                                                                    <div className="absolute -left-[23px] top-1.5 w-4 h-4 rounded-full bg-black border border-white/20 z-10 flex items-center justify-center group-hover:border-[#00F0FF] transition-colors">
                                                                        <div className="w-1.5 h-1.5 rounded-full bg-white/20 group-hover:bg-[#00F0FF] group-hover:shadow-[0_0_10px_#00F0FF] transition-all" />
                                                                    </div>

                                                                    <div className="space-y-1">
                                                                        <div className="flex items-center gap-3">
                                                                            <span className="text-white font-header font-bold text-xl uppercase tracking-tight group-hover:text-[#00F0FF] transition-colors">
                                                                                {title}
                                                                            </span>
                                                                            {time && (
                                                                                <span className="text-[11px] font-mono text-[#00F0FF] uppercase bg-white/10 px-2 py-0.5 rounded border border-white/10 font-bold">
                                                                                    T+ {time}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                        {desc && (
                                                                            <p className="text-white/80 text-sm leading-relaxed font-light font-sans max-w-sm">
                                                                                {desc}
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                </motion.div>
                                                            );
                                                        })}
                                                    </div>
                                                </section>
                                            </div>

                                            {/* Right Column: Strategic Impact & Metadata */}
                                            <div className="space-y-12">
                                                <section className="space-y-6">
                                                    <div className="flex items-center gap-4">
                                                        <h4 className="text-xs font-mono text-[#FF0055] uppercase tracking-[0.3em] font-bold">Strategic_Impact</h4>
                                                        <div className="h-[1px] flex-1 bg-gradient-to-r from-[#FF0055]/30 to-transparent" />
                                                    </div>
                                                    <div className="p-8 rounded-[2rem] bg-gradient-to-br from-[#FF0055]/10 to-transparent border border-[#FF0055]/20 backdrop-blur-xl relative overflow-hidden group/impact">
                                                        <Zap size={40} className="absolute -right-4 -bottom-4 text-[#FF0055]/5 group-hover/impact:scale-125 transition-transform duration-700" />
                                                        <p className="text-lg md:text-xl text-white/80 leading-relaxed font-light relative z-10">
                                                            {typeof missionIntel.impact === 'string' ? missionIntel.impact : 'Impact data unavailable.'}
                                                        </p>
                                                    </div>
                                                </section>

                                                <section className="space-y-6">
                                                    <div className="flex items-center gap-4">
                                                        <h4 className="text-xs font-mono text-white uppercase tracking-[0.3em] font-bold">Launch_Metadata</h4>
                                                        <div className="h-[1px] flex-1 bg-white/20" />
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        {[
                                                            { label: 'STATUS', val: selectedEvent?.status },
                                                            { label: 'ROCKET', val: selectedEvent?.rocket },
                                                            { label: 'PRICE', val: selectedEvent?.price ? `$${selectedEvent.price} M` : 'N/A' },
                                                            { label: 'LOCATION', val: selectedEvent?.location?.split(',')[0] }
                                                        ].map((item, i) => (
                                                            <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                                                                <div className="text-[11px] font-mono text-white font-bold uppercase tracking-[0.2em] mb-1">{item.label}</div>
                                                                <div className="text-sm font-bold text-white truncate uppercase">{item.val || 'UNKNOWN'}</div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </section>

                                                {/* Final Tech Readout */}
                                                <div className="pt-10 border-t border-white/5">
                                                    <div className="p-4 rounded-xl bg-black/40 font-mono text-[10px] text-[#00F0FF] leading-relaxed font-bold">
                                                        $ CRYPTO_SIG: 0x8a2...f3e <br />
                                                        $ NEURAL_LATENCY: 12ms <br />
                                                        $ SOURCE: LL2_ORBITAL_ARCHIVE_NODE_04
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="py-32 text-center space-y-4">
                                            <div className="text-white/20 font-mono text-xl uppercase tracking-[1em] animate-pulse">Connection_Lost</div>
                                            <p className="text-white/40 text-sm font-mono uppercase tracking-widest">Failed to retrieve intelligence from Groq stream</p>
                                            <button onClick={handleLearnMore} className="mt-8 text-[#00F0FF] font-mono text-xs hover:underline uppercase tracking-widest">Re-establish link</button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* CRT Overlay Effect */}
                            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(45,212,191,0.03),rgba(45,212,191,0.01),rgba(45,212,191,0.03))] bg-[length:100%_2px,3px_100%] opacity-40" />
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MissionTimelineView;
