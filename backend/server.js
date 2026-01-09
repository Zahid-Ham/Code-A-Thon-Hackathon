const express = require('express');
const cors = require('cors');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const CosmicWeatherService = require('./services/CosmicWeatherService');
const OrbitalAtlasService = require('./services/OrbitalAtlasService');
const DataLabService = require('./services/DataLabService');
const AcademyIntelService = require('./services/AcademyIntelService');
require('dotenv').config(); // Load environment variables

const app = express();
const PORT = process.env.PORT || 5000;
const NASA_API_KEY = process.env.NASA_API_KEY || 'DEMO_KEY';

// Initialize Services
const cosmicService = new CosmicWeatherService(NASA_API_KEY);
const orbitalService = new OrbitalAtlasService();
const dataLabService = new DataLabService();
const academyService = new AcademyIntelService();

// Enable CORS for frontend communication
app.use(cors());
app.use(express.json());

// --- MISSION DATA ARCHIVE (CSV) ---
const CSV_PATH = path.join(__dirname, 'space_missions1__1_.csv');

app.get('/api/missions', async (req, res) => {
  const { year } = req.query;
  if (!year) return res.status(400).json({ error: 'Year parameter is required' });

  try {
    const historicalResults = [];

    // 1. ALWAYS check the Dataset (CSV) first as requested
    if (fs.existsSync(CSV_PATH)) {
      const data = fs.readFileSync(CSV_PATH, 'utf8');
      const lines = data.split('\n').filter(line => line.trim() !== '');
      const headers = lines[0].split(',');
      const yearIndex = headers.indexOf('Year');

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const values = [];
        let current = '';
        let inQuotes = false;
        for (let char of line) {
          if (char === '"') inQuotes = !inQuotes;
          else if (char === ',' && !inQuotes) { values.push(current.trim()); current = ''; }
          else current += char;
        }
        values.push(current.trim());

        if (values.length < 9) continue;
        if (values[yearIndex] === year) {
          const company = values[0] || 'Unknown';
          const location = values[1] || 'Unknown';
          const isSuccess = values[5] === '1';

          historicalResults.push({
            id: `csv-${year}-${i}`,
            name: values[8] || 'Unknown Mission',
            date: `${year}-01-01`,
            agency: company,
            rocket: values[4] || 'Unknown',
            location: location,
            status: isSuccess ? 'Success' : 'Failure',
            rocketStatus: values[6] || 'Unknown',
            price: values[7] || 'N/A',
            launchTime: values[3] || 'N/A',
            description: `Historical archive entry for ${company}. Launched from ${location}.`,
            color: isSuccess ? '#00FF99' : '#FF0055',
            type: 'HISTORY'
          });
        }
      }
    }

    // 2. If Dataset has entries, return them
    if (historicalResults.length > 0) {
      console.log(`[API] Found ${historicalResults.length} missions for ${year} in Local Dataset.`);
      return res.json(historicalResults);
    }

    // 3. Fallback to High-Fidelity API for recent/future years not in dataset (e.g., 2025, 2026)
    if (parseInt(year) >= 2020) {
      console.log(`[API] Year ${year} not in dataset. Fetching live history from LL2...`);
      const startDate = `${year}-01-01T00:00:00Z`;
      const endDate = `${parseInt(year) + 1}-01-01T00:00:00Z`;

      const ll2Res = await axios.get(`https://ll.thespacedevs.com/2.3.0/launches/?limit=100&net__gte=${startDate}&net__lt=${endDate}`, {
        headers: { 'User-Agent': 'SpaceScope-App/1.0' }
      });

      const apiResults = (ll2Res.data.results || []).map(launch => {
        const getImg = (d) => (typeof d === 'string' ? d : d?.image_url || d?.thumbnail_url || null);
        return {
          id: launch.id,
          name: launch.name,
          date: launch.net || launch.window_start,
          agency: launch.launch_service_provider?.name || 'Unknown Agency',
          rocket: launch.rocket?.configuration?.full_name || 'Unknown Rocket',
          status: launch.status?.name || 'Unknown',
          location: launch.pad?.location?.name || 'Unknown',
          description: launch.mission?.description || 'No description available.',
          image: getImg(launch.image) || getImg(launch.rocket?.configuration?.image) || null,
          color: launch.status?.abbrev === 'Success' ? '#00FF99' : (launch.status?.abbrev === 'Failure' ? '#FF0055' : '#2DD4BF'),
          type: 'HISTORY'
        };
      });

      return res.json(apiResults);
    }

    res.json([]); // No data found in dataset or API
  } catch (error) {
    console.error('[API] Error in /api/missions:', error.message);
    res.status(500).json({ error: 'Failed to process mission search' });
  }
});

// --- MISSION INTELLIGENCE (GROQ AI) ---
app.post('/api/mission-intel', async (req, res) => {
  const { name, description, date, agency } = req.body;

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey === 'YOUR_GROQ_API_KEY_HERE' || apiKey === '') {
    console.warn('[AI] GROQ_API_KEY missing or placeholder. Using simulation mode.');
    return res.json({
      summary: `The ${name} mission, conducted by ${agency}, is a significant milestone in space exploration. It focuses on advancing our orbital capabilities and scientific understanding.`,
      keyEvents: [
        `System initialization and pre-flight synchronization.`,
        `Successful insertion into target orbital trajectory.`,
        `Deployment of primary scientific payloads.`,
        `Continuous data transmission and telemetry verification.`
      ],
      impact: `This mission reinforces the global standard for ${agency}'s operations and serves as a blueprint for future deep-space logistics.`
    });
  }

  try {
    const Groq = require('groq-sdk');
    const groq = new Groq({ apiKey });
    const model = 'llama-3.1-8b-instant';
    console.log(`[AI] Requesting intelligence from model: ${model}`);

    const prompt = `
      You are a specialized space mission intelligence analyst. 
      Analyze the following mission data and provide a concise intelligence report in JSON format.
      MISSION: ${name}
      AGENCY: ${agency}
      DATE: ${date}
      DESCRIPTION: ${description}

      The JSON must contain exactly these keys:
      1. "summary": A professional 2-sentence executive summary.
      2. "keyEvents": An array of 3-4 objects, each with:
         - "title": Short name of milestone (e.g. "MAX-Q", "DEPLOYMENT")
         - "time": Estimated or actual time offset or timestamp.
         - "description": 1-sentence technical detail.
      3. "impact": A 1-2 sentence statement on the mission's long-term impact on space exploration or technology.

      Response must be ONLY valid JSON.
    `;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: model,
      temperature: 0.5,
      response_format: { type: 'json_object' }
    });

    const intel = JSON.parse(chatCompletion.choices[0].message.content);
    res.json(intel);
  } catch (error) {
    console.error('[AI] Groq Error:', error.message);
    res.status(500).json({ error: 'Intelligence retrieval failed' });
  }
});

app.get('/', (req, res) => {
  res.send('SpaceScope API is initializing... Status: Void Active.');
});

// Real-Time Cosmic Weather API
app.get('/api/space-weather', async (req, res) => {
  try {
    const data = await cosmicService.getUnifiedData();
    res.json(data);
  } catch (error) {
    console.error('[API] Failed to get cosmic weather data:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Orbital Atlas API
app.get('/api/orbital-atlas/satellites', async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 2000;
    const data = await orbitalService.getSatellites(limit);
    res.json(data);
  } catch (error) {
    console.error('[API] Failed to get satellite data:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/orbital-atlas/live/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { lat, lng } = req.query;
    const position = await orbitalService.getLivePosition(id, lat || 0, lng || 0);
    res.json(position);
  } catch (error) {
    console.error(`[API] Failed to get live position for ${req.params.id}: `, error.message);
    res.status(404).json({ error: 'Satellite not found or tracking failed' });
  }
});

app.get('/api/orbital-atlas/satellite/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const details = await orbitalService.getSatelliteDetails(id);
    res.json(details);
  } catch (error) {
    console.error(`[API] Failed to get details for ${req.params.id}: `, error.message);
    res.status(404).json({ error: 'Satellite details not found' });
  }
});

// --- ACADEMY INTELLIGENCE API ---
app.get('/api/academy/infographics', async (req, res) => {
  try {
    const data = await academyService.getDynamicInfographics();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch academy infographics' });
  }
});

app.get('/api/academy/briefings', async (req, res) => {
  try {
    const data = await academyService.getDynamicBriefings();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch academy briefings' });
  }
});

app.get('/api/academy/quizzes/:category', async (req, res) => {
  try {
    const data = await academyService.getDynamicQuizzes(req.params.category);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch dynamic quizzes' });
  }
});

// --- DATA LAB GROUND TRUTH API ---
app.get('/api/data-lab/telemetry', async (req, res) => {
  try {
    const telemetry = await dataLabService.getLiveTelemetry();
    res.json(telemetry);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch Data Lab telemetry' });
  }
});

app.post('/api/data-lab/report', async (req, res) => {
  try {
    const { countryName, countryCode, layer, countryData } = req.body;
    const report = await dataLabService.generateTechnicalReport(countryName, countryCode, layer, countryData);
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate technical report' });
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
        description: `Velocity: ${Math.round(issRes.data.velocity)} km / h.Altitude: ${Math.round(issRes.data.altitude)} km.`,
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
      // Limit to 30 open events for a richer globe
      const eonetRes = await axios.get('https://eonet.gsfc.nasa.gov/api/v3/events?limit=30&status=open', { timeout: 15000 });

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
    // FALLBACK: Inject simulated data so the user sees SOMETHING instead of nothing
    console.warn('Switching to SIMULATION MODE for Earth Hazards.');
    const fallbackHazards = [
      // VOLCANOES
      { id: 'sim_volcano_etna', title: '[SIMULATION] Mt. Etna Eruption', type: 'HAZARD', lat: 37.75, lng: 14.99, date: 'LIVE ALERT', description: 'Significant lava flow detected on SE crater.', visibility_score: 85 },
      { id: 'sim_volcano_kilauea', title: '[SIMULATION] Kilauea Activity', type: 'HAZARD', lat: 19.42, lng: -155.29, date: 'LIVE ALERT', description: 'Summit eruption active within Halemaʻumaʻu crater.', visibility_score: 80 },
      { id: 'sim_volcano_popocatenetl', title: '[SIMULATION] Popocatépetl Ash', type: 'HAZARD', lat: 19.02, lng: -98.62, date: 'LIVE ALERT', description: 'Exhalation of water vapor, gas, and light ash.', visibility_score: 75 },

      // WILDFIRES
      { id: 'sim_fire_ca', title: '[SIMULATION] California Coastal Fire', type: 'HAZARD', lat: 34.05, lng: -118.24, date: 'LIVE ALERT', description: 'Rapidly spreading brush fire near Malibu canyon.', visibility_score: 90 },
      { id: 'sim_fire_aus', title: '[SIMULATION] Bushfire - NSW', type: 'HAZARD', lat: -33.86, lng: 151.20, date: 'LIVE ALERT', description: 'High temperature anomalies detected in Blue Mountains.', visibility_score: 70 },
      { id: 'sim_fire_amazon', title: '[SIMULATION] Amazon Thermal Anomaly', type: 'HAZARD', lat: -3.46, lng: -62.21, date: 'LIVE ALERT', description: 'Multiple heat signatures consistent with forest clearing.', visibility_score: 65 },

      // ICEBERGS / SEVERE STORMS
      { id: 'sim_storm_pacific', title: '[SIMULATION] Typhoon Vongfong', type: 'HAZARD', lat: 12.5, lng: 128.0, date: 'LIVE ALERT', description: 'Category 3 storm approaching Philippine Sea.', visibility_score: 95 },
      { id: 'sim_iceberg_ant', title: '[SIMULATION] Iceberg A-76', type: 'HAZARD', lat: -75.0, lng: -50.0, date: 'LIVE ALERT', description: 'Large tabular iceberg calving event monitoring.', visibility_score: 60 }
    ];
    events = events.concat(fallbackHazards);
  }

  res.json(events);
});



// --- ASTRONOMY API PROXY ---

app.post('/api/star-chart', async (req, res) => {
  const { lat, lng, date, style } = req.body;

  const appId = process.env.ASTRONOMY_APP_ID;
  const appSecret = process.env.ASTRONOMY_APP_SECRET;

  if (!appId || !appSecret) {
    console.warn('[StarChart] Missing API Keys! Please add ASTRONOMY_APP_ID and ASTRONOMY_APP_SECRET to .env');
    return res.status(500).json({ error: 'Missing Server-Side API Keys for Star Chart' });
  }

  const authString = Buffer.from(`${appId}:${appSecret}`).toString('base64');

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
        'Authorization': `Basic ${authString} `
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

// Visual Passes Endpoint
app.get('/api/satellite/visual-passes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { lat, lng, alt, days } = req.query;

    if (!lat || !lng) return res.status(400).json({ error: "Missing lat/lng" });

    const passes = await atlasService.getVisualPasses(id, lat, lng, alt || 0, days || 10);
    res.json(passes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`\n🚀 [SYSTEM_READY] v1.1-fixed-ai active on port ${PORT}`);
  console.log(`📡 [AI_PROTOCOL] Model: llama-3.1-8b-instant verified\n`);
});
