import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { MessageSquare, Mic, MicOff, Volume2, VolumeX, X, Send } from 'lucide-react';

const SpaceChatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'system', content: "Greetings, Explorer. I am Cosmos 🌌. Ask me anything about the universe!" }
    ]);
    const [input, setInput] = useState("");
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const messagesEndRef = useRef(null);
    const synthesisRef = useRef(window.speechSynthesis);
    const recognitionRef = useRef(null);

    // Scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Initialize Speech Recognition
    useEffect(() => {
        if ('webkitSpeechRecognition' in window) {
            const recognition = new window.webkitSpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = 'en-US';

            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                setInput(transcript);
                handleSend(transcript, true); // Auto-send + Auto-speak on voice
            };

            recognition.onend = () => setIsListening(false);
            recognitionRef.current = recognition;
        }
    }, []);

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current?.stop();
        } else {
            recognitionRef.current?.start();
            setIsListening(true);
        }
    };

    const speak = (text) => {
        if (synthesisRef.current.speaking) {
            synthesisRef.current.cancel();
            setIsSpeaking(false);
            return;
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.onend = () => setIsSpeaking(false);

        setIsSpeaking(true);
        synthesisRef.current.speak(utterance);
    };

    const handleSend = async (textOverride = null, autoSpeak = false) => {
        const msgText = textOverride || input;
        if (!msgText.trim()) return;

        // Add User Message
        const newMessages = [...messages, { role: 'user', content: msgText }];
        setMessages(newMessages);
        setInput("");
        setIsLoading(true);

        try {
            const res = await axios.post('/api/chat', { message: msgText });
            const botReply = res.data.reply || "I am having trouble connecting to the star network.";

            setMessages(prev => [...prev, { role: 'system', content: botReply }]);

            // Only speak if triggered by Voice Input
            if (autoSpeak) {
                speak(botReply);
            }

        } catch (err) {
            console.error(err);
            let errorMsg = "Error: Connection lost.";

            if (err.message === "Network Error") {
                errorMsg = "Error: Network Blocked (Possible Mixed Content).";
            } else if (err.response) {
                errorMsg = `Error: ${err.response.status} - ${err.response.data.error || 'Server Fault'}`;
            }

            setMessages(prev => [...prev, { role: 'system', content: errorMsg }]);
            if (autoSpeak) speak("I cannot reach the server.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* Activation Button (Floating) */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-[0_0_20px_rgba(120,50,255,0.5)] hover:scale-110 transition-transform flex items-center gap-2"
                >
                    <MessageSquare size={24} />
                    <span className="font-bold hidden md:block">Ask Cosmos</span>
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-6 right-6 z-50 w-[90vw] md:w-96 h-[500px] bg-black/90 backdrop-blur-xl border border-purple-500/30 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-slide-up">

                    {/* Header */}
                    <div className="p-4 bg-purple-900/20 border-b border-purple-500/20 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <h3 className="font-mono text-purple-300 font-bold">COSMOS AI</h3>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white"><X size={20} /></button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-purple-900">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] p-3 rounded-xl text-sm ${msg.role === 'user'
                                        ? 'bg-purple-600 text-white rounded-tr-none'
                                        : 'bg-gray-800 text-gray-200 rounded-tl-none border border-gray-700'
                                    }`}>
                                    {msg.content}
                                    {msg.role === 'system' && idx > 0 && (
                                        <button onClick={() => speak(msg.content)} className="ml-2 mt-1 opacity-50 hover:opacity-100 block">
                                            {isSpeaking ? <Volume2 size={12} className="text-green-400 animate-pulse" /> : <Volume2 size={12} />}
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                        {isLoading && <div className="text-xs text-purple-400 animate-pulse ml-2">Cosmos is thinking...</div>}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 border-t border-purple-500/20 bg-black/50">
                        <div className="flex gap-2">
                            <button
                                onClick={toggleListening}
                                className={`p-3 rounded-full transition-colors ${isListening ? 'bg-red-500 animate-pulse' : 'bg-gray-800 hover:bg-gray-700'}`}
                            >
                                {isListening ? <MicOff size={20} className="text-white" /> : <Mic size={20} className="text-purple-400" />}
                            </button>

                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Ask about the stars..."
                                className="flex-1 bg-gray-900/50 border border-gray-700 rounded-xl px-4 text-white focus:outline-none focus:border-purple-500 transition-colors placeholder-gray-600"
                            />

                            <button
                                onClick={() => handleSend()}
                                className="p-3 bg-purple-600 hover:bg-purple-500 rounded-full text-white transition-colors"
                            >
                                <Send size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default SpaceChatbot;
