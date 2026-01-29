# SpaceScope - The Nexus Terminal: Project Details

**SpaceScope** is an immersive, next-generation space exploration and data visualization platform. It combines real-time satellite tracking, solar weather monitoring, and interactive mission simulations to bring the wonders of the cosmos to the user's fingertips.

---

## 🚀 Core Features

### 1. **Orbital Atlas (3D Satellite Tracker)**
*   **Real-Time Tracking**: Visualize thousands of active satellites in Low Earth Orbit (LEO), Medium Earth Orbit (MEO), and Geostationary Orbit (GEO).
*   **Interactive 3D Globe**: Rendered with High-Fidelity textures and dynamic orbital paths.
*   **Hardware Inspector**: Detailed information on specific satellites, including mass, launch date, and purpose.
*   **Live Feeds**: Direct links to live video feeds (e.g., ISS Live Stream) when available.

### 2. **Solar Overwatch (Cosmic Weather)**
*   **Space Weather Monitoring**: Real-time data on Coronal Mass Ejections (CMEs), Solar Flares, and Geomagnetic Storms using NASA DONKI API.
*   **Aurora Forecast**: Live Kp-index tracking to predict aurora visibility.
*   **Impact Analysis**: Dynamic alerts on how solar activity affects terrestrial technology (GPS, Power Grids, Radio).

### 3. **Celestial Command (Earth Events)**
*   **Event Visualization**: A Mapbox-powered global dashboard tracking natural phenomena like wildfires, volcanoes, and icebergs.
*   **NASA EONET Integration**: Real-time data sourced from NASA’s Earth Observatory Natural Event Tracker.
* **Get 3d + 2d visibilty maps 


### 4. **Build For Space (Mission Simulator)**
*   **Mission Planning**: Select from historical or futuristic mission profiles (e.g., Mars Colony, Lunar Base).
*   **Strategic Configuration**: Manage budget, mass, and payload constraints to design the perfect spacecraft.
*   **Real-time Execution**: Navigate through critical mission events where your decisions determine success or failure.
*   **RPG Elements**: Earn Command Rank, Experience (XP), and Fiscal Credits based on mission performance.
* what if analysis chatbot for alternate scenatrios 

### 5. **Chrono Archive (Interactive Timeline)**
*   **NASA History**: Explore a rich timeline of space exploration milestones from the Apollo missions to the James Webb Space Telescope.
*   **Future Missions**: Insights into upcoming projects like Artemis and Mars 2030.
*** learn more burton to explore more 

contains data till 1900 

### 6. **The Space Academy**
*   **Educational Hub**: Interactive lessons and modules designed to provide "Astronomy 101" knowledge in a gamified format.
*** mission chain moudles. shows one one misoion leads to the next and so on. makimg learning a chain of decisoons.
*** 3d eaduactional model showing the air quality vegetrain land on lwath along with other stats 
***  certifications lab for wpi quesisizes 
7.
---
*** automatioon get instant notificatiosn of space events via whatsapp notfocations learn more about them thAeir imapct ec tec 


8. viuasl demonstaryion of how psace tech efefcts real world problems 

unique visual represtantion of how spcae tech effects real world problems using naimtions transitions. info about what effect it had stats etc . slider sto see before an after views too 

## 🕶️ AR/VR Feature: AR Space Lab

**SpaceScope AR Space Lab** bridges the gap between the digital and physical worlds. Using **WebXR** technology, it allows users to project celestial bodies and spacecraft directly into their living room.

*   **Immersive Visualization**: View 3D models of Earth, Mars, the ISS, and the Hubble Space Telescope at scale in your own environment.
*   **Hit-Test Placement**: Precisely place models on floors or tables using advanced spatial surface detection.
*   **Gesture Control**: Rotate and scale models using intuitive touch gestures (pinch-to-zoom, drag-to-rotate).
*   **Simulation & Gyro Modes**: 
    *   **Desktop/3D Mode**: Interact with models in a full 3D environment if AR is not supported.
    *   **Gyro Mode**: Use your mobile device as a "magic window" into the space lab using device orientation sensors.
*   **Live Context**: Seamlessly switch between different categories including Planets, Satellites, and Space Stations.

---

## 🛠️ Technical Implementation

### **Frontend Architecture**
*   **Framework**: React 18 with Vite for lightning-fast builds.
*   **3D Rendering**: Three.js, React-Three-Fiber, and React-Globe.gl.
*   **AR/VR Engine**: `@react-three/xr` for WebXR integration.
*   **Styling**: Vanilla CSS & TailwindCSS for a "Cyberspace" aesthetic.
*   **Animation**: Framer Motion for smooth transitions and HUD effects.

### **Backend Core**
*   **Runtime**: Node.js & Express.
*   **API Proxying**: Secure communication with NASA, N2YO, and Groq APIs to circumvent CORS issues and hide sensitive keys.
*   **AI Integration**: Groq API powered by Llama 3 for generating contextual "Why This Matters" descriptions for celestial objects.

---

## 📊 Data Sources
*   **NASA API**: DONKI & EONET data.
*   **N2YO**: Real-time satellite TLE (Two-Line Element) data.
*   **AstronomyAPI**: Celestial positioning and star charts.
*   **Groq**: Real-time AI analysis of complex space data.

---

## 🛠️ Setup Instructions
*(See README.md for detailed environment configuration)*

1.  **Clone**: `git clone <repo_url>`
2.  **Backend**: `cd backend && npm install && node server.js`
3.  **Frontend**: `cd frontend && npm install && npm run dev`
4.  **AR Mode**: Access the site via HTTPS on a WebXR-compatible mobile device (e.g., Android with ARCore).

---
*Created for the Code-A-Thon Hackathon*
