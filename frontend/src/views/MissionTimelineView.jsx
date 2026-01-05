import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { fetchMissions, fetchNasaApod, fetchMissionsByYear } from '../services/api';
import MissionTimeline from '../components/MissionTimeline';
import Starfield from '../components/Starfield';
import { ChevronLeft, Search, History, Zap, FastForward, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';

const MissionTimelineView = () => {
    const [missions, setMissions] = useState({ past: [], present: [], future: [] });
    const [loading, setLoading] = useState(true);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [backgroundImage, setBackgroundImage] = useState(null);
    const [activeCategory, setActiveCategory] = useState('PRESENT');
    const [searchYear, setSearchYear] = useState('');
    const [searchLoading, setSearchLoading] = useState(false);

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
                    <Link to="/" className="p-2 rounded-full border border-white/10 hover:bg-white/10 text-white/70 hover:text-[#00F0FF] transition-colors">
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
                                    : 'text-white/20 hover:text-white/50'
                                }`}
                        >
                            <cat.icon size={18} className="mb-1 transition-transform group-hover:scale-110" style={{ color: activeCategory === cat.id ? cat.color : undefined }} />
                            <span className="text-[10px] font-header font-bold tracking-widest uppercase">{cat.label}</span>
                            <span className="text-[7px] font-mono tracking-tighter opacity-40 uppercase">{cat.sub}</span>

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
                        <div className={`w-1.5 h-1.5 rounded-full ${loading || searchLoading ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'}`} />
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
                                    <span className="text-[8px] font-mono text-white/30 truncate max-w-[120px]">{selectedEvent.id}</span>
                                </div>
                                <div className="text-right">
                                    <span className="text-[9px] font-mono text-white/30 block uppercase">STAMP</span>
                                    <span className="text-white font-header font-bold text-base">{new Date(selectedEvent.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })}</span>
                                </div>
                            </div>

                            {/* Image Visualizer */}
                            <div className="w-full aspect-[21/9] bg-gradient-to-br from-gray-900 to-black rounded-xl overflow-hidden relative border border-white/5 mb-4 group">
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

                                <p className="text-gray-400 leading-relaxed text-xs md:text-sm font-light h-20 overflow-y-auto no-scrollbar pr-4 italic">
                                    "{selectedEvent.description}"
                                </p>

                                {/* Technical Specs Grid - Optimized for space */}
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 pt-1">
                                    <div className="p-2.5 bg-white/5 border border-white/10 rounded-xl">
                                        <span className="block text-[6px] font-mono text-white/30 uppercase tracking-widest mb-0.5">Launcher</span>
                                        <span className="block text-[9px] font-header font-bold text-white truncate">{selectedEvent.rocket}</span>
                                    </div>
                                    <div className="p-2.5 bg-white/5 border border-white/10 rounded-xl">
                                        <span className="block text-[6px] font-mono text-white/30 uppercase tracking-widest mb-0.5">Mission State</span>
                                        <span className="block text-[9px] font-header font-bold tracking-widest uppercase" style={{ color: selectedEvent.color }}>
                                            {selectedEvent.status}
                                        </span>
                                    </div>
                                    <div className="p-2.5 bg-white/5 border border-white/10 rounded-xl">
                                        <span className="block text-[6px] font-mono text-white/30 uppercase tracking-widest mb-0.5">Launch Time</span>
                                        <span className="block text-[9px] font-header font-bold text-white uppercase">{selectedEvent.launchTime || 'Unknown'}</span>
                                    </div>
                                    {selectedEvent.rocketStatus && (
                                        <div className="p-2.5 bg-white/10 border border-[#2DD4BF]/20 rounded-xl backdrop-blur-sm">
                                            <span className="block text-[6px] font-mono text-[#2DD4BF] uppercase tracking-widest mb-0.5">System Status</span>
                                            <span className="block text-[9px] font-header font-bold text-white uppercase">{selectedEvent.rocketStatus}</span>
                                        </div>
                                    )}
                                    {selectedEvent.price && selectedEvent.price !== 'N/A' && (
                                        <div className="p-2.5 bg-white/10 border border-green-500/20 rounded-xl backdrop-blur-sm">
                                            <span className="block text-[6px] font-mono text-green-400 uppercase tracking-widest mb-0.5">Asset Value</span>
                                            <span className="block text-[9px] font-header font-bold text-white uppercase">${selectedEvent.price}M</span>
                                        </div>
                                    )}
                                    <div className="p-2.5 bg-white/5 border border-white/10 rounded-xl col-span-full">
                                        <span className="block text-[6px] font-mono text-white/30 uppercase tracking-widest mb-0.5">Deployment Zone</span>
                                        <span className="block text-[9px] font-header font-bold text-white truncate">{selectedEvent.location}</span>
                                    </div>
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
                                <span className="text-[8px] font-mono text-white/30 tracking-[0.5em] uppercase">SEQUENTIAL DATASTREAM</span>
                            </div>
                            <div className="text-right">
                                <span className="text-[10px] font-mono text-[#00F0FF]">{missions[activeCategory.toLowerCase()].length}</span>
                                <span className="text-[8px] font-mono text-white/20 block tracking-widest">FILES</span>
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
        </div>
    );
};

export default MissionTimelineView;
