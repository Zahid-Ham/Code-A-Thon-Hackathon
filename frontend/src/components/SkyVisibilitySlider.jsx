import React, { useState } from 'react';
import { ReactCompareSlider, ReactCompareSliderImage } from 'react-compare-slider';
import { Eye } from 'lucide-react';
import { API_BASE_URL } from '../services/api';

const SkyVisibilitySlider = ({ eventData }) => {
    const [cityImage, setCityImage] = useState('/city_sky.png');
    const [darkSkyImage, setDarkSkyImage] = useState('/dark_sky.png');
    const [loading, setLoading] = useState(false);

    const generateCharts = async () => {
        if (!eventData) return;
        setLoading(true);
        try {
            // 1. Generate City View (Default Style - simulates light pollution often)
            const cityRes = await fetch(`${API_BASE_URL}/star-chart`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    lat: eventData.lat, 
                    lng: eventData.lng, 
                    date: typeof eventData.date === 'string' ? new Date().toISOString().split('T')[0] : eventData.date, // simple date fallback
                    style: 'default' 
                })
            });
            const cityData = await cityRes.json();

            // 2. Generate Dark Sky View (Navy Style - darker background, better contrast for stars)
            const darkRes = await fetch(`${API_BASE_URL}/star-chart`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    lat: eventData.lat, 
                    lng: eventData.lng, 
                    date: typeof eventData.date === 'string' ? new Date().toISOString().split('T')[0] : eventData.date,
                    style: 'navy' 
                })
            });
            const darkData = await darkRes.json();

            // Append timestamp to prevent caching
            const timestamp = Date.now();
            if (cityData.imageUrl) setCityImage(`${cityData.imageUrl}?t=${timestamp}`);
            if (darkData.imageUrl) setDarkSkyImage(`${darkData.imageUrl}?t=${timestamp}`);
        } catch (err) {
            console.error("Chart generation failed", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full mt-8">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-[#00F0FF] font-header font-bold tracking-widest text-sm flex items-center gap-2">
                    <Eye size={16} /> SKY VISIBILITY COMPARISON
                </h3>
                <button 
                    onClick={generateCharts} 
                    disabled={loading}
                    className="text-[10px] bg-white/10 hover:bg-white/20 px-2 py-1 rounded text-white transition-colors disabled:opacity-50"
                >
                    {loading ? 'GENERATING...' : 'GENERATE LIVE CHART'}
                </button>
            </div>
            
            <div className="rounded-lg overflow-hidden border border-white/20 shadow-[0_0_20px_rgba(0,0,0,0.5)] h-48 relative group">
                <ReactCompareSlider
                    itemOne={
                        <div className="relative w-full h-full">
                            {/* Force visual degredation for "City" to simulate light pollution if API is too subtle */}
                            <ReactCompareSliderImage 
                                src={cityImage} 
                                alt="City View" 
                                style={{ filter: 'brightness(1.5) contrast(0.8) sepia(0.3) blur(0.5px)' }} 
                            />
                            <div className="absolute top-2 left-2 bg-black/50 text-[10px] px-2 rounded text-white font-mono">
                                HIGH LIGHT POLLUTION
                            </div>
                        </div>
                    }
                    itemTwo={
                        <div className="relative w-full h-full">
                            <ReactCompareSliderImage src={darkSkyImage} alt="Dark Sky View" />
                            <div className="absolute top-2 right-2 bg-black/50 text-[10px] px-2 rounded text-[#00F0FF] font-mono border border-[#00F0FF]">
                                DARK SKY RESERVE
                            </div>
                        </div>
                    }
                    position={50}
                    className="h-full"
                />
                
                {/* Labels */}
                <div className="absolute top-2 left-2 bg-black/60 backdrop-blur px-2 py-1 rounded text-[10px] font-mono border border-white/10 text-white/70 pointer-events-none">
                    CITY (BORTLE 9)
                </div>
                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur px-2 py-1 rounded text-[10px] font-mono border border-white/10 text-[#00F0FF] pointer-events-none">
                    RESERVE (BORTLE 1)
                </div>
            </div>

            {/* Visibility Gauge */}
            <div className="mt-6 p-4 rounded-lg bg-white/5 border border-white/10">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-mono text-white/40">ESTIMATED VISIBILITY SCORE</span>
                    <span className="text-xs font-mono text-green-400">EXCELLENT</span>
                </div>
                <div className="relative h-2 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className="absolute top-0 left-0 h-full w-[85%] bg-gradient-to-r from-red-500 via-yellow-400 to-green-400 shadow-[0_0_10px_rgba(0,255,100,0.5)]" />
                </div>
                <div className="flex justify-between mt-1 text-[10px] font-mono text-white/30">
                    <span>POOR</span>
                    <span>PERFECT</span>
                </div>
                <div className="mt-2 text-right font-header font-bold text-2xl text-white">
                    85%
                </div>
            </div>
        </div>
    );
};

export default SkyVisibilitySlider;
