import React, { useRef, useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, X, Calendar, ArrowRight, Satellite, Crosshair, Map, Play, Pause, SkipForward, SkipBack, Wind, Thermometer, Cloud, Eye } from 'lucide-react';
import Starfield from './components/Starfield';
import SkyVisibilitySlider from './components/SkyVisibilitySlider';
import MissionTimeline from './components/MissionTimeline';
import MemoizedGlobe from './components/MemoizedGlobe';
import RocketOverlay from './components/RocketOverlay';

import ISSTracker from './components/ISSTracker';
import IntelligenceOverlay from './components/IntelligenceOverlay';

const EventDashboard = () => {
    const globeEl = useRef();
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [polygons, setPolygons] = useState([]);
    const [celestialEvents, setCelestialEvents] = useState([]);
    const [userLocation, setUserLocation] = useState(null);
    const [isGlobeReady, setIsGlobeReady] = useState(false); // Loader State

    const [weatherData, setWeatherData] = useState(null); // Weather State
    const [isFlying, setIsFlying] = useState(false);      // Warp Animation State
    const [isTracking, setIsTracking] = useState(false);  // Tracking Mode State
    const [visibilityMap, setVisibilityMap] = useState(null); // GeoJSON Footprints
    const [previewTime, setPreviewTime] = useState(null); // Time override from Timeline

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
        if (!event) return; // Defensive guard
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const title = event.title || event.label || 'Unknown Objective';
            const desc = event.description || 'No further data available.';
            const utterance = new SpeechSynthesisUtterance(`Trajecting to ${title}. ${desc}`);
            utterance.rate = 1.1;
            utterance.pitch = 0.9;
            const voices = window.speechSynthesis.getVoices();
            const sciFiVoice = voices.find(v => v.name && v.name.includes('Google US English')) || voices[0];
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
                            if (globeEl.current) {
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
        if (!event) return; // Defensive guard
        playClickSound();
        speakEventDetails(event);

        setSelectedEvent(event);
        if (typeof event.lat === 'number' && typeof event.lng === 'number') {
            fetchWeather(event.lat, event.lng);
        }

        if (globeEl.current) {
            globeEl.current.controls().autoRotate = false;

            // Warp Speed ON
            setIsFlying(true);
            setTimeout(() => setIsFlying(false), 1500); // Stop after 1.5s flight

            if (typeof event.lat === 'number' && typeof event.lng === 'number') {
                globeEl.current.pointOfView({ lat: event.lat, lng: event.lng, altitude: 1.5 }, 1500);
            }
        }
    };

    const handleTrackClick = () => {
        if (!selectedEvent) return;
        setIsTracking(true);
        if (globeEl.current) {
            globeEl.current.controls().autoRotate = false;
            // Slight zoom in for detailed view
            const currentAlt = globeEl.current.pointOfView().altitude;
            globeEl.current.pointOfView({ 
                lat: selectedEvent.lat, 
                lng: selectedEvent.lng, 
                altitude: Math.max(0.5, currentAlt * 0.8) 
            }, 1000);
        }
    };

    const handleStopTracking = () => {
        setIsTracking(false);
        setPreviewTime(null);
        // Do not auto-resume rotation immediately to allow user to look around, 
        // or resume if that's the desired "return to normal" behavior.
        // Let's resume for a "return to bridge" feel.
        if (globeEl.current) {
            globeEl.current.controls().autoRotate = true;
        }
    };

    const closePanel = () => {
        window.speechSynthesis.cancel();
        setSelectedEvent(null);
        setIsTracking(false); // Valid to stop tracking if panel closes
        setPreviewTime(null);
        setIsTourActive(false); // Stop tour if user manually closes
        if (globeEl.current) globeEl.current.controls().autoRotate = true;
    };

    useEffect(() => {
        if (userLocation) {
            fetchWeather(userLocation.lat, userLocation.lng);
        }
    }, [userLocation]);

    // Track Visibility Map Update
    useEffect(() => {
        let interval;
        if (isTracking && selectedEvent) { // Allow ALL events to request map
             const updateMap = async () => {
                 // Hack: If we don't have TLE, we can't calculate.
                 // For hackathon, assume 'selectedEvent' might have TLE props OR we default to ISS TLEs for demo if missing
                 const DEMO_TLE1 = "1 25544U 98067A   23337.56789123  .00012345  00000-0  12345-3 0  9999";
                 const DEMO_TLE2 = "2 25544  51.6431 123.4567 0001234 123.4567 236.5432 15.50000000456789";
                 
                 try {
                     const res = await fetch('http://localhost:5000/api/visibility-map', {
                         method: 'POST',
                         headers: { 'Content-Type': 'application/json' },
                         body: JSON.stringify({
                             tle1: selectedEvent.tle1, // Can be undefined
                             tle2: selectedEvent.tle2,
                             lat: selectedEvent.lat, // Pass coordinates for static events
                             lng: selectedEvent.lng,
                             time: previewTime ? previewTime : new Date().toISOString()
                         })
                     });
                     if (res.ok) {
                         const data = await res.json();
                         setVisibilityMap(data.features); // Globe expects array of features or polygons
                     }
                 } catch (e) { console.error("VisMap error", e); }
             };
             
             updateMap();
             // Only interval if NO preview set (live tracking)
             // AND only if it's a satellite (static events don't move fast)
             if (!previewTime && selectedEvent.type === 'SATELLITE') {
                interval = setInterval(updateMap, 5000); 
             }
        } else {
            setVisibilityMap(null);
        }
        return () => clearInterval(interval);
    }, [isTracking, selectedEvent, previewTime]);


    return (
        <div className="relative min-h-screen text-white bg-[#050B14] font-sans overflow-hidden">
            <Starfield />
            <RocketOverlay isFlying={isFlying} />
            
            {/* Intelligence Layer Overlay */}
            {isTracking && (
                <IntelligenceOverlay 
                    selectedEvent={selectedEvent} 
                    userLocation={userLocation} 
                    onClose={handleStopTracking}
                    onTimeSelect={(time) => setPreviewTime(time)}
                    visibilityMap={visibilityMap}
                />
            )}

            {/* Header / Top Navigation */}
            <header className="absolute top-0 left-0 w-full p-8 flex justify-between items-start z-50 pointer-events-none">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => window.location.href = '/dashboard'}
                        className="pointer-events-auto p-3 rounded-xl border border-white/10 bg-black/40 backdrop-blur-md hover:bg-[#00F0FF]/10 text-white/60 hover:text-[#00F0FF] transition-all hover:scale-110 shadow-lg"
                    >
                        <ArrowRight className="rotate-180" size={24} />
                    </button>
                    <div className="flex flex-col">
                        <h1 className="text-4xl font-header font-bold tracking-[0.2em] text-[#00F0FF] drop-shadow-[0_0_15px_rgba(0,240,255,0.4)] uppercase">
                            Celestial Command
                        </h1>
                        <div className="flex items-center gap-3 mt-1">
                            <span className="h-[1px] w-8 bg-[#00F0FF]/40" />
                            <span className="text-[10px] font-mono text-white/40 tracking-[0.4em] uppercase">Global Overwatch Paradigm // 04</span>
                        </div>
                    </div>
                </div>
                {userLocation && (
                    <div className="glass-panel px-4 py-2 rounded-full flex items-center gap-2 pointer-events-auto">
                        <Crosshair size={16} className="text-green-400 animate-pulse" />
                        <span className="text-xs font-mono text-green-400">
                            LOC: {userLocation.city ? userLocation.city.toString().toUpperCase() : 'DETECTING...'} // {typeof userLocation.lat === 'number' ? userLocation.lat.toFixed(2) : '0.00'}, {typeof userLocation.lng === 'number' ? userLocation.lng.toFixed(2) : '0.00'}
                        </span>
                    </div>
                )}
            </header>

            {/* Local Command Center - Left Panel */}
            <div className="absolute top-32 left-8 z-40 w-80 pointer-events-auto space-y-4">
                {/* 1. Local Weather / Conditions */}
                {userLocation && weatherData && !selectedEvent && (
                    <motion.div
                        initial={{ x: -100, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        className="glass-panel p-6 rounded-xl border-l-[3px] border-[#00F0FF] backdrop-blur-md bg-black/40"
                    >
                        <h3 className="text-[#00F0FF] font-mono text-[10px] tracking-widest mb-4 flex items-center gap-2">
                            <MapPin size={12} /> LOCAL SECTOR ANALYSIS
                        </h3>

                        <div className="flex items-center justify-between mb-6">
                            <div className="flex flex-col">
                                <span className="text-4xl font-bold text-white tracking-tighter">{weatherData.temperature}°</span>
                                <span className="text-[10px] text-white/40 font-mono">AMBIENT TEMP</span>
                            </div>
                            <div className="flex items-center gap-3">
                                {getWeatherInfo(weatherData.weathercode).icon}
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-[#00F0FF] leading-none">{getWeatherInfo(weatherData.weathercode).label.toUpperCase()}</span>
                                    <span className="text-[8px] text-white/40 uppercase tracking-widest mt-1">Sky Conditions</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-4">
                            <div>
                                <div className="flex items-center gap-2 text-white/80">
                                    <Wind size={12} />
                                    <span className="text-xs font-bold">{weatherData.windspeed} <span className="text-[8px]">km/h</span></span>
                                </div>
                                <div className="text-[8px] text-white/30 uppercase mt-1">Wind Velocity</div>
                            </div>
                            <div>
                                <div className="flex items-center gap-2 text-white/80">
                                    <Eye size={12} />
                                    <span className="text-xs font-bold">{(100 - (weatherData.weathercode > 3 ? 60 : 10))}%</span>
                                </div>
                                <div className="text-[8px] text-white/30 uppercase mt-1">Visibility Est.</div>
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
                    visibilityMap={visibilityMap}
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

                        <div className="mt-8 p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-[10px] font-mono text-white/30 tracking-widest uppercase">Target_Coordinates</span>
                                <Satellite size={16} className="text-[#00F0FF] animate-pulse" />
                            </div>
                            <div className="font-mono text-2xl text-white tracking-tighter flex items-baseline gap-2">
                                {typeof selectedEvent.lat === 'number' ? selectedEvent.lat.toFixed(4) : '0.0000'}°<span className="text-xs text-white/40">N</span>
                                <span className="text-white/20">/</span>
                                {typeof selectedEvent.lng === 'number' ? selectedEvent.lng.toFixed(4) : '0.0000'}°<span className="text-xs text-white/40">E</span>
                            </div>
                            <div className="mt-4 pt-4 border-t border-white/5 flex gap-4">
                                <div className="flex flex-col">
                                    <span className="text-[8px] text-white/30 uppercase font-mono">Precision</span>
                                    <span className="text-[10px] text-green-400 font-mono">HIGH_SYNC</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[8px] text-white/30 uppercase font-mono">Data_Source</span>
                                    <span className="text-[10px] text-[#00F0FF] font-mono uppercase">{selectedEvent.type}</span>
                                </div>
                            </div>
                        </div>

                        {/* Sky Compare Feature */}
                        <SkyVisibilitySlider eventData={selectedEvent} />

                        <div className="flex gap-2 mt-6">
                            <button 
                                onClick={handleTrackClick}
                                className={`flex-1 py-4 border font-bold tracking-widest transition-all flex justify-center items-center gap-2 group ${isTracking ? 'bg-[#00F0FF] text-black border-[#00F0FF]' : 'bg-[#00F0FF]/10 border-[#00F0FF]/30 text-[#00F0FF] hover:bg-[#00F0FF]/20'}`}
                            >
                                {isTracking ? 'TRACKING ACTIVE' : 'TRACK'}
                                <Crosshair size={16} className={isTracking ? 'animate-spin' : ''} />
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

            {/* Console Interface Tier - Bottom Horizontal Layer */}
            <div className="absolute bottom-0 left-0 w-full z-40 bg-gradient-to-t from-[#050B14] via-[#050B14]/90 to-transparent pt-32 pointer-events-none">
                {/* Tour Control Console - Floating Distinct Feature */}
                <div className={`mx-auto mb-10 w-fit flex items-center gap-6 p-4 rounded-2xl backdrop-blur-3xl bg-black/80 border border-white/10 transition-all duration-700 pointer-events-auto ${isTourActive ? 'shadow-[0_0_50px_rgba(0,240,255,0.2)] border-[#00F0FF]/40' : 'hover:border-white/20'}`}>
                    <div className="flex items-center gap-2 border-r border-white/10 pr-4">
                        <Play size={14} className={isTourActive ? 'text-[#00F0FF] animate-pulse' : 'text-white/20'} />
                        <span className="text-[9px] font-mono text-white/40 tracking-widest">AUTO_NAV</span>
                    </div>

                    <div className="flex items-center gap-4">
                        <button onClick={prevTourStep} className="text-white/50 hover:text-[#00F0FF] transition-all hover:scale-120"><SkipBack size={20} /></button>

                        <button
                            onClick={toggleTour}
                            className={`w-12 h-12 flex items-center justify-center rounded-xl border transition-all ${isTourActive ? 'bg-[#00F0FF] text-black border-[#00F0FF] shadow-[0_0_30px_#00F0FF]' : 'border-white/20 text-white hover:border-[#00F0FF] hover:text-[#00F0FF]'}`}
                        >
                            {isTourActive ? <Pause size={22} fill="currentColor" /> : <Play size={22} fill="currentColor" className="ml-1" />}
                        </button>

                        <button onClick={nextTourStep} className="text-white/50 hover:text-[#00F0FF] transition-all hover:scale-120"><SkipForward size={20} /></button>
                    </div>

                    <div className="flex flex-col gap-2 pl-4 border-l border-white/10">
                        <div className="flex justify-between items-center w-40">
                            <span className="text-[9px] font-mono text-white/30 uppercase tracking-tighter">Mission Sweep</span>
                            <span className="text-[10px] font-mono text-[#00F0FF] font-bold">
                                {tourIndex % Math.max(1, allDisplayEvents.length) + 1} / {allDisplayEvents.length}
                            </span>
                        </div>
                        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-[#00F0FF] transition-all duration-500 ease-out shadow-[0_0_10px_#00F0FF]"
                                style={{ width: `${((tourIndex % Math.max(1, allDisplayEvents.length) + 1) / Math.max(1, allDisplayEvents.length)) * 100}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Horizontal Chrono-Strip */}
                <div className="pointer-events-auto border-t border-white/5 bg-black/40 backdrop-blur-md pt-2">
                    <div className="flex items-center px-10 pt-2 mb-[-10px] justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-[#00F0FF] animate-pulse" />
                            <span className="text-[10px] font-mono text-white/60 tracking-[0.3em] uppercase">Active_Events_Buffer</span>
                        </div>
                        <div className="text-[9px] font-mono text-white/30 uppercase">Scroll to Explore Sector</div>
                    </div>
                    <MissionTimeline
                        events={celestialEvents}
                        onSelectEvent={handleEventClick}
                        selectedEventId={selectedEvent?.id}
                        horizontal={true}
                    />
                </div>
            </div>
        </div>
    );
};

export default EventDashboard;
