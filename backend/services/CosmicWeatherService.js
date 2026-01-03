const axios = require('axios');
const auroraEngine = require('./AuroraForecastEngine');

class CosmicWeatherService {
  constructor(apiKey) {
    this.apiKey = apiKey || 'DEMO_KEY';
    this.baseUrl = 'https://api.nasa.gov/DONKI';
    // NOAA Scale endpoints
    this.noaaScalesUrl = 'https://services.swpc.noaa.gov/products/noaa-scales.json';
    
    // In-memory cache
    this.cache = {
      data: null,
      lastFetch: 0,
    };
    
    // Cache duration: 5 minutes (300 seconds) for near reat-time alerts
    this.CACHE_DURATION = 300 * 1000; 
  }

  /**
   * Helper to fetch data with error handling
   * @param {string} endpoint 
   * @param {object} params 
   */
  async _fetchFromNasa(endpoint, params = {}) {
    try {
      const response = await axios.get(`${this.baseUrl}/${endpoint}`, {
        params: { api_key: this.apiKey, ...params },
        timeout: 10000 // 10s timeout
      });
      return response.data;
    } catch (error) {
      console.error(`[CosmicWeatherService] Error fetching ${endpoint}:`, error.message);
      return null;
    }
  }

  /**
   * Helper to fetch NOAA data
   */
  async _fetchFromNoaa(url) {
    try {
      const response = await axios.get(url, { timeout: 5000 });
      return response.data;
    } catch (error) {
      console.error(`[CosmicWeatherService] Error fetching NOAA data:`, error.message);
      return null;
    }
  }

  /**
   * Fetch Coronal Mass Ejections (CME)
   * Recent 30 days
   */
  async fetchCME() {
    const startDate = this._getRelativeDate(30);
    return await this._fetchFromNasa('CME', { startDate });
  }

  /**
   * Fetch Solar Flares (FLR)
   * Recent 30 days
   */
  async fetchFLR() {
    const startDate = this._getRelativeDate(30);
    return await this._fetchFromNasa('FLR', { startDate });
  }

  /**
   * Fetch Geomagnetic Storms (GST)
   * Recent 30 days
   */
  async fetchGST() {
    const startDate = this._getRelativeDate(30);
    return await this._fetchFromNasa('GST', { startDate });
  }

  /**
   * Fetch Radiation Storm Alerts (S-Scale)
   */
  async fetchRadiationAlerts() {
    const data = await this._fetchFromNoaa(this.noaaScalesUrl);
    // Data format: { "DateStamp": "2024-05-10", "TimeStamp": "12:00:00", "S": { "Scale": "0", "Text": "None" }, "G": ..., "R": ... }
    // Note: The relevant field is "S" -> "Scale"
    if (!data || !data['0']) return []; // NOAA JSON structure is usually an object with numeric keys for recent history, taking '0' (most recent)

    // Actually, swpc.noaa.gov/products/noaa-scales.json usually returns a specific object structure.
    // Let's assume the standard JSON: "0" is usually the latest entry in time-series arrays from SWPC.
    // If it's the "scales.json" status file, it has keys "DateStamp", "TimeStamp", "S", "G", "R".
    
    // Let's handle the direct object response format commonly used for current status:
    const sStatus = data.S; 
    if (!sStatus) return [];

    const scale = parseInt(sStatus.Scale) || 0;
    if (scale === 0) return []; // No storm

    // Map Severity
    let severity = 'LOW';
    if (scale === 2) severity = 'MODERATE';
    if (scale === 3) severity = 'HIGH';
    if (scale >= 4) severity = 'EXTREME';

    // Map Affected Systems
    let systems = ['COMMUNICATIONS']; // S1/S2 minimal
    if (scale >= 3) {
      systems = ['SATELLITES', 'AVIATION', 'GPS', 'COMMUNICATIONS'];
    }

    return [{
      alertLevel: `S${scale}`,
      severity: severity,
      affectedSystems: systems,
      startTime: `${data.DateStamp}T${data.TimeStamp}Z`, // Approximate UTC
      lastUpdated: new Date().toISOString()
    }];
  }

  /**
   * Maps raw event data to a deterministic severity level.
   * Logic:
   * - FLARE: C-class=LOW, M-class=MODERATE, X<10=HIGH, X>=10=EXTREME
   * - GST: Kp<5=LOW, Kp=5/6=MODERATE, Kp=7/8=HIGH, Kp>=9=EXTREME
   * - CME: Speed < 500=LOW, 500-1000=MODERATE, 1000-2000=HIGH, >2000=EXTREME
   * 
   * @param {string} type - 'FLARE' | 'GEOMAGNETIC' | 'CME'
   * @param {object} data - Raw event data
   * @returns {string} - 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME'
   */
  _mapSeverity(type, data) {
    try {
      if (type === 'FLARE') {
        const classType = data.classType || '';
        if (classType.startsWith('A') || classType.startsWith('B') || classType.startsWith('C')) return 'LOW';
        if (classType.startsWith('M')) return 'MODERATE';
        if (classType.startsWith('X')) {
          const num = parseFloat(classType.substring(1));
          return num >= 10 ? 'EXTREME' : 'HIGH';
        }
        return 'LOW'; // Fallback
      }

      if (type === 'GEOMAGNETIC') {
        // Check Kp index
        const kpIndex = data.allKpIndex?.[0]?.kpIndex || 0;
        if (kpIndex < 5) return 'LOW';
        if (kpIndex < 7) return 'MODERATE'; // 5, 6
        if (kpIndex < 9) return 'HIGH';     // 7, 8
        return 'EXTREME';                   // 9+
      }

      if (type === 'CME') {
        // Check Speed from analysis
        const speed = data.cmeAnalyses?.[0]?.speed || 0;
        if (speed < 500) return 'LOW';
        if (speed < 1000) return 'MODERATE';
        if (speed < 2000) return 'HIGH';
        return 'EXTREME';
      }
    } catch (err) {
      console.warn(`[CosmicWeatherService] Severity mapping error for ${type}:`, err.message);
      return 'LOW';
    }
    return 'LOW';
  }

  /**
   * Get unified real-time space weather data
   * Aggregates, normalizes, and caches the result.
   */
  async getUnifiedData() {
    const now = Date.now();

    // 1. Return Cache if valid
    if (this.cache.data && (now - this.cache.lastFetch < this.CACHE_DURATION)) {
      console.log('[CosmicWeatherService] Returning cached data.');
      return this.cache.data;
    }

    console.log('[CosmicWeatherService] Fetching fresh data from NASA & NOAA...');

    // 2. Parallel Fetch
    const [cmeData, flrData, gstData, radiationData] = await Promise.all([
      this.fetchCME(),
      this.fetchFLR(),
      this.fetchGST(),
      this.fetchRadiationAlerts()
    ]);

    // 3. Normalize & Aggregate
    const unifiedEvents = [];
    let maxKpIndex = 1; // Default low activity

    // Process CMEs
    if (cmeData) {
      cmeData.forEach(event => {
        const analysis = event.cmeAnalyses?.[0];
        const severity = this._mapSeverity('CME', event);
        const confidence = analysis?.type === 'S' ? 'HIGH' : 'MODERATE'; // S=Scientific (High confidence)

        unifiedEvents.push({
          id: event.activityID,
          type: 'CME',
          severity: severity,
          startTime: event.startTime,
          expectedImpactTime: analysis?.time21_5deg || null,
          description: event.note || `CME detected at ${event.sourceLocation || 'Unknown'}`,
          confidenceLevel: confidence
        });
      });
    }

    // Process Flares
    if (flrData) {
      flrData.forEach(event => {
        const severity = this._mapSeverity('FLARE', event);
        
        unifiedEvents.push({
          id: event.flrID,
          type: 'FLARE',
          severity: severity,
          startTime: event.beginTime,
          expectedImpactTime: null, // Immediate
          description: `Class ${event.classType} Solar Flare from Region ${event.activeRegionNum}`,
          confidenceLevel: 'HIGH' // Direct observation
        });
      });
    }

    // Process Geomagnetic Storms
    if (gstData) {
      gstData.forEach(event => {
        const severity = this._mapSeverity('GEOMAGNETIC', event);
        
        // Track max Kp for aurora forecast
        const kp = event.allKpIndex?.[0]?.kpIndex || 0;
        if (kp > maxKpIndex) maxKpIndex = kp;
        
        unifiedEvents.push({
          id: event.gstID,
          type: 'GEOMAGNETIC',
          severity: severity,
          startTime: event.startTime,
          expectedImpactTime: null, // Already started
          description: `Geomagnetic Storm (${event.link ? 'Linked' : 'Observed'})`,
          confidenceLevel: 'HIGH' // Direct measurement
        });
      });
    }

    // Sort by recent start time
    unifiedEvents.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));

    // 4. Generate Aurora Forecast
    // Use the max Kp found in GSTs, or default to 1 if no storms.
    const auroraForecast = auroraEngine.generateForecastFromKp(maxKpIndex);

    // 5. Update Cache (New Response Structure)
    const result = {
      activeSolarStorms: unifiedEvents,
      auroraForecast: auroraForecast,
      radiationAlerts: radiationData || [],
      lastUpdatedTimestamp: new Date().toISOString()
    };

    this.cache.data = result;
    this.cache.lastFetch = now;

    return result;
  }

  /**
   * Utility to get date string YYYY-MM-DD for N days ago
   */
  _getRelativeDate(daysAgo) {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString().split('T')[0];
  }
}

module.exports = CosmicWeatherService;
