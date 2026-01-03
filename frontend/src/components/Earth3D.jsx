import React, { useEffect, useRef, useState } from 'react';
import Globe from 'react-globe.gl';

const Earth3D = ({ isImpacted }) => {
  const globeEl = useRef();
  const [polygons, setPolygons] = useState([]);

  useEffect(() => {
    // Load GeoJSON for world polygons (simplified for demo)
    fetch('https://raw.githubusercontent.com/vasturiano/react-globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson')
      .then(res => res.json())
      .then(data => {
        setPolygons(data.features);
      });
  }, []);

  useEffect(() => {
    if (globeEl.current) {
      globeEl.current.controls().autoRotate = true;
      globeEl.current.controls().autoRotateSpeed = 0.5;
    }
  }, []);

  return (
    <div className="h-full w-full flex items-center justify-center">
      <Globe
        ref={globeEl}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
        backgroundColor="rgba(0,0,0,0)" // Transparent to show our Void background
        polygonsData={polygons}
        polygonCapColor={d => isImpacted && (d.properties.NAME === 'United States of America' || d.properties.NAME === 'Canada') ? 'rgba(255, 0, 0, 0.6)' : 'rgba(0, 240, 255, 0.01)'}
        polygonSideColor={() => 'rgba(0, 240, 255, 0.1)'}
        polygonStrokeColor={() => '#00F0FF'}
        polygonAltitude={isImpacted ? 0.01 : 0.005}
      />
    </div>
  );
};

export default Earth3D;
