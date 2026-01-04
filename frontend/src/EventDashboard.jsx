import React, { useRef, useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, X, Calendar, ArrowRight, Satellite, Crosshair, Map, Play, Pause, SkipForward, SkipBack, Wind, Thermometer, Cloud, Eye } from 'lucide-react';
import Starfield from './components/Starfield';
import SkyVisibilitySlider from './components/SkyVisibilitySlider';
import MissionTimeline from './components/MissionTimeline';
import MemoizedGlobe from './components/MemoizedGlobe';
import RocketOverlay from './components/RocketOverlay';
import ISSTracker from './components/ISSTracker';

const EventDashboard = () => {
    const globeEl = useRef();
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [polygons, setPolygons] = useState([]);
    const [celestialEvents, setCelestialEvents] = useState([]);
    const [userLocation, setUserLocation] = useState(null);
    const [isGlobeReady, setIsGlobeReady] = useState(false); // Loader State
    
    const [weatherData, setWeatherData] = useState(null); // Weather State
    const [isFlying, setIsFlying] = useState(false);      // Warp Animation State

    // --- Cinematic Tour State ---
    const [isTourActive, setIsTourActive] = useState(false);
    const [tourIndex, setTourIndex] = useState(() => {
        const saved = localStorage.getItem('spaceScope_tourIndex');
        return saved ? parseInt(saved, 10) : 0;
    });

    // Derived State for Decluttering & Optimization (Top 10 Only)
    const majorEvents = useMemo(() => {
        return celestialEvents.filter(e => e.type !== 'HAZARD').slice(0, 10);
    }, [celestialEvents]);

    const hazardEvents = useMemo(() => {
        return celestialEvents.filter(e => e.type === 'HAZARD').slice(0, 10);
    }, [celestialEvents]);

    const allDisplayEvents = useMemo(() => [...majorEvents, ...hazardEvents], [majorEvents, hazardEvents]);

    // Arcs: Connect User to Major Events
    const arcsData = useMemo(() => {
        if (!userLocation) return [];
        return majorEvents.map(evt => ({
            startLat: userLocation.lat,
            startLng: userLocation.lng,
            endLat: evt.lat,
            endLng: evt.lng,
            color: evt.color || '#FFFFFF',
            name: evt.label
        }));
    }, [userLocation, majorEvents]);

    // Sound Effect
    const playClickSound = () => {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(800, audioCtx.currentTime); 
        oscillator.frequency.exponentialRampToValueAtTime(300, audioCtx.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.1);
    };

    // Text-to-Speech
    const speakEventDetails = (event) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel(); 
            const utterance = new SpeechSynthesisUtterance(`Trajecting to ${event.title || event.label}. ${event.description}`);
            utterance.rate = 1.1;
            utterance.pitch = 0.9;
            const voices = window.speechSynthesis.getVoices();
            const sciFiVoice = voices.find(v => v.name.includes('Google US English')) || voices[0];
            if (sciFiVoice) utterance.voice = sciFiVoice;
            window.speechSynthesis.speak(utterance);
        }
    };

    // Weather Helper
    const fetchWeather = async (lat, lng) => {
        setWeatherData(null); // Reset
        try {
            const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true`);
            const data = await res.json();
            setWeatherData(data.current_weather);
        } catch (err) {
            console.error("Weather data fetch error", err);
        }
    };

    // Helper to map WMO codes to text/icon
    const getWeatherInfo = (code) => {
        if (code === 0) return { label: 'Clear Sky', icon: <Cloud size={16} className="text-yellow-400" /> };
        if (code >= 1 && code <= 3) return { label: 'Partly Cloudy', icon: <Cloud size={16} className="text-gray-400" /> };
        if (code >= 51 && code <= 67) return { label: 'Rainy', icon: <Cloud size={16} className="text-blue-400" /> };
        if (code >= 71 && code <= 77) return { label: 'Snow', icon: <Cloud size={16} className="text-white" /> };
        if (code >= 95) return { label: 'Storm', icon: <Cloud size={16} className="text-purple-400" /> };
        return { label: 'Unknown', icon: <Cloud size={16} /> };
    };

    // --- Tour Logic ---
    // 1. Persistence
    useEffect(() => {
        localStorage.setItem('spaceScope_tourIndex', tourIndex);
    }, [tourIndex]);

    // 2. Auto-Pilot Loop
    useEffect(() => {
        let tourTimer;
        if (isTourActive && allDisplayEvents.length > 0) {
            // A. Fly to current index
            const currentEvent = allDisplayEvents[tourIndex % allDisplayEvents.length];
            handleEventClick(currentEvent);

            // B. Wait and Advance
            tourTimer = setTimeout(() => {
                setTourIndex(prev => (prev + 1) % allDisplayEvents.length);
            }, 12000); // 12 seconds per event (Fly + Speech + Read)
        }
        return () => clearTimeout(tourTimer);
    }, [isTourActive, tourIndex, allDisplayEvents]);

    // Manual Tour Controls
    const toggleTour = () => setIsTourActive(!isTourActive);
    const nextTourStep = () => setTourIndex(prev => (prev + 1) % allDisplayEvents.length);
    const prevTourStep = () => setTourIndex(prev => (prev - 1 + allDisplayEvents.length) % allDisplayEvents.length);


    // 1. Fetch User Location & Data logic
    useEffect(() => {
        if ('speechSynthesis' in window) window.speechSynthesis.getVoices();

        const initDashboard = async () => {
            let uLat = 0, uLng = 0;
            try {
                const pos = await new Promise((resolve, reject) => 
                    navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true })
                );
                uLat = pos.coords.latitude;
                uLng = pos.coords.longitude;
                setUserLocation({ lat: uLat, lng: uLng, city: 'Unknown Sector' });

                // Reverse Geocode
                fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${uLat}&longitude=${uLng}&localityLanguage=en`)
                    .then(r => r.json())
                    .then(data => {
                        if (data.city || data.locality) {
                             setUserLocation(prev => ({ ...prev, city: data.city || data.locality }));
                        }
                    });
            } catch (e) {
                console.log('Location denied/failed');
            }

            try {
                const res = await fetch('http://localhost:5000/api/celestial-events');
                const data = await res.json();
                
                const processedEvents = data.map(evt => ({
                    ...evt,
                    color: evt.type === 'ECLIPSE' ? '#FFD700' : 
                           evt.type === 'METEOR' ? '#00F0FF' : 
                           evt.type === 'SATELLITE' ? '#FF0055' : 
                           evt.type === 'HAZARD' ? '#FF4500' : '#FFFFFF',
                    label: evt.title
                }));
                setCelestialEvents(processedEvents);
                
                // Only auto-start nearest if NOT already touring and just loaded
                if (!localStorage.getItem('spaceScope_tourIndex') && (uLat !== 0 || uLng !== 0)) {
                     const sortedByDist = [...processedEvents].sort((a, b) => {
                         const distA = Math.hypot(a.lat - uLat, a.lng - uLng);
                         const distB = Math.hypot(b.lat - uLat, b.lng - uLng);
                         return distA - distB;
                     });

                     if (sortedByDist.length > 0) {
                         const nearest = sortedByDist[0];
                         setTimeout(() => {
                             if(globeEl.current) {
                                 globeEl.current.pointOfView({ lat: uLat, lng: uLng, altitude: 2.5 }, 1000);
                                 if ('speechSynthesis' in window) {
                                     const announce = new SpeechSynthesisUtterance(`Welcome, Commander. Nearest trajectory calculated: ${nearest.title}.`);
                                     announce.rate = 1.1;
                                     window.speechSynthesis.speak(announce);
                                     handleEventClick(nearest);
                                 } else {
                                     handleEventClick(nearest);
                                 }
                             }
                         }, 1500);
                     }
                }
            } catch (err) {
                console.error('Data Init Failed:', err);
            }
        };

        initDashboard();

        fetch('https://raw.githubusercontent.com/vasturiano/react-globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson')
            .then(res => res.json())
            .then(data => {
                setPolygons(data.features);
                setIsGlobeReady(true);
            });
    }, []);

    // Initial Auto-Rotate
    useEffect(() => {
        if (globeEl.current) {
            globeEl.current.controls().autoRotate = true;
            globeEl.current.controls().autoRotateSpeed = 0.3;
        }
    }, [isGlobeReady]);

    const handleEventClick = (event) => {
        playClickSound();
        speakEventDetails(event);
        
        setSelectedEvent(event);
        fetchWeather(event.lat, event.lng);

        if (globeEl.current) {
            globeEl.current.controls().autoRotate = false;
            
            // Warp Speed ON
            setIsFlying(true);
            setTimeout(() => setIsFlying(false), 1500); // Stop after 1.5s flight

            globeEl.current.pointOfView({ lat: event.lat, lng: event.lng, altitude: 1.5 }, 1500);
        }
    };

    const closePanel = () => {
        window.speechSynthesis.cancel();
        setSelectedEvent(null);
        setIsTourActive(false); // Stop tour if user manually closes
        if (globeEl.current) globeEl.current.controls().autoRotate = true;
    };

    // Auto-Fetch Local Weather when User Location is found
    useEffect(() => {
        if (userLocation) {
             fetchWeather(userLocation.lat, userLocation.lng);
        }
    }, [userLocation]);

    return (
        <div className="relative min-h-screen text-white bg-[#050B14] font-sans overflow-hidden">
            <Starfield />
            <RocketOverlay isFlying={isFlying} />

            {/* Header */}
            <header className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-50 pointer-events-none">
                <div className="flex items-center gap-6">
                    <button 
                        onClick={() => window.location.href = '/'} // Simple navigation for now
                        className="pointer-events-auto p-2 rounded-full border border-white/20 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                    >
                         <ArrowRight className="rotate-180" size={24} />
                    </button>
                    <div className="flex flex-col">
                        <h1 className="text-3xl font-header font-bold tracking-widest text-[#00F0FF] drop-shadow-[0_0_10px_rgba(0,240,255,0.5)]">
                            CELESTIAL COMMAND
                        </h1>
                        <span className="text-xs font-mono text-white/50 tracking-[0.3em]">SYSTEM OVERWATCH // V.2.0</span>
                    </div>
                </div>
                {userLocation && (
                    <div className="glass-panel px-4 py-2 rounded-full flex items-center gap-2 pointer-events-auto">
                        <Crosshair size={16} className="text-green-400 animate-pulse" />
                        <span className="text-xs font-mono text-green-400">
                             LOC: {userLocation.city ? userLocation.city.toUpperCase() : 'DETECTING...'} // {userLocation.lat.toFixed(2)}, {userLocation.lng.toFixed(2)}
                        </span>
                    </div>
                )}
            </header>

            {/* Local Command Center - Always Visible Left Panel */}
            <div className="absolute top-32 left-8 z-40 w-80 pointer-events-auto">
                 {/* 1. Local Weather / Conditions */}
                 {userLocation && weatherData && !selectedEvent && (
                    <motion.div 
                        initial={{ x: -100, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        className="glass-panel p-6 rounded-xl border-l-[3px] border-[#00F0FF] backdrop-blur-md bg-black/40 mb-4"
                    >
                        <h3 className="text-[#00F0FF] font-mono text-xs tracking-widest mb-4 flex items-center gap-2">
                            <MapPin size={14} /> LOCAL SECTOR ANALYSIS
                        </h3>
                        
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex flex-col">
                                <span className="text-5xl font-bold text-white tracking-tighter">{weatherData.temperature}°</span>
                                <span className="text-xs text-white/40 font-mono mt-1">AMBIENT TEMP</span>
                            </div>
                            <div className="flex flex-col items-end">
                                {getWeatherInfo(weatherData.weathercode).icon}
                                <span className="text-sm font-bold text-[#00F0FF] mt-1 text-right">{getWeatherInfo(weatherData.weathercode).label}</span>
                                <span className="text-[10px] text-white/40 uppercase tracking-widest">Sky Cond</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-4">
                             <div>
                                 <div className="flex items-center gap-2 text-white/80">
                                     <Wind size={14} />
                                     <span className="font-bold">{weatherData.windspeed} <span className="text-[10px]">km/h</span></span>
                                 </div>
                                 <div className="text-[9px] text-white/30 uppercase mt-1">Wind Velocity</div>
                             </div>
                             <div>
                                 <div className="flex items-center gap-2 text-white/80">
                                     <Eye size={14} />
                                     <span className="font-bold">{(100 - (weatherData.weathercode > 3 ? 60 : 10))}%</span>
                                 </div>
                                 <div className="text-[9px] text-white/30 uppercase mt-1">Visibility Est.</div>
                             </div>
                        </div>
                    </motion.div>
                 )}

                 {/* 2. ISS Tracker */}
                 {userLocation && (
                     <ISSTracker userLocation={userLocation} />
                 )}
            </div>

            {/* Main Globe with Visual Loader */}
            <div className="absolute inset-0 z-0 flex items-center justify-center">
                {!isGlobeReady && (
                   <div className="absolute inset-0 z-50 bg-black flex flex-col items-center justify-center text-[#00F0FF]">
                       <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#00F0FF]"></div>
                       <span className="mt-4 font-mono tracking-widest">INITIALIZING ORBITAL SYSTEMS...</span>
                   </div>
                )}
                
                <MemoizedGlobe 
                    globeRef={globeEl}
                    polygons={polygons}
                    majorEvents={majorEvents}
                    hazardEvents={hazardEvents}
                    userLocation={userLocation}
                    arcsData={arcsData}
                    onEventClick={handleEventClick}
                />
            </div>

            {/* Side Panel (Glassmorphism) */}
            <AnimatePresence>
                {selectedEvent && (
                    <motion.div
                        initial={{ x: 400, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 400, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 100, damping: 20 }}
                        className="fixed right-0 top-0 h-full w-96 glass-panel border-l border-white/10 z-50 p-8 flex flex-col pt-24 backdrop-blur-xl bg-black/40 overflow-y-auto"
                    >
                        <button 
                            onClick={closePanel}
                            className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors"
                        >
                            <X size={24} />
                        </button>

                        <div className="mb-2 flex items-center gap-3">
                             {selectedEvent.type === 'ECLIPSE' && <div className="w-2 h-2 rounded-full bg-yellow-400 shadow-[0_0_10px_gold]" />}
                             {selectedEvent.type === 'METEOR' && <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_cyan]" />}
                             {selectedEvent.type === 'SATELLITE' && <div className="w-2 h-2 rounded-full bg-pink-500 shadow-[0_0_10px_magenta]" />}
                             {selectedEvent.type === 'HAZARD' && <div className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_10px_orange]" />}
                             <span className="font-mono text-xs tracking-widest text-white/60">{selectedEvent.type} EVENT</span>
                        </div>

                        <h2 className="text-4xl font-header font-bold text-white mb-6 drop-shadow-md leading-tight">
                            {selectedEvent.label}
                        </h2>

                        {/* Mission Conditions Widget */}
                        <div className="bg-white/5 border border-white/10 rounded-lg p-4 mb-6">
                            <h3 className="text-[#00F0FF] font-mono text-xs tracking-widest mb-3 border-b border-white/5 pb-2">MISSION CONDITIONS</h3>
                            {weatherData ? (
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-center gap-2">
                                        <Thermometer size={18} className="text-white/60" />
                                        <div>
                                            <div className="text-xl font-bold">{weatherData.temperature}°C</div>
                                            <div className="text-[10px] text-white/40 font-mono">TEMP</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Wind size={18} className="text-white/60" />
                                        <div>
                                            <div className="text-xl font-bold">{weatherData.windspeed} <span className="text-xs">km/h</span></div>
                                            <div className="text-[10px] text-white/40 font-mono">WIND VELOCITY</div>
                                        </div>
                                    </div>
                                    <div className="col-span-2 flex items-center gap-2 mt-2 bg-black/20 p-2 rounded">
                                        {getWeatherInfo(weatherData.weathercode).icon}
                                        <span className="text-sm font-mono text-[#00F0FF]">{getWeatherInfo(weatherData.weathercode).label.toUpperCase()}</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 text-white/40 animate-pulse">
                                    <Satellite size={16} className="animate-spin" />
                                    <span className="text-xs font-mono">SCANNING ATMOSPHERE...</span>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-3 text-[#00F0FF] mb-8 font-mono text-sm border-b border-white/10 pb-4">
                            <Calendar size={16} />
                            <span>{selectedEvent.date}</span>
                        </div>

                        <p className="text-white/80 leading-relaxed text-lg font-light mb-auto">
                            {selectedEvent.description}
                        </p>

                        <div className="mt-8 p-4 rounded-lg bg-white/5 border border-white/10">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs font-mono text-white/40">COORDINATES</span>
                                <Satellite size={16} className="text-white/40" />
                            </div>
                            <div className="font-mono text-xl text-white">
                                {selectedEvent.lat.toFixed(2)}° N / {selectedEvent.lng.toFixed(2)}° E
                            </div>
                        </div>

                        {/* Sky Compare Feature */}
                        <SkyVisibilitySlider eventData={selectedEvent} />

                        <div className="flex gap-2 mt-6">
                             <button className="flex-1 py-4 bg-[#00F0FF]/10 border border-[#00F0FF]/30 text-[#00F0FF] font-bold tracking-widest hover:bg-[#00F0FF]/20 transition-all flex justify-center items-center gap-2 group">
                                TRACK
                                <Crosshair size={16} />
                            </button>
                            <a 
                                href={`https://www.google.com/search?q=${encodeURIComponent(selectedEvent.title + ' space event details')}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex-1 py-4 bg-white/5 border border-white/10 text-white/70 font-bold tracking-widest hover:bg-white/10 hover:text-white transition-all flex justify-center items-center gap-2"
                            >
                                LEARN MORE
                                <ArrowRight size={16} />
                            </a>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Tour Control Panel (Floating above Timeline) */}
            <div className={`absolute bottom-64 left-1/2 transform -translate-x-1/2 flex items-center gap-4 p-4 rounded-full backdrop-blur-xl bg-black/60 border border-[#00F0FF]/30 z-40 transition-all duration-500 ${isTourActive ? 'shadow-[0_0_30px_rgba(0,240,255,0.3)]' : 'opacity-80 hover:opacity-100'}`}>
                <button onClick={prevTourStep} className="text-white hover:text-[#00F0FF] transition-colors"><SkipBack size={20}/></button>
                
                <button 
                    onClick={toggleTour} 
                    className={`w-12 h-12 flex items-center justify-center rounded-full border border-[#00F0FF] transition-all ${isTourActive ? 'bg-[#00F0FF] text-black shadow-[0_0_20px_#00F0FF]' : 'text-[#00F0FF] hover:bg-[#00F0FF]/20'}`}
                >
                    {isTourActive ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
                </button>
                
                <button onClick={nextTourStep} className="text-white hover:text-[#00F0FF] transition-colors"><SkipForward size={20}/></button>

                <div className="w-32 h-1 bg-white/20 rounded-full overflow-hidden ml-2">
                    <div 
                        className="h-full bg-[#00F0FF] transition-all duration-300 ease-linear"
                        style={{ width: `${((tourIndex % Math.max(1, allDisplayEvents.length)) / Math.max(1, allDisplayEvents.length)) * 100}%` }}
                    />
                </div>
                <span className="text-[10px] font-mono text-[#00F0FF]">
                    TOUR: {tourIndex % Math.max(1, allDisplayEvents.length) + 1}/{allDisplayEvents.length}
                </span>
            </div>

            {/* Mission Timeline - Bottom Overlay */}
            <MissionTimeline events={celestialEvents} onSelectEvent={handleEventClick} selectedEventId={selectedEvent?.id} />
        </div>
    );
};

export default EventDashboard;
