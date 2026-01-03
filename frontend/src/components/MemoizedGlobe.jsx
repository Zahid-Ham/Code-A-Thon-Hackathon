import React, { memo, useState, useEffect } from 'react';
import Globe from 'react-globe.gl';

const MemoizedGlobe = ({ 
    globeRef, 
    polygons, 
    majorEvents, 
    hazardEvents, 
    userLocation, 
    arcsData, 
    onEventClick 
}) => {
    const [points, setPoints] = useState([]);

    // Combine data for points if needed, or use labels/rings directly as passed
    // User asked to render "Top 10 Active Events" -> passing sliced data from parent is cleaner, 
    // but we can also ensure we don't render too much here.
    
    return (
        <Globe
            ref={globeRef}
            backgroundColor="rgba(0,0,0,0)"
            // Optimization: Use a potentially lower res image if available, or just rely on these settings
            globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
            
            // Optimization: Lower atmosphere altitude
            atmosphereAltitude={0.15}
            atmosphereColor="#00F0FF"

            // Polygons (Gold Land)
            polygonsData={polygons}
            polygonCapColor={() => 'rgba(255, 215, 0, 0.05)'}
            polygonSideColor={() => 'rgba(255, 215, 0, 0.1)'}
            polygonStrokeColor={() => '#FFD700'}
            polygonAltitude={0.005}

            // Graticules
            showGraticules={true}
            graticulesColor="rgba(0, 240, 255, 0.2)"

            // Optimization: Limit labels/points
            labelsData={majorEvents}
            labelLat={d => d.lat}
            labelLng={d => d.lng}
            labelText={d => d.label}
            labelColor={d => d.color}
            labelDotRadius={0.5} // Optimization: Smaller dots
            labelSize={1.8}
            labelResolution={1} // Optimization: Lower resolution for text
            onLabelClick={onEventClick}

            // Rings
            ringsData={hazardEvents}
            ringLat={d => d.lat}
            ringLng={d => d.lng}
            ringColor={() => '#FF4500'}
            ringMaxRadius={3}
            ringPropagationSpeed={2}
            ringRepeatPeriod={800}
            onRingClick={onEventClick}
            
            // HTML Markers (User Location)
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

            // Optimization: Wait for ready (Logic handled by parent loader usually, but globe handles texture loading)
            onGlobeReady={() => console.log('Globe Ready')}
        />
    );
};

// Optimization: React.memo logic
// Only re-render if essential props change
export default memo(MemoizedGlobe, (prevProps, nextProps) => {
    return (
        prevProps.polygons === nextProps.polygons &&
        prevProps.majorEvents === nextProps.majorEvents &&
        prevProps.hazardEvents === nextProps.hazardEvents &&
        prevProps.userLocation === nextProps.userLocation &&
        prevProps.arcsData === nextProps.arcsData
    );
});
