/**
 * Engine to derive Aurora visibility from Geomagnetic Data
 */
class AuroraForecastEngine {
  constructor() {}

  /**
   * Generates a forecast object based on the Kp Index.
   * @param {number} kpIndex 
   * @returns {object} AuroraForecast
   */
  generateForecastFromKp(kpIndex) {
    const visibility = this.calculateVisibility(kpIndex);
    const range = this.calculateLatitudeRange(kpIndex);
    const summary = this.generateSummary(kpIndex, visibility, range);
    
    // Default valid range 8 hours
    const now = new Date();
    const end = new Date(now.getTime() + 8 * 3600 * 1000); 

    return {
      kpIndex: kpIndex,
      visibilityLevel: visibility,
      visibleLatitudeRange: range,
      forecastStartTime: now.toISOString(),
      forecastEndTime: end.toISOString(),
      humanReadableSummary: summary
    };
  }

  /**
   * Determine visibility level
   */
  calculateVisibility(kp) {
    if (kp < 3) return 'NONE'; // G0
    if (kp < 5) return 'LOW';  // G0+
    if (kp < 7) return 'MEDIUM'; // G1, G2
    return 'HIGH'; // G3+
  }

  /**
   * Determine geographic reach
   */
  calculateLatitudeRange(kp) {
    if (kp < 3) return '> 65°N (Polar Regions)';
    if (kp < 5) return '> 60°N (High Latitudes)';
    if (kp < 7) return '> 50°N (Mid Latitudes)';
    return '> 40°N (Low Latitudes)';
  }

  /**
   * Generate human friendly summary
   */
  generateSummary(kp, visibility, latRange) {
    if (visibility === 'NONE') return 'Aurora activity is low. Visible only in polar regions.';
    
    let locations = '';
    if (kp >= 7) locations = 'Seattle, Chicago, Paris, Berlin';
    else if (kp >= 5) locations = 'Edmonton, Oslo, Helsinki';
    else locations = 'Reykjavik, Fairbanks, Tromsø';

    return `Aurora visible at ${latRange} (${locations}). Current Kp: ${kp}.`;
  }
}

module.exports = new AuroraForecastEngine();
