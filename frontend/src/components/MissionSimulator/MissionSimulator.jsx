import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getFirstScenario, getNextScenario } from './ScenarioEngine';
import { evaluateDecision, calculateScore } from './DecisionEvaluator';
import MissionConfigurator from './common/MissionConfigurator';
import './MissionSimulator.css';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, AlertTriangle, CheckCircle, Activity, Play, BarChart2, Shield, DollarSign, BrainCircuit, ChevronRight, Wind, Zap, AlertOctagon } from 'lucide-react';

const MissionSimulator = () => {
    const navigate = useNavigate();

    // States: INTRO -> SETUP -> SCENARIO -> SUMMARY
    const [phase, setPhase] = useState('INTRO');
    const [missionConfig, setMissionConfig] = useState(null);
    const [currentScenario, setCurrentScenario] = useState(null);

    const [currentStats, setCurrentStats] = useState({ cost: 0, science: 0, safety: 100 });
    const [scenarioState, setScenarioState] = useState('CHOICE'); // CHOICE, PROCESSING, OUTCOME
    const [lastOutcome, setLastOutcome] = useState(null);
    const [gameHistory, setGameHistory] = useState([]);

    // Load first scenario immediately when config is done
    const handleConfigComplete = (config) => {
        setMissionConfig(config);

        // Set initial stats based on config
        setCurrentStats({
            cost: config.payload.cost + config.vehicle.cost,
            science: 0,
            safety: parseFloat(config.vehicle.reliability)
        });

        // Load the first scenario synchronously
        const first = getFirstScenario();
        setCurrentScenario(first);

        // NOW safe to switch phase
        setPhase('SCENARIO');
    };

    const handleStartBriefing = () => {
        setPhase('SETUP');
    };

    const handleChoice = (choice) => {
        setScenarioState('PROCESSING');

        // Simulate "Thinking" / Calculation time for suspense
        setTimeout(() => {
            const outcome = evaluateDecision(choice);
            setLastOutcome(outcome);
            setGameHistory(prev => [...prev, { scenario: currentScenario, choice, outcome }]);

            // Update stats immediately
            setCurrentStats(prev => calculateScore(prev, outcome.stats));
            setScenarioState('OUTCOME');
        }, 1500);
    };

    const handleNext = () => {
        const next = getNextScenario(currentScenario.id);
        if (next) {
            setCurrentScenario(next);
            setScenarioState('CHOICE');
            setLastOutcome(null);
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
    };

    // Helper to render stat change indicators
    const StatChange = ({ val, type }) => {
        if (!val) return null;
        const isPoison = (type === 'cost' && val > 0) || (type !== 'cost' && val < 0);
        const color = isPoison ? 'text-red-400' : 'text-green-400';
        const sign = val > 0 ? '+' : '';
        return <span className={`text-xs ml-2 font-mono ${color}`}>({sign}{val})</span>;
    };

    return (
        <div className="mission-simulator-container">

            {/* PHASE 0: INTRO BRIEFING */}
            {phase === 'INTRO' && (
                <div className="briefing-overlay">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="briefing-card"
                    >
                        <div className="text-cyan-500 font-mono text-sm tracking-widest mb-4 flex items-center justify-center gap-2">
                            <AlertOctagon size={16} /> CLASSIFIED // LEVEL 5 ACCESS
                        </div>
                        <h1 className="briefing-title">OPERATION SKYFALL</h1>
                        <div className="briefing-prob">
                            <p className="mb-4"><strong>SITUATION:</strong> A catastrophic Category 5 hurricane is forming faster than models predicted. Ground telemetry is partial.</p>
                            <p className="mb-4"><strong>MISSION:</strong> Take full command of Mission Control. You will design the mission, launch the satellite, and navigate all critical anomalies.</p>
                            <p><strong>STAKES:</strong> Every decision has consequences. You will deal with budget constraints, political pressure, and technical failures based on <strong>real historical spaceflight events</strong>.</p>
                        </div>
                        <button onClick={handleStartBriefing} className="briefing-btn flex items-center gap-2 mx-auto">
                            <Play size={20} fill="black" /> INITIALIZE
                        </button>
                    </motion.div>
                </div>
            )}


            {/* HEADER */}
            {phase !== 'INTRO' && (
                <header className="sim-header">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/dashboard')} className="hover:text-cyan-400 transition">
                            <ArrowLeft />
                        </button>
                        <h1 className="text-lg font-bold tracking-widest text-cyan-500 flex items-center gap-2">
                            <BrainCircuit size={24} /> COMMAND CENTER <span className="text-white/30">//</span> {phase}
                        </h1>
                    </div>

                    {(phase === 'SCENARIO' || phase === 'SUMMARY') && currentStats && (
                        <div className="sim-stats">
                            <div className="stat-item">
                                <div className="stat-label flex items-center gap-1"><DollarSign size={10} /> Budget Used</div>
                                <div className="stat-value text-white">${currentStats.cost}M</div>
                            </div>
                            <div className="stat-item">
                                <div className="stat-label flex items-center gap-1"><BarChart2 size={10} /> Science</div>
                                <div className="stat-value text-green-400">{currentStats.science}</div>
                            </div>
                            <div className="stat-item">
                                <div className="stat-label flex items-center gap-1"><Shield size={10} /> Vehicle Health</div>
                                <div className="stat-value text-cyan-400">{currentStats.safety}%</div>
                            </div>
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
                                                        <div className={`px-2 py-1 rounded text-xs font-bold ${choice.risk.successChance < 0.5 ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                                                            {Math.round(choice.risk.successChance * 100)}% SUCCESS RATE
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

                                            {/* WHAT IF SECTION */}
                                            {lastOutcome.whatIf && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.5 }}
                                                    className="p-8 rounded-lg bg-orange-500/5 border border-orange-500/20"
                                                >
                                                    <div className="flex items-center gap-2 text-orange-400 text-xs font-bold uppercase tracking-widest mb-4">
                                                        <Zap size={14} /> The "What If" Scenario
                                                    </div>
                                                    <p className="text-orange-100/70 text-lg italic leading-relaxed">
                                                        {lastOutcome.whatIf}
                                                    </p>
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

                                                {lastOutcome.realLifePrecedent ? (
                                                    <div className="space-y-6">
                                                        <div>
                                                            <div className="text-gray-500 text-[10px] uppercase mb-1 tracking-widest">REAL-LIFE MISSION</div>
                                                            <h3 className="text-2xl text-white font-bold">{lastOutcome.realLifePrecedent.mission}</h3>
                                                        </div>

                                                        <div>
                                                            <div className="text-gray-500 text-[10px] uppercase mb-1 tracking-widest">THE EVENT</div>
                                                            <p className="text-gray-300 text-lg leading-relaxed font-light">
                                                                {lastOutcome.realLifePrecedent.detail}
                                                            </p>
                                                        </div>

                                                        <div className="mt-8 p-4 bg-white/5 rounded border-l-2 border-cyan-500/50">
                                                            <div className="text-cyan-500 text-[10px] font-bold uppercase mb-2">Simulation Accuracy</div>
                                                            <p className="text-xs text-gray-400 leading-relaxed">
                                                                This event is based on verified NASA/SpaceX telemetry and historical reports. Your decision mirrors the high-stakes trade-offs faced by Flight Directors.
                                                            </p>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-20">
                                                        <Wind className="mx-auto text-white/5 mb-4" size={48} />
                                                        <p className="text-gray-500 italic">Historical data encrypted or unavailable for this specific sequence.</p>
                                                    </div>
                                                )}

                                                <div className="mt-auto pt-8">
                                                    <div className="text-[10px] text-gray-700 font-mono mb-2">SECURE_LOG_REF</div>
                                                    <div className="font-mono text-[9px] text-cyan-500/30 break-all bg-black/20 p-2 rounded">
                                                        {btoa(JSON.stringify({ id: currentScenario.id, outcome: lastOutcome.title })).substring(0, 64)}...
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}

                {/* PHASE 3: SUMMARY */}
                {phase === 'SUMMARY' && (
                    <div className="sim-game-container flex items-center justify-center">
                        <div className="max-w-2xl w-full bg-slate-900/50 p-10 border border-white/10 rounded-xl backdrop-blur-xl text-center">
                            <h2 className="text-4xl font-bold text-white mb-2">MISSION REPORT</h2>
                            <div className="text-xl text-cyan-400 font-mono mb-8">OPERATION COMPLETE</div>

                            <div className="grid grid-cols-3 gap-4 mb-10">
                                <div className="p-4 bg-white/5 rounded">
                                    <div className="text-gray-400 text-sm uppercase tracking-widest mb-1">Final Cost</div>
                                    <div className="text-2xl text-white font-mono">${currentStats.cost}M</div>
                                </div>
                                <div className="p-4 bg-white/5 rounded">
                                    <div className="text-gray-400 text-sm uppercase tracking-widest mb-1">Science Data</div>
                                    <div className="text-2xl text-green-400 font-mono">{currentStats.science}</div>
                                </div>
                                <div className="p-4 bg-white/5 rounded">
                                    <div className="text-gray-400 text-sm uppercase tracking-widest mb-1">Vehicle State</div>
                                    <div className="text-2xl text-cyan-400 font-mono">{currentStats.safety}%</div>
                                </div>
                            </div>

                            <button onClick={handleRestart} className="px-8 py-3 bg-cyan-500 text-black font-bold uppercase tracking-widest hover:bg-white transition-colors">
                                New Mission
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default MissionSimulator;

