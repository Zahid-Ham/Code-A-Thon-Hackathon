import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

const SoundContext = createContext();

export const useSound = () => useContext(SoundContext);

export const SoundProvider = ({ children }) => {
  const [isMuted, setIsMuted] = useState(true);
  
  // Refs for audio elements to avoid re-creation
  const hoverAudio = useRef(new Audio('/sounds/hover.mp3'));
  const warpAudio = useRef(new Audio('/sounds/warp.mp3'));

  useEffect(() => {
    // Preload audio
    hoverAudio.current.load();
    warpAudio.current.load();
    
    // Set volumes
    hoverAudio.current.volume = 0.2; // Subtle hover
    warpAudio.current.volume = 0.5; // Louder warp
  }, []);

  const playHover = () => {
    if (isMuted) return;
    // Clone node to allow rapid re-triggering if needed, or just reset time
    if (hoverAudio.current.paused) {
        hoverAudio.current.play().catch(e => console.log("Audio play failed (interaction needed first)", e));
    } else {
        hoverAudio.current.currentTime = 0;
    }
  };

  const playWarp = () => {
    if (isMuted) return;
    warpAudio.current.currentTime = 0;
    warpAudio.current.play().catch(e => console.log("Audio play failed", e));
  };

  const toggleMute = () => setIsMuted(!isMuted);

  return (
    <SoundContext.Provider value={{ isMuted, playHover, playWarp, toggleMute }}>
      {children}
      {/* Sound Toggle UI Button - Fixed Absolute Position */}
      <div 
        onClick={toggleMute}
        className="fixed bottom-6 right-6 z-50 p-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 cursor-pointer transition-colors backdrop-blur-md group"
      >
        {isMuted ? (
          <VolumeX size={20} className="text-gray-400 group-hover:text-white" />
        ) : (
          <Volume2 size={20} className="text-cyan-400 group-hover:text-cyan-200" />
        )}
      </div>
    </SoundContext.Provider>
  );
};
