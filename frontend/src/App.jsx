import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TheBridge from './components/TheBridge';
import EventDashboard from './EventDashboard';
import SolarOverwatch from './SolarOverwatch';
import TransitionLayout from './components/TransitionLayout';
import { SoundProvider } from './contexts/SoundContext';
import { CosmicWeatherProvider } from './contexts/CosmicWeatherContext';
import {
  ChronoArchivePlaceholder,
  AcademyPlaceholder,
  TerraVisionPlaceholder
} from './components/PlaceholderPages';

function App() {
  return (
    <CosmicWeatherProvider>
      <Router>
        <SoundProvider>
          <Routes>
             <Route element={<TransitionLayout />}>
                <Route path="/" element={<TheBridge />} />
                <Route path="/events" element={<EventDashboard />} />
                <Route path="/solar" element={<SolarOverwatch />} />
                <Route path="/timeline" element={<ChronoArchivePlaceholder />} />
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
