import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, ArrowRight, RefreshCcw, CheckCircle2, XCircle, Award, Layers, Globe, Zap, Rocket, ChevronLeft } from 'lucide-react';
import { quizzes, quizCategories } from '../data/learningData';

const SpaceExam = () => {
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
    const [score, setScore] = useState(0);
    const [showResult, setShowResult] = useState(false);
    const [selectedOption, setSelectedOption] = useState(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [randomizedQuestions, setRandomizedQuestions] = useState([]);
    const [loadingQuiz, setLoadingQuiz] = useState(false);

    // Fetch dynamic AI quizzes when a category is selected
    useState(() => {
        if (!selectedCategory) return;
        const fetchQuiz = async () => {
            setLoadingQuiz(true);
            try {
                const res = await fetch(`http://localhost:5000/api/academy/quizzes/${selectedCategory}`);
                const data = await res.json();
                setRandomizedQuestions(data);
            } catch (err) {
                console.error('Failed to sync intelligence pool');
            } finally {
                setLoadingQuiz(false);
            }
        };
        fetchQuiz();
    }, [selectedCategory]);

    const questionData = randomizedQuestions[currentQuestionIdx];

    const handleOptionClick = (option) => {
        if (isAnswered) return;
        setSelectedOption(option);
        setIsAnswered(true);
        if (option === questionData.answer) setScore(score + 1);
    };

    const handleNext = () => {
        const nextQuestion = currentQuestionIdx + 1;
        if (nextQuestion < randomizedQuestions.length) {
            setCurrentQuestionIdx(nextQuestion);
            setSelectedOption(null);
            setIsAnswered(false);
        } else {
            setShowResult(true);
        }
    };

    const resetQuiz = () => {
        setSelectedCategory(null);
        setCurrentQuestionIdx(0);
        setScore(0);
        setShowResult(false);
        setSelectedOption(null);
        setIsAnswered(false);
    };

    const getRank = () => {
        const pct = (score / randomizedQuestions.length) * 100;
        if (pct === 100) return 'COMMANDER';
        if (pct >= 80) return 'LT. COMMANDER';
        if (pct >= 60) return 'ANALYST';
        if (pct >= 40) return 'SPECIALIST';
        return 'CADET';
    };

    const getIcon = (iconName) => {
        switch (iconName) {
            case 'Layers': return <Layers size={24} />;
            case 'Globe': return <Globe size={24} />;
            case 'Zap': return <Zap size={24} />;
            case 'Rocket': return <Rocket size={24} />;
            default: return <Rocket size={24} />;
        }
    }

    return (
        <div className="w-full h-full p-8 flex flex-col glass-panel border border-white/10 bg-[#0a0f18]/90 overflow-hidden relative">
            <AnimatePresence mode="wait">
                {!selectedCategory ? (
                    <motion.div
                        key="category-select"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="flex-1 flex flex-col"
                    >
                        <div className="mb-8">
                            <h3 className="text-cyan-400 font-mono text-[10px] tracking-widest uppercase mb-1">Certification Protocol</h3>
                            <h2 className="text-3xl font-bold text-white tracking-wider">SELECT SPECIALIZATION</h2>
                            <p className="text-white/40 text-sm mt-2">Choose a field of study to begin your orbital rank evaluation.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {quizCategories.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className="flex items-center gap-6 p-6 rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-cyan-500/5 hover:border-cyan-500/40 transition-all group text-left"
                                >
                                    <div className="p-4 rounded-xl bg-white/5 group-hover:bg-cyan-500/10 group-hover:text-cyan-400 transition-colors">
                                        {getIcon(cat.icon)}
                                    </div>
                                    <div>
                                        <div className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors uppercase">{cat.title}</div>
                                        <div className="text-[10px] text-white/30 font-mono mt-1">10 RAD-SORTED QUESTIONS</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </motion.div>
                ) : loadingQuiz ? (
                    <motion.div
                        key="quiz-loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex-1 flex flex-col items-center justify-center gap-6"
                    >
                        <RefreshCcw size={48} className="text-cyan-400 animate-spin" />
                        <div className="text-center">
                            <div className="text-xs font-mono text-cyan-400 animate-pulse tracking-[0.5em] uppercase mb-2">Syncing Intelligence Pool</div>
                            <div className="text-[10px] text-white/30 uppercase font-mono">Verifying Technical Constants via Groq Engine...</div>
                        </div>
                    </motion.div>
                ) : !showResult && randomizedQuestions.length > 0 ? (
                    <motion.div
                        key="question-view"
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -20, opacity: 0 }}
                        className="flex-1 flex flex-col"
                    >
                        {/* HUD Header */}
                        <div className="flex justify-between items-center mb-8 pb-6 border-b border-white/5">
                            <button onClick={resetQuiz} className="flex items-center gap-2 text-white/40 hover:text-white transition-colors">
                                <ChevronLeft size={16} /> <span className="text-[10px] font-mono uppercase tracking-widest">Abort Exam</span>
                            </button>
                            <div className="text-right">
                                <div className="text-[10px] text-cyan-400 font-mono tracking-widest uppercase mb-2">TELEMETRY_SYNC: {currentQuestionIdx + 1}/10</div>
                                <div className="flex gap-1 h-1">
                                    {randomizedQuestions.map((_, i) => (
                                        <div key={i} className={`flex-1 transition-all duration-500 ${i <= currentQuestionIdx ? 'bg-cyan-500' : 'bg-white/10'}`} />
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 flex flex-col">
                            <h3 className="text-2xl text-white mb-10 font-light italic leading-relaxed">"{questionData.question}"</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 content-start">
                                {questionData.options.map((option, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleOptionClick(option)}
                                        disabled={isAnswered}
                                        className={`
                        p-6 rounded-xl border text-left transition-all duration-300 relative group
                        ${selectedOption === option
                                                ? (option === questionData.answer ? 'bg-green-500/20 border-green-500 text-green-400' : 'bg-red-500/20 border-red-500 text-red-400')
                                                : (isAnswered && option === questionData.answer ? 'bg-green-500/10 border-green-500/40 text-green-400' : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:border-white/20')}
                      `}
                                    >
                                        <div className="flex justify-between items-center">
                                            <span className="font-mono text-sm tracking-wide">{option}</span>
                                            {isAnswered && option === questionData.answer && <CheckCircle2 size={18} className="text-green-500" />}
                                            {isAnswered && selectedOption === option && option !== questionData.answer && <XCircle size={18} className="text-red-500" />}
                                        </div>
                                    </button>
                                ))}
                            </div>

                            <AnimatePresence shadow>
                                {isAnswered && (
                                    <motion.div
                                        initial={{ y: 10, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        className="mt-8 p-4 bg-cyan-500/5 border-l-2 border-cyan-500 rounded-r-lg"
                                    >
                                        <div className="text-[9px] font-mono text-cyan-400 mb-1 uppercase tracking-widest">Technical Breakdown</div>
                                        <p className="text-xs text-white/70 leading-relaxed italic">{questionData.explanation}</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="mt-8 flex justify-end">
                            <button
                                onClick={handleNext}
                                disabled={!isAnswered}
                                className={`
                  flex items-center gap-3 px-10 py-4 rounded-full font-bold tracking-[0.2em] transition-all
                  ${isAnswered ? 'bg-cyan-500 text-black shadow-[0_0_20px_rgba(0,240,255,0.4)]' : 'bg-white/5 text-white/20 cursor-not-allowed border border-white/5'}
                `}
                            >
                                {currentQuestionIdx === randomizedQuestions.length - 1 ? 'FINALIZE PROTOCOL' : 'CONTINUE SEQUENCE'}
                                <ArrowRight size={20} />
                            </button>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="results"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="flex-1 flex flex-col items-center justify-center text-center"
                    >
                        <div className="relative mb-10">
                            <Trophy size={120} className="text-yellow-400 drop-shadow-[0_0_40px_rgba(250,204,21,0.3)]" />
                            <div className="absolute -bottom-4 -right-4 bg-black p-2 rounded-full border border-cyan-500/50">
                                <Award size={40} className="text-cyan-400" />
                            </div>
                        </div>

                        <h2 className="text-5xl font-bold text-white mb-2 tracking-tighter">MISSION DEBRIEF</h2>
                        <div className="font-mono text-cyan-400 tracking-[0.5em] text-sm mb-12">ASSIGNED RANK: {getRank()}</div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-3xl mb-12">
                            <div className="glass-panel p-6 border border-white/10 bg-white/5">
                                <div className="text-[10px] text-white/40 font-mono mb-2 tracking-widest uppercase">Sync Accuracy</div>
                                <div className="text-4xl font-bold text-green-400">{score * 10}%</div>
                            </div>
                            <div className="glass-panel p-6 border border-white/10 bg-white/5">
                                <div className="text-[10px] text-white/40 font-mono mb-2 tracking-widest uppercase">Telemetry Pass</div>
                                <div className="text-4xl font-bold text-white">{score}/10</div>
                            </div>
                            <div className="glass-panel p-6 border border-white/10 bg-white/5">
                                <div className="text-[10px] text-white/40 font-mono mb-2 tracking-widest uppercase">System Status</div>
                                <div className="text-4xl font-bold text-cyan-400">{score >= 6 ? 'CERTIFIED' : 'FAILED'}</div>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={resetQuiz}
                                className="flex items-center gap-2 px-8 py-4 rounded-full border border-white/20 hover:bg-white/10 transition-all font-mono text-[10px] tracking-[0.2em] uppercase"
                            >
                                <RefreshCcw size={16} /> Re-Initialize Exam
                            </button>
                            <button
                                onClick={resetQuiz}
                                className="group flex items-center gap-3 px-10 py-4 rounded-full bg-cyan-500 text-black font-bold tracking-[0.2em] shadow-[0_0_30px_rgba(0,240,255,0.3)]"
                            >
                                RETURN TO ACADEMY <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Decorative Lines */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
            <div className="absolute bottom-0 right-0 w-1/3 h-[1px] bg-cyan-500/20" />
        </div>
    );
};

export default SpaceExam;
