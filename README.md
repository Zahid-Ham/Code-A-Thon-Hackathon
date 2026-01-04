# SpaceScope - The Nexus Terminal

**SpaceScope** is a next-generation orbital visualization and cosmic monitoring platform. It bridges the gap between raw space data and human experience, offering an immersive, real-time dashboard for tracking Earth's satellites, monitoring solar weather, and visualizing celestial events.

![SpaceScope Dashboard](./assets/dashboard-preview.png)
*(Note: Add a screenshot of your dashboard here)*

## 🚀 Key Features

### 1. **Orbital Atlas (3D Satellite Tracker)**
*   **Real-Time Visualization**: Track thousands of satellites (LEO, MEO, GEO) in real-time.
*   **Immersive Graphics**: Satellites rendered as 3D icons with orbit-specific glows (Cyan/Gold/Red).
*   **Interactive Inspector**: Click any satellite to view its live path, velocity, altitude, and even **photos** of the hardware.
*   **Mission Control**: Integrated "Why This Matters" context and links to **Live Video Feeds** (e.g., ISS).
*   **Search & Filter**: Instantly find specific satellites like "Starlink" or "Tiangong".

### 2. **Solar Overwatch (Cosmic Weather)**
*   **Live Space Weather**: Real-time data on Solar Flares, Geomagnetic Storms, and Coronal Mass Ejections (CMEs).
*   **Aurora Forecast**: Predictive engine for northern lights visibility based on Kp index.
*   **Impact Analysis**: Explains how solar events affect GPS and power grids.

### 3. **The Bridge (Main Dashboard)**
*   **Navigation System**: A sci-fi "Solar System" interface to warp between modules.
*   **Event Dashboard**: Mapbox integration for tracking celestial events on Earth.

---

## 🛠️ Technology Stack
*   **Frontend**: React (Vite), Three.js / React-Globe.gl, Framer Motion, TailwindCSS.
*   **Backend**: Node.js, Express.
*   **APIs**: NASA (EONET, DONKI), N2YO (Satellites), Groq (AI Context), AstronomyAPI.

---

## 🔑 API Keys & Configuration

This project requires several API keys to function fully. Create a `.env` file in the `backend/` directory with the following keys:

### 1. NASA API (Free)
*   **Purpose**: Used for Space Weather (DONKI) and Earth Events (EONET).
*   **Limit**: 1,000 requests/hour (Standard).
*   **Get it here**: [https://api.nasa.gov/](https://api.nasa.gov/)
*   **Variable**: `NASA_API_KEY`
*   **⚠️ IMPORTANT - VPN Usage**: 
    > The NASA EONET API is sometimes **geo-blocked** or unstable in certain regions. 
    > **If Earth Events fail to load, connect to a VPN (USA server) to generate a valid session.**

### 2. N2YO API (Free*)
*   **Purpose**: Providing live satellite TLE (Two-Line Element) data.
*   **Get it here**: [https://www.n2yo.com/api/](https://www.n2yo.com/api/) (Requires account).
*   **Variable**: `N2YO_API_KEY`

### 3. Groq API (Free Beta)
*   **Purpose**: Generates AI descriptions ("Why This Matters") for satellites.
*   **Get it here**: [https://console.groq.com/keys](https://console.groq.com/keys)
*   **Variable**: `GROQ_API_KEY`

### 4. Astronomy API (Freemium)
*   **Purpose**: Star charts and celestial positioning.
*   **Get it here**: [https://astronomyapi.com/](https://astronomyapi.com/)
*   **Variables**: 
    *   `ASTRONOMY_APP_ID`
    *   `ASTRONOMY_APP_SECRET`

---

## 💻 Installation & Setup

### Prerequisites
*   **Node.js** (v18+ recommended)
*   **Git**

### Step 1: Clone the Repository
```bash
git clone https://github.com/YourUsername/SpaceScope.git
cd SpaceScope
```

### Step 2: Backend Setup
The backend handles API proxying and data caching.

1.  Navigate to the backend folder:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  **Configure Environment**:
    Create a file named `.env` in the `backend` folder and paste your keys:
    ```env
    PORT=5000
    NASA_API_KEY=your_nasa_key_here
    N2YO_API_KEY=your_n2yo_key_here
    GROQ_API_KEY=your_groq_key_here
    ASTRONOMY_APP_ID=your_id_here
    ASTRONOMY_APP_SECRET=your_secret_here
    ```
4.  Start the Server:
    ```bash
    node server.js
    ```
    > You should see: `Server running on port 5000`

### Step 3: Frontend Setup
The frontend is the visual interface.

1.  Open a **new terminal** (keep backend running) and navigate to frontend:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the Development Server:
    ```bash
    npm run dev
    ```
4.  Open your browser to the local URL (usually `http://localhost:5173`).

---

## ⚠️ Troubleshooting

**1. "Earth Events / EONET not loading"**
*   **Cause**: NASA EONET API connectivity issues in your region.
*   **Fix**: Turn on a **VPN** (set to USA) to resolve connection resets.

**2. "AI Analysis is missing"**
*   **Cause**: Groq API key might be missing or rate-limited.
*   **Fix**: Check your `.env` file and ensure the `GROQ_API_KEY` is valid.

**3. "Map/Globe is black"**
*   **Cause**: WebGL might be disabled or `mapbox-gl` token is missing (if applicable).
*   **Fix**: Ensure hardware acceleration is on in your browser.

---

## 🌟 Why SpaceScope?
Modern space data is often trapped in spreadsheets or clunky government websites. **SpaceScope** was built to solve this by turning abstract data (TLEs, Kp indices, JSON feeds) into an **experience**. It's not just about seeing a dot on a map; it's about understanding that dot is the **ISS**, seeing its solar panels, and knowing exactly when it will pass over your home.

Enjoy the view! 🌍🛰️
