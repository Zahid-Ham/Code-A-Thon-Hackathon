const satellite = require('satellite.js');

class VisibilityTimelineService {
    /**
     * Calculate visibility windows for a satellite
     * @param {string} tle1 - TLE Line 1
     * @param {string} tle2 - TLE Line 2
     * @param {number} observerLat - Observer Latitude (degrees)
     * @param {number} observerLng - Observer Longitude (degrees)
     * @param {number} observerAlt - Observer Altitude (km) - Default 0
     * @returns {Array} List of VisibilityEvent objects
     */
    static calculateVisibility(tle1, tle2, observerLat, observerLng, observerAlt = 0) {
        const satRec = satellite.twoline2satrec(tle1, tle2);
        const passes = [];
        
        // Simulation parameters
        // Simulation parameters
        // Start 6 hours in the past to show recent history
        const startTime = new Date(Date.now() - 6 * 60 * 60 * 1000); 
        const durationHours = 30; // 6h past + 24h future
        const stepSeconds = 60; // 1-minute resolution for speed, fine-tune if needed
        const minElevation = 10; // degrees, standard visibility threshold

        let currentPass = null;

        for (let i = 0; i <= durationHours * 60 * 60; i += stepSeconds) {
            const time = new Date(startTime.getTime() + i * 1000);
            
            // 1. Propagate satellite
            const positionAndVelocity = satellite.propagate(satRec, time);
            const gmst = satellite.gstime(time);
            
            // 2. Get Look Angles (Azimuth, Elevation, Range)
            const positionGd = {
                longitude: satellite.degreesToRadians(observerLng),
                latitude: satellite.degreesToRadians(observerLat),
                height: observerAlt
            };

            if (!positionAndVelocity.position) continue; // Skip if propagation error

            const positionEcf = satellite.eciToEcf(positionAndVelocity.position, gmst);
            const lookAngles = satellite.ecfToLookAngles(positionGd, positionEcf);

            const elevationDeg = satellite.radiansToDegrees(lookAngles.elevation);
            const azimuthDeg = satellite.radiansToDegrees(lookAngles.azimuth);

            // 3. Detect Pass State
            if (elevationDeg >= minElevation) {
                if (!currentPass) {
                    // Start of a new pass
                    currentPass = {
                        startTime: time,
                        maxElevation: elevationDeg,
                        peakTime: time,
                        endTime: null,
                        azimuthStart: azimuthDeg
                    };
                } else {
                    // Ongoing pass, update max elevation
                    if (elevationDeg > currentPass.maxElevation) {
                        currentPass.maxElevation = elevationDeg;
                        currentPass.peakTime = time;
                    }
                }
            } else {
                if (currentPass) {
                    // End of pass
                    currentPass.endTime = time;
                    currentPass.duration = (currentPass.endTime - currentPass.startTime) / 1000; // seconds
                    
                    // Normalize entry
                    passes.push(this._normalizeEvent(currentPass));
                    currentPass = null;
                }
            }
        }
        
        // Close any ongoing pass at the end of simulation
        if (currentPass) {
            currentPass.endTime = new Date(startTime.getTime() + durationHours * 60 * 60 * 1000);
            currentPass.duration = (currentPass.endTime - currentPass.startTime) / 1000;
            passes.push(this._normalizeEvent(currentPass));
        }

        return passes;
    }

    static _normalizeEvent(passData) {
        // Calculate confidence based on max elevation
        let confidence = 'LOW';
        if (passData.maxElevation > 60) confidence = 'HIGH';
        else if (passData.maxElevation > 30) confidence = 'MEDIUM';

        return {
            eventId: crypto.randomUUID(),
            startTime: passData.startTime.toISOString(),
            peakTime: passData.peakTime.toISOString(),
            endTime: passData.endTime.toISOString(),
            duration: Math.round(passData.duration),
            maxElevation: Math.round(passData.maxElevation),
            visibilityConfidence: confidence,
            type: 'VISIBLE_PASS'
        };
    }

    /**
     * Calculate visibility footprint (zones) for a given time
     * @param {string} tle1 
     * @param {string} tle2 
     * @param {Date|string} time 
     */
    /**
     * Calculate visibility footprint (zones) for a given time
     * @param {string} tle1 
     * @param {string} tle2 
     * @param {Date|string} time 
     * @param {number} lat - Optional static lat
     * @param {number} lng - Optional static lng
     */
    static calculateFootprint(tle1, tle2, timeRequest, lat, lng) {
        const time = timeRequest ? new Date(timeRequest) : new Date();

        // Check if Satellite TLEs are valid
        if (tle1 && tle2 && tle1.length > 10) {
            try {
                const satRec = satellite.twoline2satrec(tle1, tle2);
                
                // Propagate
                const positionAndVelocity = satellite.propagate(satRec, time);
                if (!positionAndVelocity.position) {
                    console.log('VisService: Sat propagation failed for', time);
                    return null;
                }
        
                const gmst = satellite.gstime(time);
                const positionGd = satellite.eciToGeodetic(positionAndVelocity.position, gmst);
        
                const satAlt = positionGd.height; // km
                const satLat = satellite.degreesToRadians(positionGd.latitude); // result in radians
                const satLng = satellite.degreesToRadians(positionGd.longitude); // result in radians

                // Convert back to degrees for static gen, wait... 
                // _generateCircle takes radians.
                const center = [satLng, satLat]; 

                // Dynamic radius based on altitude
                const R_EARTH = 6371;
                const cosAlpha = R_EARTH / (R_EARTH + satAlt);
                const alpha = Math.acos(cosAlpha); // Horizon

                const getGamma = (elDeg) => {
                    const el = elDeg * (Math.PI/180);
                    return Math.acos( (R_EARTH / (R_EARTH + satAlt)) * Math.cos(el) ) - el;
                };

                const polyHorizon = this._generateCircle(center, alpha);
                const polyPartial = this._generateCircle(center, getGamma(25));
                const polyHigh = this._generateCircle(center, getGamma(50));

                return this._formatFeatures(polyHorizon, polyPartial, polyHigh);
            } catch (err) {
                console.error("VisService: TLE calc error", err);
            }
        }

        // Fallback: Static Footprint if lat/lng provided
        if (lat !== undefined && lng !== undefined) {
             console.log(`VisService: Generating static footprint for ${lat}, ${lng}`);
             return this.calculateStaticFootprint(lat, lng);
        }

        return null;
    }

    static calculateStaticFootprint(latDeg, lngDeg) {
        // Convert to Radians
        const center = [satellite.degreesToRadians(lngDeg), satellite.degreesToRadians(latDeg)];
        
        // Fixed radii for static events (Larger for visual impact on 2D map)
        // 1 deg lat ~ 111km
        // Reference: Eclipse/Planetary alignment visibility is often hemispherical or wide.
        // Let's make "Horizon" very large (~5000km) to mimic "Visible from this hemisphere"
        const radHorizon = 1.0; // ~6000km (approx)
        const radPartial = 0.5; // ~3000km
        const radHigh = 0.2; // ~1200km

        const polyHorizon = this._generateCircle(center, radHorizon);
        const polyPartial = this._generateCircle(center, radPartial);
        const polyHigh = this._generateCircle(center, radHigh);

        return this._formatFeatures(polyHorizon, polyPartial, polyHigh);
    }

    static _formatFeatures(polyHorizon, polyPartial, polyHigh) {
        return {
            type: "FeatureCollection",
            features: [
                {
                    type: "Feature",
                    properties: { type: "horizon", opacity: 0.2, color: "#00F0FF" },
                    geometry: { type: "Polygon", coordinates: [polyHorizon] }
                },
                {
                    type: "Feature",
                    properties: { type: "partial", opacity: 0.4, color: "#00F0FF" },
                    geometry: { type: "Polygon", coordinates: [polyPartial] }
                },
                {
                    type: "Feature",
                    properties: { type: "high", opacity: 0.6, color: "#FFFFFF" },
                    geometry: { type: "Polygon", coordinates: [polyHigh] }
                }
            ]
        };
    }

    // Helper: Generate circle coordinates on sphere (GeoJSON format: [lng, lat])
    static _generateCircle(center, radiusRad, numPoints = 60) {
        const coordinates = [];
        const [lng, lat] = center; // radians

        for (let i = 0; i <= numPoints; i++) {
            const bearing = (i / numPoints) * 2 * Math.PI;

            const latOut = Math.asin(Math.sin(lat) * Math.cos(radiusRad) +
                                     Math.cos(lat) * Math.sin(radiusRad) * Math.cos(bearing));
            
            const lngOut = lng + Math.atan2(Math.sin(bearing) * Math.sin(radiusRad) * Math.cos(lat),
                                            Math.cos(radiusRad) - Math.sin(lat) * Math.sin(latOut));
            
            // Normalize Lng to -180..180
            let lngDeg = lngOut * (180 / Math.PI);
            let latDeg = latOut * (180 / Math.PI);
            
            // Normalize longitude
            lngDeg = ((lngDeg + 540) % 360) - 180;

            coordinates.push([lngDeg, latDeg]);
        }
        return coordinates;
    }
}

module.exports = VisibilityTimelineService;
