import React, { useRef, useMemo, useEffect, useState } from 'react';
import Globe from 'react-globe.gl';
import * as THREE from 'three';
import * as satellite from 'satellite.js';
import { useOrbitalAtlas } from '../contexts/OrbitalAtlasContext';

// Helper to create a Satellite Icon Texture
const getSatelliteTexture = (color) => {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    // Glow
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(255,255,255,0.8)');
    gradient.addColorStop(0.2, color);
    gradient.addColorStop(1, 'transparent');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);

    // Satellite Body (Central Square)
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(28, 24, 8, 16);

    // Solar Panels (Wings)
    ctx.fillStyle = color; // Colored panels
    ctx.fillRect(4, 28, 20, 8); // Left
    ctx.fillRect(40, 28, 20, 8); // Right

    // Panel Detail lines
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(14, 28, 1, 8);
    ctx.fillRect(50, 28, 1, 8);

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
};

const OrbitalEarth = () => {
    const globeEl = useRef();
    const { satellites, setSelectedSat, selectedSat, loading } = useOrbitalAtlas();
    const [clock, setClock] = useState(new Date());
    const [hoveredSat, setHoveredSat] = useState(null);
    const [showAll, setShowAll] = useState(false);

    // Pre-generate textures for performance
    const textureLEO = useMemo(() => getSatelliteTexture('#00F0FF'), []); // Cyan
    const textureMEO = useMemo(() => getSatelliteTexture('#FFD700'), []); // Gold
    const textureGEO = useMemo(() => getSatelliteTexture('#FF4500'), []); // Red
    const textureSelected = useMemo(() => getSatelliteTexture('#FFFFFF'), []); // White

    // Throttled Animation Loop (30 FPS for smoothness)
    useEffect(() => {
        let frameId;
        let lastTime = 0;
        const animate = (time) => {
            if (time - lastTime > 33) { // ~30 FPS
                setClock(new Date());
                lastTime = time;
            }
            frameId = requestAnimationFrame(animate);
        };
        frameId = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(frameId);
    }, []);

    const visibleSatellites = useMemo(() => {
        if (!satellites) return [];
        if (showAll || selectedSat) return satellites;
        return satellites.filter(s =>
            s.category === 'Station' ||
            s.category === 'Navigation' ||
            s.category === 'Weather' ||
            s.name.includes('STARLINK')
        );
    }, [satellites, showAll, selectedSat]);

    // Compute Live Positions
    const satData = useMemo(() => {
        if (!visibleSatellites) return [];

        return visibleSatellites.map(d => {
            if (d.tleLine1 && d.tleLine2) {
                const satRec = satellite.twoline2satrec(d.tleLine1, d.tleLine2);
                const posVel = satellite.propagate(satRec, clock);
                if (posVel.position) {
                    const gmst = satellite.gstime(clock);
                    const gd = satellite.eciToGeodetic(posVel.position, gmst);
                    return {
                        ...d,
                        lat: satellite.degreesLat(gd.latitude),
                        lng: satellite.degreesLong(gd.longitude),
                        alt: gd.height / 6371
                    };
                }
            }
            return { ...d, alt: d.altitude ? d.altitude / 6371 : 0.05, lat: d.lat || 0, lng: d.lng || 0 };
        });
    }, [visibleSatellites, clock]);

    // Camera Fly-to Effect
    const prevSelectedId = useRef(null);
    useEffect(() => {
        if (selectedSat && selectedSat.satelliteId !== prevSelectedId.current && globeEl.current) {
            const liveSat = satData.find(s => s.satelliteId === selectedSat.satelliteId);
            if (liveSat) {
                console.log('Flying to', liveSat.name);
                globeEl.current.pointOfView({
                    lat: liveSat.lat,
                    lng: liveSat.lng,
                    altitude: Math.max(liveSat.alt * 2.5 + 0.5, 1.8)
                }, 2000); // Smooth 2s flight
                prevSelectedId.current = selectedSat.satelliteId;
            }
        } else if (!selectedSat) {
            prevSelectedId.current = null;
        }
    }, [selectedSat, satData]);


    // Generate Orbit Path
    const selectedPath = useMemo(() => {
        if (!selectedSat || !selectedSat.tleLine1) return [];
        const satRec = satellite.twoline2satrec(selectedSat.tleLine1, selectedSat.tleLine2);
        const points = [];
        const now = new Date();
        // Render 1 full orbit
        const period = selectedSat.orbitalPeriod || 100;
        const steps = 200;
        const stepTime = (period * 60 * 1000) / steps;

        for (let i = 0; i <= steps; i++) {
            const t = new Date(now.getTime() + (i * stepTime));
            const posVel = satellite.propagate(satRec, t);
            if (posVel.position) {
                const gmst = satellite.gstime(t);
                const gd = satellite.eciToGeodetic(posVel.position, gmst);
                points.push([
                    satellite.degreesLat(gd.latitude),
                    satellite.degreesLong(gd.longitude),
                    gd.height / 6371
                ]);
            }
        }
        return [{ points, color: '#FFFFFF' }];
    }, [selectedSat]);


    // Orbital Shells (Subtle Reference Grids)
    const shellsData = [
        { radius: 1 + 1000 / 6371, color: 0x00F0FF, opacity: 0.05, name: 'LEO' },
        { radius: 1 + 20200 / 6371, color: 0xFFD700, opacity: 0.03, name: 'MEO' },
        { radius: 1 + 35786 / 6371, color: 0xFF4500, opacity: 0.03, name: 'GEO' }
    ];

    if (!loading && satellites.length === 0) {
        return (
            <div className="flex items-center justify-center h-full text-red-500 font-mono border border-red-900 bg-red-900/10 p-4 rounded">
                ⚠️ LIVE DATA TEMPORARILY UNAVAILABLE
            </div>
        );
    }

    return (
        <div className="relative w-full h-full">
            {/* View Toggle */}
            <div className="absolute top-5 left-5 z-10 w-fit">
                <button
                    onClick={() => setShowAll(!showAll)}
                    className="text-[10px] text-cyan-400 border border-cyan-800 bg-black/50 px-2 py-1 rounded hover:bg-cyan-900/50 transition-all font-mono tracking-widest uppercase"
                >
                    {showAll ? 'Hide Debris' : 'Show All Satellites'}
                </button>
            </div>

            <Globe
                ref={globeEl}
                globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
                bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
                backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
                backgroundColor="rgba(0,0,0,0)"

                animateIn={true}
                onGlobeReady={() => {
                    if (globeEl.current) {
                        globeEl.current.controls().autoRotate = true;
                        globeEl.current.controls().autoRotateSpeed = 0.5;
                        globeEl.current.controls().enableDamping = true;
                    }
                }}

                // SATELLITES AS OBJECTS (Sprites)
                objectsData={satData}
                objectLat="lat"
                objectLng="lng"
                objectAltitude={d => d.alt}
                objectThreeObject={d => {
                    // Determine texture based on orbit/selection
                    let tex = textureLEO;
                    if (d.orbitType === 'MEO') tex = textureMEO;
                    if (d.orbitType === 'GEO') tex = textureGEO;
                    if (selectedSat && d.satelliteId === selectedSat.satelliteId) tex = textureSelected;

                    // Size
                    let size = 50; // Base size for Sprite
                    if (d.orbitType === 'GEO') size = 80; // Make GEO larger as they are far away
                    if (selectedSat && d.satelliteId === selectedSat.satelliteId) size = 120; // Selected is huge
                    else if (selectedSat) size = 20; // Dim others
                    else if (hoveredSat && d.satelliteId === hoveredSat.satelliteId) size = 100; // Hover

                    const material = new THREE.SpriteMaterial({ map: tex, depthWrite: false });
                    const sprite = new THREE.Sprite(material);

                    let scale = d.orbitType === 'GEO' ? 5 : 3;
                    if (selectedSat && d.satelliteId === selectedSat.satelliteId) scale = 10;
                    else if (selectedSat) scale = 2; // Keep dim ones visible enough to click
                    else if (hoveredSat && d.satelliteId === hoveredSat.satelliteId) scale = 8;

                    sprite.scale.set(scale, scale, 1);
                    return sprite;
                }}
                onObjectClick={(obj) => {
                    setSelectedSat(obj); // Directly set the satellite object state
                    if (globeEl.current) globeEl.current.controls().autoRotate = false;
                }}
                onObjectHover={setHoveredSat}


                // Paths for Selected
                pathsData={selectedPath}
                pathPoints="points"
                pathPointLat={p => p[0]}
                pathPointLng={p => p[1]}
                pathPointAlt={p => p[2]}
                pathColor="color"
                pathStroke={2}
                pathDashLength={0.5}
                pathDashGap={0.2}
                pathDashAnimateTime={2000}
                pathResolution={2}

                // Shells
                customLayerData={shellsData}
                customThreeObject={d => {
                    // Wireframe Sphere
                    const geometry = new THREE.SphereGeometry(d.radius * 100, 32, 32);
                    const material = new THREE.MeshBasicMaterial({
                        color: d.color,
                        transparent: true,
                        opacity: d.opacity,
                        wireframe: true // Make it wireframe for "Tech" look
                    });
                    return new THREE.Mesh(geometry, material);
                }}
            />
        </div>
    );
};

export default OrbitalEarth;
