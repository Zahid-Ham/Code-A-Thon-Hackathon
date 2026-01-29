import axios from 'axios';

// API Configurations
const LL2_BASE_URL = 'https://ll.thespacedevs.com/2.3.0';
const NASA_BASE_URL = 'https://api.nasa.gov/planetary/apod';
const NASA_API_KEY = 'DEMO_KEY'; // In production, use environment variable
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
console.log("🚀 [SpaceScope] API Connector Initialized. Target:", API_BASE_URL);

export const fetchMissionsByYear = async (year) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/missions?year=${year}`);
        return response.data;
    } catch (error) {
        console.error("Failed to fetch missions by year:", error);
        return [];
    }
};

export const fetchMissionIntel = async (mission) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/mission-intel`, {
            name: mission.name,
            description: mission.description,
            date: mission.date,
            agency: mission.agency
        });
        return response.data;
    } catch (error) {
        console.error("Failed to fetch mission intelligence:", error);
        return null;
    }
};

// Helper to extract image URL from LL2 v2.3.0 Image objects or strings
const getImageUrl = (imgData) => {
    if (!imgData) return null;
    if (typeof imgData === 'string') return imgData;
    if (typeof imgData === 'object') {
        return imgData.image_url || imgData.thumbnail_url || null;
    }
    return null;
};

// Normalize API data to our Mission interface
// Interface: { id, name, date, agency, rocket, status, description, image, type }
const normalizeMission = (launch) => {
    // Determine status color/type
    let type = 'ISRO'; // Default fallback
    if (launch.launch_service_provider) {
        if (launch.launch_service_provider.name.includes('SpaceX')) type = 'SPACEX';
        else if (launch.launch_service_provider.name.includes('NASA')) type = 'NASA';
        else if (launch.launch_service_provider.name.includes('ESA')) type = 'ESA';
    }

    const missionStatus = launch.status ? launch.status.abbrev : 'TBD';
    const isSuccess = missionStatus === 'Success';
    const isFailure = missionStatus === 'Failure';

    // Status color mapping
    let color = '#FFFFFF';
    if (isSuccess) color = '#00FF99'; // Green/Teal
    else if (isFailure) color = '#FF0055'; // Red
    else if (missionStatus === 'Go') color = '#00F0FF'; // Cyan for upcoming confirmed
    else color = '#FFD700'; // Gold for TBD/Hold

    return {
        id: launch.id,
        name: launch.name,
        date: launch.net || launch.window_start || 'TBD',
        agency: launch.launch_service_provider ? launch.launch_service_provider.name : 'Unknown Agency',
        rocket: launch.rocket && launch.rocket.configuration ? (launch.rocket.configuration.full_name || launch.rocket.configuration.name) : 'Unknown Rocket',
        status: launch.status ? launch.status.name : 'Unknown',
        description: launch.mission ? launch.mission.description : 'No description available for this mission.',
        image: getImageUrl(launch.image) ||
            getImageUrl(launch.rocket?.configuration?.image) ||
            getImageUrl(launch.rocket?.configuration?.image_url) ||
            null,
        type: type,
        color: color,
        rawStatus: missionStatus
    };
};

export const fetchMissions = async () => {
    try {
        // 1. Fetch Upcoming Launches (Future & Current)
        const upcomingResponse = await axios.get(`${LL2_BASE_URL}/launches/upcoming/?limit=50`, {
            headers: { 'User-Agent': 'SpaceScope-App/1.0' }
        });

        // 2. Fetch Previous Launches (Past)
        const pastResponse = await axios.get(`${LL2_BASE_URL}/launches/previous/?limit=50`, {
            headers: { 'User-Agent': 'SpaceScope-App/1.0' }
        });

        // Reference Date: Today is 2026-01-05 (User provided current time)
        const today = new Date().getTime();

        const upcomingData = upcomingResponse.data.results || [];
        const pastData = pastResponse.data.results || [];

        // Merge and remove duplicates if any (by id)
        const allData = [...pastData, ...upcomingData];
        const uniqueData = Array.from(new Map(allData.map(item => [item.id, item])).values());

        // Normalize all
        const normalized = uniqueData.map(normalizeMission);

        // Status Categorization Sets (User defined rules)
        const pastStatusNames = [
            'Launch Successful', 'Launch Failure', 'Partial Failure', 'Failure',
            'Success', 'Deorbited', 'Completed', 'Success (Partial)'
        ];
        const presentStatusNames = [
            'Active', 'In Orbit', 'Operational', 'Ongoing',
            'Extended Mission', 'Launch In Flight', 'En Route'
        ];

        const past = [];
        const present = [];
        const future = [];

        normalized.forEach(mission => {
            const mDate = new Date(mission.date).getTime();
            const statusName = mission.status;

            // 🔴 Past: Date is strictly before today
            if (mDate < today) {
                past.push(mission);
            }
            // 🔵 Present: Status is Active/Operational/In Flight
            else if (presentStatusNames.some(s => statusName.includes(s))) {
                present.push(mission);
            }
            // 🟣 Upcoming: Everything else (beyond today and not active)
            else {
                future.push(mission);
            }
        });

        // Sorting
        // Past: Newest first (Descending)
        past.sort((a, b) => new Date(b.date) - new Date(a.date));
        // Present: Most recent launch first (Descending)
        present.sort((a, b) => new Date(b.date) - new Date(a.date));
        // Future: Soonest launch first (Ascending)
        future.sort((a, b) => new Date(a.date) - new Date(b.date));

        return { past, present, future };

    } catch (error) {
        console.error("Failed to fetch missions:", error);

        // Fallback Mock Data in case of API failure (Rate limits, etc.)
        return {
            past: [
                {
                    id: 'mock-1',
                    name: 'Apollo 11',
                    date: '1969-07-16T13:32:00Z',
                    agency: 'NASA',
                    rocket: 'Saturn V',
                    status: 'Success',
                    description: 'The first mission to land humans on the Moon.',
                    image: 'https://images-assets.nasa.gov/image/as11-40-5903/as11-40-5903~orig.jpg',
                    color: '#00FF99',
                    type: 'NASA'
                }
            ],
            present: [
                {
                    id: 'mock-present-1',
                    name: 'James Webb Space Telescope',
                    date: '2021-12-25T12:20:00Z',
                    agency: 'NASA/ESA/CSA',
                    rocket: 'Ariane 5',
                    status: 'Active',
                    description: 'The premier space observatory of the next decade.',
                    image: 'https://images.unsplash.com/photo-1614728263952-84ea256f9679?auto=format&fit=crop&q=80&w=800',
                    color: '#00F0FF',
                    type: 'NASA'
                }
            ],
            future: [
                {
                    id: 'mock-3',
                    name: 'Artemis II',
                    date: '2025-11-01T00:00:00Z',
                    agency: 'NASA',
                    rocket: 'SLS Block 1',
                    status: 'Planned',
                    description: 'First crewed flight of the Artemis program.',
                    color: '#FFD700',
                    type: 'NASA'
                }
            ]
        };
    }
};

export const fetchNasaApod = async () => {
    try {
        const response = await axios.get(`${NASA_BASE_URL}?api_key=${NASA_API_KEY}`);
        return response.data;
    } catch (error) {
        console.error("NASA APOD Fetch Error:", error);
        return null;
    }
};
