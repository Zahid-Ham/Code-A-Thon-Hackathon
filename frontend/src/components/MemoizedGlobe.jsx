import React, { memo, useState, useMemo } from 'react';
import Globe from 'react-globe.gl';
import { useCosmicWeather } from '../contexts/CosmicWeatherContext';

const MemoizedGlobe = ({ 
    globeRef, 
    polygons, 
    majorEvents, 
    hazardEvents, 
    userLocation, 
    arcsData, 
    onEventClick,
    visibilityMap
}) => {
    const { weatherData, globalSeverity } = useCosmicWeather();

    // --- Visual Configuration based on Severity ---
    const config = useMemo(() => {
        switch (globalSeverity) {
        case 'HIGH':
        case 'EXTREME':
            return {
            atmosphereColor: '#FF4500', // Reddish
            atmosphereAltitude: 0.25,
            polygonAltitude: 0.02
            };
        case 'MODERATE':
            return {
            atmosphereColor: '#FFD700', // Yellowish
            atmosphereAltitude: 0.18,
            polygonAltitude: 0.01
            };
        default:
            return {
            atmosphereColor: '#00F0FF', // Sci-Fi Blue
            atmosphereAltitude: 0.15,
            polygonAltitude: 0.005
            };
        }
    }, [globalSeverity]);

    // --- Aurora Data Generation ---
    // Renders animated rings at the poles
    const auroraRings = useMemo(() => {
        const kp = weatherData?.auroraForecast?.kpIndex || 1;
        const rings = [];
        
        // Show if Kp > 2
        const baseColor = kp > 6 ? (t) => `rgba(255, 0, 255, ${1-t})` : (t) => `rgba(0, 255, 128, ${1-t})`; 
        const intensity = Math.max(1, kp - 2); 

        // North Pole
        for (let i = 0; i < intensity; i++) {
        rings.push({
            lat: 82 - (i * 2),
            lng: 0,
            maxR: 10 + (i * 5),
            propagationSpeed: 1 + (kp * 0.1),
            repeatPeriod: 800 - (kp * 50),
            color: baseColor
        });
        }
        // South Pole
        for (let i = 0; i < intensity; i++) {
        rings.push({
            lat: -82 + (i * 2), 
            lng: 0, 
            maxR: 10 + (i * 5),
            propagationSpeed: 1 + (kp * 0.1),
            repeatPeriod: 800 - (kp * 50),
            color: baseColor
        });
        }

        return rings;
    }, [weatherData]);

    // --- Radiation Alert Rings ---
    const radiationRings = useMemo(() => {
        const alerts = weatherData?.radiationAlerts || [];
        if (alerts.length === 0) return [];

        // Find max severity
        const severityMap = { 'LOW': 1, 'MODERATE': 2, 'HIGH': 3, 'EXTREME': 4 };
        let maxSev = 0;
        alerts.forEach(a => {
            const s = severityMap[a.severity] || 0;
            if (s > maxSev) maxSev = s;
        });

        if (maxSev < 2) return [];

        const colorFunc = (t) => {
           if (maxSev === 4) return `rgba(255, 0, 0, ${1-t})`;
           if (maxSev === 3) return `rgba(255, 69, 0, ${1-t})`;
           return `rgba(255, 165, 0, ${1-t})`;
        };
        
        return [{
            lat: 0, lng: 0,
            maxR: 180,
            propagationSpeed: maxSev * 2,
            repeatPeriod: 2000 / maxSev,
            color: colorFunc
        }];
    }, [weatherData]);

    // Combine hazard events with localized rings
    const allRings = useMemo(() => [...hazardEvents, ...auroraRings, ...radiationRings], [hazardEvents, auroraRings, radiationRings]);

    // Memoize the polygons data to include both countries and visibility zones
    const combinedPolygons = useMemo(() => {
        let base = polygons.map(p => ({ ...p, properties: { ...p.properties, type: 'country' } })); // distinct style
        if (visibilityMap) {
            // Add visibility zones on top
            return [...base, ...visibilityMap];
        }
        return base;
    }, [polygons, visibilityMap]);

    return (
        <Globe
            ref={globeRef}
            backgroundColor="rgba(0,0,0,0)"
            globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
            bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
            backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
            
            // Dynamic Atmosphere
            atmosphereAltitude={config.atmosphereAltitude}
            atmosphereColor={config.atmosphereColor}

            // Polygons (Countries + Visibility)
            polygonsData={combinedPolygons}
            polygonSideColor={() => 'rgba(0, 0, 0, 0)'}
            polygonStrokeColor={() => '#111'}
            polygonCapColor={(d) => {
                if (d.properties.type === 'horizon') return 'rgba(0, 240, 255, 0.1)';
                if (d.properties.type === 'partial') return 'rgba(0, 240, 255, 0.2)';
                if (d.properties.type === 'high') return 'rgba(255, 255, 255, 0.1)';
                return 'rgba(200, 200, 200, 0.1)'; // Country default
            }}
            polygonAlt={(d) => d.properties.type ? 0.01 : 0.005} // Zones slightly higher
            polygonsTransitionDuration={500}

            // Graticules
            showGraticules={true}
            graticulesColor="rgba(0, 240, 255, 0.2)"

            // Labels (Major Events)
            labelsData={majorEvents}
            labelLat={d => d.lat}
            labelLng={d => d.lng}
            labelText={d => d.label}
            labelColor={d => d.color}
            labelDotRadius={0.5} 
            labelSize={1.8}
            labelResolution={1} 
            onLabelClick={onEventClick}

            // Rings (Hazards + Cosmic Weather)
            ringsData={allRings}
            ringLat={d => d.lat}
            ringLng={d => d.lng}
            ringColor={d => d.color || '#FF4500'} 
            ringMaxRadius={d => d.maxR || d.ringMaxRadius || 3}
            ringPropagationSpeed={d => d.propagationSpeed || d.ringPropagationSpeed || 2}
            ringRepeatPeriod={d => d.repeatPeriod || d.ringRepeatPeriod || 800}
            onRingClick={onEventClick}
            
            // HTML Markers
            htmlElementsData={userLocation ? [{ ...userLocation, type: 'USER' }] : []}
            htmlLat={d => d.lat}
            htmlLng={d => d.lng}
            htmlElement={d => {
                const el = document.createElement('div');
                el.innerHTML = `<div style="color: #00FF00; transform: translate(-50%, -50%);"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s-8-10-8-14a8 8 0 0 1 16 0c0 4-8 14-8 14z" /><circle cx="12" cy="10" r="3" /></svg></div>`;
                return el;
            }}

            // Arcs
            arcsData={arcsData}
            arcColor={'color'}
            arcDashLength={0.4}
            arcDashGap={0.2}
            arcDashAnimateTime={1500}
            arcStroke={0.5}

            onGlobeReady={() => console.log('Globe Ready')}
        />
    );
};

// Optimization: React.memo logic
export default memo(MemoizedGlobe, (prevProps, nextProps) => {
    // Note: We are now using context inside, so memo might need to be less strict 
    // or we accept that context updates will trigger re-renders regardless of props.
    // However, fast context updates (animations) might be heavy. 
    // Ideally we pass weather data as props if we want strict memo control, 
    // but connecting to context here is easiest for now.
    return (
        prevProps.polygons === nextProps.polygons &&
        prevProps.majorEvents === nextProps.majorEvents &&
        prevProps.hazardEvents === nextProps.hazardEvents &&
        prevProps.userLocation === nextProps.userLocation &&
        prevProps.arcsData === nextProps.arcsData
    );
});
