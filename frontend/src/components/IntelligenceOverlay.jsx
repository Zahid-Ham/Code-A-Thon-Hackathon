import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crosshair, Eye, Clock, Activity, X, Radio, Target, Zap } from 'lucide-react';
import VisibilityTimeline from './VisibilityTimeline';
import TacticalMap from './TacticalMap';

const IntelligenceOverlay = ({ selectedEvent, onClose, userLocation, onTimeSelect, visibilityMap }) => {
    // Determine target color based on event type
    const targetColor = useMemo(() => {
        if (!selectedEvent) return '#00F0FF';
        switch (selectedEvent.type) {
            case 'HAZARD': return '#FF4500'; // OrangeRed
            case 'SATELLITE': return '#FF0055'; // Pink
            case 'ECLIPSE': return '#FFD700'; // Gold
            case 'METEOR': return '#00F0FF'; // Cyan
            default: return '#00F0FF';
        }
    }, [selectedEvent]);

    // Mock Visibility Probability Data for Graph
    const visibilityData = useMemo(() => {
        // Generate a simple curve peaking around "now" + random offset
        const points = [];
        for (let i = 0; i < 24; i++) {
            // Mock probability distribution
            const prob = 30 + Math.sin((i / 24) * Math.PI * 2) * 20 + Math.random() * 10;
            points.push(prob);
        }
        return points;
    }, [selectedEvent]);

    // Fetch Visibility Events for Timeline
    const [visibilityEvents, setVisibilityEvents] = useState([]);
    const [impactAnalysis, setImpactAnalysis] = useState("Analyzing event impact parameters...");
    const [selectedPass, setSelectedPass] = useState(null);

    useEffect(() => {
        if (!selectedEvent) return;

        // 1. Fetch Forecast (Existing Logic)
        if (selectedEvent.type === 'SATELLITE') {
            const fetchForecast = async () => {
                 // Use TLEs if available or fallbacks. Updated to 2025/2026 epoch for testing.
                 const DEMO_TLE1 = "1 25544U 98067A   25365.12345678  .00012345  00000-0  12345-3 0  9999";
                 const DEMO_TLE2 = "2 25544  51.6431 123.4567 0001234 123.4567 236.5432 15.50000000456789";
    
                 try {
                    const res = await fetch('http://localhost:5000/api/visibility-forecast', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            tle1: selectedEvent.tle1 || DEMO_TLE1,
                            tle2: selectedEvent.tle2 || DEMO_TLE2,
                            lat: userLocation?.lat || 40.7128,
                            lng: userLocation?.lng || -74.006,
                            alt: 0
                        })
                    });
                    if (res.ok) {
                        const data = await res.json();
                        setVisibilityEvents(data);
                    }
                 } catch (e) {
                     console.error("Failed to fetch forecast for timeline", e);
                 }
            };
            fetchForecast();
        }

        // 2. Fetch AI Impact Analysis
        const fetchImpact = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/impact-analysis', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        eventName: selectedEvent.title,
                        eventType: selectedEvent.type,
                        location: { lat: selectedEvent.lat, lng: selectedEvent.lng }
                    })
                });
                const data = await res.json();
                if (data.impact) setImpactAnalysis(data.impact);
            } catch (e) {
                setImpactAnalysis("Data Uplink Failed: Unable to retrieve impact assessment.");
            }
        };
        fetchImpact();

    }, [selectedEvent, userLocation]);

    // Handle Pass Selection (Scrubbing)
    const handlePassSelect = (pass) => {
        setSelectedPass(pass);
        if (onTimeSelect && pass.peakTime) {
            onTimeSelect(pass.peakTime);
        }
    };

    if (!selectedEvent) return null;

    return (
        <AnimatePresence>
            <motion.div
                key="intelligence-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-[100] bg-black flex flex-col justify-between p-12 pointer-events-auto"
            >
                {/* Close Button - Top Right */}
                <button 
                    onClick={onClose}
                    className="absolute top-6 right-6 z-50 p-3 bg-red-500/20 hover:bg-red-500 text-red-500 hover:text-white rounded-full transition-all border border-red-500/50 group"
                >
                    <X size={24} className="group-hover:rotate-90 transition-transform" />
                </button>

                {/* HUD Corners */}
                <div className="absolute top-8 left-8 w-16 h-16 border-t-2 border-l-2 border-white/20 rounded-tl-3xl pointer-events-none"></div>
                <div className="absolute top-8 right-8 w-16 h-16 border-t-2 border-r-2 border-white/20 rounded-tr-3xl pointer-events-none"></div>
                <div className="absolute bottom-8 left-8 w-16 h-16 border-b-2 border-l-2 border-white/20 rounded-bl-3xl pointer-events-none"></div>
                <div className="absolute bottom-8 right-8 w-16 h-16 border-b-2 border-r-2 border-white/20 rounded-br-3xl pointer-events-none"></div>

                {/* Central Reticle OR 2D Tactical Map */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center w-[800px] h-[500px]">
                     <TacticalMap 
                        visibilityMap={visibilityMap} 
                        userLocation={userLocation}
                        selectedEvent={selectedEvent}
                     />
                </div>

                {/* Top Center: Operation Mode & Event Context */}
                <div className="w-full flex justify-center pointer-events-auto relative z-10">
                    <div className="bg-black/80 backdrop-blur-md border border-white/10 px-8 py-3 rounded-full flex flex-col items-center gap-2">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <Radio size={14} className="animate-pulse text-red-500" />
                                <span className="text-xs font-mono text-red-500 font-bold tracking-widest">LIVE TRACKING</span>
                            </div>
                            <div className="w-px h-4 bg-white/20"></div>
                            <span className="text-xs font-mono text-white/60">{selectedEvent.label?.toUpperCase() || selectedEvent.type}</span>
                        </div>
                        <h2 className="text-2xl font-header text-white tracking-wider">{selectedEvent.title}</h2>
                    </div>
                </div>

                {/* Left Panel: Signal & Telemetry */}
                <div className="pointer-events-auto absolute left-12 top-1/2 -translate-y-1/2 w-72 space-y-4">
                    <motion.div 
                        initial={{ x: -50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        className="p-4 bg-black/60 backdrop-blur-md border-l-2 rounded-r-xl border-white/10"
                        style={{ borderLeftColor: targetColor }}
                    >
                         <h3 className="text-[10px] font-mono text-white/40 uppercase tracking-widest mb-2 flex items-center gap-2">
                            <Activity size={12} /> Signal Telemetry
                         </h3>
                         <div className="space-y-3">
                             <div className="grid grid-cols-2 gap-2 mt-4 pt-2 border-t border-white/5">
                                 <div className="bg-white/5 p-2 rounded">
                                     <span className="text-[9px] text-white/30 block">AZIMUTH</span>
                                     <span className="text-sm font-mono text-white">142.5°</span>
                                 </div>
                                 <div className="bg-white/5 p-2 rounded">
                                     <span className="text-[9px] text-white/30 block">ELEVATION</span>
                                     <span className="text-sm font-mono text-white">45.2°</span>
                                 </div>
                             </div>
                         </div>
                    </motion.div>

                    {/* AI Impact Analysis Panel */}
                    <motion.div
                         initial={{ x: -50, opacity: 0 }}
                         animate={{ x: 0, opacity: 1 }}
                         transition={{ delay: 0.2 }}
                         className="p-4 bg-black/80 backdrop-blur-md border border-white/10 rounded-xl"
                    >
                        <h3 className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                            <Zap size={12} /> AI Impact Analysis
                        </h3>
                        <p className="text-xs text-gray-300 leading-relaxed font-mono">
                            {impactAnalysis}
                        </p>
                    </motion.div>
                </div>

                {/* Right Panel: Viewing Probability Graph */}
                <div className="pointer-events-auto absolute right-12 top-1/2 -translate-y-1/2 w-80">
                     <motion.div 
                        initial={{ x: 50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        className="p-4 bg-black/60 backdrop-blur-md border-r-2 rounded-l-xl border-white/10"
                        style={{ borderRightColor: targetColor }}
                     >
                        <h3 className="text-[10px] font-mono text-white/40 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Eye size={12} /> Visibility Forecast (24H)
                        </h3>
                        
                        {/* CSS Chart */}
                        <div className="h-32 flex items-end justify-between gap-1 mb-2">
                            {visibilityData.map((val, i) => (
                                <div key={i} className="w-full flex flex-col justify-end h-full gap-1 group relative">
                                    <div 
                                        className="w-full rounded-t-sm transition-all duration-300 group-hover:bg-white"
                                        style={{ 
                                            height: `${val}%`, 
                                            backgroundColor: i === 12 ? '#fff' : `${targetColor}60`
                                        }}
                                    ></div>
                                </div>
                            ))}
                        </div>
                     </motion.div>
                </div>

                {/* Bottom Center: System Status OR Timeline */}
                <div className="absolute bottom-0 left-0 right-0 z-50">
                    <VisibilityTimeline 
                        events={visibilityEvents} 
                        onPassSelect={handlePassSelect}
                        selectedPassId={selectedPass?.eventId}
                    />
                </div>

            </motion.div>
        </AnimatePresence>
    );
};

export default IntelligenceOverlay;
