import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const CosmicWeatherContext = createContext();

export const useCosmicWeather = () => useContext(CosmicWeatherContext);

export const CosmicWeatherProvider = ({ children }) => {
  const [weatherData, setWeatherData] = useState(null);
  const [globalSeverity, setGlobalSeverity] = useState('LOW');

  const [loading, setLoading] = useState(true);

  const [lastUpdated, setLastUpdated] = useState(null);
  const [isStale, setIsStale] = useState(false);
  


  const fetchCosmicWeather = async () => {
    try {
      // Don't set loading=true on background refetches to avoid flicker
      // setLoading(true); 
      const res = await axios.get('http://localhost:5000/api/space-weather');
      setWeatherData(res.data);
      setLastUpdated(new Date());
      setIsStale(false);
      
      // Calculate Severity
      // Rule: Take the HIGHEST severity from all active events
      const severities = ['LOW', 'MODERATE', 'HIGH', 'EXTREME'];
      let maxSevIndex = 0;

      // Check Solar Storms
      if (res.data.activeSolarStorms) {
        res.data.activeSolarStorms.forEach(storm => {
            const idx = severities.indexOf(storm.severity);
            if (idx > maxSevIndex) maxSevIndex = idx;
        });
      }

      // Check Radiation Alerts
      if (res.data.radiationAlerts) {
          res.data.radiationAlerts.forEach(alert => {
            const idx = severities.indexOf(alert.severity);
            if (idx > maxSevIndex) maxSevIndex = idx;
          });
      }

      // Check Aurora (Optional: elevate severity for extreme aurora?)
      // For now, let's keep Global Severity focused on "Threat Level"
      
      setGlobalSeverity(severities[maxSevIndex]);
      setLoading(false);

    } catch (err) {
      console.error("Failed to fetch cosmic weather:", err);
      // If we have previous data, keep it but mark as stale
      if (weatherData) {
          setIsStale(true);
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCosmicWeather();
    // Poll every 60 seconds
    const interval = setInterval(fetchCosmicWeather, 60000);
    return () => clearInterval(interval);
  }, []);

  const activeStorms = weatherData?.activeSolarStorms || [];

  return (
    <CosmicWeatherContext.Provider value={{ 
        weatherData, 
        loading, 
        globalSeverity, 
        activeStorms,
        lastUpdated,
        isStale,
        // Helper for debugging/demo
        setGlobalSeverity 
    }}>
      {children}
    </CosmicWeatherContext.Provider>
  );
};
