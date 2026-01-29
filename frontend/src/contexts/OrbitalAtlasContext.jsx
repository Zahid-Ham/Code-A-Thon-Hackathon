import React, { createContext, useContext, useState, useEffect } from 'react';

const OrbitalAtlasContext = createContext();

export const useOrbitalAtlas = () => useContext(OrbitalAtlasContext);

export const OrbitalAtlasProvider = ({ children }) => {
  const [satellites, setSatellites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSat, setSelectedSat] = useState(null);
  const [selectedDetails, setSelectedDetails] = useState(null);

  // Fetch Catalog
  useEffect(() => {
    fetch('http://localhost:5000/api/orbital-atlas/satellites?limit=2000')
      .then(res => res.json())
      .then(data => {
        setSatellites(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load satellites:', err);
        setLoading(false);
      });
  }, []);

  // Fetch Details when simple object selected
  useEffect(() => {
    if (selectedSat) {
        setLoading(true);
        fetch(`http://localhost:5000/api/orbital-atlas/satellite/${selectedSat.satelliteId}`)
            .then(res => res.json())
            .then(data => {
                setSelectedDetails(data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Failed to load sat details:', err);
                setLoading(false);
            });
    } else {
        setSelectedDetails(null);
    }
  }, [selectedSat]);

  return (
    <OrbitalAtlasContext.Provider value={{
      satellites,
      loading,
      selectedSat,
      setSelectedSat,
      selectedDetails
    }}>
      {children}
    </OrbitalAtlasContext.Provider>
  );
};
