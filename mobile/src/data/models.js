
// Static Asset Mapping for React Native
// Models must be resolvable at compile time by Metro

// Only include models that actually exist to prevent "Module Not Found" crashes
const MODEL_ASSETS = {
    'earth': require('../../assets/models/earth.glb'),
    'moon': require('../../assets/models/moon.glb'),
    'mars': require('../../assets/models/mars.glb'),
};

export const AR_MODELS = {
  Planets: [
    { 
      id: 'earth', 
      name: 'Earth', 
      asset: MODEL_ASSETS['earth'], 
      scale: 0.2, 
      type: 'Terrestrial Planet',
      purpose: 'Sustaining Life',
      impact: 'The only known astronomical object to harbor life. Its magnetic field protects us from solar radiation.'
    },
    { 
      id: 'moon', 
      name: 'Moon', 
      asset: MODEL_ASSETS['moon'], 
      scale: 0.15,
      type: 'Natural Satellite',
      purpose: 'Tides & Stability',
      impact: 'Stabilizes Earth\'s axial tilt, creating a stable climate. Controls ocean tides.'
    },
    { 
      id: 'mars', 
      name: 'Mars', 
      asset: MODEL_ASSETS['mars'], 
      scale: 0.18,
      type: 'Terrestrial Planet',
      purpose: 'Potential Habitation',
      impact: 'The most likely candidate for future human colonization. Contains water ice and signs of ancient rivers.',
    }
  ],
  // Empty sections for now as models are missing
  Satellites: [],
  Stations: []
};
