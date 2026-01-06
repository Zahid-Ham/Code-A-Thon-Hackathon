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

  // Refs for audio elements to avoid re-creation
  const hoverAudio = useRef(new Audio("/sounds/hover.mp3"));
  const warpAudio = useRef(new Audio("/sounds/warp.mp3"));
  // Placeholder for mechanical hum - user needs to provide 'hum.mp3'
  // Using a map to manage multiple stems
  const stemsRef = useRef({});

  useEffect(() => {
    // Preload audio
    hoverAudio.current.load();
    warpAudio.current.load();
    hoverAudio.current.volume = 0.2;
    warpAudio.current.volume = 0.5;
  }, []);

  const playHover = () => {
    if (isMuted) return;
    if (hoverAudio.current.paused) {
      hoverAudio.current.play().catch((e) => {});
    } else {
      hoverAudio.current.currentTime = 0;
    }
  };

  const playWarp = () => {
    if (isMuted) return;
    warpAudio.current.currentTime = 0;
    warpAudio.current.play().catch((e) => {});
  };

  // Adaptive Audio Mixer
  // volumeMap: { 'space': 0.5, 'cockpit': 0.2, 'reflection': 0.0 }
  const updateMix = (volumeMap) => {
    if (isMuted) {
      Object.values(stemsRef.current).forEach((audio) => audio.pause());
      return;
    }

    Object.entries(volumeMap).forEach(([track, vol]) => {
      if (!stemsRef.current[track]) {
        // Lazy load stems
        // Map generic track names to files (This could be config driven too)
        const fileMap = {
          space: "/sounds/space_ambience.mp3",
          cockpit: "/sounds/cockpit_hum.mp3",
          reflection: "/sounds/ethereal_pad.mp3",
        };
        const audio = new Audio(fileMap[track] || "/sounds/hum.mp3"); // Fallback
        audio.loop = true;
        stemsRef.current[track] = audio;
      }

      const audio = stemsRef.current[track];
      if (vol > 0.01) {
        if (audio.paused) audio.play().catch(() => {});
        // Smooth volume transition could be added here, but direct setting is fine for scroll-driven
        audio.volume = Math.min(Math.max(vol, 0), 1);
      } else {
        if (!audio.paused) audio.pause();
      }
    });
  };

  const toggleMute = () => setIsMuted(!isMuted);

  const value = React.useMemo(() => ({
    isMuted, playHover, playWarp, updateMix, toggleMute
  }), [isMuted]);

  return (
    <SoundContext.Provider value={value}>
      {children}
      {/* Sound Toggle UI Button - Fixed Absolute Position */}
      <div
        onClick={toggleMute}
        className="fixed bottom-6 right-6 z-50 p-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 cursor-pointer transition-colors backdrop-blur-md group"
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
