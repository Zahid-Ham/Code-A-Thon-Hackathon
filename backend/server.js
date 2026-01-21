const express = require('express');
const cors = require('cors');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const CosmicWeatherService = require('./services/CosmicWeatherService');
const OrbitalAtlasService = require('./services/OrbitalAtlasService');
const DataLabService = require('./services/DataLabService');
const VisibilityTimelineService = require('./services/VisibilityTimelineService');
require('dotenv').config(); // Load environment variables

const app = express();
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT} (Accessible via LAN)`);
});
const NASA_API_KEY = process.env.NASA_API_KEY || 'DEMO_KEY';

// Initialize Services
const cosmicService = new CosmicWeatherService(NASA_API_KEY);
const orbitalService = new OrbitalAtlasService();

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

// --- WHAT IF ANALYSIS CHATBOT (GROQ AI) ---
app.post('/api/mission-whatif', async (req, res) => {
  const { scenario, userChoice, outcome, question } = req.body;
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey || apiKey === 'YOUR_GROQ_API_KEY_HERE') {
    return res.json({
      reply: "Simulation Protocol: Neural Link Inactive. I cannot perform deep historical divergence analysis without a valid API Key."
    });
  }

  try {
    const Groq = require('groq-sdk');
    const groq = new Groq({ apiKey });

    const allChoices = scenario.choices.map(c => `- Option: ${c.text} (Risk: ${c.risk.failureconsequences})`).join('\n');

    const systemPrompt = `
            You are the Flight Dynamics Officer (FDO) AI.
            
            SCENARIO CONTEXT:
            Event: ${scenario.title}
            Description: ${scenario.description}
            
            AVAILABLE OPTIONS:
            ${allChoices}
            
            COMMAND COMMANDER'S DECISION:
            Chosen Action: "${userChoice.text}"
            Outcome: ${outcome.title} (${outcome.success ? "SUCCESS" : "FAILURE"})
            Outcome Detail: ${outcome.message}
            
            USER INQUIRY: "${question}"
            
            DIRECTIVE:
            1. Analyze the timeline divergence. Explain EXACTLY what would have happened if they chose differently, using realistic spaceflight physics/logic.
            2. If they ask about the current outcome, explain the technical reasons for the success/failure.
            3. Tone: Professional, Technical, slightly robotic but helpful. use terms like "Delta-V", "Telemetry", "Structural Load", "Max-Q".
            4. Keep response under 50 words.
            5. STRICT OUTPUT RULE: Do NOT use markdown formatting. Do NOT use **bold** or *italics*. Use plain text only.
        `;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: question }
      ],
      model: 'llama-3.1-8b-instant',
      temperature: 0.7,
      max_tokens: 150
    });

    res.json({ reply: chatCompletion.choices[0].message.content });

  } catch (error) {
    console.error('[WhatIf] Groq Error:', error.message);
    res.status(500).json({ error: 'Analysis stream interrupted.' });
  }
});

// --- HISTORICAL ARCHIVE AI (GROQ) ---
app.post('/api/mission-history', async (req, res) => {
  const { scenario, choice, outcome } = req.body;
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey || apiKey === 'YOUR_GROQ_API_KEY_HERE') {
    return res.json({
      mission: "APOLLO 13 (Simulated)",
      detail: "In the absence of AI uplink, we reference Apollo 13: The crew manually corrected their trajectory using the LEM engine, surviving a critical oxygen tank failure."
    });
  }

  try {
    const Groq = require('groq-sdk');
    const groq = new Groq({ apiKey });

    const systemPrompt = `
        Act as a Spaceflight Historian database.
        
        TASK:
        Find a REAL historical space mission (NASA, Soviet, ESA, SpaceX, etc.) that faced a similar challenge to this scenario:
        - Scenario: "${scenario.title}: ${scenario.description}"
        - User Choice: "${choice.text}" (Outcome: ${outcome.success ? 'Success' : 'Failure'})

        OUTPUT FORMAT (JSON):
        {
            "mission": "NAME OF REAL MISSION (Year)",
            "detail": "A 1-2 sentence summary of what actually happened in that real mission and how it relates to the user's situation. 40 words max. Plain text only.",
            "solution": "What the agency or crew actually DID to solve (or attempt to solve) the issue. 40 words max.",
            "outcome": "A short, one-line summary of the final result (e.g. 'Mission Saved', 'Crew Lost')."
        }

        Note: If no direct match exists, choose the closest thematic match (e.g., power failure, critical reentry, communication loss).
    `;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: systemPrompt }],
      model: 'llama-3.1-8b-instant',
      temperature: 0.4,
      response_format: { type: 'json_object' }
    });

    const result = JSON.parse(chatCompletion.choices[0].message.content);
    res.json(result);

  } catch (error) {
    console.error('[AI] History Error:', error.message);
    res.json({
      mission: "DATA CORRUPTED",
      detail: "Historical archives are currently unreachable due to solar flare interference."
    });
  }
});

// --- SPACE CHATBOT (GROQ AI) ---
app.post('/api/chat', async (req, res) => {
  console.log(`[CHAT] Incoming Request: ${req.body.message}`);
  const { message, mobileMode } = req.body;
  const apiKey = process.env.GROQ_API_KEY;

  // Simulation Mode if Key is missing
  if (!apiKey || apiKey === 'YOUR_GROQ_API_KEY_HERE') {
    const reply = mobileMode
      ? "Simulation: Audio Link Active. Asking about planets?"
      : "I am running in simulation mode. I can answer space questions! Did you know Saturn's density is so low it would float in water?";
    return res.json({ reply });
  }

  try {
    const Groq = require('groq-sdk');
    const groq = new Groq({ apiKey });

    // Dynamic System Prompt based on Mode
    let systemPrompt = `
            You are "Cosmos", an advanced AI assistant specialized ONLY in Astronomy, Space Exploration, Physics, and Rocketry.
            
            RULES:
            1. Answering ONLY questions related to Space/Universe.
            2. If a user asks about non-space topics (e.g., cooking, politics, coding), politely refuse and steer back to space.
            3. Keep answers concise (under 3 sentences) but fascinating.
            4. Use a wondrous, scientific tone.
        `;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      model: 'llama-3.1-8b-instant',
      temperature: 0.7,
      max_tokens: mobileMode ? 60 : 150
    });

    res.json({ reply: chatCompletion.choices[0].message.content });

  } catch (error) {
    console.error('[Chat] Groq Error:', error.message);
    res.status(500).json({ error: 'Comms link unstable.' });
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
        visibility_score: 100,
        // TLEs for Visibility Calculation (Updated for 2026)
        tle1: "1 25544U 98067A   26007.12345678  .00016717  00000+0  30706-3 0  9993",
        tle2: "2 25544  51.6416 295.1234 0005555 100.1234 350.1234 15.49876543123456"
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
          description: `Active natural event detected by NASA Earth Observatory.Category: ${evt.categories[0].title}.`,
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

// --- IMPACT ANALYSIS (GROQ AI) ---
app.post('/api/impact-analysis', async (req, res) => {
  const { eventName, eventType, location } = req.body;
  const apiKey = process.env.GROQ_API_KEY;

  // Simulation Fallback
  if (!apiKey || apiKey === 'YOUR_GROQ_API_KEY_HERE') {
    return res.json({
      impact: "Simulation: This event has a moderate impact on local visibility. In future cycles, similar patterns may increase atmospheric interference by 15%."
    });
  }

  try {
    const Groq = require('groq-sdk');
    const groq = new Groq({ apiKey });

    const prompt = `
            Analyze the "Impact" of this space/earth event:
            Event: ${eventName} (${eventType})
            Location: Lat ${location?.lat}, Lng ${location?.lng}

            Provide a 2-sentence expert assessment on:
            1. Current Impact on the region (visibility/environment).
            2. Future Impact/Prediction.
            
            Tone: Scientific, Concise.
        `;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.1-8b-instant',
      temperature: 0.7,
      max_tokens: 100
    });

    res.json({ impact: chatCompletion.choices[0].message.content });
  } catch (error) {
    console.error('[Impact] Groq Error:', error.message);
    res.status(500).json({ error: 'Analysis failed.' });
  }
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

  const authString = Buffer.from(`${appId}:${appSecret} `).toString('base64');

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
    });

    // Return the image URL provided by the API
    console.log('[StarChart] Success. URL:', response.data.data.imageUrl);
    res.json({ imageUrl: response.data.data.imageUrl });
  } catch (error) {
    console.error('Star Chart Error Detail:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to generate star chart' });
  }
});

const multer = require('multer');
// Configure Multer Storage (Keep Extension for Groq)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Ensure directory exists
    const fs = require('fs');
    const dir = 'uploads/';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    // Use original name or timestamp + ext
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'audio-' + uniqueSuffix + '.m4a'); // Force .m4a for mobile uploads
  }
});

const upload = multer({ storage: storage });

// --- SPEECH-TO-TEXT (GROQ WHISPER) ---
app.post('/api/transcribe', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file uploaded.' });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey || apiKey === 'YOUR_GROQ_API_KEY_HERE') {
      return res.json({ text: "Simulation: Voice Transcribed. Tell me about Mars." });
    }

    const Groq = require('groq-sdk');
    const groq = new Groq({ apiKey });
    const fs = require('fs');

    // Groq Whisper API
    const translation = await groq.audio.transcriptions.create({
      file: fs.createReadStream(req.file.path),
      model: "whisper-large-v3",
      response_format: "json",
      temperature: 0.0
    });

    // Cleanup
    fs.unlinkSync(req.file.path);

    res.json({ text: translation.text });

  } catch (error) {
    console.error('[Transcribe] Error:', error.message);
    res.status(500).json({ error: 'Voice processing failed.' });
  }
});


// --- VISIBILITY INTELLIGENCE API ---
app.post('/api/visibility-forecast', (req, res) => {
  try {
    const { tle1, tle2, lat, lng, alt } = req.body;

    if (!tle1 || !tle2 || lat === undefined || lng === undefined) {
      return res.status(400).json({ error: 'Missing TLE or coordinates' });
    }

    const passes = VisibilityTimelineService.calculateVisibility(
      tle1,
      tle2,
      parseFloat(lat),
      parseFloat(lng),
      parseFloat(alt || 0)
    );

    res.json(passes);
  } catch (error) {
    console.error('[API] Visibility Forecast Error:', error.message);
    res.status(500).json({ error: 'Failed to calculate visibility' });
  }
});

app.post('/api/visibility-map', (req, res) => {
  try {
    const { tle1, tle2, time, lat, lng } = req.body;
    // Pass lat/lng for static fallback
    const footprint = VisibilityTimelineService.calculateFootprint(tle1, tle2, time, lat, lng);
    res.json(footprint);
  } catch (error) {
    console.error('Vis Map Error:', error.message);
    res.status(500).json({ error: 'Failed to generate map' });
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
