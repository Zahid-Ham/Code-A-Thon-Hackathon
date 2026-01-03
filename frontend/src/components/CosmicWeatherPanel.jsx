import React, { useMemo } from 'react';
import { useCosmicWeather } from '../contexts/CosmicWeatherContext';
import { Sun, Wind, Radio, AlertTriangle, CheckCircle, Info } from 'lucide-react';

const CosmicWeatherPanel = () => {
  const { weatherData, globalSeverity, activeStorms, lastUpdated, isStale } = useCosmicWeather();

  // --- 1. Content Logic: "Translation Layer" ---
  const getSolarContent = (severity) => {
    switch (severity) {
      case 'EXTREME': return {
        status: "DANGEROUS",
        what: "A massive solar flare has erupted directly towards Earth.",
        why: "High risk of widespread power grid failures and satellite damage.",
        action: "Operators: Protect assets. Public: Prepare for potential blackouts."
      };
      case 'HIGH': return {
        status: "WARNING",
        what: "Strong solar activity detected. Multiple flares active.",
        why: "GPS and Radio signals may be unreliable. Aurora visible far south.",
        action: "Pilots/Mariners: Monitor navigation systems closely."
      };
      case 'MODERATE': return {
        status: "ELEVATED",
        what: "The Sun is active with minor eruptions.",
        why: "Possible minor radio static at high altitudes.",
        action: "No improved public action needed. Enjoy the aurora."
      };
      case 'LOW': 
      default: return {
        status: "CALM",
        what: "The Sun is behaving normally. No major eruptions.",
        why: "Space weather is stable and safe for all systems.",
        action: "No action needed."
      };
    }
  };

  const getAuroraContent = (kp) => {
    if (kp >= 9) return {
      status: "GLOBAL EVENT",
      what: "Extremely rare auroras visible as far south as Florida or Spain.",
      why: "A massive geomagnetic storm is hitting Earth's atmosphere.",
      action: "Look up! This is a once-in-a-decade event."
    };
    if (kp >= 7) return {
      status: "INTENSE",
      what: "Northern Lights visible in Northern US & Central Europe.",
      why: "Strong solar wind is interacting with Earth's magnetic field.",
      action: "Great viewing conditions away from city lights."
    };
    if (kp >= 5) return {
      status: "ACTIVE",
      what: "Auroras visible in Canada, Scotland, and Scandinavia.",
      why: "Moderate geomagnetic activity.",
      action: "Cameras may capture colors invisible to the eye."
    };
    return {
      status: "QUIET",
      what: "Auroras confined to the Arctic/Antarctic circles.",
      why: "Geomagnetic field is quiet.",
      action: "No mid-latitude visibility."
    };
  };

  const getRadiationContent = (alerts) => {
    if (!alerts || alerts.length === 0) return {
      status: "NOMINAL",
      what: "Radiation levels are normal.",
      why: "Earth's magnetic shield is holding strong.",
      action: "Safe for air travel and astronauts."
    };
    
    // Check max severity
    const severities = alerts.map(a => a.severity);
    if (severities.includes('EXTREME')) return {
      status: "HAZARDOUS",
      what: "Extreme radiation storm in progress.",
      why: "High energy particles are penetrating the atmosphere.",
      action: "High-altitude flights should reroute. Astronauts: Shelter."
    };
    if (severities.includes('HIGH')) return {
      status: "ELEVATED",
      what: "Increased high-energy particles detected.",
      why: "Satellite electronics may glitch.",
      action: "Avoid polar flight routes if possible."
    };
    return {
      status: "MINOR",
      what: "Slight increase in background radiation.",
      why: "Minor solar particle event.",
      action: "No impact on humans or aviation."
    };
  };

  // Derived Values
  const solarData = getSolarContent(globalSeverity);
  
  const auroraKp = weatherData?.auroraForecast?.kpIndex || 0;
  const auroraData = getAuroraContent(auroraKp);
  
  const radAlerts = weatherData?.radiationAlerts || [];
  const radData = getRadiationContent(radAlerts);


  // --- 2. Helper Styles ---
  const getSevStyles = (status) => {
    if(['DANGEROUS', 'GLOBAL EVENT', 'HAZARDOUS'].includes(status)) return 'border-red-500/50 bg-red-900/10 text-red-100';
    if(['WARNING', 'INTENSE', 'ELEVATED', 'ACTIVE'].includes(status)) return 'border-orange-500/50 bg-orange-900/10 text-orange-100';
    return 'border-cyan-500/30 bg-cyan-900/10 text-cyan-100';
  };

  // --- 3. Card Component ---
  const ExplanationCard = ({ title, icon: Icon, data }) => (
    <div className={`p-5 rounded-xl border backdrop-blur-md transition-all duration-300 flex flex-col gap-3 ${getSevStyles(data.status)}`}>
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-2">
        <div className="flex items-center gap-2">
           <Icon size={18} className="opacity-80" />
           <span className="font-['Orbitron'] font-bold tracking-wider text-sm">{title}</span>
        </div>
        <span className="text-xs font-bold px-2 py-0.5 rounded bg-black/40 border border-white/10 uppercase tracking-widest">
            {data.status}
        </span>
      </div>

      {/* Narrative Body */}
      <div className="space-y-3 pt-1">
         
         {/* What */}
         <div>
            <div className="text-[10px] uppercase tracking-widest opacity-50 font-mono mb-1">Observation</div>
            <p className="text-sm leading-relaxed font-light">{data.what}</p>
         </div>

         {/* Why */}
         <div>
            <div className="text-[10px] uppercase tracking-widest opacity-50 font-mono mb-1">Impact</div>
            <p className="text-sm leading-relaxed font-light opacity-90">{data.why}</p>
         </div>

         {/* Action */}
         <div className="bg-black/20 p-2 rounded border-l-2 border-white/20">
             <div className="text-[10px] uppercase tracking-widest opacity-50 font-mono mb-1 flex items-center gap-1">
                {data.status === 'NOMINAL' || data.status === 'CALM' || data.status === 'QUIET' ? <CheckCircle size={10}/> : <AlertTriangle size={10}/>}
                Guidance
             </div>
             <p className="text-xs font-medium italic">{data.action}</p>
         </div>

      </div>
    </div>
  );

  return (
    <div className="fixed top-24 right-6 w-96 flex flex-col gap-4 z-40 animate-fade-in-right max-h-[85vh] overflow-y-auto pr-2 pb-10 scrollbar-hide">
      
      {/* Header */}
      <div className="flex items-center justify-between pl-1 border-l-4 border-cyan-500">
         <h2 className="ml-3 font-['Orbitron'] font-bold text-lg text-white">COSMIC BRIEFING</h2>
         <div className="flex gap-1">
            <div className={`w-2 h-2 rounded-full animate-pulse ${globalSeverity === 'EXTREME' ? 'bg-red-500' : 'bg-cyan-500'}`} />
            <span className="text-[10px] text-cyan-400 tracking-widest uppercase">LIVE FEED</span>
         </div>
      </div>

      <ExplanationCard title="SOLAR STATE" icon={Sun} data={solarData} />
      <ExplanationCard title="AURORA FORECAST" icon={Wind} data={auroraData} />
      <ExplanationCard title="RADIATION MONITOR" icon={Radio} data={radData} />

      {/* Footer Info */}
      <div className="flex justify-between items-center px-1 mt-2">
          <span className="text-[10px] items-center gap-1 font-mono text-white/30 flex">
             <Info size={10}/>
             Using Real-Time NOAA Scales
          </span>
          <span className="text-[10px] font-mono text-white/30">
              {lastUpdated && `UPDATED: ${lastUpdated.toLocaleTimeString()}`}
          </span>
      </div>

    </div>
  );
};

export default CosmicWeatherPanel;
