const axios = require('axios');
const satellite = require('satellite.js');
const Groq = require('groq-sdk');
const metadata = require('../data/satellite_metadata');

class OrbitalAtlasService {
  constructor() {
    this.cache = {
      satellites: [],
      lastFetch: 0
    };
    this.CACHE_DURATION = 90 * 60 * 1000; // 90 minutes cache
    
    // N2YO & Groq Configuration
    this.N2YO_API_KEY = process.env.N2YO_API_KEY;
    this.GROQ_API_KEY = process.env.GROQ_API_KEY;
    this.n2yoCache = new Map(); // Cache single sat positions for short time
    this.aiCache = new Map();   // Cache AI descriptions 

    // Initialize Groq
    if (this.GROQ_API_KEY) {
        this.groq = new Groq({ apiKey: this.GROQ_API_KEY });
    }

    // CelesTrak GP Element Sets
    this.SOURCES = [
      { key: 'stations', url: 'https://celestrak.org/NORAD/elements/gp.php?GROUP=stations&FORMAT=tle', category: 'Station' },
      { key: 'weather', url: 'https://celestrak.org/NORAD/elements/gp.php?GROUP=weather&FORMAT=tle', category: 'Weather' },
      { key: 'gps', url: 'https://celestrak.org/NORAD/elements/gp.php?GROUP=gps-ops&FORMAT=tle', category: 'Navigation' },
      { key: 'communications', url: 'https://celestrak.org/NORAD/elements/gp.php?GROUP=geo&FORMAT=tle', category: 'Communication' }, 
      { key: 'resource', url: 'https://celestrak.org/NORAD/elements/gp.php?GROUP=resource&FORMAT=tle', category: 'Earth Observation' }
    ];
  }

  // ... (existing getSatellites code) ...
  async getSatellites(limit = 5000) {
    const now = Date.now();
    // Serve from cache if valid
    if (this.cache.satellites.length > 0 && (now - this.cache.lastFetch < this.CACHE_DURATION)) {
      console.log(`[OrbitalAtlas] Serving ${this.cache.satellites.length} cached satellites.`);
      return this.limitResults(this.cache.satellites, limit);
    }
    console.log('[OrbitalAtlas] Cache expired. Fetching fresh TLE data...');
    const freshSatellites = await this.fetchAllSources();
    if (freshSatellites.length > 0) {
      this.cache.satellites = freshSatellites;
      this.cache.lastFetch = now;
    } else if (this.cache.satellites.length > 0) {
       console.warn('[OrbitalAtlas] Fetch failed. Serving stale cache.');
    }
    return this.limitResults(this.cache.satellites, limit);
  }

  // ... (existing fetchAllSources code) ...
  async fetchAllSources() {
    try {
      const promises = this.SOURCES.map(source => 
        axios.get(source.url, { timeout: 15000 })
          .then(res => ({ source, data: res.data }))
          .catch(err => {
            console.error(`[OrbitalAtlas] Failed to fetch ${source.key}:`, err.message);
            return null;
          })
      );
      const results = await Promise.all(promises);
      let allSatellites = [];
      const seenIds = new Set();
      for (const result of results) {
        if (!result) continue; 
        const satellites = this.parseTLEs(result.data, result.source.category);
        for (const sat of satellites) {
          if (!seenIds.has(sat.satelliteId)) {
            seenIds.add(sat.satelliteId);
            allSatellites.push(sat);
          }
        }
      }
      console.log(`[OrbitalAtlas] Aggregated ${allSatellites.length} unique satellites.`);
      return allSatellites;
    } catch (error) {
      console.error('[OrbitalAtlas] Critical error in fetchAllSources:', error);
      return [];
    }
  }

  async getSatelliteDetails(id) {
    // 1. Get Live Position Data (which includes basic metadata from local catalog fallback)
    const positionData = await this.getLivePosition(id);
    
    // 2. Enhance with Curated Metadata
    let enriched = { ...positionData };
    if (metadata[id]) {
        enriched = { ...enriched, ...metadata[id] };
    }

    // 3. AI Enrichment (if needed and enabled)
    // Only generate if we don't have a static description OR if we want to "Chat" with it.
    // For now, let's auto-generate a description if not present and we have an API key.
    if (this.GROQ_API_KEY && !enriched.description && !this.aiCache.has(id)) {
        console.log(`[OrbitalAtlas] Generating AI description for ${enriched.name}...`);
        try {
            const prompt = `Explain the satellite "${enriched.name}" (ID: ${id}) to a general audience. In 2-3 short sentences, cover: What is it? Who operates it? Why does it matter to a normal person on Earth?`;
            
            const completion = await this.groq.chat.completions.create({
                messages: [{ role: "user", content: prompt }],
                model: "llama-3.3-70b-versatile", // Use a fast, current model
            });
            
            const aiDesc = completion.choices[0]?.message?.content || "";
            this.aiCache.set(id, aiDesc);
            enriched.description = aiDesc;
            enriched.aiGenerated = true;

        } catch (err) {
            console.error('[OrbitalAtlas] Groq AI Generation failed:', err.message);
        }
    } else if (this.aiCache.has(id)) {
        enriched.description = this.aiCache.get(id);
        enriched.aiGenerated = true;
    }

    // Ensure lastUpdated is present
    enriched.lastUpdated = new Date().toISOString(); 
    return enriched;
  }

  async getLivePosition(satId, observerLat = 0, observerLng = 0) {
    // 1. Check Short-Term Cache (5 seconds)
    const cacheKey = `${satId}_${observerLat}_${observerLng}`;
    const now = Date.now();
    
    if (this.n2yoCache.has(cacheKey)) {
      const cached = this.n2yoCache.get(cacheKey);
      if (now - cached.timestamp < 5000) return cached.data;
    }

    // 2. Try N2YO API if Key exists
    if (this.N2YO_API_KEY) {
      try {
        // N2YO: /positions/{id}/{observer_lat}/{observer_lng}/{observer_alt}/{seconds}
        // Obsever Alt = 0, Seconds = 1 (current position)
        const url = `https://api.n2yo.com/rest/v1/satellite/positions/${satId}/${observerLat}/${observerLng}/0/1/&apiKey=${this.N2YO_API_KEY}`;
        const response = await axios.get(url, { timeout: 5000 });
        
        if (response.data && response.data.positions && response.data.positions.length > 0) {
          const pos = response.data.positions[0];
          const result = {
            satelliteId: String(response.data.info.satid),
            name: response.data.info.satname,
            latitude: pos.satlatitude,
            longitude: pos.satlongitude,
            altitude: pos.sataltitude, // km
            velocity: 0, // N2YO doesn't give velocity in this endpoint, but easy to calc if we had 2 points.
            azimuth: pos.azimuth,
            elevation: pos.elevation,
            timestamp: now
          };
          
          this.n2yoCache.set(cacheKey, { timestamp: now, data: result });
          return result;
        }
      } catch (err) {
        console.warn(`[OrbitalAtlas] N2YO fetch for ${satId} failed: ${err.message}. Fallbacking to TLE.`);
      }
    }

    // 3. Fallback: Local TLE Calculation
    // Find sat in our main cache
    console.log(`[OrbitalAtlas] Looking for ${satId} in cache of ${this.cache.satellites.length} items.`);
    let cachedSat = this.cache.satellites.find(s => String(s.satelliteId) === String(satId));
    
    // If not in cache, we could try fetching specific TLE, but for now returns stored one.
    if (!cachedSat) {
        console.warn(`[OrbitalAtlas] Sat ${satId} NOT FOUND. Sample cached IDs:`, this.cache.satellites.slice(0,5).map(s=>s.satelliteId));
        throw new Error('Satellite not found in local catalog.');
    }

    // Recalculate precise position for NOW
    // Note: satellite object already has lat/lng but that's from 'lastFetch'.
    // We strictly should re-propagate using the TLE string to get live 'second-by-second' animation precision.
    
    // Use the already imported satellite module (variable `satellite`)
    const satRecParsed = satellite.twoline2satrec(cachedSat.tleLine1, cachedSat.tleLine2);
    const date = new Date();
    const positionAndVelocity = satellite.propagate(satRecParsed, date);
    const positionEci = positionAndVelocity.position;
    const velocityEci = positionAndVelocity.velocity;

    if (!positionEci) throw new Error('Propagation error');

    const gmst = satellite.gstime(date);
    const positionGd = satellite.eciToGeodetic(positionEci, gmst);

    const result = {
      satelliteId: cachedSat.satelliteId,
      name: cachedSat.name, // Will be overridden by metadata in getSatelliteDetails
      latitude: satellite.degreesLat(positionGd.latitude),
      longitude: satellite.degreesLong(positionGd.longitude),
      altitude: positionGd.height,
      velocity: Math.sqrt(velocityEci.x**2 + velocityEci.y**2 + velocityEci.z**2),
      timestamp: now,
      source: 'LOCAL_TLE_FALLBACK',
      // Pass through original parsed metadata if any (inclination etc)
      inclination: cachedSat.inclination,
      orbitType: cachedSat.orbitType,
      period: cachedSat.orbitalPeriod
    };

    return result;
  }

  async getTLE(satId) {
      if (this.cache.satellites.length === 0) {
          await this.getSatellites();
      }
      const sat = this.cache.satellites.find(s => s.satelliteId === satId);
      if (sat) {
          return {
              tle: { line1: sat.tleLine1, line2: sat.tleLine2 },
              info: { satname: sat.name, satid: satId }
          };
      }
      return null;
  }

  async getVisualPasses(satId, lat, lng, alt = 0, days = 10, minVis = 300) {
      try {
          // 1. Get TLE Data (Local or API)
          const tleData = await this.getTLE(satId);
          if (!tleData || !tleData.tle) {
               console.warn(`[getVisualPasses] TLE not found for ${satId}`);
               return { passes: [] };
          }

          // 2. Perform Local Propagation using satellite.js
          const satRec = satellite.twoline2satrec(tleData.tle.line1, tleData.tle.line2);
          const passes = [];
          const now = new Date();
          let currentPass = null;
          
          // Check next 24 hours (enough for ~15 orbits)
          // Step size: 1 minute
          for (let i = 0; i < 60 * 24; i++) {
              const time = new Date(now.getTime() + i * 60000);
              
              // Propagate
              const positionAndVelocity = satellite.propagate(satRec, time);
              const positionEci = positionAndVelocity.position;
              if (!positionEci) continue;

              const gmst = satellite.gstime(time);
              const positionEcf = satellite.eciToEcf(positionEci, gmst);
              const lookAngles = satellite.ecfToLookAngles({
                  latitude: parseFloat(lat) * Math.PI / 180,
                  longitude: parseFloat(lng) * Math.PI / 180,
                  height: parseFloat(alt) / 1000
              }, positionEcf);

              const az = lookAngles.azimuth * 180 / Math.PI;
              const el = lookAngles.elevation * 180 / Math.PI;

              if (el > 10) { // Visible > 10 degrees elevation
                  if (!currentPass) {
                      currentPass = {
                          startUTC: Math.floor(time.getTime() / 1000),
                          startAz: az,
                          startAzCompass: this.degreesToCompass(az),
                          maxEl: el,
                          startTime: time
                      };
                  } else {
                      if (el > currentPass.maxEl) currentPass.maxEl = el;
                  }
              } else {
                  if (currentPass) {
                      currentPass.endUTC = Math.floor(time.getTime() / 1000);
                      currentPass.duration = currentPass.endUTC - currentPass.startUTC;
                      currentPass.endAz = az;
                      currentPass.endAzCompass = this.degreesToCompass(az);
                      passes.push(currentPass);
                      currentPass = null;
                  }
              }
          }

          if (passes.length > 0) {
              return {
                  info: { satname: tleData.info.satname, satid: satId, method: "LOCAL_CALCULATION" },
                  passes: passes
              };
          }
           
          return { info: { satname: "Unknown", satid: satId }, passes: [] };

      } catch (err) {
          console.error(`[OrbitalAtlas] Local Pass Calc failed: ${err.message}`, err);
          return { passes: [] };
      }
  }

  degreesToCompass(degrees) {
      const val = Math.floor((degrees / 22.5) + 0.5);
      const arr = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
      return arr[(val % 16)];
  }

  // ... (existing parseTLEs code) ...

  parseTLEs(rawTle, defaultCategory) {
    const lines = rawTle.split(/\r?\n/);
    const satellites = [];
    const now = new Date();

    // Loop through lines in groups of 3 (Name, Line 1, Line 2)
    for (let i = 0; i < lines.length; i += 3) {
      if (i + 2 >= lines.length) break;

      const name = lines[i].trim();
      const tle1 = lines[i+1].trim();
      const tle2 = lines[i+2].trim();

      if (!tle1.startsWith('1 ') || !tle2.startsWith('2 ')) continue;

      try {
        const satRec = satellite.twoline2satrec(tle1, tle2);
        
        // Propagate to current time for position
        const positionAndVelocity = satellite.propagate(satRec, now);
        const positionEci = positionAndVelocity.position;
        const velocityEci = positionAndVelocity.velocity; // km/s

        // Calculate Orbital Period (mins)
        // Mean Motion is in revolutions per day in TLE Line 2 (cols 53-63)
        // Or calculated from satRec.no (mean motion in rad/min)
        const meanMotionRadPerMin = satRec.no; 
        const periodMins = (2 * Math.PI) / meanMotionRadPerMin;

        // Calculate Inclination (degrees) - directly from TLE or satRec
        const inclinationDeg = satellite.degreesLat(satRec.inclo); // satRec.inclo is in radians

        // Determine Position
        let lat = 0, lng = 0, alt = 0;
        let validPos = false;

        if (positionEci) {
            const gmst = satellite.gstime(now);
            const positionGd = satellite.eciToGeodetic(positionEci, gmst);
            lat = satellite.degreesLat(positionGd.latitude);
            lng = satellite.degreesLong(positionGd.longitude);
            alt = positionGd.height; // km
            validPos = true;
        }

        if (!validPos) continue; // specific sat might be decayed or erroring

        // Determine Orbit Type
        // LEO: < 2000 km
        // MEO: 2000 km < alt < 35786 km
        // GEO: ~35786 km (allow margin ~35000+)
        let orbitType = 'LEO';
        if (alt > 35000) orbitType = 'GEO';
        else if (alt > 2000) orbitType = 'MEO';

        // Check curated metadata for overrides (e.g. better name or category)
        const satId = satRec.satnum;
        let extraData = {};
        if (metadata[satId]) {
            extraData = {
                name: metadata[satId].name, // Use pretty name
                operator: metadata[satId].operator,
                missionType: metadata[satId].missionType,
                realWorldImpact: metadata[satId].realWorldImpact
            };
        }

        satellites.push({
          satelliteId: satId, // parsed string from TLE
          name: name,
          category: defaultCategory,
          orbitType: orbitType,
          inclination: parseFloat(inclinationDeg.toFixed(2)),
          altitude: parseFloat(alt.toFixed(2)),
          orbitalPeriod: parseFloat(periodMins.toFixed(2)),
          velocity: Math.sqrt(velocityEci.x**2 + velocityEci.y**2 + velocityEci.z**2),
          lat: parseFloat(lat.toFixed(4)),
          lng: parseFloat(lng.toFixed(4)),
          tleLine1: tle1,
          tleLine2: tle2,
          ...extraData
        });

      } catch (err) {
        // Ignore single parse errors
      }
    }
    return satellites;
  }

  limitResults(satellites, limit) {
    if (limit <= 0) return satellites;
    return satellites.slice(0, limit);
  }
}

module.exports = OrbitalAtlasService;
