import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Cpu, Terminal, Zap } from 'lucide-react';
import { API_BASE_URL } from '../../services/api';

const WhatIfChatbot = ({ scenario, userChoice, outcome }) => {
    const [messages, setMessages] = useState([
        {
            id: 'init',
            role: 'system',
            text: `DIVERGENCE ANALYSIS MODULE ONLINE.\nI can simulate alternative timelines based on the Mission parameters.\n\nAsk me: "What if I chose the other option?"`
        }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMsg = { id: Date.now(), role: 'user', text: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const res = await fetch(`${API_BASE_URL}/mission-whatif`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    scenario,
                    userChoice,
                    outcome,
                    question: userMsg.text
                })
            });
            const data = await res.json();

            const aiMsg = {
                id: Date.now() + 1,
                role: 'system',
                text: data.reply || "Analysis Failed: Connection interrupted."
            };
            setMessages(prev => [...prev, aiMsg]);
        } catch (err) {
            setMessages(prev => [...prev, { id: Date.now() + 1, role: 'system', text: "ERROR: Sim Link Offline." }]);
        }
        setLoading(false);
    };

    return (
        <div className="w-full h-96 bg-black/40 border border-[#F97316]/30 rounded-lg flex flex-col overflow-hidden backdrop-blur-md shadow-[0_0_30px_rgba(249,115,22,0.1)]">
            {/* Header */}
            <div className="p-3 bg-[#F97316]/10 border-b border-[#F97316]/20 flex items-center gap-3">
                <Cpu size={18} className="text-[#F97316] animate-pulse" />
                <span className="text-xs font-mono font-bold text-[#F97316] tracking-[0.2em] uppercase">
                    SIMULATION_AI // WHAT_IF
                </span>
            </div>

            {/* Chat Area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
                {messages.map((msg) => (
                    <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div className={`max-w-[80%] rounded-lg p-3 text-sm font-mono leading-relaxed ${msg.role === 'user'
                                ? 'bg-[#F97316]/20 text-white border border-[#F97316]/40'
                                : 'bg-black/60 text-[#F97316]/90 border border-[#F97316]/20'
                            }`}>
                            {msg.role === 'system' && <Terminal size={12} className="inline mr-2 mb-0.5 opacity-50" />}
                            {msg.text.split('\n').map((line, i) => (
                                <span key={i} className="block">{line}</span>
                            ))}
                        </div>
                    </motion.div>
                ))}
                {loading && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                        <div className="bg-black/60 border border-[#F97316]/10 px-4 py-2 rounded-lg flex items-center gap-2">
                            <div className="w-2 h-2 bg-[#F97316] rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                            <div className="w-2 h-2 bg-[#F97316] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                            <div className="w-2 h-2 bg-[#F97316] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-3 bg-black/40 border-t border-[#F97316]/20 flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about alternative outcomes..."
                    className="flex-1 bg-transparent border border-white/10 rounded px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-[#F97316]/50 placeholder-white/20"
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="p-2 bg-[#F97316]/20 text-[#F97316] rounded hover:bg-[#F97316]/40 transition disabled:opacity-50"
                >
                    <Send size={18} />
                </button>
            </form>
        </div>
    );
};

export default WhatIfChatbot;
