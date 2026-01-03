import React, { useEffect, useRef, useState, useMemo } from 'react';
import Globe from 'react-globe.gl';
import { useCosmicWeather } from '../contexts/CosmicWeatherContext';

const Earth3D = ({ isImpacted }) => {
  const globeEl = useRef();
  const [polygons, setPolygons] = useState([]);
  const { globalSeverity, weatherData } = useCosmicWeather();

  useEffect(() => {
    // Load GeoJSON for world polygons (simplified for demo)
    fetch('https://raw.githubusercontent.com/vasturiano/react-globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson')
      .then(res => res.json())
      .then(data => {
        setPolygons(data.features);
      });
  }, []);

  // --- Visual Configuration based on Severity ---
  const config = useMemo(() => {
    switch (globalSeverity) {
      case 'HIGH':
      case 'EXTREME':
        return {
          atmosphereColor: '#FF4500', // Reddish atmosphere
          atmosphereAltitude: 0.25,
          autoRotateSpeed: 2.0, // Chaos
          polygonAltitude: 0.02
        };
      case 'MODERATE':
        return {
          atmosphereColor: '#FFD700', // Yellowish
          atmosphereAltitude: 0.15,
          autoRotateSpeed: 1.0,
          polygonAltitude: 0.01
        };
      default:
        return {
          atmosphereColor: '#00F0FF', // Standard Sci-Fi Blue
          atmosphereAltitude: 0.1,
          autoRotateSpeed: 0.5,
          polygonAltitude: 0.005
        };
    }
  }, [globalSeverity]);

  // --- Aurora Data Generation ---
  // Renders animated rings at the poles to simulate aurora visualization
  const auroraRings = useMemo(() => {
    const kp = weatherData?.auroraForecast?.kpIndex || 1;
    const rings = [];
    
    // Only show if Kp is significant (e.g. > 2)
    const baseColor = kp > 6 ? (t) => `rgba(255, 0, 255, ${1-t})` : (t) => `rgba(0, 255, 128, ${1-t})`; // Purple/Green
    const intensity = Math.max(1, kp - 2); 

    // North Pole Rings
    for (let i = 0; i < intensity; i++) {
       rings.push({
         lat: 82 - (i * 2), // Bands descending from pole
         lng: 0, // centered on pole rotation axis effectively
         maxR: 10 + (i * 5),
         propagationSpeed: 1 + (kp * 0.1),
         repeatPeriod: 800 - (kp * 50),
         color: baseColor
       });
    }
    // South Pole Rings (Mirror)
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
  // Renders pulsing rings from center of Earth outwards 
  const radiationRings = useMemo(() => {
    const alerts = weatherData?.radiationAlerts || [];
    if (alerts.length === 0) return [];

    // Find max severity alert
    const severityMap = { 'LOW': 1, 'MODERATE': 2, 'HIGH': 3, 'EXTREME': 4 };
    let maxSev = 0;
    alerts.forEach(a => {
      const s = severityMap[a.severity] || 0;
      if (s > maxSev) maxSev = s;
    });

    if (maxSev < 2) return []; // Ignore LOW for big visuals to keep it clean

    const colorFunc = (t) => {
       if (maxSev === 4) return `rgba(255, 0, 0, ${1-t})`; // Red
       if (maxSev === 3) return `rgba(255, 69, 0, ${1-t})`; // OrangeRed
       return `rgba(255, 165, 0, ${1-t})`; // Orange
    };
    
    // Create a global pulse
    return [{
      lat: 0, lng: 0,
      maxR: 180, // Cover whole globe
      propagationSpeed: maxSev * 2,
      repeatPeriod: 2000 / maxSev,
      color: colorFunc
    }];
  }, [weatherData]);

  // Combine Rings
  const allRings = useMemo(() => [...auroraRings, ...radiationRings], [auroraRings, radiationRings]);


  // --- Satellite Path Distortion ---
  const satellitePaths = useMemo(() => {
    const paths = [];
    const count = 15;
    const isGlitch = globalSeverity === 'HIGH' || globalSeverity === 'EXTREME';

    for (let i = 0; i < count; i++) {
       // Random orbit parameters
       const inclination = (Math.random() - 0.5) * 160; 
       const offset = Math.random() * 360;
       const coords = [];
       
       // Generate circle path
       for (let j = 0; j <= 360; j+=5) {
          // Simple rough conversion for demo orbit visual
          // (In real app, would use true Keplerian math, but here just visual lines)
          // Just simplistic stripes for now
          coords.push([
            (j + offset) % 360 - 180, 
            inclination * Math.sin((j * Math.PI) / 180) 
          ]);
       }

       // Glitch effect: Random colors or gaps
       const color = isGlitch && Math.random() > 0.7 
          ? ['#FF0000', '#FFFFFF'][Math.floor(Math.random()*2)] 
          : '#00F0FF';
       
       const dash = isGlitch ? [Math.random(), Math.random()] : [1, 0];

       paths.push({
         coords: coords,
         color: () => color,
         dash: dash 
       });
    }
    return paths;
  }, [globalSeverity]);


  useEffect(() => {
    if (globeEl.current) {
      globeEl.current.controls().autoRotate = true;
      globeEl.current.controls().autoRotateSpeed = config.autoRotateSpeed;
    }
  }, [config.autoRotateSpeed]);

  return (
    <div className="h-full w-full flex items-center justify-center">
      <Globe
        ref={globeEl}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
        backgroundColor="rgba(0,0,0,0)" 
        atmosphereColor={config.atmosphereColor}
        atmosphereAltitude={config.atmosphereAltitude}
        
        // Polygons (Countries)
        polygonsData={polygons}
        polygonCapColor={d => isImpacted && (d.properties.NAME === 'United States of America' || d.properties.NAME === 'Canada') ? 'rgba(255, 0, 0, 0.6)' : 'rgba(0, 240, 255, 0.01)'}
        polygonSideColor={() => 'rgba(0, 240, 255, 0.1)'}
        polygonStrokeColor={() => '#00F0FF'}
        polygonAltitude={isImpacted ? 0.02 : config.polygonAltitude}

        // Rings (Aurora + Radiation)
        ringsData={allRings}
        ringColor="color"
        ringMaxRadius="maxR"
        ringPropagationSpeed="propagationSpeed"
        ringRepeatPeriod="repeatPeriod"

        // Paths (Satellites)
        pathsData={satellitePaths}
        pathPoints="coords"
        pathColor="color"
        pathDashLength={isImpacted ? 0.1 : 0} // Slight dash if impacted
        pathDashGap={isImpacted ? 0.1 : 0}
        pathAltitude={0.1}
        pathResolution={2}
      />
    </div>
  );
};

export default Earth3D;
