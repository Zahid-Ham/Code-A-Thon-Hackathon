import React, { useState, useEffect, useMemo, useRef } from 'react';
import Globe from 'react-globe.gl';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, ShieldAlert, Thermometer, Droplets, Wind, Info, X, Zap } from 'lucide-react';
import { API_BASE_URL } from '../services/api';

const EarthImpactSim = () => {
    const [countries, setCountries] = useState({ features: [] });
    const [activeLayer, setActiveLayer] = useState('NDVI'); // NDVI, POLLUTION
    const [hoveredCountry, setHoveredCountry] = useState(null);
    const [selectedReport, setSelectedReport] = useState(null);
    const globeEl = useRef();

    // Simulated Live Telemetry State
    const [telemetry, setTelemetry] = useState({
        signal: 98.4,
        latency: 24,
        dataRate: 450,
        sensorTemp: 22.4
    });

    // Live Telemetry Polling
    useEffect(() => {
        fetch('https://raw.githubusercontent.com/vasturiano/react-globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson')
            .then(res => res.json())
            .then(setCountries);

        const fetchTelemetry = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/data-lab/telemetry`);
                const data = await res.json();
                setTelemetry(prev => ({
                    ...data,
                    // Keep smooth interpolation for UI feel if needed, but data is from API
                    signal: data.signal || prev.signal,
                    latency: data.latency || prev.latency,
                    dataRate: data.dataRate || prev.dataRate,
                    sensorTemp: data.sensorTemp || prev.sensorTemp
                }));
            } catch (err) {
                console.error('Failed to sync telemetry');
            }
        };

        fetchTelemetry();
        const interval = setInterval(fetchTelemetry, 5000); // Sync every 5s
        return () => clearInterval(interval);
    }, []);

    const layerConfig = useMemo(() => {
        switch (activeLayer) {
            case 'STANDARD':
                return {
                    color: () => 'rgba(0, 240, 255, 0.25)',
                    label: 'Optical Telemetry',
                    unit: 'VIS',
                    Icon: Activity,
                    axis: 'Standard Imagery'
                };
            case 'NDVI':
                return {
                    color: (d) => {
                        const val = (d.properties.GDP_MD_EST / 100000) % 1;
                        // Natural Deep Green to Light Green with transparency
                        return `rgba(${Math.floor(val * 40)}, ${Math.floor(val * 180 + 20)}, ${Math.floor(val * 80)}, 0.45)`;
                    },
                    label: 'Vegetation Health Index',
                    unit: 'NDVI',
                    Icon: Droplets,
                    axis: 'Reflectance (NIR/Red)'
                };
            case 'POLLUTION':
                return {
                    color: (d) => {
                        const val = (d.properties.POP_EST / 100000000) % 1;
                        // Intense Red Glow
                        return `rgba(${Math.floor(val * 255 + 50)}, 0, 0, 0.65)`;
                    },
                    label: 'Nitrogen Dioxide (NO2)',
                    unit: 'μmol/m²',
                    Icon: Wind,
                    axis: 'TROPOMI Column Density'
                };
            default:
                return { color: () => 'rgba(0, 240, 255, 0.2)', label: 'Standard', Icon: Activity };
        }
    }, [activeLayer]);

    const fetchTechnicalReport = async (country) => {
        const countryName = country.properties.NAME;
        const countryCode = country.properties.ISO_A3;

        try {
            setSelectedReport({ name: countryName, code: countryCode, loading: true }); // Set loading state
            const res = await fetch(`${API_BASE_URL}/data-lab/report`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    countryName,
                    countryCode,
                    layer: activeLayer,
                    countryData: country.properties // Pass real GeoJSON properties
                })
            });
            const report = await res.json();
            setSelectedReport(report);
        } catch (err) {
            console.error('Failed to generate ground-truth report');
            setSelectedReport(null); // Clear report on error
        }
    };

    const [isHoveringHUD, setIsHoveringHUD] = useState(false);
    const [lastHoveredCountry, setLastHoveredCountry] = useState(null);

    return (
        <div className="w-full h-full relative glass-panel border border-white/10 bg-[#020408]/80 overflow-hidden">

            {/* Globe Layer */}
            <div className="absolute inset-0 z-0">
                <Globe
                    ref={globeEl}
                    globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
                    backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
                    polygonsData={countries.features}
                    polygonSideColor={() => 'rgba(255, 255, 255, 0.1)'}
                    polygonStrokeColor={() => 'rgba(255, 255, 255, 0.15)'}
                    polygonCapColor={layerConfig.color}
                    polygonAltitude={(d) => {
                        if (activeLayer === 'STANDARD') return 0.01;
                        const val = activeLayer === 'NDVI'
                            ? (d.properties.GDP_MD_EST / 200000) % 0.1
                            : (d.properties.POP_EST / 100000000) % 0.15;
                        return val + 0.01;
                    }}
                    polygonLabel={({ properties: d }) => `
            <div class="glass-panel p-3 border border-white/10 text-white font-mono text-[10px]">
              <div class="text-cyan-400 font-bold mb-1">${d.NAME}</div>
              <div class="text-white/40 uppercase tracking-tighter shrink-0">${layerConfig.label}</div>
            </div>
          `}
                    onPolygonClick={(d) => fetchTechnicalReport(d)}
                    onPolygonHover={(d) => {
                        setHoveredCountry(d);
                        if (d) setLastHoveredCountry(d);
                    }}
                    polygonsTransitionDuration={1000}
                />
            </div>

            {/* Control Overlay */}
            <div className="absolute top-6 left-6 z-10 w-72 space-y-4 pointer-events-none">
                <div className="glass-panel p-6 border border-white/10 pointer-events-auto bg-black/40 backdrop-blur-md">
                    <div className="text-[10px] font-mono text-cyan-400 mb-2 tracking-[0.3em] uppercase">Observation_Layer</div>
                    <div className="flex flex-col gap-3">
                        {[
                            { id: 'STANDARD', label: 'Standard View', color: 'text-cyan-400', icon: Activity },
                            { id: 'NDVI', label: 'Vegetation Health', color: 'text-green-400', icon: Droplets },
                            { id: 'POLLUTION', label: 'Air Quality (NO2)', color: 'text-orange-400', icon: Wind }
                        ].map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveLayer(item.id)}
                                className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${activeLayer === item.id ? 'bg-white/10 border-white/20' : 'bg-transparent border-transparent opacity-40 hover:opacity-100'}`}
                            >
                                <item.icon size={18} className={item.color} />
                                <span className="text-xs font-bold uppercase tracking-wider">{item.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Live Telemetry Ticker */}
                <div className="glass-panel p-4 border border-white/10 bg-black/40 backdrop-blur-md pointer-events-auto">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <Activity size={12} className="text-cyan-400 animate-pulse" />
                            <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest">Live Telemetry</span>
                        </div>
                        <div className="text-[8px] bg-cyan-400/10 text-cyan-400 px-1.5 py-0.5 rounded border border-cyan-400/20">SENTINEL-5P</div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <div className="text-[8px] text-white/20 uppercase font-mono">Signal Strength</div>
                            <div className="text-sm font-bold text-white">{telemetry.signal}%</div>
                        </div>
                        <div>
                            <div className="text-[8px] text-white/20 uppercase font-mono">Data Rate</div>
                            <div className="text-sm font-bold text-white tracking-tighter">{telemetry.dataRate} Mb/s</div>
                        </div>
                        <div>
                            <div className="text-[8px] text-white/20 uppercase font-mono">Latency</div>
                            <div className="text-sm font-bold text-white">{telemetry.latency}ms</div>
                        </div>
                        <div>
                            <div className="text-[8px] text-white/20 uppercase font-mono">Sensor Temp</div>
                            <div className="text-sm font-bold text-white">{telemetry.sensorTemp}°C</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Hover Info HUD */}
            <AnimatePresence>
                {(hoveredCountry || isHoveringHUD) && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        onMouseEnter={() => setIsHoveringHUD(true)}
                        onMouseLeave={() => setIsHoveringHUD(false)}
                        className="absolute bottom-6 left-6 z-10 glass-panel p-6 border border-white/10 bg-[#0a0f18]/90 backdrop-blur-xl w-72 pointer-events-auto"
                    >
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="text-lg font-bold text-white uppercase tracking-tighter">{(hoveredCountry || lastHoveredCountry).properties.NAME}</h3>
                            <button
                                onClick={() => setSelectedReport(generateReport(hoveredCountry || lastHoveredCountry))}
                                className="p-1.5 rounded bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500/20 transition-all group"
                            >
                                <Info size={14} className="text-cyan-400 group-hover:scale-110 transition-transform" />
                            </button>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-white/40 font-mono mb-4">
                            <layerConfig.Icon size={12} /> {layerConfig.axis}
                        </div>
                        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden mb-2">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{
                                    width: activeLayer === 'NDVI'
                                        ? `${((hoveredCountry || lastHoveredCountry).properties.GDP_MD_EST / 100000) % 1 * 100}%`
                                        : (activeLayer === 'POLLUTION'
                                            ? `${((hoveredCountry || lastHoveredCountry).properties.POP_EST / 100000000) % 1 * 100}%`
                                            : '50%')
                                }}
                                className={`h-full transition-all duration-500 ${activeLayer === 'NDVI' ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : (activeLayer === 'POLLUTION' ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]')}`}
                            />
                        </div>
                        <div className="flex justify-between text-[8px] font-mono text-white/30 tracking-widest">
                            <span>MIN_RES</span>
                            <span>DATA_LOCKED</span>
                            <span>MAX_RES</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Technical Report Modal */}
            <AnimatePresence shadow>
                {selectedReport && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="w-full max-w-lg glass-panel border border-white/10 bg-[#0a0f18] p-10 relative"
                        >
                            <button onClick={() => setSelectedReport(null)} className="absolute top-6 right-6 text-white/40 hover:text-white transition-colors">
                                <X size={20} />
                            </button>

                            <div className="mb-8">
                                <div className="text-cyan-400 font-mono text-[10px] tracking-[0.3em] uppercase mb-1">Observation_Log // {selectedReport.code}</div>
                                <h2 className="text-3xl font-bold text-white uppercase tracking-tight">{selectedReport.name}</h2>
                            </div>

                            {selectedReport.loading ? (
                                <div className="py-20 flex flex-col items-center justify-center gap-4">
                                    <Activity size={40} className="text-cyan-400 animate-spin" />
                                    <span className="text-xs font-mono text-white/40 animate-pulse uppercase tracking-widest">Hydrating Ground Truth...</span>
                                </div>
                            ) : (
                                <>
                                    <div className="grid grid-cols-1 gap-4 mb-8">
                                        {selectedReport.metrics.map(m => (
                                            <div key={m.label} className="p-4 rounded-xl border border-white/5 bg-white/[0.02] flex justify-between items-center">
                                                <span className="text-[10px] font-mono text-white/30 uppercase">{m.label.replace(/_/g, ' ')}</span>
                                                <div className="text-right">
                                                    <span className={`text-lg font-bold ${m.color || 'text-white'}`}>{m.value}</span>
                                                    <span className="ml-1 text-[10px] text-white/20 font-mono uppercase">{m.unit}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mb-8">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Zap size={14} className="text-cyan-400 leading-none" />
                                            <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">AI_ANALYSIS</span>
                                        </div>
                                        <p className="text-sm text-white/70 italic bg-cyan-400/5 p-4 rounded-lg border-l-2 border-cyan-400/30">
                                            "{selectedReport.analysis}"
                                        </p>
                                    </div>
                                </>
                            )}

                            <button
                                onClick={() => setSelectedReport(null)}
                                className="w-full py-4 rounded-full bg-cyan-500 text-black font-bold tracking-[0.2em] shadow-[0_0_20px_rgba(0,240,255,0.3)] uppercase text-xs"
                            >
                                Acknowledge & Sync
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Decorative Corner Elements */}
            <div className="absolute top-0 right-0 p-4 opacity-20"><Activity size={40} className="text-cyan-400" /></div>
            <div className="absolute bottom-4 right-4 text-[8px] font-mono text-white/20 tracking-widest uppercase">TERRA_SCAN_V2 // ACCURACY: HIGH</div>
        </div>
    );
};

export default EarthImpactSim;
