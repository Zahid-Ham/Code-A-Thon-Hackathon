import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, ActivityIndicator, Alert, Platform } from 'react-native';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import { Ionicons } from '@expo/vector-icons'; // Or lucide-react-native if installed, usually Ionicons is standard in Expo
import Constants from 'expo-constants';

// Dynamic IP Detection (Dev Mode)
const getApiUrl = () => {
    // In production, valid URL. In Dev, usage Metro IP.
    if (process.env.EXPO_PUBLIC_API_URL) return process.env.EXPO_PUBLIC_API_URL;
    
    const debuggerHost = Constants.expoConfig?.hostUri || Constants.manifest?.debuggerHost;
    
    if (debuggerHost) {
        const ip = debuggerHost.split(':')[0];
        // Use the detected IP with port 5000
        return `http://${ip}:5000/api`;
    }
    
    // Fallback for Emulator or if detection fails
    return Platform.OS === 'android' ? 'http://10.0.2.2:5000/api' : 'http://localhost:5000/api';
};

const API_URL = getApiUrl();
console.log("Dynamic API URL:", API_URL);

const VoiceChatbot = () => {
    const [recording, setRecording] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isListening, setIsListening] = useState(false);

    // VAD State
    const silenceTimer = useRef(null);
    const hasSpoken = useRef(false);
    const lastMetering = useRef(-160);

    useEffect(() => {
        (async () => {
            await Audio.requestPermissionsAsync();
            // Initial Greeting
            speak("Systems online. Ready.");
        })();
    }, []);

    const startRecording = async () => {
        try {
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });

            // Clean state
            hasSpoken.current = false;

            const { recording } = await Audio.Recording.createAsync(
                Audio.RecordingOptionsPresets.HIGH_QUALITY,
                (status) => handleVAD(status)
            );
            setRecording(recording);
            setIsListening(true);
        } catch (err) {
            console.error('Failed to start recording', err);
        }
    };

    const handleVAD = async (status) => {
        if (!status.isRecording) return;

        const metering = status.metering; 
        lastMetering.current = metering;
        
        // RELAXED Thresholds (More sensitive to speech, less sensitive to silence)
        const SPEECH_THRESHOLD = -45; // Easier to trigger
        const SILENCE_THRESHOLD = -55; // Harder to accidentally stop

        // 1. Detect Speech Start
        if (metering > SPEECH_THRESHOLD) {
            hasSpoken.current = true;
            if (silenceTimer.current) {
                clearTimeout(silenceTimer.current);
                silenceTimer.current = null;
            }
        }

        // 2. Detect Silence (Only if already spoken)
        // Increased timeout to 2.5s to prevent cutting off mid-sentence
        if (hasSpoken.current && metering < SILENCE_THRESHOLD) {
            if (!silenceTimer.current) {
                silenceTimer.current = setTimeout(() => {
                    stopAndSend(status.durationMillis); 
                }, 2500); 
            }
        }
    };

    const stopAndSend = async (duration) => {
        console.log("Auto-Stopping... Duration:", duration);
        // Minimum duration check (avoid immediate trigger)
        if (duration < 1000) { 
             console.log("Ignored short noise");
             return; 
        }
        handlePress(true); 
    };

    const stopRecording = async () => {
        if (!recording) return;
        
        if (silenceTimer.current) clearTimeout(silenceTimer.current);

        setIsListening(false);
        setIsProcessing(true); 

        try {
            await recording.stopAndUnloadAsync();
            const uri = recording.getURI(); 
            setRecording(null);
            
            // Validate File
            if (!uri) throw new Error("No recording URI");
            console.log("Audio URI:", uri);

            await processAudio(uri);
        } catch (error) {
            console.log("Stop Error:", error);
            setIsProcessing(false);
            Alert.alert("Error", "Failed to stop recording.");
        }
    };

    const processAudio = async (uri) => {
        try {
            const formData = new FormData();
            formData.append('audio', {
                uri: uri,
                type: 'audio/m4a', 
                name: 'voice_query.m4a',
            });

            console.log("Uploading to:", `${API_URL}/transcribe`);

            const transRes = await fetch(`${API_URL}/transcribe`, {
                method: 'POST',
                headers: { 'Content-Type': 'multipart/form-data' },
                body: formData
            });

            if (!transRes.ok) {
                // If 404/500, throw specific error
                throw new Error(`Server Error: ${transRes.status}`);
            }

            const transData = await transRes.json();
            
            // Handle Empty Speech Gracefully
            if (!transData.text || transData.text.trim().length === 0) {
                console.log("Empty transcription");
                speak("I didn't hear anything.");
                setIsProcessing(false);
                return;
            }
            
            console.log("User said:", transData.text);

            // 2. Chat
            const chatRes = await fetch(`${API_URL}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: transData.text, mobileMode: true })
            });

            const chatData = await chatRes.json();
            const reply = chatData.reply || "I didn't copy that.";

            setIsProcessing(false);
            speak(reply);

        } catch (e) {
            console.error("Process Audio Error:", e);
            setIsProcessing(false);
            
            // UX: Don't crash, just inform
            if (e.message.includes("Network request failed")) {
                Alert.alert("Connection Error", `Cannot reach PC at ${API_URL}.\nCheck Wi-Fi or Firewall.`);
                speak("Connection lost.");
            } else {
                 speak("System error.");
            }
        }
    };

    const speak = (text) => {
        setIsSpeaking(true);
        Speech.speak(text, {
            language: 'en-US',
            pitch: 1.0,
            rate: 1.0,
            onDone: () => setIsSpeaking(false),
            onError: () => setIsSpeaking(false)
        });
    };
    
    // Check Connection on Mount
    useEffect(() => {
        const checkConnection = async () => {
             try {
                 // Simple Ping (Fetch Home)
                 // Or just assume if transcribe works later.
                 // Let's use transcribe with no data? No.
                 // We'll just greet.
                 speak("Systems online. Ready.");
             } catch (e) {
                 console.log("Init Error");
             }
        };
        
        (async () => {
             await Audio.requestPermissionsAsync();
             checkConnection();
        })();
    }, []);

    // Main Toggle
    const handlePress = (forceStop = false) => {
        if (isProcessing) return;
        if (isSpeaking) {
            Speech.stop();
            setIsSpeaking(false);
            return;
        }

        if (recording || forceStop) {
            stopRecording();
        } else {
            startRecording();
        }
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity 
                activeOpacity={0.7}
                onPress={() => handlePress()}
                style={[
                    styles.button, 
                    isListening ? styles.listening : (isProcessing ? styles.processing : styles.idle)
                ]}
            >
                {isProcessing ? (
                     <ActivityIndicator size="small" color="black" />
                ) : (
                    <Text style={styles.icon}>
                        {isListening ? "👂" : (isSpeaking ? "🔊" : "🎙️")}
                    </Text>
                )}
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 120, // Moved Up to avoid overlap
        right: 20,
        zIndex: 200, 
    },
    button: {
        width: 65,
        height: 65,
        borderRadius: 35,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 5,
        elevation: 10,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.8)'
    },
    idle: {
        backgroundColor: '#00D4FF', // Cyan
    },
    listening: {
        backgroundColor: '#FF3B30', // Red (Recording)
        borderColor: '#FFD700',
        transform: [{ scale: 1.1 }]
    },
    processing: {
        backgroundColor: '#FFCC00', // Gold
    },
    icon: {
        fontSize: 28,
        color: 'black'
    }
});

export default VoiceChatbot;
