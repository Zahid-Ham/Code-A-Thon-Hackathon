import React from 'react';
import { OrbitalAtlasProvider, useOrbitalAtlas } from '../contexts/OrbitalAtlasContext';
import OrbitalEarth from '../components/OrbitalEarth';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, X } from 'lucide-react';

const SatelliteModal = ({ isOpen, onClose, details, satellite }) => {
    if (!isOpen || !details) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative w-full max-w-2xl bg-black/90 border border-cyan-500/30 rounded-xl overflow-hidden shadow-[0_0_50px_rgba(0,240,255,0.2)] flex flex-col max-h-[80vh] animation-fade-in-up">

                {/* Header */}
                <div className="relative h-40 bg-black/50 shrink-0">
                    {details.img && details.img !== 'N/A' ? (
                        <img
                            src={details.img}
                            alt={satellite?.name}
                            className="w-full h-full object-cover opacity-50"
                            onError={(e) => { e.target.style.display = 'none' }}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
                            <div className="text-6xl opacity-20">🛰️</div>
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>

                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 rounded-full bg-black/50 hover:bg-white/10 text-white/70 hover:text-white transition-colors z-10"
                    >
                        <X size={24} />
                    </button>

                    <div className="absolute bottom-6 left-8">
                        <h2 className="text-3xl font-bold text-white mb-1 drop-shadow-md">{satellite?.name}</h2>
                        <div className="flex items-center gap-3">
                            <span className="text-xs text-cyan-400 font-mono tracking-widest uppercase px-2 py-0.5 bg-cyan-900/30 border border-cyan-500/30 rounded">
                                {satellite?.orbitType} ORBIT
                            </span>
                            <span className="text-xs text-white/60 font-mono tracking-widest uppercase">
                                #{satellite?.satelliteId}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Scrollable Body */}
                <div className="p-8 overflow-y-auto scrollbar-thin scrollbar-thumb-cyan-900 scrollbar-track-transparent space-y-8">

                    {/* Mission History */}
                    {details.history && (
                        <div className="animate-slide-in" style={{ animationDelay: '0.1s' }}>
                            <h3 className="text-cyan-400 text-sm font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                                <span className="w-8 h-[1px] bg-cyan-500/50"></span>
                                Mission History
                            </h3>
                            <p className="text-gray-300 leading-relaxed text-sm md:text-base border-l-2 border-white/10 pl-4">
                                {details.history}
                            </p>
                        </div>
                    )}

                    {/* Instruments */}
                    {details.instruments && (
                        <div className="animate-slide-in" style={{ animationDelay: '0.2s' }}>
                            <h3 className="text-cyan-400 text-sm font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                                <span className="w-8 h-[1px] bg-cyan-500/50"></span>
                                Onboard Instruments
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {details.instruments.map((inst, i) => (
                                    <div key={i} className="bg-white/5 p-3 rounded border border-white/5 flex items-center gap-3">
                                        <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full shadow-[0_0_5px_#22d3ee]"></div>
                                        <span className="text-gray-300 text-sm">{inst}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Achievements */}
                    {details.achievements && (
                        <div className="animate-slide-in" style={{ animationDelay: '0.3s' }}>
                            <h3 className="text-cyan-400 text-sm font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                                <span className="w-8 h-[1px] bg-cyan-500/50"></span>
                                Major Achievements
                            </h3>
                            <div className="bg-gradient-to-r from-yellow-900/10 to-transparent p-4 border-l-2 border-yellow-500/50 rounded-r-lg">
                                <p className="text-gray-300 leading-relaxed text-sm">
                                    {details.achievements}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* AI Full Description fallback */}
                    {details.aiGenerated && details.description && (
                        <div className="animate-slide-in" style={{ animationDelay: '0.4s' }}>
                            <div className="flex items-center gap-2 mb-3">
                                <h3 className="text-cyan-400 text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                                    <span className="w-8 h-[1px] bg-cyan-500/50"></span>
                                    AI Analysis
                                </h3>
                                <span className="text-[9px] bg-purple-900/50 px-2 py-0.5 rounded text-purple-200 border border-purple-500/30">Groq Enhanced</span>
                            </div>
                            <p className="text-gray-300 leading-relaxed text-sm bg-white/5 p-4 rounded-lg font-mono text-xs opacity-80">
                                {details.description}
                            </p>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-white/10 bg-black/40 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase tracking-widest rounded transition-colors"
                    >
                        Close Data Stream
                    </button>
                </div>
            </div>
        </div>
    );
};

const Inspector = () => {
    const { selectedSat, setSelectedSat, selectedDetails, loading } = useOrbitalAtlas();
    const [showModal, setShowModal] = React.useState(false);

    if (!selectedSat) return (
        <div className="absolute top-20 right-5 w-80 bg-black/80 backdrop-blur-md p-6 border border-white/20 rounded-xl text-white">
            <h2 className="text-2xl font-bold mb-2 glitch-text">ORBITAL ATLAS</h2>
            <p className="text-white/60 text-sm">Select a satellite to view telemetry.</p>
        </div>
    );

    return (
        <>
            <div className={`absolute top-20 right-5 w-96 bg-black/90 backdrop-blur-xl border border-cyan-500/30 rounded-xl text-white shadow-[0_0_30px_rgba(0,240,255,0.2)] transition-all duration-300 h-auto flex flex-col overflow-hidden`}>

                {/* Close Button */}
                <button
                    onClick={() => setSelectedSat(null)}
                    className="absolute top-2 right-2 z-50 p-2 rounded-full bg-black/50 hover:bg-black/80 text-white/50 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>

                {/* Satellite Image Header */}
                <div className="relative w-full h-48 bg-black/50 shrink-0">
                    {selectedDetails?.img && selectedDetails.img !== 'N/A' ? (
                        <img
                            src={selectedDetails.img}
                            alt={selectedSat.name}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.target.style.display = 'none' }}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
                            <div className="text-6xl opacity-20">🛰️</div>
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                    <div className="absolute bottom-4 left-6 pr-10">
                        <h2 className="text-2xl font-bold text-white mb-0 drop-shadow-md leading-tight">{selectedSat.name}</h2>
                        <div className="text-xs text-cyan-400 font-mono tracking-widest uppercase mt-1">{selectedSat.orbitType} ORBIT • #{selectedSat.satelliteId}</div>
                    </div>
                </div>

                <div className="p-6 pt-2 flex-shrink-0">
                    {loading ? (
                        <div className="text-cyan-400 animate-pulse mt-4">Establishing Downlink...</div>
                    ) : selectedDetails ? (
                        <div className="space-y-4 mt-2">
                            {/* Primary Info Grid */}
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="bg-white/5 p-2 rounded border border-white/5">
                                    <div className="text-white/40 text-[10px] tracking-wider">ALTITUDE</div>
                                    <div className="font-mono text-lg">{Math.round(selectedDetails.altitude)} <span className="text-xs text-white/50">km</span></div>
                                </div>
                                <div className="bg-white/5 p-2 rounded border border-white/5">
                                    <div className="text-white/40 text-[10px] tracking-wider">VELOCITY</div>
                                    <div className="font-mono text-lg">{selectedDetails.velocity?.toFixed(2)} <span className="text-xs text-white/50">km/s</span></div>
                                </div>
                                <div className="bg-white/5 p-2 rounded border border-white/5">
                                    <div className="text-white/40 text-[10px] tracking-wider">LAUNCH YEAR</div>
                                    <div className="font-mono text-base">{selectedDetails.launchDate ? selectedDetails.launchDate.split('-')[0] : 'N/A'}</div>
                                </div>
                                <div className="bg-white/5 p-2 rounded border border-white/5">
                                    <div className="text-white/40 text-[10px] tracking-wider">MISSION</div>
                                    <div className="font-mono text-base truncate" title={selectedDetails.missionType}>{selectedDetails.missionType || 'Classified'}</div>
                                </div>
                            </div>

                            {/* Why It Matters (Expanded) */}
                            {(selectedDetails.realWorldImpact || selectedDetails.description) && (
                                <div className="bg-cyan-900/10 p-4 border-l-2 border-cyan-500 rounded-r-lg">
                                    <div className="text-cyan-400 text-xs font-bold uppercase tracking-wider mb-2">INTELLIGENCE BRIEF</div>
                                    <div className="text-sm text-gray-300 italic max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-cyan-500/30 pr-2 leading-relaxed">
                                        "{selectedDetails.realWorldImpact || selectedDetails.description}"
                                    </div>
                                </div>
                            )}

                            {/* Live Stream Button */}
                            {selectedDetails.liveStreamUrl && (
                                <a
                                    href={selectedDetails.liveStreamUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-2 w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded font-bold text-sm transition-colors"
                                >
                                    <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                                    WATCH LIVE FEED
                                </a>
                            )}

                            {/* Toggle Learn More */}
                            <button
                                onClick={() => setShowModal(true)}
                                className="w-full py-2 bg-white/5 hover:bg-white/10 rounded text-xs text-cyan-400 font-mono tracking-widest mt-2 hover:shadow-[0_0_10px_rgba(34,211,238,0.2)] transition-all"
                            >
                                [+] LEARN MORE
                            </button>
                        </div>
                    ) : (
                        <div className="text-red-500 mt-4">Telemetry Lost.</div>
                    )}
                </div>
            </div>

            <SatelliteModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                details={selectedDetails}
                satellite={selectedSat}
            />
        </>
    );
};

const SatelliteList = () => {
    const { satellites, selectedSat, setSelectedSat, loading } = useOrbitalAtlas();
    const [searchTerm, setSearchTerm] = React.useState('');
    const [filterType, setFilterType] = React.useState('ALL');

    const filtered = React.useMemo(() => {
        if (!satellites) return [];
        return satellites.filter(s => {
            const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesType = filterType === 'ALL' || s.orbitType === filterType;
            return matchesSearch && matchesType;
        });
    }, [satellites, searchTerm, filterType]);

    // Limit visible items for performance if needed, but 2000 is okay for modern DOM if simplistic
    const displayList = filtered.slice(0, 100);

    return (
        <div className="absolute top-20 left-5 w-80 h-[80vh] flex flex-col bg-black/80 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]">
            <div className="p-4 border-b border-white/10 bg-white/5">
                <h2 className="text-lg font-bold text-white mb-3 tracking-widest">SATELLITE LOG</h2>

                {/* Search */}
                <input
                    type="text"
                    placeholder="Search NORAD ID or Name..."
                    className="w-full bg-black/50 border border-white/20 rounded p-2 text-sm text-cyan-400 focus:outline-none focus:border-cyan-500 mb-2"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />

                {/* Filters */}
                <div className="flex gap-2 text-[10px]">
                    {['ALL', 'LEO', 'MEO', 'GEO'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilterType(f)}
                            className={`flex-1 py-1 rounded border ${filterType === f ? 'bg-cyan-900/50 border-cyan-500 text-cyan-300' : 'border-white/10 hover:bg-white/5 text-gray-400'}`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-cyan-900 scrollbar-track-black">
                {loading ? (
                    <div className="text-center p-4 text-white/30 animate-pulse">Scanning frequencies...</div>
                ) : filtered.length === 0 ? (
                    <div className="text-center p-4 text-white/30">No signals found.</div>
                ) : (
                    <div className="space-y-1">
                        {displayList.map(sat => (
                            <div
                                key={sat.satelliteId}
                                onClick={() => setSelectedSat(sat)}
                                className={`p-2 rounded cursor-pointer border-l-2 transition-all hover:bg-white/5 ${selectedSat?.satelliteId === sat.satelliteId ? 'bg-cyan-900/20 border-cyan-400' : 'border-transparent text-white/60'}`}
                            >
                                <div className="flex justify-between items-center">
                                    <div className="font-mono text-sm font-bold text-white truncate max-w-[150px]">{sat.name}</div>
                                    <div className={`text-[9px] px-1 rounded ${sat.orbitType === 'GEO' ? 'bg-red-900/50 text-red-300' :
                                        sat.orbitType === 'MEO' ? 'bg-yellow-900/50 text-yellow-300' :
                                            'bg-cyan-900/50 text-cyan-300'
                                        }`}>{sat.orbitType}</div>
                                </div>
                                <div className="flex justify-between mt-1 text-[10px] opacity-60 font-mono">
                                    <span>#{sat.satelliteId}</span>
                                    <span>{sat.category}</span>
                                </div>
                            </div>
                        ))}
                        {filtered.length > 100 && (
                            <div className="text-center text-xs text-white/30 py-2">
                                + {filtered.length - 100} more hidden...
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="p-2 border-t border-white/10 bg-black/60 text-[10px] text-center text-white/30">
                ACTIVE TRACKING: {filtered.length} / {satellites.length}
            </div>
        </div>
    );
};

const OrbitalAtlasView = () => {
    const navigate = useNavigate();

    return (
        <OrbitalAtlasProvider>
            <div className="relative w-full h-screen bg-black overflow-hidden font-sans">
                {/* Back Button */}
                <button
                    onClick={() => navigate('/dashboard')}
                    className="absolute top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 bg-black/50 backdrop-blur-md border border-white/10 rounded-full text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-500 hover:text-cyan-300 transition-all group"
                >
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="text-xs font-mono tracking-widest uppercase">Return to Nexus</span>
                </button>

                <OrbitalEarth />
                <Inspector />
                <SatelliteList />

                {/* Legend */}
                <div className="absolute bottom-10 right-10 flex gap-6 pointer-events-none bg-black/50 p-2 rounded-full border border-white/10">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#00F0FF]"></div>
                        <span className="text-white text-[10px] font-mono tracking-widest opacity-80">LEO</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-yellow-400 shadow-[0_0_8px_#FFD700]"></div>
                        <span className="text-white text-[10px] font-mono tracking-widest opacity-80">MEO</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_#FF4500]"></div>
                        <span className="text-white text-[10px] font-mono tracking-widest opacity-80">GEO</span>
                    </div>
                </div>
            </div>
        </OrbitalAtlasProvider>
    );
};

export default OrbitalAtlasView;

