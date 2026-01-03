import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TheBridge from './components/TheBridge';
import EventDashboard from './EventDashboard';
import TransitionLayout from './components/TransitionLayout';
import { SoundProvider } from './contexts/SoundContext';
import {
  SolarOverwatchPlaceholder,
  ChronoArchivePlaceholder,
  AcademyPlaceholder,
  TerraVisionPlaceholder
} from './components/PlaceholderPages';

function App() {
  return (
    <Router>
      <SoundProvider>
        <Routes>
           <Route element={<TransitionLayout />}>
              <Route path="/" element={<TheBridge />} />
              <Route path="/events" element={<EventDashboard />} />
              <Route path="/solar" element={<SolarOverwatchPlaceholder />} />
              <Route path="/timeline" element={<ChronoArchivePlaceholder />} />
              <Route path="/academy" element={<AcademyPlaceholder />} />
              <Route path="/terra" element={<TerraVisionPlaceholder />} />
           </Route>
        </Routes>
      </SoundProvider>
    </Router>
  );
}

export default App;
