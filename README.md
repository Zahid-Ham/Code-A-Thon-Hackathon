# SpaceScope: The Bridge Dashboard

**SpaceScope** is a next-generation space exploration dashboard featuring a cinematic "Solar System" navigation interface, a 3D interactive event globe, and immersive audio-visual effects.

---

## 🚀 Features

### **1. "The Bridge" (Landing Dashboard)**
- **Cinematic Navigation**: A "Solar System" layout where modules orbit a pulsing central sun (Logo).
- **Parallax Effects**: Interactive mouse-movement parallax on the central hub.
- **Glassmorphism UI**: High-end glass, neon, and "void" aesthetics using `backdrop-filter`.
- **Warp Transitions**: Seamless "Hyperspace" star-streak transitions when navigating between modules.

### **2. Celestial Command (Event Dashboard)**
- **Interactive 3D Globe**: Built with `react-globe.gl`, visualizing live celestial events on a rotatable Earth.
- **Micro-Interactions**: Hover over events for details, "Focus Mode" dimming, and sound effects.
- **Live Data Streams**:
  - **NASA DONKI**: Solar flares and geomagnetic storms.
  - **NASA EONET**: Wildfires, volcanoes, and natural events.
  - **ISS Tracker**: Real-time position of the International Space Station.
  - **Open-Meteo**: Real-time weather conditions at event locations.

### **3. Immersive Audio & Visuals**
- **Sound Design**: Custom "Hover" chirps and "Warp Engage" sound effects (managed via `SoundContext`).
- **Space Dust**: A lightweight HTML5 Canvas particle system for the background.
- **Motion Design**: Smooth entry/exit animations powering the "Cinematic Page Transitions".

---

## 🛠 Tech Stack

### **Frontend**
- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) (with custom utilitarian classes)
- **Animation**: [Framer Motion](https://www.framer.com/motion/)
- **3D Visualization**:
  - [Three.js](https://threejs.org/)
  - [React Three Fiber](https://docs.pmndrs.assets/react-three-fiber)
  - [react-globe.gl](https://github.com/vasturiano/react-globe.gl)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Routing**: [React Router DOM](https://reactrouter.com/)

### **Backend**
- **Runtime**: [Node.js](https://nodejs.org/)
- **Server**: [Express.js](https://expressjs.com/)
- **Utilities**: `axios`, `dotenv`, `cors`

---

## 📦 Installation & Setup

### **Prerequisites**
- Node.js (v18 or higher recommended)
- Git

### **1. Clone the Repository**
```bash
git clone https://github.com/your-username/SpaceScope.git
cd SpaceScope
```

### **2. Backend Setup**
Navigate to the backend folder and install dependencies:
```bash
cd backend
npm install
```

**Environment Variables (Optional)**:
Create a `.env` file in the `backend` directory to use real NASA/Astronomy APIs. If skipped, the app will use demo/fallback keys.
```env
PORT=5000
NASA_API_KEY=your_nasa_api_key
ASTRONOMY_APP_ID=your_id
ASTRONOMY_APP_SECRET=your_secret
```

Start the backend server:
```bash
node server.js
# or
npm run dev
```
*The server will run on `http://localhost:5000`.*

### **3. Frontend Setup**
Open a new terminal, navigate to the frontend folder, and install dependencies:
```bash
cd frontend
npm install
```

Start the development server:
```bash
npm run dev
```
*The application will open at `http://localhost:5173`.*

---

## 🎵 Audio Assets Note
The application looks for audio files in `frontend/public/sounds/`.
Ensure you have the following files for the full experience:
- `hover.mp3` (Short, high-tech chirp)
- `warp.mp3` (Deep, whooshing warp sound)

---

## 🏗 Project Structure

```
SpaceScope/
├── backend/            # Express Server
│   ├── server.js       # Main API Logic
│   └── package.json
│
├── frontend/           # React Application
│   ├── public/         # Static assets (sounds, icons)
│   ├── src/
│   │   ├── components/ # Reusable UI Components (TheBridge, Globe, etc.)
│   │   ├── contexts/   # Global State (SoundContext)
│   │   ├── App.jsx     # Main Router Setup
│   │   ├── EventDashboard.jsx # Celestial Command Module
│   │   └── main.jsx    # Entry Point
│   └── package.json
│
└── README.md           # Documentation
```

---

## 🔮 Future Roadmap
- [ ] Connect "Solar Overwatch" to active NASA SDO imagery.
- [ ] Implement "Mission Timeline" with horizontal scroll history.
- [ ] Add User Authentication for saving favorite celestial events.

---

*Built with Code & Stardust.*
