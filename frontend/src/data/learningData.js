export const missionBriefings = [

    // Global Guardians (12 Missions)
    {
        id: 'gg-1', theme: 'Global Guardians', sequence: 1, era: 'Pioneer', title: 'Sputnik 1',
        content: 'Launched in 1957 by the Soviet Union, Sputnik 1 was the first artificial satellite to successfully orbit the Earth. This polished metal sphere broadcasted radio pulses that provided critical data on the density of the upper atmosphere. Its success triggered the global Space Race and proved that human-made objects could maintain a stable orbit.',
        technicalData: { launch: '1957', orbit: 'LEO', battery: '21 days' },
        imageUrl: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&q=80&w=800',
        officialLink: 'https://en.wikipedia.org/wiki/Sputnik_1'
    },
    {
        id: 'gg-2', theme: 'Global Guardians', sequence: 2, era: 'Pioneer', title: 'TIROS-1',
        content: 'TIROS-1, launched in 1960, was the first successful weather satellite and revolutionized our ability to monitor Earth from space. It provided the first television imagery of cloud patterns, proving that satellites were essential for meteorology. This mission established space as the ultimate high ground for planetary protection and storm tracking.',
        technicalData: { sensors: 'TV-Vidicon', weight: '122kg' },
        imageUrl: 'https://s.yimg.com/zb/imgv1/eff4f372-d2b8-38fd-aa4c-a7f3fd3276aa/t_500x300',
        officialLink: 'https://science.nasa.gov/mission/tiros/'
    },
    {
        id: 'gg-3', theme: 'Global Guardians', sequence: 3, era: 'Analysis', title: 'Landsat 1',
        content: 'Launched in 1972, Landsat 1 initiated the longest continuous record of Earth\'s land surface from orbital space. It carried a Multispectral Scanner that allowed scientists to monitor vegetation health and urban growth on a global scale. Its legacy continues through a series of satellites that remain critical for monitoring climate change and resource management.',
        technicalData: { resolution: '80m', sensors: 'MSS' },
        imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800',
        officialLink: 'https://landsat.gsfc.nasa.gov/satellites/landsat-1/'
    },
    {
        id: 'gg-4', theme: 'Global Guardians', sequence: 4, era: 'Analysis', title: 'GOES-1',
        content: 'GOES-1, launched in 1975, provided the first continuous weather monitoring from a fixed point in geostationary orbit. It allowed for real-time tracking of hurricane development and paved the way for modern severe weather alerts. This constant vigilance from orbit has since saved countless lives by providing early warnings for catastrophic storms.',
        technicalData: { orbit: 'GEO', altitude: '35,786km' },
        imageUrl: 'https://s.yimg.com/zb/imgv1/7e12a17f-bc5a-3709-8588-62082fe5d291/t_500x300',
        officialLink: 'https://en.wikipedia.org/wiki/GOES_1'
    },
    {
        id: 'gg-5', theme: 'Global Guardians', sequence: 5, era: 'Modern', title: 'TRMM',
        content: 'The Tropical Rainfall Measuring Mission, launched in 1997, provided the first 3D view of tropical rainfall and thunderstorms. By using precipitation radar to see inside storms, it significantly improved our understanding of the global water cycle. This joint NASA-JAXA mission established the technical foundation for all modern global precipitation measurements.',
        technicalData: { radar: 'PR', swath: '215km' },
        imageUrl: 'https://tse4.mm.bing.net/th/id/OIP.O5bfI-xZeUfzDbrDNeeYdAHaFJ?pid=Api&P=0&h=220',
        officialLink: 'https://trmm.gsfc.nasa.gov/'
    },
    {
        id: 'gg-6', theme: 'Global Guardians', sequence: 6, era: 'Modern', title: 'Terra',
        content: 'Launched in 1999, Terra is the flagship of NASA\'s Earth Observing System, monitoring land, oceans, and atmosphere simultaneously. It carries five specialized instruments that provide a comprehensive health check for our planet every few days. Terra\'s data has been pivotal in documenting the accelerating impacts of climate change over the last two decades.',
        technicalData: { sensors: 'MODIS', life: '20+ yrs' },
        imageUrl: 'https://images.unsplash.com/photo-1502134249126-9f3755a50d78?auto=format&fit=crop&q=80&w=800',
        officialLink: 'https://terra.nasa.gov/'
    },
    {
        id: 'gg-7', theme: 'Global Guardians', sequence: 7, era: 'Modern', title: 'Aqua',
        content: 'Launched in 2002, Aqua focuses on the global water cycle by monitoring evaporation, precipitation, and polar ice caps. It uses microwave sensors to see through clouds, providing accurate sea surface temperatures even during intense storms. Aqua\'s measurements are essential for tracking El Niño events and predicting long-term climate trends.',
        technicalData: { sensor: 'AIRS', accuracy: '1K' },
        imageUrl: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&q=80&w=800',
        officialLink: 'https://aqua.nasa.gov/'
    },
    {
        id: 'gg-8', theme: 'Global Guardians', sequence: 8, era: 'Modern', title: 'Aura',
        content: 'Aura, launched in 2004, is dedicated to monitoring the chemistry of Earth\'s atmosphere and the recovery of the ozone layer. Its instruments measure trace gases at parts-per-billion levels, helping scientists track air quality and greenhouse gas concentrations. By watching over our atmospheric shield, Aura ensures we have the data needed to protect global respiratory health.',
        technicalData: { sensor: 'OMI', trace: 'O3/NO2' },
        imageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=800',
        officialLink: 'https://aura.gsfc.nasa.gov/'
    },
    {
        id: 'gg-9', theme: 'Global Guardians', sequence: 9, era: 'Modern', title: 'Sentinel-1',
        content: 'Sentinel-1 uses synthetic aperture radar to monitor Earth through clouds, rain, and total darkness. It provides a constant data stream essential for mapping floods, tracking sea ice, and managing natural disasters in real-time. Its ability to detect subtle ground shifts makes it a vital early-warning system for volcanoes and earthquake zones.',
        technicalData: { type: 'SAR', revisit: '6 days' },
        imageUrl: 'https://tse4.mm.bing.net/th/id/OIP.O5bfI-xZeUfzDbrDNeeYdAHaFJ?pid=Api&P=0&h=220',
        officialLink: 'https://en.wikipedia.org/wiki/Sentinel-1'
    },
    {
        id: 'gg-10', theme: 'Global Guardians', sequence: 10, era: 'Modern', title: 'Sentinel-2',
        content: 'Sentinel-2 delivers high-resolution optical imagery that is critical for agricultural monitoring and global forest management. Its thirteen spectral bands can detect plant stress before it becomes visible to the human eye, supporting worldwide food security. This mission provides the most detailed look at how our land use affects the planet\' biology.',
        technicalData: { resolution: '10-60m', bands: '13' },
        imageUrl: 'https://tse4.mm.bing.net/th/id/OIP.O5bfI-xZeUfzDbrDNeeYdAHaFJ?pid=Api&P=0&h=220',
        officialLink: 'https://en.wikipedia.org/wiki/Sentinel-2'
    },
    {
        id: 'gg-11', theme: 'Global Guardians', sequence: 11, era: 'Modern', title: 'Sentinel-6',
        content: 'Sentinel-6 Michael Freilich measures global sea level rise with millimeter-level precision using an advanced radar altimeter. This data is essential for coastal cities to prepare for rising tides and for scientists to track melting polar ice. It continues a thirty-year legacy of ocean monitoring, providing the definitive record of our changing climate.',
        technicalData: { accuracy: '1cm', launch: '2020' },
        imageUrl: 'https://tse3.mm.bing.net/th/id/OIP.fY7XPY7mSBD0NtvcEogOcwHaFj?pid=Api&P=0&h=220',
        officialLink: 'https://www.nasa.gov/sentinel-6'
    },
    {
        id: 'gg-12', theme: 'Global Guardians', sequence: 12, era: 'Future', title: 'NISAR',
        content: 'NISAR is an upcoming radar mission that will map Earth\'s land surface every twelve days to track ecosystems and crustal shifts. By using dual-frequency radar, it can see through dense forest canopies to monitor carbon storage and volcanic swelling. This partnership between the US and India represents the future of global planetary vigilance.',
        technicalData: { L_Band: '24cm', S_Band: '10cm' },
        imageUrl: 'https://s.yimg.com/zb/imgv1/d3559c6c-cf54-304f-b355-f805e91eda5e/t_500x300',
        officialLink: 'https://nisar.jpl.nasa.gov/'
    },

    // Cosmic Seekers (18 Missions)
    {
        id: 'cs-1', theme: 'Cosmic Seekers', sequence: 1, era: 'Pioneer', title: 'Mariner 2',
        content: 'Launched in 1962, Mariner 2 was the first spacecraft to reach another planet, successfully flying past Venus. It revealed that Venus was a hellish greenhouse world hot enough to melt lead, fundamentally changing our view of planetary evolution. This flyby established the technical template for all future interplanetary exploration missions.',
        technicalData: { encounter: 'Venus', year: '1962' },
        imageUrl: 'https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?auto=format&fit=crop&q=80&w=800',
        officialLink: 'https://en.wikipedia.org/wiki/Mariner_2'
    },
    {
        id: 'cs-2', theme: 'Cosmic Seekers', sequence: 2, era: 'Pioneer', title: 'Venera 7',
        content: 'Venera 7 was the first spacecraft to land on and transmit data from the surface of another planet, surviving the extreme pressure of Venus. It relayed critical data for twenty-three minutes, proving that human engineering could survive the solar system\'s most hostile environments. This Soviet mission remains a masterpiece of thermal engineering and deep-space survival.',
        technicalData: { pressure: '90 atm', temp: '475C' },
        imageUrl: 'https://s.yimg.com/zb/imgv1/a2c8c7d5-82a6-3550-afd1-0f7ff3fd8636/t_500x300',
        officialLink: 'https://en.wikipedia.org/wiki/Venera_7'
    },
    {
        id: 'cs-3', theme: 'Cosmic Seekers', sequence: 3, era: 'Detection', title: 'Viking 1',
        content: 'Viking 1 was the first US spacecraft to successfully land on Mars and perform a long-term science mission on the surface in 1975. It carried a sophisticated biological laboratory to search for signs of Martian metabolism, revolutionizing the field of astrobiology. The lander also provided the first high-resolution panoramic images of the dusty, rock-strewn Martian landscape.',
        technicalData: { lab: 'GCMS', mission: 'Bio-Search' },
        imageUrl: 'https://tse4.mm.bing.net/th/id/OIP.HoywffzezyBEHRyIYImmJQHaFy?pid=Api&P=0&h=220',
        officialLink: 'https://science.nasa.gov/mission/viking-1/'
    },
    {
        id: 'cs-4', theme: 'Cosmic Seekers', sequence: 4, era: 'Detection', title: 'Voyager 1',
        content: 'Voyager 1 is the farthest human-made object in existence, currently exploring the interstellar medium beyond our solar system. Launched in 1977, it discovered active volcanoes on Io and the potential for subsurface oceans on Jupiter\'s moon Europa. It continues to send back data on cosmic rays, serving as a persistent scout for the human race.',
        technicalData: { distance: '161 AU', status: 'Interstellar' },
        imageUrl: 'https://tse4.mm.bing.net/th/id/OIP.lo0MpcjECekSTnjWKe0IGwHaEK?pid=Api&P=0&h=220',
        officialLink: 'https://voyager.jpl.nasa.gov/'
    },
    {
        id: 'cs-5', theme: 'Cosmic Seekers', sequence: 5, era: 'Explorer', title: 'Chandrayaan-1',
        content: 'Launched in 2008, Chandrayaan-1 was India\'s first mission to the Moon and a major technological leap for ISRO. It famously discovered water molecules on the lunar surface using the Moon Mineralogy Mapper instrument. This mission confirmed the presence of lunar water ice and established India as a serious player in deep space exploration.',
        technicalData: { launch: '2008', goal: 'Lunar Water', payload: '11 instruments' },
        imageUrl: 'https://resize.indiatvnews.com/en/resize/newbucket/1200_-/2019/10/chandrayaan-1-1571713834.jpg',
        officialLink: 'https://www.isro.gov.in/Chandrayaan_1.html'
    },
    {
        id: 'cs-6', theme: 'Cosmic Seekers', sequence: 6, era: 'Rover', title: 'Curiosity',
        content: 'The Curiosity rover landed on Mars in 2012 to determine if the planet was ever habitable for microbial life. It discovered that Gale Crater once contained an ancient lake with the perfect chemical ingredients for life. By reading the layers of Martian history, Curiosity has transformed our understanding of the Red Planet\'s past.',
        technicalData: { laser: 'ChemCam', weight: '899kg' },
        imageUrl: 'https://tse1.mm.bing.net/th/id/OIP.WXRwnNE_A_HwEPTbkC2R8AHaEK?pid=Api&P=0&h=220',
        officialLink: 'https://mars.nasa.gov/msl/home/'
    },
    {
        id: 'cs-7', theme: 'Cosmic Seekers', sequence: 7, era: 'Rover', title: 'Mangalyaan (MOM)',
        content: 'The Mars Orbiter Mission, launched in 2013, made India the first nation to reach Mars on its maiden attempt. It was designed to explore Martian surface features, morphology, mineralogy, and the Martian atmosphere using indigenous scientific instruments. MOM is celebrated globally for its incredible cost-efficiency and technical precision.',
        technicalData: { launch: '2013', cost: '$74M', orbit: 'Martian' },
        imageUrl: 'https://tse2.mm.bing.net/th/id/OIP.RZhcYE242TcCg5LWO-iSKwHaD4?pid=Api&P=0&h=220',
        officialLink: 'https://www.isro.gov.in/MarsOrbiterMission.html'
    },
    {
        id: 'cs-8', theme: 'Cosmic Seekers', sequence: 8, era: 'Exploration', title: 'TESS',
        content: 'TESS is surveying the brightest stars to find planets transiting across their faces, mapping our cosmic neighborhood for habitable worlds. It has discovered thousands of exoplanet candidates, ranging from Earth-sized worlds to massive gas giants. This catalog provides the prime targets for future atmospheric studies by the James Webb telescope.',
        technicalData: { stars: '20M', planets: '1000s' },
        imageUrl: 'https://tse1.mm.bing.net/th/id/OIP.W3WdsyHi99PYDSYtYzZb4gHaE1?pid=Api&P=0&h=220',
        officialLink: 'https://tess.mit.edu/'
    },
    {
        id: 'cs-9', theme: 'Cosmic Seekers', sequence: 9, era: 'Rover', title: 'Chandrayaan-2',
        content: 'Chandrayaan-2, launched in 2019, was a highly complex mission comprising an Orbiter, Lander (Vikram), and Rover (Pragyan). While the lander faced a hard landing, the orbiter continues to provide high-resolution data on lunar mineralogy and water ice. It mapped the lunar South Pole in unprecedented detail, paving the way for future surface missions.',
        technicalData: { launch: '2019', orbiter_life: '7 yrs', sensors: 'OHRC' },
        imageUrl: 'https://tse1.mm.bing.net/th/id/OIP.iRFi_xFUPjVeI88pokmFtwHaGJ?pid=Api&P=0&h=220',
        officialLink: 'https://www.isro.gov.in/chandrayaan2.html'
    },
    {
        id: 'cs-10', theme: 'Cosmic Seekers', sequence: 10, era: 'Rover', title: 'Perseverance',
        content: 'Perseverance landed in Jezero Crater in 2021 to search for signs of ancient microbial life and collect samples for the first-ever return to Earth. It successfully deployed Ingenuity, the first helicopter to fly on another planet, proving controlled flight is possible in the thin Martian air. This rover is Currently caching high-value rock cores that might hold the secret to Martian biology.',
        technicalData: { helicopter: 'Ingenuity', samples: '38 tubes' },
        imageUrl: 'https://tse4.mm.bing.net/th/id/OIP.ofc_iszeSWV2a9QYxgYvKQHaEK?pid=Api&P=0&h=220',
        officialLink: 'https://mars.nasa.gov/mars2020/'
    },
    {
        id: 'cs-11', theme: 'Cosmic Seekers', sequence: 11, era: 'Exploration', title: 'James Webb',
        content: 'The James Webb Space Telescope is humanity\'s premier eye in the dark, peeking back nearly 13.5 billion years into our cosmic past. It uses ultra-sensitive infrared sensors to see through dust clouds and watch the very first stars in the universe igniting. Webb is currently rewiring our understanding of galaxy formation and the atmospheres of distant exoplanets.',
        technicalData: { mirror: '6.5m Gold', orbit: 'L2' },
        imageUrl: 'https://tse1.mm.bing.net/th/id/OIP.r6NwnABWwq6MHS6iv2TV3QHaE8?pid=Api&P=0&h=220',
        officialLink: 'https://webb.nasa.gov/'
    },
    {
        id: 'cs-12', theme: 'Cosmic Seekers', sequence: 12, era: 'Observation', title: 'Chandrayaan-3',
        content: 'In 2023, Chandrayaan-3 made history by making India the first nation to land near the lunar South Pole. The Pragyan rover successfully detected sulfur and other elements on the surface, providing critical data on the regions unique chemical composition. This mission demonstrated incredible precision in "soft landing" and confirmed Indias mastery of lunar logistics.',
        technicalData: { launch: '2023', landing: 'South Pole', rover: 'Pragyan' },
        imageUrl: 'https://tse1.mm.bing.net/th/id/OIP.0tmi_0gc1vQq805UtYd-cgHaEH?pid=Api&P=0&h=220',
        officialLink: 'https://www.isro.gov.in/Chandrayaan3.html'
    },
    {
        id: 'cs-13', theme: 'Cosmic Seekers', sequence: 13, era: 'Observation', title: 'Aditya-L1',
        content: 'Launched in 2023, Aditya-L1 is India\'s first dedicated space mission to study the Sun from the L1 Lagrange point. It carries seven payloads to observe the solar corona, photosphere, and chromosphere while monitoring the solar wind and magnetic fields. This mission provides critical data for solar weather forecasting and protecting Earth\'s electronic infrastructure.',
        technicalData: { orbit: 'L1 Halo', sensors: 'VELC/SUIT', distance: '1.5M km' },
        imageUrl: 'https://tse3.mm.bing.net/th/id/OIP.QeVM5moaJVnLF5qoc8nSLAHaEK?pid=Api&P=0&h=220',
        officialLink: 'https://www.isro.gov.in/Aditya_L1.html'
    },
    {
        id: 'cs-14', theme: 'Cosmic Seekers', sequence: 14, era: 'Observation', title: 'Europa Clipper',
        content: 'Europa Clipper will investigate Jupiter\'s moon Europa to determine if its subsurface ocean could harbor life. It will perform nearly fifty flybys to measure the thickness of the moon\'s ice shell and search for chemical signatures of life. This mission is the definitive quest to explore the ocean worlds of our outer solar system.',
        technicalData: { radar: 'REASON', launch: '2024' },
        imageUrl: 'https://tse4.mm.bing.net/th/id/OIP.NcwYc6A4FInT1nDC3UdX6gHaFg?pid=Api&P=0&h=220',
        officialLink: 'https://europa.nasa.gov/'
    },
    {
        id: 'cs-15', theme: 'Cosmic Seekers', sequence: 15, era: 'Frontier', title: 'Gaganyaan G1',
        content: 'Gaganyaan G1, India\'s first uncrewed test flight, is scheduled for early 2026 to validate critical systems for human spaceflight. Onboard will be Vyommitra, a humanoid robot designed to monitor life-support systems and simulate astronaut functions during the mission. This flight is the essential precursor to launching Indian astronauts into low-Earth orbit.',
        technicalData: { launch: '2026', rocket: 'LVM3', robot: 'Vyommitra' },
        imageUrl: 'https://tse4.mm.bing.net/th/id/OIP.2T08kZsFeudQMqCGAlmqiwHaFj?pid=Api&P=0&h=220',
        officialLink: 'https://www.isro.gov.in/Gaganyaan.html'
    },
    {
        id: 'cs-16', theme: 'Cosmic Seekers', sequence: 16, era: 'Observation', title: 'Dragonfly',
        content: 'Dragonfly is a bold mission to send a dual-quadcopter to Saturn\'s moon Titan to search for the chemical building blocks of life. Launching in 2027, it will hop across Titan\'s organic-rich surface to investigate dune fields and ancient impact craters. Titan is often considered a frozen version of early Earth, making this a journey through time.',
        technicalData: { rotors: '8', range: '175km' },
        imageUrl: 'https://sp.yimg.com/ib/th/id/OIP.OWU-lGjZIrm40XQ7TvYO0wHaDA?pid=Api&w=148&h=148&c=7&dpr=2&rs=1',
        officialLink: 'https://www.nasa.gov/dragonfly'
    },
    {
        id: 'cs-17', theme: 'Cosmic Seekers', sequence: 17, era: 'Frontier', title: 'Starship',
        content: 'Starship is a fully reusable spacecraft designed to carry crew and massive cargo to Earth orbit, the Moon, and Mars. Its revolutionary design aims to lower the cost of space access and enable the first multi-planetary human colony. It represents the culmination of a chain of discovery that began with Sputnik over seventy years ago.',
        technicalData: { thrust: '7.5k MN', payload: '100t+' },
        imageUrl: 'https://up.yimg.com/ib/th/id/OIP.J7c2J7Q3n7lKPWMQGbsikQHaEo?pid=Api&rs=1&c=1&qlt=95&w=179&h=112',
        officialLink: 'https://www.spacex.com/vehicles/starship/'
    },

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
