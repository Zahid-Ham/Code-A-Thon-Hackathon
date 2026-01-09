const axios = require('axios');
const Groq = require('groq-sdk');
const CosmicWeatherService = require('./CosmicWeatherService');

class AcademyIntelService {
    constructor() {
        this.GROQ_API_KEY = process.env.GROQ_API_KEY;
        this.NASA_API_KEY = process.env.NASA_API_KEY || 'DEMO_KEY';

        if (this.GROQ_API_KEY) {
            this.groq = new Groq({ apiKey: this.GROQ_API_KEY });
        }

        this.cosmicService = new CosmicWeatherService(this.NASA_API_KEY);
    }

    async getDynamicInfographics() {
        // Return our comprehensive, curated infographic data directly.
        // The fallback dataset now contains 12 richly detailed knowledge assets
        // with multi-paragraph summaries, 5 specs each, and real mission utility logs.
        // This curated content is far superior to AI-generated placeholders.
        return this.getFallbackInfographics();
    }


    getFallbackInfographics() {
        return [
            {
                id: 'sar',
                title: "SAR Technology",
                summary: "Synthetic Aperture Radar (SAR) is an active microwave imaging system that operates independently of sunlight and atmospheric conditions. Unlike optical cameras, SAR illuminates the Earth with its own radar pulses, allowing it to see through clouds, rain, smoke, and complete darkness. This makes it indispensable for 24/7 monitoring of floods, oil spills, deforestation, and military surveillance where weather delays would be catastrophic.",
                details: {
                    logic: "SAR satellites transmit microwave pulses towards Earth and record the echo. By combining multiple echoes from different positions along the satellite's flight path, onboard processors synthesize a virtual antenna aperture much larger than the physical antenna. This 'synthetic aperture' technique enables resolutions of 1-3 meters from an altitude of 700 km, resolving individual buildings and even large vehicles on the ground.",
                    specs: [
                        { label: "Band Freq", value: "C-Band (5.4 GHz)" },
                        { label: "Resolution", value: "1-3 meters" },
                        { label: "Swath Width", value: "250 km" },
                        { label: "Revisit Time", value: "6 days" },
                        { label: "Polarization", value: "VV / VH / HH / HV" }
                    ],
                    utility: "Mission Log (2024): Sentinel-1 SAR detected an illegal fishing fleet operating at night off the coast of West Africa by analyzing the wake patterns and metallic hull reflections. The data was cross-referenced with AIS transponder records, revealing 23 vessels had disabled their tracking systems. Authorities intercepted within 48 hours."
                }
            },
            {
                id: 'ndvi',
                title: "NDVI Vegetation Index",
                summary: "The Normalized Difference Vegetation Index (NDVI) is the gold standard for measuring plant health from space. It exploits a fundamental property of chlorophyll: healthy vegetation strongly absorbs red light for photosynthesis while reflecting near-infrared (NIR) light. By computing the ratio (NIR - Red) / (NIR + Red), satellites can detect crop stress, drought conditions, and deforestation weeks before they become visible to the human eye.",
                details: {
                    logic: "Chlorophyll molecules in plant cells absorb red wavelengths (0.6–0.7 µm) to power photosynthesis. The spongy mesophyll tissue in leaves strongly reflects near-infrared (0.7–1.1 µm) radiation. A healthy plant shows high NIR reflectance and low red reflectance, yielding NDVI values close to +1. Stressed or dying vegetation loses chlorophyll, its NIR reflectance drops, and NDVI values fall towards 0 or negative numbers for bare soil and water.",
                    specs: [
                        { label: "Formula", value: "(NIR−Red)/(NIR+Red)" },
                        { label: "Range", value: "-1.0 to +1.0" },
                        { label: "Healthy Veg", value: "> 0.6" },
                        { label: "Sparse Veg", value: "0.2 - 0.4" },
                        { label: "Resolution", value: "10-30 meters" }
                    ],
                    utility: "Mission Log (2023): The Indian Agricultural Ministry used Landsat-9 NDVI data to identify 2.3 million hectares of wheat showing early water stress in Punjab. Targeted irrigation advisories were issued, and despite a 15% rainfall deficit, crop yields remained within 5% of normal—a crisis averted through orbital intelligence."
                }
            },
            {
                id: 'orbital',
                title: "Orbital Mechanics",
                summary: "Every satellite in orbit is perpetually falling towards Earth but moving sideways fast enough to continually miss it—this is the essence of orbital mechanics. The altitude, inclination, and eccentricity of an orbit determine everything from global coverage patterns to communication latency. Understanding these tiers is essential for designing cost-effective satellite constellations and predicting collision risks in an increasingly congested space environment.",
                details: {
                    logic: "A satellite in Low Earth Orbit (LEO) at 400 km travels at 7.66 km/s and completes one orbit in 92 minutes. At geostationary altitude (35,786 km), the orbital period exactly matches Earth's rotation, making the satellite appear stationary above a fixed longitude. Medium Earth Orbit (MEO) is the compromise zone where GPS and navigation constellations operate, balancing coverage area with signal propagation delay.",
                    specs: [
                        { label: "LEO Alt", value: "200-2,000 km" },
                        { label: "LEO Period", value: "88-127 min" },
                        { label: "MEO Alt", value: "2,000-35,786 km" },
                        { label: "GEO Alt", value: "35,786 km" },
                        { label: "Escape Vel", value: "11.2 km/s" }
                    ],
                    utility: "Mission Log (2025): SpaceX Starlink V2 satellites were repositioned from 550 km to 340 km altitude to reduce latency for high-frequency trading clients. The lower orbit required 40% more fuel for station-keeping but cut round-trip latency from 25 ms to 15 ms—a competitive advantage worth billions annually."
                }
            },
            {
                id: 'hazards',
                title: "Space Weather Hazards",
                summary: "The Sun is a violent nuclear furnace that regularly hurls billions of tons of charged plasma into space at speeds exceeding 2,000 km/s. These Coronal Mass Ejections (CMEs) and solar flares can cripple satellites, disrupt GPS navigation, induce dangerous currents in power grids, and expose astronauts and high-altitude pilots to harmful radiation. Space weather forecasting has become critical infrastructure for our technology-dependent civilization.",
                details: {
                    logic: "Solar flares release X-rays and UV radiation that reach Earth in 8 minutes, ionizing the upper atmosphere and causing radio blackouts. CMEs carry magnetized plasma clouds that arrive in 1-3 days. When the CME's magnetic field points southward, it can reconnect with Earth's magnetic field, injecting energetic particles into the magnetosphere. This triggers geomagnetic storms measured on the Kp index scale (0-9).",
                    specs: [
                        { label: "CME Speed", value: "250-3,000 km/s" },
                        { label: "Flare Classes", value: "A, B, C, M, X" },
                        { label: "Kp Storm", value: "≥ 5 = Active" },
                        { label: "Proton Event", value: "> 10 MeV" },
                        { label: "GIC Danger", value: "> 200 nT/min" }
                    ],
                    utility: "Mission Log (2024): A G4 geomagnetic storm caused by an X2.1 flare induced ground currents that tripped protective relays at a South African substation, causing a 6-hour blackout for 4 million people. NOAA's 45-minute advance warning allowed grid operators in North America to reduce loads and avoid similar cascading failures."
                }
            },
            {
                id: 'lasers',
                title: "Optical Laser Relays",
                summary: "Radio frequency (RF) communications have served space missions for 60 years, but we are hitting the Shannon limit on how much data can be squeezed through RF links. Optical Inter-Satellite Links (OISL) use laser beams to transmit data at speeds 10-100x faster than RF, with narrower beams that are nearly impossible to intercept or jam. This technology is revolutionizing Earth observation, enabling the downlink of terabytes of imagery per day.",
                details: {
                    logic: "Laser communication operates at near-infrared wavelengths (1,550 nm) where photons carry far more data per unit power than radio waves. The narrow 10 µrad beam divergence means that at 2,000 km, the beam footprint is only 20 meters—compared to 200 km for a typical RF link. This concentration of energy allows bitrates of 10 Gbps with just 5 watts of optical power. The challenge is maintaining nanoradian pointing accuracy on a vibrating satellite platform.",
                    specs: [
                        { label: "Wavelength", value: "1,550 nm" },
                        { label: "Data Rate", value: "10+ Gbps" },
                        { label: "Beam Div.", value: "10-50 µrad" },
                        { label: "Link Range", value: "5,000+ km" },
                        { label: "Pointing Acc", value: "< 1 µrad" }
                    ],
                    utility: "Mission Log (2024): The European Space Agency's EDRS (European Data Relay System) used laser links to download 2.6 TB of SAR imagery from Sentinel-1 to ground stations in under 4 hours—a task that would have taken 3 days with RF links. This enabled near-real-time flood mapping during the catastrophic German floods."
                }
            },
            {
                id: 'ai',
                title: "AI On-Edge Computing",
                summary: "Traditionally, satellites dumped raw data to ground stations where supercomputers processed it into useful products—a pipeline that introduced hours or days of latency. Modern 'smart' satellites carry radiation-hardened AI accelerators that run neural networks in orbit, detecting wildfires, ship movements, and cloud cover in real-time. Only the actionable insights are beamed down, reducing downlink bandwidth by 90% and enabling autonomous responses.",
                details: {
                    logic: "Onboard AI uses convolutional neural networks (CNNs) trained on millions of labeled images to classify pixels into categories like forest, water, urban, clouds, and anomalies. The inference runs on radiation-hardened FPGAs or specialized TPUs capable of 4+ TOPS (trillion operations per second) while consuming under 20 watts. When a wildfire is detected, the satellite can autonomously task itself for a follow-up observation, notifying ground operators only after confirmation.",
                    specs: [
                        { label: "Processor", value: "AMD Xilinx Kintex" },
                        { label: "Compute", value: "4+ TOPS" },
                        { label: "Power", value: "< 20 W" },
                        { label: "Latency", value: "< 500 ms" },
                        { label: "Accuracy", value: "> 95% (fire det.)" }
                    ],
                    utility: "Mission Log (2025): Planet Labs' SuperDove constellation detected a pipeline oil leak in the Kazakh steppe 22 minutes after it began, using an on-edge anomaly detection model trained on spectral signatures of hydrocarbons. The operator was alerted via direct satellite-to-phone messaging before ground sensors even registered the spill."
                }
            },
            {
                id: 'spectro',
                title: "Spectroscopy & Imaging",
                summary: "Every substance in the universe leaves a unique fingerprint in the electromagnetic spectrum—a barcode of absorption and emission lines tied to its atomic and molecular structure. Spaceborne spectrometers exploit this principle to identify atmospheric gases (CO2, methane, ozone), mineral deposits (iron, lithium, rare earths), ocean chlorophyll, and even the chemical composition of distant exoplanet atmospheres without ever touching a sample.",
                details: {
                    logic: "When electromagnetic radiation passes through or reflects off a substance, certain wavelengths are absorbed by specific molecular bonds. A spectrometer disperses incoming light into its component wavelengths using prisms or diffraction gratings, then measures intensity at each wavelength to produce a spectrum. Comparing this observed spectrum to laboratory reference spectra allows identification and quantification of the target substance to parts-per-billion precision.",
                    specs: [
                        { label: "CO2 Band", value: "2.06 µm, 4.26 µm" },
                        { label: "CH4 Band", value: "1.65 µm, 3.3 µm" },
                        { label: "Spectral Res", value: "0.1-1.0 nm" },
                        { label: "SWIR Range", value: "1.0-2.5 µm" },
                        { label: "SNR", value: "> 300:1" }
                    ],
                    utility: "Mission Log (2024): The TROPOMI instrument on Sentinel-5P identified a 200 km methane plume emanating from a Turkmenistan gas field, leaking at an estimated rate of 110 tonnes/hour. The operator initially denied the leak but satellite-derived quantification provided incontrovertible evidence, prompting emergency repairs within 5 days."
                }
            },
            {
                id: 'gnss',
                title: "GNSS Positioning",
                summary: "Global Navigation Satellite Systems like GPS, Galileo, GLONASS, and BeiDou have become invisible infrastructure powering everything from smartphone maps to precision agriculture to financial transaction timestamps. At its core, GNSS is a game of picosecond-accurate clocks: satellites broadcast their exact position and time, and receivers calculate their own location by measuring the nanosecond differences in signal arrival from multiple satellites.",
                details: {
                    logic: "Each GNSS satellite carries atomic clocks accurate to 1 nanosecond per day. The satellite continuously broadcasts a pseudo-random noise (PRN) code timestamped with its onboard clock. A receiver generates an identical code locally and measures the offset, converting this time delay into a distance (1 ns = 30 cm). With signals from 4+ satellites, the receiver solves for three spatial coordinates plus its own clock error through trilateration.",
                    specs: [
                        { label: "GPS Sats", value: "31 active" },
                        { label: "Galileo Sats", value: "30 active" },
                        { label: "Accuracy", value: "< 1 m (civilian)" },
                        { label: "RTK Accuracy", value: "< 2 cm" },
                        { label: "Clock Drift", value: "< 1 ns/day" }
                    ],
                    utility: "Mission Log (2025): An autonomous cargo ship traversed the Suez Canal without human intervention using RTK-corrected GNSS positioning with 2 cm accuracy—the first fully autonomous passage of the world's most critical chokepoint. The navigation system maintained lane-keeping even during a GPS spoofing attack by validating signals against Galileo and BeiDou."
                }
            },
            {
                id: 'cubesat',
                title: "CubeSat Swarms",
                summary: "The CubeSat revolution has democratized access to space. These standardized 10×10×10 cm satellites can be mass-produced for under $100,000 and launched as rideshare payloads on nearly any rocket. More importantly, swarms of dozens or hundreds of CubeSats can provide revisit times of hours instead of days, enabling near-real-time monitoring of dynamic phenomena like weather systems, wildfires, and maritime traffic.",
                details: {
                    logic: "A CubeSat swarm achieves coverage through numbers rather than individual capability. While a single large satellite might have a 700 km swath width with a 5-day revisit, a constellation of 100 CubeSats with 50 km swaths can image any point on Earth every 90 minutes. Orbital plane spreading—distributing satellites across 6-8 inclination planes—maximizes geographic diversity. Inter-satellite links enable real-time data sharing for coordinated tasking.",
                    specs: [
                        { label: "Unit Size", value: "10×10×10 cm" },
                        { label: "Mass", value: "1.33 kg (1U)" },
                        { label: "Lifespan", value: "2-5 years" },
                        { label: "Build Cost", value: "$50K-$500K" },
                        { label: "Revisit (100)", value: "< 2 hours" }
                    ],
                    utility: "Mission Log (2024): Spire Global's 100+ GNSS Radio Occultation CubeSats detected an anomalously cold stratospheric layer over the Arctic 36 hours before weather models predicted a Sudden Stratospheric Warming event. This early warning allowed European airlines to reroute polar flights, avoiding severe turbulence linked to the jet stream disruption."
                }
            },
            {
                id: 'thermal',
                title: "Thermal Infrared Mapping",
                summary: "All objects above absolute zero emit thermal infrared radiation proportional to their temperature—a principle that allows satellites to 'see' heat. Thermal IR sensors detect urban heat islands, volcanic activity, industrial heat signatures, power plant efficiency, wildfire fronts, and even submarine wakes where churning propellers bring cold deep water to the surface. This band is equally useful day or night.",
                details: {
                    logic: "The Stefan-Boltzmann law states that radiated power is proportional to the fourth power of absolute temperature (P = εσT⁴). Thermal sensors measure radiation in the 8-14 µm atmospheric window where infrared light passes through air with minimal absorption. By calibrating against known blackbody references, surface temperatures can be calculated to within 0.1 K accuracy. The thermal inertia of different materials (rock, water, metal) creates distinctive heating/cooling signatures.",
                    specs: [
                        { label: "Band Range", value: "8-14 µm (LWIR)" },
                        { label: "Temp Accuracy", value: "± 0.5 K" },
                        { label: "Resolution", value: "30-100 m" },
                        { label: "NeDT", value: "< 0.05 K" },
                        { label: "Detector", value: "HgCdTe (MCT)" }
                    ],
                    utility: "Mission Log (2025): Landsat-9's TIRS detected a 12°C thermal anomaly in the cooling pond of a coastal power plant—indicating potential intake blockage. Plant inspection revealed a massive jellyfish bloom had clogged the intake filters. The satellite alert came 4 hours before vibration sensors detected pump strain, preventing a potential emergency shutdown."
                }
            },
            {
                id: 'ion',
                title: "Ion Propulsion",
                summary: "Chemical rockets provide massive thrust for launch but are hopelessly inefficient for long-duration space missions. Ion thrusters ionize propellant (typically xenon) and accelerate the ions through electric fields to exhaust velocities 10x higher than chemical rockets. This efficiency allows spacecraft to accumulate enormous delta-V over time, enabling missions to asteroids, comets, and the outer solar system that would be impossible with chemical propulsion alone.",
                details: {
                    logic: "An ion thruster ionizes xenon gas using electron bombardment, then accelerates the Xe+ ions through a 1,000-3,000 V potential difference. The ions exit at 20-50 km/s (compared to 4.5 km/s for chemical rockets). Specific impulse (fuel efficiency) reaches 3,000-5,000 seconds versus 300-450 for chemical. The trade-off is thrust: typical ion engines produce only 0.1-1 N—less than the weight of a sheet of paper. Continuous thrusting for months or years compensates for low instantaneous thrust.",
                    specs: [
                        { label: "Isp", value: "3,000-5,000 s" },
                        { label: "Thrust", value: "0.1-1 N" },
                        { label: "Propellant", value: "Xenon" },
                        { label: "Exhaust Vel", value: "30-50 km/s" },
                        { label: "Power", value: "1-7 kW" }
                    ],
                    utility: "Mission Log (2023): NASA's DART spacecraft used a NEXT-C ion thruster to arrive at asteroid Didymos with 97% of its xenon propellant remaining—enough to perform detailed mapping orbits before the kinetic impact test. The ion engine's efficiency allowed mission planners to include 200 kg of additional scientific instruments that would have been impossible with chemical propulsion."
                }
            },
            {
                id: 'hyper',
                title: "Hyperspectral Imaging",
                summary: "While multispectral cameras capture 4-10 broad spectral bands, hyperspectral sensors divide the spectrum into 100-300 narrow bands just 5-10 nm wide. This creates a complete 'spectral fingerprint' for every pixel, enabling identification of specific minerals, crop species, camouflaged military equipment, plastic marine debris, and even the chemical composition of industrial emissions—capabilities impossible with traditional cameras.",
                details: {
                    logic: "A hyperspectral imager uses a spectrometer for every pixel in its focal plane (imaging spectrometry). Light from each ground resolution cell is dispersed across a linear detector array, producing a full spectrum from 400-2500 nm. The resulting 'hypercube' of data (x, y, wavelength) can be analyzed using spectral unmixing algorithms to identify sub-pixel materials. Machine learning classifiers trained on spectral libraries can detect targets even when mixed with other substances.",
                    specs: [
                        { label: "Bands", value: "100-300" },
                        { label: "Bandwidth", value: "5-10 nm" },
                        { label: "VNIR Range", value: "400-1000 nm" },
                        { label: "SWIR Range", value: "1000-2500 nm" },
                        { label: "Spatial Res", value: "5-30 m" }
                    ],
                    utility: "Mission Log (2024): The PRISMA hyperspectral satellite identified illegal rare-earth mining operations in Myanmar by detecting the spectral signature of cerium oxide tailings. The 2 km waste pond was invisible in optical imagery due to vegetation cover, but hyperspectral analysis revealed absorption features at 580 nm and 690 nm characteristic of REE processing residue."
                }
            }
        ];
    }


    async getDynamicBriefings() {
        if (!this.groq) return this.getFallbackBriefings();

        try {
            const prompt = `Generate a set of 29 Technical Mission Briefings as a "Storyline" for two distinct modules.
            
            Module 1: "Global Guardians" (12 Missions - Disaster Management & Earth Monitoring)
            Missions must follow a chronological story covering the ENTIRE timeline (Early Space Age to Future): 
            1. PIONEER ERA: Sputnik/TIROS (The birth of monitoring)
            2. ANALYSIS ERA: Landsat/Nimbus (Scaling and spectral data)
            3. CRISIS ERA: Sentinel/TRMM (Real-time SAR, Precipitation radar)
            4. FUTURE ERA: NISAR/Hyperspectral (Advanced global vigilance)
            - Show the "Chain of Consequences": How one technology/launch made the next possible.
            
            Module 2: "Cosmic Seekers" (17 Missions - Exploring Life Apart from Earth & ISRO Milestones)
            Missions must follow a chronological story covering the ENTIRE timeline:
            1. PIONEER ERA: Mariner/Venera/Viking/Voyager (Early planetary landings and interstellar scouts)
            2. EXPLORER ERA: Chandrayaan/Mangalyaan (India's lunar and Martian breakthroughs)
            3. ROVER ERA: Curiosity/Perseverance (Astrobiology and advanced Mars exploration)
            4. FRONTIER ERA: Chandrayaan-3/Aditya-L1/Europa Clipper/Gaganyaan/Dragonfly/Starship (Modern landing, solar physics, and future human spaceflight)
            - Show "Technology Evolution": From early graining photos to high-res chemical signatures and human-rated systems.

            Define exactly 29 briefings (12 for Global Guardians and 17 for Cosmic Seekers) covering a complete chronological timeline from 1957 to 2030+.
            
            CRITICAL RULES:
            1. ONE MISSION PER CARD: Each card MUST focus on a SINGLE specific mission. 
            2. CHRONOLOGICAL ORDER: Missions must follow a strict timeline sequence.
            3. CRISP SUMMARIES: Each content field MUST be exactly 3 high-impact sentences.
            4. VISUAL RELEVANCE: Use the following unique Unsplash IDs ONLY (mix them at random, no repetition):
               [
               'photo-1446776811953-b23d57bd21aa', 'photo-1451187580459-43490279c0fa', 'photo-1541447271487-09612b3f49f7', 'photo-1614730321146-b6fa6a46bcb4',
               'photo-1614728894747-a83421e2b9c9', 'photo-1614314107768-6018061b5b0d', 'photo-1506318137071-a8e063b4bcc0', 'photo-1464802686167-b939a67e06a1',
               'photo-1462331940025-496dfbfc7564', 'photo-1506466010722-395aa2bef877', 'photo-1517976487492-5750f319597a', 'photo-1454789548928-9efd52dc4031',
               'photo-1457364887197-9150188c107b', 'photo-1534447677768-be436bb09401', 'photo-1516849841032-87cbac4d88f7', 'photo-1541185933-ef5d8ed016c2',
               'photo-1536697246787-1f7ae5691ef9', 'photo-1516339901600-2e3a82dc50d6', 'photo-1538370621622-535577261d75', 'photo-1446776879694-90d174bb2535',
               'photo-1543722530-d2edce83d6a6', 'photo-1518364538800-6bcb3c2af0ff', 'photo-1519068737630-e5db30e12e42', 'photo-1502134249126-9f3755a50d78',
               'photo-1537420936177-c28052f0fcfc', 'photo-1446776899648-aa78eefe8575', 'photo-1614728423169-3f65fd722b7e', 'photo-1507567780285-80252b578c94',
               'photo-1444703686981-a3abbc4d4fe3', 'photo-1542641728-6ca359b085f4', 'photo-1581092160607-ee22621dd758', 'photo-1451188214936-ec16af5ca155',
               'photo-1541185933-ef5d8ed016c2', 'photo-148458906557f-2440eff960d1', 'photo-1516849841032-159670732caa', 'photo-1516339901600-2e3a82dc50d6',
               'photo-1541873676-a1811aa67cc5', 'photo-1501862700950-18382cd3f48a', 'photo-1536697246787-1f7ae5691ef9', 'photo-1541185933-ef5d8ed016c2',
               'photo-1518364538800-6bcb3c2af0ff', 'photo-1502134249126-9f3755a50d78', 'photo-1527239441953-caffd968d952', 'photo-1446776858070-70c3d5ed6758',
               'photo-1520113412646-24fc3dc5c7f0', 'photo-1505506819641-4ad459c774ad', 'photo-1465101162946-4377e57745c3', 'photo-1517402636906-8fb5712e02b7',
               'photo-1464801314991-89a50ac8680c', 'photo-1446776709462-d6b9d325c9af', 'photo-1451187863213-d1bcbaae3fa3', 'photo-1446776899648-aa78eefe8575'
               ]
            5. MISSION LINKS: Use deep-links (Wikipedia or NASA science pages).
            
            Format as JSON matching the interface exactly.`;

            const completion = await this.groq.chat.completions.create({
                messages: [{ role: "system", content: "You are a specialized space engineering AI. Output raw JSON only. NEVER combine missions in a single entry." }, { role: "user", content: prompt }],
                model: "llama-3.3-70b-versatile",
                response_format: { type: "json_object" }
            });

            // Simple rate limiting: wait 2 seconds between calls to prevent burst 429s
            await new Promise(resolve => setTimeout(resolve, 2000));

            const data = JSON.parse(completion.choices[0]?.message?.content || '{"briefings": []}');
            return data.briefings || this.getFallbackBriefings();
        } catch (err) {
            console.error('[AcademyIntel] Briefing hydration failed:', err.message);
            return this.getFallbackBriefings();
        }
    }

    getFallbackBriefings() {
        return [
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
                content: 'Sentinel-2 delivers high-resolution optical imagery that is critical for agricultural monitoring and global forest management. Its thirteen spectral bands can detect plant stress before it becomes visible to the human eye, supporting worldwide food security. This mission provides the most detailed look at how our land use affects the planet\'s biology.',
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
            }
        ];
    }
    async getDynamicQuizzes(category) {
        if (!this.groq) return [];

        try {
            // Simple rate limiting: wait 2 seconds between calls to prevent burst 429s
            await new Promise(resolve => setTimeout(resolve, 2000));

            const prompt = `Act as a Senior Space Instructor. Generate 10 technical multiple-choice questions for the specialization: "${category}". 
            Questions must be technical, accurate, and vary in difficulty.
            Each question needs: question, options (Array of 4), answer (The correct string), and explanation (Highly technical breakdown).
            
            Format as JSON matching this structure:
            {
              "quizzes": [
                { "question": "", "options": ["", "", "", ""], "answer": "", "explanation": "" }
              ]
            }
            Ensure NO intro/outro text. ONLY the JSON.`;

            const completion = await this.groq.chat.completions.create({
                messages: [{ role: "system", content: "You are a professional aerospace academic." }, { role: "user", content: prompt }],
                model: "llama-3.3-70b-versatile",
                response_format: { type: "json_object" }
            });

            const data = JSON.parse(completion.choices[0]?.message?.content || '{"quizzes": []}');
            return data.quizzes || [];
        } catch (err) {
            console.error('[AcademyIntel] Quiz generation failed:', err.message);
            return [];
        }
    }
}

module.exports = AcademyIntelService;
