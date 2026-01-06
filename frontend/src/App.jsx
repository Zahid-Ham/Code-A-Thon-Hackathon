import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TheBridge from './components/TheBridge';
import EventDashboard from './EventDashboard';
import SolarOverwatch from './SolarOverwatch';
import OrbitalAtlasView from './views/OrbitalAtlasView';
import TransitionLayout from './components/TransitionLayout';
import { SoundProvider } from './contexts/SoundContext';
import { CosmicWeatherProvider } from './contexts/CosmicWeatherContext';
import {
  ChronoArchivePlaceholder,
  AcademyPlaceholder,
  TerraVisionPlaceholder
} from './components/PlaceholderPages';
import MissionTimelineView from './views/MissionTimelineView';

import CosmicLanding from './components/CosmicLanding';

function App() {
  return (
    <CosmicWeatherProvider>
      <Router>
        <SoundProvider>
          <Routes>
             {/* Landing Page (No Layout/Transition initially, or separate) */}
             <Route path="/" element={<CosmicLanding />} />

            <Route element={<TransitionLayout />}>
              <Route path="/dashboard" element={<TheBridge />} />
              <Route path="/events" element={<EventDashboard />} />
              <Route path="/solar" element={<SolarOverwatch />} />
              <Route path="/orbital" element={<OrbitalAtlasView />} />
              <Route path="/timeline" element={<MissionTimelineView />} />
              <Route path="/academy" element={<AcademyPlaceholder />} />
              <Route path="/terra" element={<TerraVisionPlaceholder />} />
            </Route>
          </Routes>
        </SoundProvider>
      </Router>
    </CosmicWeatherProvider>
  );
}

export default App;
