export const missionBriefings = [
    {
        id: 'orbital-mechanics',
        title: 'Orbital Mechanics 101',
        difficulty: 'Analyst',
        duration: '10 min',
        content: `Understanding how satellites stay in space requires mastering the balance between gravity and velocity. 
    Low Earth Orbit (LEO) satellites travel at ~7.8 km/s to prevent falling back to Earth. 
    Geostationary Orbit (GEO) requires an altitude of 35,786 km, where a satellite's period matches Earth's rotation exactly.`,
        technicalData: {
            leoVelocity: '7.8 km/s',
            geoAltitude: '35,786 km',
            keplersLaws: 'T² ∝ r³'
        }
    },
    {
        id: 'remote-sensing',
        title: 'The Eye in the Sky: Remote Sensing',
        difficulty: 'Commander',
        duration: '15 min',
        content: `Satellites use the Electromagnetic Spectrum to monitor Earth's health. 
    NDVI (Normalized Difference Vegetation Index) uses Near-Infrared light to measure plant photosynthesis. 
    SAR (Synthetic Aperture Radar) can see through clouds and smoke, providing critical data during floods and fires.`,
        impactAreas: ['Agriculture', 'Disaster Relief', 'Climate Change']
    },
    {
        id: 'solar-storms',
        title: 'Solar Dynamics & The Magnetosphere',
        difficulty: 'Specialist',
        duration: '12 min',
        content: `The Sun is a dynamic star that constantly emits charged particles. During Coronal Mass Ejections (CMEs), billions of tons of plasma are hurled into space. When these hit Earth's magnetosphere, they cause geomagnetic storms, visualized as Auroras but also posing risks to GPS and power grids.`,
        technicalData: {
            kpScale: '0-9 (G-Scale)',
            particleSpeed: '300-2000 km/s',
            stormDuration: '24-72 hours'
        }
    }
];

export const quizCategories = [
    { id: 'orbital', title: 'Orbital Dynamics', icon: 'Layers' },
    { id: 'sensing', title: 'Remote Sensing', icon: 'Globe' },
    { id: 'weather', title: 'Cosmic Weather', icon: 'Zap' },
    { id: 'missions', title: 'Mission History', icon: 'Rocket' }
];

export const quizzes = {
    orbital: [
        {
            question: 'What is the "Kessler Syndrome"?',
            options: ['Space radiation sickness', 'Debris collision chain reaction', 'Satellite engine failure', 'Solar flare impact'],
            answer: 'Debris collision chain reaction',
            explanation: 'A scenario where the density of objects in LEO is high enough that collisions cause a cascade of debris.'
        },
        {
            question: 'At what altitude does a Geostationary Orbit (GEO) occur?',
            options: ['2,000 km', '20,000 km', '35,786 km', '42,000 km'],
            answer: '35,786 km',
            explanation: 'Matches Earths rotational period exactly.'
        },
        {
            question: 'What is the eccentricity of a perfect circular orbit?',
            options: ['0', '0.5', '1', 'Infinity'],
            answer: '0',
            explanation: 'Eccentricity (e) measures how much an orbit deviates from a circle.'
        },
        {
            question: 'Which Lagrange point is located between the Sun and Earth?',
            options: ['L1', 'L2', 'L3', 'L4'],
            answer: 'L1',
            explanation: 'L1 is ideal for solar observations.'
        },
        {
            question: 'What velocity is required to escape Earths gravity?',
            options: ['7.8 km/s', '11.2 km/s', '30 km/s', '150 km/s'],
            answer: '11.2 km/s',
            explanation: 'This is known as the Escape Velocity.'
        },
        {
            question: 'What defines a "Mollynia Orbit"?',
            options: ['Low inclination', 'Highly elliptical & high inclination', 'Perfectly circular', 'Retrograde'],
            answer: 'Highly elliptical & high inclination',
            explanation: 'Designed to provide coverage for high-latitude regions like Russia.'
        },
        {
            question: 'What is the period of a satellite in LEO?',
            options: ['60 mins', '90-120 mins', '12 hours', '24 hours'],
            answer: '90-120 mins',
            explanation: 'LEO satellites circle the Earth about 16 times a day.'
        },
        {
            question: 'Which force provides the centripetal acceleration for an orbit?',
            options: ['Magnetism', 'Friction', 'Gravity', 'Radiation pressure'],
            answer: 'Gravity',
            explanation: 'Gravity pulls the satellite toward the Earth, keeping it in its path.'
        },
        {
            question: 'What is a retrograde orbit?',
            options: ['Orbits with Earths rotation', 'Orbits against Earths rotation', 'Orbits over the poles', 'Stationary orbits'],
            answer: 'Orbits against Earths rotation',
            explanation: 'Orbiting in the opposite direction of the planets rotation.'
        },
        {
            question: 'Keplers Second Law states that a line segment joining a planet and the Sun sweeps out:',
            options: ['Variable areas', 'Equal areas in equal time', 'Circular areas', 'Elliptical paths'],
            answer: 'Equal areas in equal time',
            explanation: 'Also known as the Law of Equal Areas.'
        }
    ],
    sensing: [
        {
            question: 'What does NDVI stand for?',
            options: ['New Digital Video Index', 'Normalized Difference Vegetation Index', 'Natural Data Visual Input', 'Near Deployment Visual Info'],
            answer: 'Normalized Difference Vegetation Index',
            explanation: 'Used to measure the health of vegetation.'
        },
        {
            question: 'Which spectral bands are used for NDVI?',
            options: ['Blue & Green', 'Red & Near-Infrared', 'Gamma & X-Ray', 'Thermal & UV'],
            answer: 'Red & Near-Infrared',
            explanation: 'Calculated as (NIR-Red)/(NIR+Red).'
        },
        {
            question: 'What is the primary advantage of SAR over optical sensors?',
            options: ['Higher resolution', 'Cheaper', 'Sees through clouds/darkness', 'Better colors'],
            answer: 'Sees through clouds/darkness',
            explanation: 'Synthetic Aperture Radar uses microwaves, which penetrate atmosphere.'
        },
        {
            question: 'Which instrument is primarily used to measure sea surface height?',
            options: ['Altimeter', 'Spectrometer', 'Magnetometer', 'Radiometer'],
            answer: 'Altimeter',
            explanation: 'Radar altimeters measure distance to the surface by timing reflected pulses.'
        },
        {
            question: 'What is "Spatial Resolution"?',
            options: ['Number of spectral bands', 'Size of the smallest detectable object', 'Frequency of data capture', 'Bit-depth of imagery'],
            answer: 'Size of the smallest detectable object',
            explanation: 'Usually expressed in meters per pixel.'
        },
        {
            question: 'What is a "Sun-Synchronous" orbit?',
            options: ['Orbits the Sun directly', 'Passes over at the same local solar time', 'Stays in Earths shadow', 'Always faces away from Sun'],
            answer: 'Passes over at the same local solar time',
            explanation: 'Ideal for consistent lighting in Earth observation.'
        },
        {
            question: 'What does Thermal Infrared help detect?',
            options: ['Chlorophyll', 'Heat signatures/Temperature', 'Mineral deposits', 'Wind speed'],
            answer: 'Heat signatures/Temperature',
            explanation: 'Used for monitoring volcanoes, urban heat islands, and wildfires.'
        },
        {
            question: 'What is "Hyperspectral" imaging?',
            options: ['High speed imaging', 'Imaging across hundreds of narrow bands', '3D imaging', 'Imaging in deep space only'],
            answer: 'Imaging across hundreds of narrow bands',
            explanation: 'Provides a "chemical signature" of objects.'
        },
        {
            question: 'Lidar stands for:',
            options: ['Light Distance and Range', 'Light Detection and Ranging', 'Linear Data and Radio', 'Laser Integrated Data'],
            answer: 'Light Detection and Ranging',
            explanation: 'Uses pulsed lasers to map 3D structures.'
        },
        {
            question: 'Which NASA mission is famous for 50+ years of continuous Earth imagery?',
            options: ['Landsat', 'Voyager', 'Hubble', 'Artemis'],
            answer: 'Landsat',
            explanation: 'The Landsat program is the longest-running enterprise for acquisition of satellite imagery of Earth.'
        }
    ],
    weather: [
        {
            question: 'What is a CME?',
            options: ['Cosmic Mass Entry', 'Coronal Mass Ejection', 'Circular Magnetic Effect', 'Core Mantle Expansion'],
            answer: 'Coronal Mass Ejection',
            explanation: 'A huge bubble of plasma released from the Sun.'
        },
        {
            question: 'What scale is used for Geomagnetic Storm severity?',
            options: ['Richter', 'Kp Index (G-Scale)', 'Celsius', 'Beaufort'],
            answer: 'Kp Index (G-Scale)',
            explanation: 'Goes from 0 to 9, where 5+ is a storm.'
        },
        {
            question: 'How long does light take to travel from Sun to Earth?',
            options: ['1 second', '8 minutes', '1 hour', '24 hours'],
            answer: '8 minutes',
            explanation: 'Light speed (c) covers the ~150 million km in 499 seconds.'
        },
        {
            question: 'What causes the Northern Lights (Aurora)?',
            options: ['Oxygen burning', 'Solar particles hitting atmosphere', 'Moonlight reflections', 'Ocean bioluminescence'],
            answer: 'Solar particles hitting atmosphere',
            explanation: 'Excited gases in the upper atmosphere emit light.'
        },
        {
            question: 'What is a "Solar Flare"?',
            options: ['A sunspot', 'Sudden blast of electromagnetic radiation', 'A cool region on Sun', 'Planetary transit'],
            answer: 'Sudden blast of electromagnetic radiation',
            explanation: 'Intense localized eruption of energy.'
        },
        {
            question: 'Which satellite observes the Sun from L1?',
            options: ['SOHO', 'James Webb', 'Voyager 1', 'GPS'],
            answer: 'SOHO',
            explanation: 'Solar and Heliospheric Observatory.'
        },
        {
            question: 'What is the "Solar Wind"?',
            options: ['Friction in space', 'Stream of charged particles', 'Atmospheric gases', 'Gravitational waves'],
            answer: 'Stream of charged particles',
            explanation: 'A constant flow of electrons and protons from the Sun.'
        },
        {
            question: 'A G5 Geomagnetic storm is considered:',
            options: ['Minor', 'Moderate', 'Strong', 'Extreme'],
            answer: 'Extreme',
            explanation: 'G5 can cause widespread power grid issues.'
        },
        {
            question: 'What protects Earth from most solar radiation?',
            options: ['The Ozone Layer', 'The Magnetosphere', 'The Moon', 'Clouds'],
            answer: 'The Magnetosphere',
            explanation: 'The region of space surrounding Earth where the magnetic field is dominant.'
        },
        {
            question: 'Sunspots are parts of the Sun that are:',
            options: ['Hotter', 'Cooler', 'Solid', 'Void'],
            answer: 'Cooler',
            explanation: 'Areas of intense magnetic activity that inhibit convection.'
        }
    ],
    missions: [
        {
            question: 'Which mission first landed humans on the Moon?',
            options: ['Apollo 1', 'Apollo 11', 'Artemis', 'Gemini'],
            answer: 'Apollo 11',
            explanation: 'Armstrong and Aldrin landed in 1969.'
        },
        {
            question: 'What is the longest-operating spacecraft in deep space?',
            options: ['Hubble', 'Voyager 1', 'Pioneer', 'ISS'],
            answer: 'Voyager 1',
            explanation: 'Launched in 1977, it is now in interstellar space.'
        },
        {
            question: 'Which planet does the Perseverance rover currently explore?',
            options: ['Venus', 'Jupiter', 'Mars', 'Saturn'],
            answer: 'Mars',
            explanation: 'Searching for signs of ancient life in Jezero Crater.'
        },
        {
            question: 'The ISS orbits Earth approximately how many times per day?',
            options: ['1', '8', '16', '32'],
            answer: '16',
            explanation: 'Traveling at 28,000 km/h, it completes an orbit every 90 mins.'
        },
        {
            question: 'Which telescope replaced Hubble as the primary deep space observer?',
            options: ['Spitzer', 'James Webb (JWST)', 'Kepler', 'TESS'],
            answer: 'James Webb (JWST)',
            explanation: 'Webb observes primarily in Infrared.'
        },
        {
            question: 'NASA Artemis mission aims to return humans to:',
            options: ['Mars', 'The Moon', 'Titan', 'Asteroid Belt'],
            answer: 'The Moon',
            explanation: 'Focusing on the Lunar South Pole.'
        },
        {
            question: 'Who was the first human in space?',
            options: ['Neil Armstrong', 'Yuri Gagarin', 'John Glenn', 'Buzz Aldrin'],
            answer: 'Yuri Gagarin',
            explanation: 'Vostok 1, April 12, 1961.'
        },
        {
            question: 'Which mission discovered water ice on the Lunar poles?',
            options: ['LCROSS / LRO', 'Apollo 17', 'Viking 1', 'Galileo'],
            answer: 'LCROSS / LRO',
            explanation: 'Confirmed significant water deposits in shadowed craters.'
        },
        {
            question: 'New Horizons mission performed the first flyby of:',
            options: ['Saturn', 'Pluto', 'Ceres', 'Eris'],
            answer: 'Pluto',
            explanation: 'Provided the first high-res images of the "Heart" of Pluto.'
        },
        {
            question: 'Which agency operates the Rosetta comet-landing mission?',
            options: ['NASA', 'ESA', 'ISRO', 'JAXA'],
            answer: 'ESA',
            explanation: 'Landded the Philae probe on Comet 67P.'
        }
    ]
};
