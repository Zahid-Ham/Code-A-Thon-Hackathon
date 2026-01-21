import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Rocket, Globe, Satellite, CheckCircle, Info, ChevronRight } from 'lucide-react';

const CONFIG_STEPS = [
    { id: 'PAYLOAD', title: 'Payload Selection', icon: Satellite, desc: 'Choose the primary instrument for the mission.' },
    { id: 'ORBIT', title: 'Orbital Parameters', icon: Globe, desc: 'Define the target altitude and inclination.' },
    { id: 'VEHICLE', title: 'Launch Vehicle', icon: Rocket, desc: 'Select a rocket capable of lifting the payload.' }
];

const PAYLOADS = [
    {
        id: 'spy', name: 'KH-11 "Keyhole"', type: 'Optical Recon',
        mass: '19,000 kg', cost: 250, risk: 'Medium',
        desc: 'Top-secret NRO satellite. Capable of reading a license plate from space. Requires massive lift capacity.',
        stats: { res: '10cm', band: 'Visual/IR' }
    },
    {
        id: 'comm', name: 'AEHF-6', type: 'Secure Comms',
        mass: '6,168 kg', cost: 180, risk: 'Low',
        desc: 'Advanced Extremely High Frequency. Provides jamming-resistant communications for nuclear command.',
        stats: { res: 'N/A', band: 'EHF/SHF' }
    },
    {
        id: 'weather', name: 'GOES-R', type: 'Atmospheric Science',
        mass: '2,800 kg', cost: 110, risk: 'High',
        desc: 'Next-gen geostationary weather monitoring. Critical for hurricane tracking. Sensitive optics.',
        stats: { res: '500m', band: 'Multispectral' }
    }
];

const ORBITS = [
    {
        id: 'leo', name: 'Low Earth Orbit', alt: '400 km',
        desc: 'Close to Earth. Ideal for high-res imaging but suffers from atmospheric drag. Requires frequent station keeping.',
        stats: { period: '90 min', coverage: 'Rapid Revisit' }
    },
    {
        id: 'sso', name: 'Sun-Synchronous', alt: '800 km',
        desc: 'Polar orbit. Passes over any given point at the same local solar time. Perfect for consistent shadows in imaging.',
        stats: { period: '102 min', coverage: 'Global' }
    },
    {
        id: 'geo', name: 'Geostationary', alt: '35,786 km',
        desc: 'Matches Earth rotation. Satellite appears fixed in the sky. Massive fuel cost to reach.',
        stats: { period: '24 hrs', coverage: 'Hemi-spheric' }
    }
];

const VEHICLES = [
    {
        id: 'heavy', name: 'Delta IV Heavy', provider: 'ULA',
        cost: 350, reliability: '98%',
        desc: 'The beast. Three common booster cores. Capable of lifting the heaviest spy satellites to high orbits.',
        stats: { thrust: '9.4 MN', stage: 'Hydrogen' }
    },
    {
        id: 'falcon', name: 'Falcon 9', provider: 'SpaceX',
        cost: 67, reliability: '99%',
        desc: 'Reliable workhorse. Reusable first stage significantly reduces mission cost. Moderate lift capacity.',
        stats: { thrust: '7.6 MN', stage: 'Kerosene' }
    },
    {
        id: 'electron', name: 'Electron', provider: 'Rocket Lab',
        cost: 7.5, reliability: '92%',
        desc: 'Dedicated small-sat launcher. Too small for heavy payloads but perfect for rapid, cheap access.',
        stats: { thrust: '0.19 MN', stage: 'Electric Pump' }
    }
];

export default function MissionConfigurator({ onComplete }) {
    const [step, setStep] = useState(0);
    const [config, setConfig] = useState({ payload: null, orbit: null, vehicle: null });

    const handleSelect = (category, item) => {
        const newConfig = { ...config, [category]: item };
        setConfig(newConfig);
    };

    const handleNext = () => {
        if (step < 2) setStep(step + 1);
        else onComplete(config);
    };

    const currentData = step === 0 ? PAYLOADS : (step === 1 ? ORBITS : VEHICLES);
    const categoryName = step === 0 ? 'payload' : (step === 1 ? 'orbit' : 'vehicle');
    const StepIcon = CONFIG_STEPS[step].icon;

    return (
        <div className="w-full h-full flex flex-col bg-[#0b0d17] text-white relative overflow-hidden">
            {/* Background Grid */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none"></div>

            {/* Header / Progress */}
            <div className="p-8 border-b border-white/10 bg-black/50 backdrop-blur z-10 flex justify-between items-end">
                <div>
                    <div className="flex items-center gap-3 mb-2 text-cyan-500">
                        <StepIcon size={24} />
                        <span className="text-sm font-mono tracking-widest uppercase">Phase {step + 1}: {CONFIG_STEPS[step].title}</span>
                    </div>
                    <h2 className="text-3xl font-header uppercase tracking-wider">{CONFIG_STEPS[step].desc}</h2>
                </div>
                <div className="flex gap-2">
                    {CONFIG_STEPS.map((s, i) => (
                        <div key={i} className={`h-1 w-12 rounded-full transition-all ${i <= step ? 'bg-cyan-500 shadow-[0_0_10px_#00f0ff]' : 'bg-gray-800'}`}></div>
                    ))}
                </div>
            </div>

            {/* Main Selection Area */}
            <div className="flex-1 p-8 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-y-auto z-10">
                {currentData.map((item) => {
                    const isSelected = config[categoryName]?.id === item.id;
                    return (
                        <motion.button
                            key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            whileHover={{ scale: 1.01 }}
                            onClick={() => handleSelect(categoryName, item)}
                            className={`
                                relative text-left p-6 rounded-xl border-2 transition-all group overflow-hidden flex flex-col
                                ${isSelected
                                    ? 'bg-cyan-900/20 border-cyan-500 shadow-[0_0_30px_rgba(0,240,255,0.15)]'
                                    : 'bg-white/5 border-white/5 hover:border-white/20 hover:bg-white/10'}
                            `}
                        >
                            {/* Selection Marker */}
                            {isSelected && (
                                <div className="absolute top-4 right-4 text-cyan-400">
                                    <CheckCircle size={24} fill="rgba(0,240,255,0.2)" />
                                </div>
                            )}

                            <div className="mb-4">
                                <h3 className={`text-2xl font-bold mb-1 group-hover:text-cyan-400 transition-colors ${isSelected ? 'text-cyan-400' : 'text-white'}`}>{item.name}</h3>
                                {item.type && <span className="text-xs font-mono text-gray-500 uppercase tracking-wider border border-gray-700 px-2 py-1 rounded">{item.type}</span>}
                            </div>

                            <p className="text-gray-400 text-sm leading-relaxed mb-6 flex-1">
                                {item.desc}
                            </p>

                            {/* Tech Specs Grid */}
                            <div className="grid grid-cols-2 gap-4 text-xs font-mono bg-black/30 p-4 rounded-lg border border-white/5">
                                {item.cost && (
                                    <div>
                                        <div className="text-gray-500 mb-1">COST</div>
                                        <div className="text-white font-bold text-lg">${item.cost}M</div>
                                    </div>
                                )}
                                {item.mass && (
                                    <div>
                                        <div className="text-gray-500 mb-1">MASS</div>
                                        <div className="text-white font-bold">{item.mass}</div>
                                    </div>
                                )}
                                {item.alt && (
                                    <div>
                                        <div className="text-gray-500 mb-1">ALTITUDE</div>
                                        <div className="text-white font-bold">{item.alt}</div>
                                    </div>
                                )}
                                {item.reliability && (
                                    <div>
                                        <div className="text-gray-500 mb-1">RATING</div>
                                        <div className={`font-bold ${parseFloat(item.reliability) > 95 ? 'text-green-400' : 'text-yellow-400'}`}>{item.reliability}</div>
                                    </div>
                                )}
                                {item.stats && Object.entries(item.stats).map(([k, v]) => (
                                    <div key={k}>
                                        <div className="text-gray-500 mb-1 uppercase">{k}</div>
                                        <div className="text-white font-bold">{v}</div>
                                    </div>
                                ))}
                            </div>
                        </motion.button>
                    );
                })}
            </div>

            {/* Footer Actions */}
            <div className="p-6 border-t border-white/10 bg-black/80 flex justify-between items-center backdrop-blur z-20">
                <div className="text-xs text-gray-500 font-mono">
                    SELECTION REQUIRED TO PROCEED
                </div>
                <button
                    disabled={!config[categoryName]}
                    onClick={handleNext}
                    className={`
                        flex items-center gap-2 px-8 py-4 font-bold uppercase tracking-widest transition-all
                        ${config[categoryName]
                            ? 'bg-cyan-500 text-black hover:bg-white hover:shadow-[0_0_20px_rgba(0,240,255,0.5)] cursor-pointer'
                            : 'bg-gray-800 text-gray-500 cursor-not-allowed'}
                    `}
                    style={{ clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)' }}
                >
                    {step === 2 ? 'Initialize Simulation' : 'Confirm Choice'} <ChevronRight size={18} />
                </button>
            </div>
        </div>
    );
}
