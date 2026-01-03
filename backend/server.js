const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config(); // Load environment variables

const app = express();
const PORT = process.env.PORT || 5000;
const NASA_API_KEY = process.env.NASA_API_KEY || 'DEMO_KEY';

// Enable CORS for frontend communication
app.use(cors());
app.use(express.json());

// In-Memory Cache
let cache = {
  data: null,
  lastFetch: 0
};
const CACHE_DURATION = 3600000; // 1 hour in ms

app.get('/', (req, res) => {
  res.send('SpaceScope API is initializing... Status: Void Active.');
});

// Smart Proxy Route
app.get('/api/space-weather', async (req, res) => {
  const now = Date.now();

  // 1. Check Cache
  if (cache.data && (now - cache.lastFetch < CACHE_DURATION)) {
    console.log('[CACHE] Serving saved space weather data.');
    return res.json(cache.data);
  }

  // 2. Fetch from NASA
  try {
    console.log('[API] Fetching new data from NASA DONKI...');
    // Use the key from .env, fallback to DEMO_KEY if not set
    const response = await axios.get(`https://api.nasa.gov/DONKI/FLR?startDate=2024-01-01&endDate=2024-02-01&api_key=${NASA_API_KEY}`, { timeout: 5000 });
    
    // Filter Data (Optimization: Send only what's needed)
    const latestFlare = response.data[response.data.length - 1]; // Get most recent
    
    if (!latestFlare) throw new Error('No recent flare data');

    const cleanData = {
      isSimulation: false,
      classType: latestFlare.classType || 'B1.0',
      activeRegionNum: latestFlare.activeRegionNum || 0,
      beginTime: latestFlare.beginTime || new Date().toISOString()
    };

    // Update Cache
    cache.data = cleanData;
    cache.lastFetch = now;
    
    return res.json(cleanData);

  } catch (error) {
    console.error('[ERROR] NASA API failed or timed out:', error.message);
    console.log('[FALLBACK] Engaging Simulation Mode.');
    
    // 3. Simulation Mode Fallback
    // Return impressive dummy data so the UI always looks good
    const simulationData = {
      isSimulation: true,
      classType: 'X1.2', // High Impact
      activeRegionNum: 3576,
      beginTime: new Date().toISOString()
    };
    
    return res.json(simulationData);
  }
});

// --- CELESTIAL EVENTS HYBRID API ---

// Caches
let issCache = { data: null, lastFetch: 0 };
let eonetCache = { data: null, lastFetch: 0 };

// Hardcoded Majors (2026 Seeds)
const PREDICTED_EVENTS = [
  {
    id: 'evt_eclipse_2026',
    title: 'Total Solar Eclipse',
    type: 'ECLIPSE',
    lat: 65.0,
    lng: -18.0,
    date: 'Aug 12, 2026',
    description: 'Total Solar Eclipse visible across the Arctic, Greenland, Iceland, and northern Spain.',
    visibility_score: 95
  },
  {
    id: 'evt_perseids_2026',
    title: 'Perseid Meteor Shower',
    type: 'METEOR',
    lat: 45.0,
    lng: 135.0,
    date: 'Aug 11-13, 2026',
    description: 'peak activity of the Perseid meteor shower, up to 100 meteors/hour.',
    visibility_score: 88
  },
  {
    id: 'evt_saturn_opp',
    title: 'Saturn at Opposition',
    type: 'PLANETARY',
    lat: -25.0, // viewing latitude (approx)
    lng: 0.0,
    date: 'Sep 21, 2026',
    description: 'Saturn will be at its closest approach to Earth and its face will be fully illuminated by the Sun.',
    visibility_score: 90
  }
];

app.get('/api/celestial-events', async (req, res) => {
  const now = Date.now();
  let events = [...PREDICTED_EVENTS];

  // 1. Fetch ISS Position (Cache: 10s)
  try {
    if (issCache.data && (now - issCache.lastFetch < 10000)) {
      events.push(issCache.data);
    } else {
      const issRes = await axios.get('https://api.wheretheiss.at/v1/satellites/25544', { timeout: 3000 });
      const issData = {
        id: 'iss_live',
        title: 'ISS LIVE POSITION',
        type: 'SATELLITE',
        lat: issRes.data.latitude,
        lng: issRes.data.longitude,
        date: 'LIVE NOW',
        description: `Velocity: ${Math.round(issRes.data.velocity)} km/h. Altitude: ${Math.round(issRes.data.altitude)} km.`,
        visibility_score: 100
      };
      
      issCache.data = issData;
      issCache.lastFetch = now;
      events.push(issData);
    }
  } catch (err) {
    console.error('ISS Fetch Error:', err.message);
    // Fallback: don't push ISS or push cached old data if available
    if (issCache.data) events.push(issCache.data);
  }

  // 2. Fetch NASA EONET (Wildfires/Volcanoes) (Cache: 24h)
  try {
    // 24 hours = 86400000 ms
    if (eonetCache.data && (now - eonetCache.lastFetch < 86400000)) {
       events = events.concat(eonetCache.data); // Use concat for arrays
    } else {
       // Limit to 5 open events to avoid clutter
       const eonetRes = await axios.get('https://eonet.gsfc.nasa.gov/api/v3/events?limit=5&status=open', { timeout: 5000 });
       
       const liveHazards = eonetRes.data.events.map(evt => {
         // EONET geometries can be points or polygons. We take the first point.
         const geom = evt.geometry[0];
         return {
           id: evt.id,
           title: evt.title,
           type: 'HAZARD', // Volcanoes, Wildfires, etc.
           lat: geom.coordinates[1], // GeoJSON is [lng, lat]
           lng: geom.coordinates[0],
           date: 'LIVE ALERT',
           description: `Active natural event detected by NASA Earth Observatory. Category: ${evt.categories[0].title}.`,
           visibility_score: 40 // Hazards usually mean bad visibility (smoke/ash)
         };
       });

       eonetCache.data = liveHazards;
       eonetCache.lastFetch = now;
       events = events.concat(liveHazards);
    }
  } catch (err) {
    console.error('EONET Fetch Error:', err.message);
    // Be silent about EONET errors, just show the rest
  }

  res.json(events);
});



// --- ASTRONOMY API PROXY ---

app.post('/api/star-chart', async (req, res) => {
  const { lat, lng, date, style } = req.body;
  
  const authString = Buffer.from(`${process.env.ASTRONOMY_APP_ID}:${process.env.ASTRONOMY_APP_SECRET}`).toString('base64');
  
  try {
    const response = await axios.post('https://api.astronomyapi.com/api/v2/studio/star-chart', {
      style: style || 'default', // 'default', 'inverted', 'navy', 'red'
      observer: {
        latitude: parseFloat(lat),
        longitude: parseFloat(lng),
        date: date || new Date().toISOString().split('T')[0]
      },
      view: {
        type: 'area',
        parameters: {
          position: {
            equatorial: {
              rightAscension: 0,
              declination: 0
            }
          },
          zoom: 2 // Wide field of view
        }
      }
    }, {
      headers: {
        'Authorization': `Basic ${authString}`
      }
    });
    
    // Return the image URL provided by the API
    console.log('[StarChart] Success. URL:', response.data.data.imageUrl);
    res.json({ imageUrl: response.data.data.imageUrl });
  } catch (error) {
    console.error('Star Chart Error Detail:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to generate star chart' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running in the void on port ${PORT}`);
});
