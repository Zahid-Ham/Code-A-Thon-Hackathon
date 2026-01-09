import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

const TacticalMap = ({ visibilityMap, userLocation, selectedEvent }) => {
    
    // Equirectangular Projection Helper
    // Map Width/Height must match the Aspect Ratio of the World Map Image (usually 2:1)
    const MAP_WIDTH = 800;
    const MAP_HEIGHT = 400;

    const project = (lng, lat) => {
        const x = (lng + 180) * (MAP_WIDTH / 360);
        const y = (90 - lat) * (MAP_HEIGHT / 180);
        return { x, y };
    };

    // Convert GeoJSON Features to SVG Paths
    const paths = useMemo(() => {
        if (!visibilityMap) return [];
        
        return visibilityMap.map((feature, index) => {
            if (!feature.geometry || feature.geometry.type !== 'Polygon') return null;
            
            const coords = feature.geometry.coordinates[0]; // Outer ring
            if (!coords) return null;

            // Generate "d" attribute for path
            // Handle varying GeoJSON structures (some wrap 180/-180 which causes lines across map)
            // For a simple hackathon map, we might accept some artifacts or clip them.
            // A simple "L" (Line to) approach:
            
            let d = "";
            let start = true;

            // Basic artifact prevention: if jump is too big (>180 deg longitude), stop/start
            // OR simply filter. The "circle" generator might produce safe coords.
            
            coords.forEach((pt, i) => {
                const [lng, lat] = pt;
                const { x, y } = project(lng, lat);
                
                if (start) {
                    d += `M ${x} ${y} `;
                    start = false;
                } else {
                    // Check for wraparound artifacts
                    const prevPt = coords[i-1];
                    if (Math.abs(pt[0] - prevPt[0]) > 180) {
                        // Move instead of Line to properly handle wrap (simplistic)
                        d += `M ${x} ${y} `; 
                    } else {
                        d += `L ${x} ${y} `;
                    }
                }
            });
            d += "Z"; // Close path

            return (
                <path 
                    key={index}
                    d={d}
                    fill={feature.properties.color || '#00F0FF'}
                    fillOpacity={feature.properties.opacity || 0.2}
                    stroke={feature.properties.color || '#00F0FF'}
                    strokeWidth={0.5}
                />
            );
        });
    }, [visibilityMap]);

    // User Location Dot
    const userDot = useMemo(() => {
        if (!userLocation) return null;
        const { x, y } = project(userLocation.lng, userLocation.lat);
        return { x, y };
    }, [userLocation]);

    return (
        <div className="relative w-full h-full flex items-center justify-center bg-black border-2 border-white/20 rounded-xl overflow-hidden shadow-2xl">
            <div className="relative bg-black" style={{ width: MAP_WIDTH, height: MAP_HEIGHT }}>
                
                {/* 1. Grid Lines (The "Scientific" Look) */}
                <div className="absolute inset-0" 
                    style={{ 
                        backgroundImage: `
                            linear-gradient(to right, #333 1px, transparent 1px),
                            linear-gradient(to bottom, #333 1px, transparent 1px)
                        `,
                        backgroundSize: '40px 40px'
                    }} 
                />
                <div className="absolute inset-0 border border-white/30"></div>
                
                {/* 2. World Map Outline (High Contrast) */}
                {/* Using a reliable equirectangular silhouette image with higher contrast */}
                <img 
                    src="https://upload.wikimedia.org/wikipedia/commons/8/83/Equirectangular_projection_SW.jpg" 
                    alt="World Map"
                    className="absolute inset-0 w-full h-full opacity-60 mix-blend-screen grayscale contrast-125"
                />

                {/* 3. Visibility Zones (Bright & Clear) */}
                <svg width={MAP_WIDTH} height={MAP_HEIGHT} className="absolute inset-0 pointer-events-none">
                    {paths}
                    
                    {/* Equatorial Line */}
                    <line x1="0" y1={MAP_HEIGHT/2} x2={MAP_WIDTH} y2={MAP_HEIGHT/2} stroke="#FFD700" strokeWidth="1" strokeOpacity="0.5" strokeDasharray="4 4" />
                    
                    {/* Prime Meridian */}
                    <line x1={MAP_WIDTH/2} y1="0" x2={MAP_WIDTH/2} y2={MAP_HEIGHT} stroke="#FFD700" strokeWidth="1" strokeOpacity="0.5" strokeDasharray="4 4" />

                    {/* Event Center Marker */}
                    {selectedEvent && (selectedEvent.lat !== undefined) && (() => {
                        const { x, y } = project(selectedEvent.lng, selectedEvent.lat);
                        return (
                            <g>
                                <circle cx={x} cy={y} r={6} fill="#FF0000" className="animate-pulse" />
                                <circle cx={x} cy={y} r={12} stroke="#FF0000" strokeWidth="1" fill="none" className="animate-ping" />
                            </g>
                        );
                    })()}

                    {/* User Location */}
                    {userDot && (
                        <circle cx={userDot.x} cy={userDot.y} r={4} fill="#00FF00" stroke="white" strokeWidth="1" />
                    )}
                </svg>
            </div>

            {/* Title / Legend */}
            <div className="absolute top-4 left-4 p-3 bg-black/80 backdrop-blur border border-white/20 rounded max-w-xs">
                <h3 className="text-xs font-mono text-[#FFD700] uppercase tracking-widest mb-1 border-b border-white/10 pb-1">
                    Global Visibility Map
                </h3>
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-[#00F0FF]/40 border border-[#00F0FF]"></div>
                        <span className="text-[10px] text-white/70 font-mono">100% VISIBILITY ZONE</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-white/10 border border-white/40"></div>
                        <span className="text-[10px] text-white/70 font-mono">PARTIAL / HORIZON</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TacticalMap;
