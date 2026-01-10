import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";
import { Volume2, VolumeX } from "lucide-react";

const SoundContext = createContext();

export const useSound = () => useContext(SoundContext);

export const SoundProvider = ({ children }) => {
  const [isMuted, setIsMuted] = useState(true);

  // Refs for audio elements to avoid re-creation & allow control
  const hoverAudio = useRef(new Audio("/sounds/hover.mp3"));
  const warpAudio = useRef(new Audio("/sounds/warp.mp3"));
  const scanAudio = useRef(new Audio("/sounds/scan_lock.m4a"));
  const clickAudio = useRef(new Audio("/sounds/click_mechanical.wav"));
  
  // Stems map
  const stemsRef = useRef({});

  // 1. Preload & Config
  useEffect(() => {
    const loadAudio = (ref, vol) => {
        ref.current.load();
        ref.current.volume = vol;
    };
    loadAudio(hoverAudio, 0.2);
    loadAudio(warpAudio, 0.5);
    loadAudio(scanAudio, 0.4);
    loadAudio(clickAudio, 0.3);
  }, []);

  // 2. Immediate Mute Enforcement
  useEffect(() => {
    if (isMuted) {
      // Pause all SFX
      hoverAudio.current.pause();
      warpAudio.current.pause();
      scanAudio.current.pause();
      clickAudio.current.pause();
      
      // Pause all Stems
      Object.values(stemsRef.current).forEach((audio) => audio.pause());
    } else {
        // Optional: We could resume stems here, but `updateMix` usually handles it on scroll.
        // We'll leave it to the next scroll event or explicit play call to resume.
    }
  }, [isMuted]);

  const playHover = () => {
    if (isMuted) return;
    if (hoverAudio.current.paused) {
      hoverAudio.current.play().catch(() => {});
    } else {
      hoverAudio.current.currentTime = 0;
    }
  };

  const playWarp = () => {
    if (isMuted) return;
    warpAudio.current.currentTime = 0;
    warpAudio.current.play().catch(() => {});
  };

  const playScan = () => {
    if (isMuted) return;
    scanAudio.current.currentTime = 0;
    scanAudio.current.play().catch(() => {});
  };

  const playClick = () => {
     if (isMuted) return;
     clickAudio.current.currentTime = 0;
     clickAudio.current.play().catch(() => {});
  };

  // Adaptive Audio Mixer
  // volumeMap: { 'space': 0.5, 'cockpit': 0.2, 'reflection': 0.0, 'mystery': 0.0 }
  // Logic: Only plays if NOT muted.
  const updateMix = (volumeMap) => {
    if (isMuted) return; // Mute effect above handles pausing

    Object.entries(volumeMap).forEach(([track, vol]) => {
      if (!stemsRef.current[track]) {
        // Lazy load stems
        const fileMap = {
          space: "/sounds/space_ambience.mp3",
          cockpit: "/sounds/cockpit_hum.mp3",
          reflection: "/sounds/ethereal_pad.mp3",
          mystery: "/sounds/dark_drone.mp3",
        };
        const audio = new Audio(fileMap[track] || "/sounds/hum.mp3"); // Fallback
        audio.loop = true;
        stemsRef.current[track] = audio;
      }

      const audio = stemsRef.current[track];
      if (vol > 0.01) {
        if (audio.paused) audio.play().catch(() => {});
        audio.volume = Math.min(Math.max(vol, 0), 1);
      } else {
        if (!audio.paused) audio.pause();
      }
    });
  };

  const toggleMute = () => setIsMuted(!isMuted);

  const value = React.useMemo(() => ({
    isMuted, playHover, playWarp, playScan, playClick, updateMix, toggleMute
  }), [isMuted]);

  return (
    <SoundContext.Provider value={value}>
      {children}
      {/* Sound Toggle UI Button - Fixed Absolute Position */}
      <div
        onClick={toggleMute}
        className="fixed bottom-6 left-6 z-50 p-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 cursor-pointer transition-colors backdrop-blur-md group"
      >
        {isMuted ? (
          <VolumeX size={20} className="text-gray-400 group-hover:text-white" />
        ) : (
          <Volume2
            size={20}
            className="text-cyan-400 group-hover:text-cyan-200"
          />
        )}
      </div>
    </SoundContext.Provider>
  );
};
