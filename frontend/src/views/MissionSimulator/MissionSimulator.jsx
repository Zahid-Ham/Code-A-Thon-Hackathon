import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getFirstScenario, getNextScenario, enrichScenarioWithConfig, getMissions, getMissionById } from './ScenarioEngine';
import { evaluateDecision, calculateScore } from './DecisionEvaluator';
import MissionConfigurator from './common/MissionConfigurator';
import WhatIfChatbot from './WhatIfChatbot';
import './MissionSimulator.css';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, AlertTriangle, CheckCircle, Activity, Play, BarChart2, Shield, DollarSign, BrainCircuit, ChevronRight, Wind, Zap, AlertOctagon, Globe2 } from 'lucide-react';
import { API_BASE_URL } from '../../services/api';

// Animation Variants
const fadeIn = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.5 } } };
const slideUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120 } } };
const staggerContainer = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };

const MissionSimulator = () => {
    const navigate = useNavigate();

    // Game Phases: INTRO -> MISSION_SELECT -> SETUP -> SCENARIO -> SUMMARY
    const [phase, setPhase] = useState('MISSION_SELECT');
    const [selectedMission, setSelectedMission] = useState(null);
    const [missionConfig, setMissionConfig] = useState(null);
    const [currentScenario, setCurrentScenario] = useState(null);
    const [scenarioState, setScenarioState] = useState('CHOICE'); // CHOICE, PROCESSING, OUTCOME
    const [gameHistory, setGameHistory] = useState([]);
    const [stats, setStats] = useState({
        cost: 0,
        science: 0,
        safety: 100
    });
    const [lastOutcome, setLastOutcome] = useState(null);
    const [historicalData, setHistoricalData] = useState(null);

    const missions = getMissions();

    // Load first scenario immediately when config is done
    const handleConfigComplete = (config) => {
        setMissionConfig(config);

        // Set initial stats based on config
        setStats({
            cost: config.payload.cost + config.vehicle.cost,
            science: 0,
            safety: parseFloat(config.vehicle.reliability)
        });

        // Load the first scenario synchronously & Enrich it
        const first = getFirstScenario(selectedMission.id);
        const enrichedFirst = enrichScenarioWithConfig(first, config);
        setCurrentScenario(enrichedFirst);

        // NOW safe to switch phase
        setPhase('SCENARIO');
    };

    const handleStartBriefing = () => {
        setPhase('SETUP');
    };

    const handleChoice = (choice) => {
        setScenarioState('PROCESSING');

        // Simulate "Thinking" / Calculation time for suspense
        setTimeout(async () => {
            const outcome = evaluateDecision(choice);
            setLastOutcome(outcome);
            setGameHistory(prev => [...prev, { scenario: currentScenario, choice, outcome }]);

            // Update stats immediately
            setStats(prev => calculateScore(prev, outcome.stats));
            setScenarioState('OUTCOME');

            // Fetch AI Historical Context
            try {
                const res = await fetch(`${API_BASE_URL}/mission-history`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        scenario: { title: currentScenario.title, description: currentScenario.description },
                        choice: { text: choice.text },
                        outcome: { success: outcome.success }
                    })
                });

                if (!res.ok) {
                    throw new Error(`Server Error: ${res.status}`);
                }

                const data = await res.json();
                setHistoricalData(data);
            } catch (err) {
                console.error("Failed to fetch history:", err);
                if (err.message.includes('404') || err.name === 'SyntaxError') {
                    setHistoricalData({
                        mission: "SYSTEM UPDATE REQUIRED",
                        detail: "The Mission Control Server requires a restart to enable Neural Archives. Please run 'node server.js' again."
                    });
                } else {
                    setHistoricalData({
                        mission: "UPLINK FAILED",
                        detail: "Could not retrieve historical archives. Check connection."
                    });
                }
            }

        }, 1500);
    };

    const handleNext = () => {
        const next = getNextScenario(currentScenario.id);
        if (next) {
            // Apply Dynamic Difficulty based on Config
            const enrichedNext = enrichScenarioWithConfig(next, missionConfig);
            setCurrentScenario(enrichedNext);
            setScenarioState('CHOICE');
            setLastOutcome(null);
            setHistoricalData(null);
        } else {
            setPhase('SUMMARY');
        }
    };

    const handleRestart = () => {
        setPhase('INTRO');
        setMissionConfig(null);
        setCurrentScenario(null);
        setScenarioState('CHOICE');
        setGameHistory([]);
        setHistoricalData(null);
    };

    // Helper to render stat change indicators
    const StatChange = ({ val, type }) => {
        if (!val) return null;
        const isPoison = (type === 'cost' && val > 0) || (type !== 'cost' && val < 0);
        const color = isPoison ? 'text-red-400' : 'text-green-400';
        const sign = val > 0 ? '+' : '';
        return <span className={`text-xs ml-2 font-mono ${color}`}>({sign}{val})</span>;
    };

    // --- PHASE: MISSION SELECTION ---
    if (phase === 'MISSION_SELECT') {
        const icons = { Wind, Globe: Globe2, Zap, Shield };
        return (
            <div className="mission-simulator-container">
                <div className="sim-header">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                            <BrainCircuit className="text-blue-400" size={24} />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold tracking-[0.2em] text-white">MISSION CONTROL</h1>
                            <div className="text-[10px] text-blue-400/80 font-mono">SELECT OPERATION</div>
                        </div>
                    </div>
                    <button onClick={() => navigate('/dashboard')} className="px-4 py-2 rounded border border-white/10 hover:bg-white/5 text-xs font-mono tracking-widest transition-colors text-gray-400 hover:text-white">
                        ABORT
                    </button>
                </div>

                <div className="sim-main-grid">
                    <div className="mission-select-grid">
                        {missions.map(mission => {
                            const Icon = icons[mission.icon] || Activity;
                            return (
                                <motion.div
                                    key={mission.id}
                                    whileHover={{ scale: 1.02 }}
                                    className="relative group cursor-pointer"
                                    onClick={() => {
                                        setSelectedMission(mission);
                                        setPhase('SETUP');
                                    }}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl border border-white/20" />
                                    <div className="bg-[#0A0F1A]/90 p-8 rounded-xl border border-white/10 h-full flex flex-col gap-4 backdrop-blur-md hover:border-[color:var(--mc)]" style={{ '--mc': mission.color }}>
                                        <div className="flex justify-between items-start">
                                            <div className="p-3 rounded-lg bg-black/50 border border-white/10" style={{ color: mission.color }}>
                                                <Icon size={32} />
                                            </div>
                                            <div className="px-2 py-1 rounded text-[10px] font-bold tracking-widest border border-white/10 bg-white/5">
                                                {mission.difficulty}
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-bold text-white mb-1">{mission.title}</h3>
                                            <div className="text-xs font-mono opacity-60 uppercase tracking-wider" style={{ color: mission.color }}>{mission.subtitle}</div>
                                        </div>
                                        <p className="text-sm text-gray-400 leading-relaxed font-light">
                                            {mission.description}
                                        </p>
                                        <div className="mt-auto pt-4 flex gap-2">
                                            <div className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden">
                                                <div className="h-full bg-current transition-all duration-500 group-hover:w-full w-3/4" style={{ color: mission.color, backgroundColor: mission.color }} />
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    }

    // --- PHASE: SUMMARY ---
    if (phase === 'SUMMARY') {
        const score = stats.science + stats.safety - stats.cost;
        let rank = 'C';
        if (score > 150) rank = 'S';
        else if (score > 100) rank = 'A';
        else if (score > 50) rank = 'B';
        else if (score < 0) rank = 'F';

        return (
            <div className="mission-simulator-container">
                <div className="flex-1 flex items-center justify-center p-8">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-4xl w-full bg-[#0A0F1A]/95 border border-white/10 rounded-2xl p-12 backdrop-blur-xl relative overflow-hidden"
                    >
                        {/* Rank Watermark */}
                        <div className="absolute -right-10 -top-10 text-[20rem] font-black text-white/5 select-none pointer-events-none font-mono">
                            {rank}
                        </div>

                        <div className="text-center mb-12 relative z-10">
                            <h2 className="text-4xl font-bold text-white mb-2">MISSION DEBRIEF</h2>
                            <div className="text-blue-400 font-mono tracking-[0.5em] uppercase text-sm">Operation {selectedMission?.title} // COMPLETE</div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12 relative z-10">
                            <div className="p-6 bg-white/5 rounded-xl border border-white/10 text-center">
                                <div className="text-xs text-gray-400 uppercase tracking-widest mb-2">Final Rank</div>
                                <div className={`text-6xl font-black ${rank === 'F' ? 'text-red-500' : 'text-yellow-400'}`}>{rank}</div>
                            </div>
                            <div className="p-6 bg-white/5 rounded-xl border border-white/10 text-center">
                                <div className="text-xs text-gray-400 uppercase tracking-widest mb-2">Science Data</div>
                                <div className="text-3xl font-bold text-blue-400">+{stats.science}</div>
                                <div className="text-[10px] text-gray-500 mt-1">TB COLLECTED</div>
                            </div>
                            <div className="p-6 bg-white/5 rounded-xl border border-white/10 text-center">
                                <div className="text-xs text-gray-400 uppercase tracking-widest mb-2">Budget Delta</div>
                                <div className="text-3xl font-bold text-green-400">-${stats.cost}M</div>
                                <div className="text-[10px] text-gray-500 mt-1">OVERRUN</div>
                            </div>
                            <div className="p-6 bg-white/5 rounded-xl border border-white/10 text-center">
                                <div className="text-xs text-gray-400 uppercase tracking-widest mb-2">Crew Safety</div>
                                <div className="text-3xl font-bold text-orange-400">{stats.safety}%</div>
                                <div className="text-[10px] text-gray-500 mt-1">RATING</div>
                            </div>
                        </div>

                        <div className="flex gap-4 justify-center relative z-10">
                            <button
                                onClick={handleRestart}
                                className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-all flex items-center gap-3 uppercase tracking-widest text-sm"
                            >
                                <RefreshCw size={18} /> Re-Deploy
                            </button>
                            <button
                                onClick={() => {
                                    setPhase('MISSION_SELECT');
                                    setStats({ cost: 0, science: 0, safety: 100 });
                                }}
                                className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-lg transition-all flex items-center gap-3 uppercase tracking-widest text-sm"
                            >
                                <Globe2 size={18} /> Mission Select
                            </button>
                        </div>
                    </motion.div>
                </div>
            </div>
        );
    }

    return (
        <div className="mission-simulator-container">

            {/* PHASE 0: MISSION SELECTION (Handled by early return), INTRO removed */}

            {/* HEADER */}
            {phase !== 'MISSION_SELECT' && (
                <header className="sim-header">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/dashboard')} className="hover:text-cyan-400 transition">
                            <ArrowLeft />
                        </button>
                        <h1 className="text-lg font-bold tracking-widest text-cyan-500 flex items-center gap-2">
                            <BrainCircuit size={24} /> COMMAND CENTER <span className="text-white/30">//</span> {phase}
                        </h1>
                    </div>

                    {(phase === 'SCENARIO' || phase === 'SUMMARY') && stats && (
                        <div className="sim-stats">
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="stat-item">
                                <div className="stat-label flex items-center gap-1"><DollarSign size={10} className="text-cyan-400" /> Budget Used</div>
                                <div className={`stat-value ${stats.cost > 100 ? 'danger' : ''}`}>${stats.cost}M</div>
                            </motion.div>
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="stat-item">
                                <div className="stat-label flex items-center gap-1"><BrainCircuit size={10} className="text-purple-400" /> Science</div>
                                <div className="stat-value text-purple-200">{stats.science} TB</div>
                            </motion.div>
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="stat-item">
                                <div className="stat-label flex items-center gap-1"><Shield size={10} className={stats.safety < 50 ? 'text-red-500' : 'text-green-400'} /> Hull Integrity</div>
                                <div className={`stat-value ${stats.safety < 50 ? 'danger' : 'good'}`}>{stats.safety}%</div>
                            </motion.div>
                        </div>
                    )}

                    <button onClick={handleRestart} className="text-gray-500 hover:text-white transition">
                        <RefreshCw size={20} />
                    </button>
                </header>
            )}

            {/* MAIN CONTENT */}
            <div className="sim-main-grid">

                {/* PHASE 1: SETUP */}
                {phase === 'SETUP' && (
                    <div className="sim-game-container">
                        <MissionConfigurator onComplete={handleConfigComplete} />
                    </div>
                )}

                {/* PHASE 2: SCENARIOS */}
                {phase === 'SCENARIO' && currentScenario && (
                    <div className="sim-game-container">
                        <AnimatePresence mode="wait">

                            {/* SCENE: MAKE CHOICE */}
                            {scenarioState === 'CHOICE' && (
                                <motion.div
                                    key="choice"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="max-w-4xl mx-auto w-full"
                                >
                                    {/* Scenario Header */}
                                    <div className="mb-8 border-l-4 border-cyan-500 pl-6 py-2">
                                        <div className="text-cyan-500 text-xs font-bold tracking-[0.2em] mb-2 uppercase">
                                            Current Event // {currentScenario.id}
                                        </div>
                                        <h2 className="text-4xl font-header text-white mb-4">{currentScenario.title}</h2>
                                        <p className="text-gray-300 text-xl leading-relaxed max-w-2xl">{currentScenario.description}</p>

                                        {/* Context Tags */}
                                        <div className="flex gap-4 mt-6">
                                            {currentScenario.context && Object.entries(currentScenario.context).map(([key, val]) => (
                                                <div key={key} className="bg-white/5 px-3 py-1 rounded text-xs font-mono text-cyan-200 border border-white/10 uppercase">
                                                    {key}: <span className="text-white">{val}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Choices Grid */}
                                    <div className="decision-grid">
                                        {currentScenario.choices.map(choice => (
                                            <div
                                                key={choice.id}
                                                onClick={() => handleChoice(choice)}
                                                className="decision-card group"
                                            >
                                                <div className="flex justify-between items-start mb-4">
                                                    <h3 className="text-2xl font-bold text-white group-hover:text-cyan-400 transition-colors">{choice.text}</h3>
                                                    {choice.risk && (
                                                        <div className={`px-2 py-1 rounded text-xs font-bold bg-white/5 text-gray-400 border border-white/10`}>
                                                            RISK LEVEL: {choice.risk.failureconsequences ? 'HIGH' : 'MODERATE'}
                                                        </div>
                                                    )}
                                                </div>
                                                <p className="text-gray-400 mb-6 flex-grow">{choice.description}</p>

                                                <div className="border-t border-white/10 pt-4 mt-auto">
                                                    <div className="text-xs uppercase tracking-widest text-gray-500 mb-2">Projected Impact</div>
                                                    <div className="flex flex-wrap gap-2 text-xs font-mono">
                                                        {choice.risk.costImpact && <span className="text-yellow-500">COST: ${choice.risk.costImpact}</span>}
                                                        {choice.risk.fuelCost && <span className="text-orange-500">FUEL: -{choice.risk.fuelCost}</span>}
                                                        {choice.risk.failureconsequences && <span className="text-red-400">RISK: {choice.risk.failureconsequences}</span>}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {/* SCENE: PROCESSING */}
                            {scenarioState === 'PROCESSING' && (
                                <motion.div
                                    key="processing"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex flex-col items-center justify-center h-[60vh]"
                                >
                                    <div className="text-cyan-500 text-6xl font-black tracking-widest animate-pulse">EXECUTING_</div>
                                    <div className="mt-4 text-gray-500 font-mono">Awaiting telemetry from vehicle...</div>
                                </motion.div>
                            )}

                            {/* SCENE: OUTCOME */}
                            {scenarioState === 'OUTCOME' && lastOutcome && (
                                <motion.div
                                    key="outcome"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="max-w-6xl mx-auto w-full pt-10"
                                >
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                                        {/* Main Result Column */}
                                        <div className="lg:col-span-2 space-y-6">
                                            <div className={`p-8 rounded-lg border backdrop-blur-md relative overflow-hidden ${lastOutcome.success ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                                                {/* Status Badge */}
                                                <div className={`absolute top-0 right-0 px-6 py-2 font-black tracking-widest text-xs ${lastOutcome.success ? 'bg-green-500 text-black' : 'bg-red-500 text-white'}`}>
                                                    {lastOutcome.success ? 'MISSION CONTINUES' : 'ANOMALY DETECTED'}
                                                </div>

                                                <div className="flex items-center gap-4 mb-6">
                                                    {lastOutcome.success ? <CheckCircle size={48} className="text-green-400" /> : <AlertTriangle size={48} className="text-red-500" />}
                                                    <h2 className={`text-4xl font-black uppercase tracking-tight ${lastOutcome.success ? 'text-green-400' : 'text-red-500'}`}>{lastOutcome.title}</h2>
                                                </div>
                                                <p className="text-2xl text-white leading-relaxed mb-8 font-light">{lastOutcome.message}</p>

                                                {/* Impact Metrics */}
                                                <div className="bg-black/40 p-6 rounded-lg border border-white/5">
                                                    <div className="text-xs uppercase tracking-[0.3em] text-gray-500 mb-4 pb-2 border-b border-white/10">TELEMETRY IMPACT REPORT</div>
                                                    <div className="grid grid-cols-3 gap-8">
                                                        <div>
                                                            <div className="text-[10px] text-gray-400 uppercase mb-1">Budget Delta</div>
                                                            <div className="text-xl font-mono text-white flex items-center">
                                                                {lastOutcome.stats.cost === 0 ? 'NOMINAL' : `$${Math.abs(lastOutcome.stats.cost)}M`}
                                                                <StatChange val={lastOutcome.stats.cost} type="cost" />
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <div className="text-[10px] text-gray-400 uppercase mb-1">Science Yield</div>
                                                            <div className="text-xl font-mono text-white flex items-center">
                                                                {lastOutcome.stats.science === 0 ? 'NONE' : `${lastOutcome.stats.science} UNITS`}
                                                                <StatChange val={lastOutcome.stats.science} type="sci" />
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <div className="text-[10px] text-gray-400 uppercase mb-1">System Health</div>
                                                            <div className="text-xl font-mono text-white flex items-center">
                                                                {lastOutcome.stats.safety === 0 ? 'STABLE' : `${Math.abs(lastOutcome.stats.safety)}%`}
                                                                <StatChange val={lastOutcome.stats.safety} type="safety" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* WHAT IF CHATBOT SECTION */}
                                            {lastOutcome && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.5 }}
                                                    className="mt-8"
                                                >
                                                    <WhatIfChatbot
                                                        scenario={gameHistory[gameHistory.length - 1]?.scenario || currentScenario}
                                                        userChoice={gameHistory[gameHistory.length - 1]?.choice}
                                                        outcome={lastOutcome}
                                                    />
                                                </motion.div>
                                            )}

                                            <button
                                                onClick={handleNext}
                                                className="w-full py-5 bg-cyan-500 text-black font-black uppercase tracking-[0.3em] hover:bg-white hover:scale-[1.01] active:scale-[0.99] transition-all shadow-[0_0_30px_rgba(0,240,255,0.2)]"
                                            >
                                                Acknowledge & Proceed <ChevronRight className="inline ml-2" />
                                            </button>
                                        </div>

                                        {/* History & Context Column */}
                                        <div className="space-y-6">
                                            <div className="relative h-full bg-slate-900/40 border border-white/10 p-8 rounded-lg backdrop-blur-sm">
                                                <div className="flex items-center gap-2 text-blue-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-8 pb-4 border-b border-white/5">
                                                    <Activity size={14} /> HISTORICAL ARCHIVE
                                                </div>

                                                {historicalData ? (
                                                    <div className="space-y-6">
                                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                                            <div className="text-gray-500 text-[10px] uppercase mb-1 tracking-widest">REAL-LIFE MISSION</div>
                                                            <h3 className="text-2xl text-white font-bold">{historicalData.mission}</h3>
                                                        </motion.div>

                                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                                                            <div className="text-gray-500 text-[10px] uppercase mb-1 tracking-widest">THE EVENT</div>
                                                            <p className="text-gray-300 text-lg leading-relaxed font-light mb-6">
                                                                {historicalData.detail}
                                                            </p>
                                                        </motion.div>

                                                        {historicalData.solution && (
                                                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
                                                                <div className="text-gray-500 text-[10px] uppercase mb-1 tracking-widest">REAL-WORLD SOLUTION</div>
                                                                <p className="text-cyan-200 text-sm leading-relaxed border-l-2 border-cyan-500 pl-3">
                                                                    {historicalData.solution}
                                                                </p>
                                                            </motion.div>
                                                        )}

                                                        {historicalData.outcome && (
                                                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="mt-6 pt-6 border-t border-white/10">
                                                                <div className="text-gray-500 text-[10px] uppercase mb-1 tracking-widest">HISTORICAL OUTCOME</div>
                                                                <div className="text-xl font-bold text-white tracking-wide">
                                                                    {historicalData.outcome}
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-20 animate-pulse">
                                                        <Activity className="mx-auto text-cyan-500 mb-4 animate-spin" size={32} />
                                                        <p className="text-cyan-400 font-mono text-xs tracking-widest">DECRYPTING ARCHIVES...</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}

            </div>
        </div >
    );
};

export default MissionSimulator;
