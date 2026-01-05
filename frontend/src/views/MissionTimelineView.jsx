import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { fetchMissions, fetchNasaApod } from '../services/api';
import MissionTimeline from '../components/MissionTimeline';
import Starfield from '../components/Starfield';
import { ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const MissionTimelineView = () => {
    const [missions, setMissions] = useState({ past: [], present: [], future: [] });
    const [loading, setLoading] = useState(true);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [backgroundImage, setBackgroundImage] = useState(null);
    const [activeCategory, setActiveCategory] = useState('PRESENT');

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            const missionData = await fetchMissions();
            const apodData = await fetchNasaApod();

            setMissions(missionData);
            if (apodData && apodData.media_type === 'image') {
                setBackgroundImage(apodData.hdurl || apodData.url);
            }
            setLoading(false);
        };
        loadData();
    }, []);

    const categories = [
        { id: 'PAST', label: '🔴 Past Missions', color: '#FF0055' },
        { id: 'PRESENT', label: '🔵 Present (Ongoing)', color: '#00F0FF' },
        { id: 'FUTURE', label: '🟣 Upcoming (Future)', color: '#A020F0' },
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
            <div className="relative z-50 p-6 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent">
                <div className="flex items-center gap-4">
                    <Link to="/" className="p-2 rounded-full border border-white/10 hover:bg-white/10 text-white/70 hover:text-[#00F0FF] transition-colors">
                        <ChevronLeft size={24} />
                    </Link>
                    <div>
                        <h1 className="font-header text-3xl font-bold tracking-widest uppercase text-transparent bg-clip-text bg-gradient-to-r from-white to-[#00F0FF]">
                            Chrono-Archive
                        </h1>
                        <p className="font-mono text-xs text-[#00F0FF]/60 tracking-[0.3em]">MISSION TIMELINE</p>
                    </div>
                </div>

                {/* Categories / Filter Tabs */}
                <div className="flex bg-white/5 backdrop-blur-md p-1 rounded-full border border-white/10">
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={`px-6 py-2 rounded-full text-[10px] font-mono tracking-widest transition-all duration-300 ${activeCategory === cat.id
                                ? 'bg-white/10 text-white border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.1)]'
                                : 'text-white/30 hover:text-white/60 hover:bg-white/5'
                                }`}
                            style={activeCategory === cat.id ? { color: cat.color, borderColor: `${cat.color}66` } : {}}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>

                {/* Status Indicator */}
                <div className="hidden md:flex items-center gap-2 px-4 py-1 rounded-full border border-[#00F0FF]/30 bg-[#00F0FF]/5">
                    <div className={`w-2 h-2 rounded-full ${loading ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'}`} />
                    <span className="text-[10px] font-mono font-bold text-[#00F0FF]">{loading ? 'SYNCING...' : 'LIVE FEED'}</span>
                </div>
            </div>

            {/* Main Content Area: Now split side-by-side for better vertical real estate */}
            <div className="relative z-10 flex-1 flex flex-col md:flex-row h-[calc(100vh-100px)]">

                {/* Left: Selected Event Details */}
                <div className="w-full md:w-1/2 p-8 flex flex-col justify-center items-center">
                    {selectedEvent ? (
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            key={selectedEvent.id}
                            className="bg-black/40 backdrop-blur-2xl border border-white/10 p-8 rounded-2xl w-full max-w-xl shadow-[0_0_50px_rgba(0,240,255,0.05)] pointer-events-auto"
                        >
                            {/* Image */}
                            <div className="w-full aspect-video bg-black rounded-lg overflow-hidden relative border border-white/5 shadow-lg group mb-6">
                                {selectedEvent.image ? (
                                    <img
                                        src={selectedEvent.image}
                                        alt={selectedEvent.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800';
                                        }}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-900 text-white/20 font-mono text-xs">NO VISUAL</div>
                                )}
                            </div>

                            {/* Info */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h2 className="text-2xl font-header font-bold text-white mb-1 leading-tight">{selectedEvent.name}</h2>
                                        <div className="text-[#00F0FF] font-mono text-sm tracking-wider uppercase">{selectedEvent.agency}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-3xl font-mono font-thin text-white/80">{new Date(selectedEvent.date).getFullYear()}</div>
                                        <div className="text-[10px] text-white/40 font-mono uppercase tracking-tighter">
                                            {new Date(selectedEvent.date).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}
                                        </div>
                                    </div>
                                </div>

                                <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                                <p className="text-gray-400 leading-relaxed text-sm h-24 overflow-y-auto no-scrollbar scroll-smooth">
                                    {selectedEvent.description}
                                </p>

                                <div className="flex flex-wrap gap-2 pt-2">
                                    <div className="px-3 py-1 rounded bg-white/5 border border-white/10 text-[10px] font-mono text-white/60">
                                        ROCKET: <span className="text-white">{selectedEvent.rocket}</span>
                                    </div>
                                    <div className="px-3 py-1 rounded bg-white/5 border border-white/10 text-[10px] font-mono text-white/60">
                                        STATUS: <span style={{ color: selectedEvent.color }}>{selectedEvent.status}</span>
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
                            <p className="text-white/40 font-mono tracking-widest text-xs">PENDING INPUT...</p>
                        </div>
                    )}
                </div>

                {/* Right: Vertical Timeline List */}
                <div className="w-full md:w-1/2 h-full relative border-l border-white/5 bg-white/[0.02]">
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
    );
};

export default MissionTimelineView;
