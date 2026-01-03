import React, { useState, useEffect } from 'react';
import { useLocation, useOutlet } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Hyperspace from './Hyperspace';
import { useSound } from '../contexts/SoundContext';

const TransitionLayout = () => {
  const location = useLocation();
  const outlet = useOutlet();
  const { playWarp } = useSound();
  const [showHyperspace, setShowHyperspace] = useState(false);

  // Trigger warp effect on route change (except initial load if you prefer)
  useEffect(() => {
    // Only trigger if we are navigating away from home or between modules
    // Simplification: Trigger on any location change
    if (location.pathname !== '/') {
        setShowHyperspace(true);
        const timer = setTimeout(() => setShowHyperspace(false), 800); // 0.8s warp
        return () => clearTimeout(timer);
    }
  }, [location.pathname]);

  return (
    <>
      <AnimatePresence mode="wait">
        <motion.div
           key={location.pathname}
           // Fade in from black
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           exit={{ opacity: 0 }}
           transition={{ duration: 0.5 }}
           className="w-full h-full"
        >
          {outlet}
        </motion.div>
      </AnimatePresence>

      {/* Hyperspace Overlay */}
      <AnimatePresence>
        {showHyperspace && (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-[9999]"
            >
                <Hyperspace />
            </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default TransitionLayout;
