import React from 'react';
import { OrbitalAtlasProvider, useOrbitalAtlas } from '../contexts/OrbitalAtlasContext';
import OrbitalEarth from '../components/OrbitalEarth';

const Inspector = () => {
    const { selectedSat, selectedDetails, loading } = useOrbitalAtlas();
    const [isExpanded, setIsExpanded] = React.useState(false);
    
    // Reset expanded state when sat changes
    React.useEffect(() => setIsExpanded(false), [selectedSat]);

    if (!selectedSat) return (
        <div className="absolute top-20 right-5 w-80 bg-black/80 backdrop-blur-md p-6 border border-white/20 rounded-xl text-white">
            <h2 className="text-2xl font-bold mb-2 glitch-text">ORBITAL ATLAS</h2>
            <p className="text-white/60 text-sm">Select a satellite to view telemetry.</p>
        </div>
    );

    return (
        <div className={`absolute top-20 right-5 w-96 bg-black/90 backdrop-blur-xl border border-cyan-500/30 rounded-xl text-white shadow-[0_0_30px_rgba(0,240,255,0.2)] transition-all duration-300 ${isExpanded ? 'h-[80vh]' : 'h-auto'} flex flex-col overflow-hidden`}>
             
             {/* Satellite Image Header */}
             <div className="relative w-full h-48 bg-black/50 shrink-0">
                {selectedDetails?.img ? (
                    <img src={selectedDetails.img} alt={selectedSat.name} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
                        <div className="text-6xl opacity-20">🛰️</div>
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                <div className="absolute bottom-4 left-6">
                    <h2 className="text-2xl font-bold text-white mb-0 drop-shadow-md">{selectedSat.name}</h2>
                    <div className="text-xs text-cyan-400 font-mono tracking-widest uppercase">{selectedSat.orbitType} ORBIT • #{selectedSat.satelliteId}</div>
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

                        {/* Why It Matters */}
                        {(selectedDetails.realWorldImpact || selectedDetails.description) && (
                            <div className="bg-cyan-900/20 p-3 border-l-2 border-cyan-500">
                                <div className="text-cyan-500/60 text-xs uppercase tracking-wider mb-1">Why This Matters</div>
                                <div className="text-sm italic max-h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-cyan-500/30 pr-2">
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
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="w-full py-2 bg-white/5 hover:bg-white/10 rounded text-xs text-cyan-400 font-mono tracking-widest mt-2"
                        >
                            {isExpanded ? '[-] COLLAPSE DATA' : '[+] LEARN MORE'}
                        </button>
                    </div>
                ) : (
                    <div className="text-red-500 mt-4">Telemetry Lost.</div>
                )}
            </div>

            {/* Expanded Content (Scrollable) */}
             {isExpanded && selectedDetails && (
                 <div className="flex-1 overflow-y-auto p-6 pt-0 space-y-4 border-t border-white/10 text-sm scrollbar-thin scrollbar-thumb-cyan-900 scrollbar-track-transparent">
                     {/* History */}
                     {selectedDetails.history && (
                        <div>
                             <h3 className="text-white/60 text-xs font-bold uppercase mb-1">Mission History</h3>
                             <p className="text-gray-300 leading-relaxed">{selectedDetails.history}</p>
                        </div>
                     )}

                     {/* Instruments */}
                     {selectedDetails.instruments && (
                        <div>
                             <h3 className="text-white/60 text-xs font-bold uppercase mb-1">Onboard Instruments</h3>
                             <ul className="list-disc list-inside text-gray-300">
                                 {selectedDetails.instruments.map((inst, i) => <li key={i}>{inst}</li>)}
                             </ul>
                        </div>
                     )}

                     {/* Achievements */}
                     {selectedDetails.achievements && (
                        <div>
                             <h3 className="text-white/60 text-xs font-bold uppercase mb-1">Major Achievements</h3>
                             <p className="text-gray-300 leading-relaxed">{selectedDetails.achievements}</p>
                        </div>
                     )}

                     {/* AI Full Description fallback */}
                     {selectedDetails.aiGenerated && selectedDetails.description && (
                         <div>
                             <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-white/60 text-xs font-bold uppercase">AI Analysis</h3>
                                <span className="text-[9px] bg-purple-900/50 px-1 rounded text-purple-200">Groq</span>
                             </div>
                             <p className="text-gray-300 leading-relaxed">{selectedDetails.description}</p>
                         </div>
                     )}
                 </div>
             )}
        </div>
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
                                    <div className={`text-[9px] px-1 rounded ${
                                        sat.orbitType === 'GEO' ? 'bg-red-900/50 text-red-300' :
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

import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const OrbitalAtlasView = () => {
    const navigate = useNavigate();

    return (
        <OrbitalAtlasProvider>
            <div className="relative w-full h-screen bg-black overflow-hidden font-sans">
                {/* Back Button */}
                 <button 
                    onClick={() => navigate('/')}
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
