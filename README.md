<<<<<<< HEAD
﻿# Main Branch



 
=======
# SpaceScope - The Nexus Terminal 🌌🚀

**SpaceScope** is a comprehensive space exploration platform that unifies real-time orbital data, cosmic weather monitoring, and immersive visualizations into a single futuristic interface. It spans a **React Web Dashboard** for command-center style monitoring and a **React Native Mobile App** for on-the-go AR exploration.

---

## 🛰️ 1. Web Dashboard (The Command Center)

The core web application is built with **React, Vite, Three.js, and Framer Motion**.

### **A. Orbital Atlas (3D Visualization)**
*   **Tech**: `react-globe.gl`, `satellite.js`.
*   **Features**:
    *   Renders thousands of real-time satellites (Starlink, ISS, GPS) on an interactive 3D globe.
    *   **Orbit Calculation**: Uses TLE (Two-Line Element) data to predict precise positions.
    *   **Intelligence Center**: Click any satellite to see AI-generated context ("Why is this important?").

### **B. Solar Overwatch (Space Weather)**
*   **Tech**: NASA DONKI API.
*   **Features**:
    *   **Live Monitoring**: Tracks Solar Flares, Geomagnetic Storms (Kp Index), and CMEs.
    *   **Aurora Forecast**: Predicts visibility of Northern Lights based on storm severity.
    *   **Impact Analysis**: AI explains risks to power grids and GPS systems.

### **C. Star Academy (Education Hub)**
*   **Tech**: Custom Gamification Engine.
*   **Features**:
    *   **Mission Briefings**: Technical deep-dives into orbital mechanics.
    *   **Earth Impact Sim**: Interactive simulators for satellite data application.
    *   **Certification Exam**: Test your knowledge to earn ranks (Cadet -> Commander).

### **D. WebXR Space Lab (VR/AR Ready)**
*   **Tech**: `@react-three/xr`.
*   **Features**:
    *   Allows users with VR headsets or AR-capable browsers to view 3D assets in immersive mode directly from the web.

---

## 📱 2. Mobile AR Space Lab (The Field Unit)

A dedicated campanion app built with **React Native (Expo)** for immersive exploration.

### **A. Hybrid AR Engine**
We implemented a dual-mode AR system to ensure 100% device compatibility:
1.  **Native AR (Google Scene Viewer)**:
    *   **For**: Android with ARCore / iOS with ARKit.
    *   **Experience**: High-fidelity, surface-detected AR. Best for detailed inspection.
    *   **Usage**: Tap "Google AR 🚀" to launch the native viewer.
2.  **Universal AR (Simulated)**:
    *   **For**: All other devices.
    *   **Experience**: Uses **Device Gyroscope** + **Camera Feed**.
    *   **Interaction**: Pinch-to-zoom, drag-to-rotate, overlaying the model on the real world.

### **B. Voice Intelligence (V.I.)**
A hands-free AI assistant designed for mobile use.
*   **Tech**: `expo-av` (Recording), `expo-speech` (TTS), Groq AI (Llama 3).
*   **Features**:
    *   **VAD (Voice Activity Detection)**: Automatically stops recording when you stop speaking (1.5s silence).
    *   **Context Aware**: Knows it is in "Mobile Mode" and gives concise, spoken answers (3 sentences max).
    *   **Visual Feedback**:
        *   🔵 **Blue**: Idle.
        *   🔴 **Red**: Listening (Auto-Stop Active).
        *   🟡 **Gold**: Processing/Thinking.

### **C. 3D Model Library**
*   **Hubble Space Telescope**: Detailed model with metadata.
*   **Planets**: Earth, Moon, Mars.

---

## ⚙️ 3. Backend (The Core)

A robust **Node.js/Express** server acting as the central nervous system.
*   **API Proxy**: Routes requests to NASA/N2YO to hide API keys and handle CORS.
*   **AI Engine**: Integrates **Groq SDK** for near-instant (Llama 3 8b) logic and context generation.
*   **Voice Processing**: Handles audio file uploads (`multer`), file conversion, and transcription via **Groq Whisper**.

---

## 💻 Installation & Setup Guide

### Prerequisites
*   **Node.js** (v18 or higher)
*   **Git**
*   **Expo Go** App (on your Smartphone)

### Step 1: Clone & Configure Backend
Everything starts here.

1.  **Navigate**: `cd backend`
2.  **Install**: `npm install`
3.  **Secrets**: Create a `.env` file:
    ```env
    PORT=5000
    NASA_API_KEY=your_key
    N2YO_API_KEY=your_key
    GROQ_API_KEY=your_key
    ```
4.  **Run**: `node server.js`
    *   *Note*: Takes note of the "Server running..." message.

### Step 2: Launch Web Dashboard
1.  **Navigate**: `cd frontend` (New Terminal)
2.  **Install**: `npm install`
3.  **Run**: `npm run dev`
4.  **View**: Open `http://localhost:5173`.

### Step 3: Launch Mobile App
**CRITICAL**: Phone and PC must be on the **same Wi-Fi**.

1.  **Navigate**: `cd mobile` (New Terminal)
2.  **Install**: `npm install` (or `npx expo install`)
3.  **Configure Network**:
    *   Open `mobile/src/components/VoiceChatbot.js`.
    *   Edit line ~8: `const API_URL = 'http://YOUR_PC_IP:5000/api';`
    *   *Find IP via `ipconfig` (Win) or `ifconfig` (Mac).*
4.  **Run**: `npx expo start --clear`
5.  **Scan**: Use **Expo Go** on your phone to scan the QR code.

---

## ⚠️ Troubleshooting

| Issue | Solution |
| :--- | :--- |
| **Mobile: "Network Request Failed"** | Your phone can't see the PC. Check firewall, ensure same Wi-Fi, and verify IP in `VoiceChatbot.js`. |
| **Mobile: "Server Error 500"** | Likely audio upload failure. Restart Backend. Ensure `uploads/` folder permissions. |
| **Mobile: "No Speech Detected"** | Speak louder or closer. The VAD is tuned to ignore background noise. |
| **Web: "EONET API Error"** | NASA's EONET is often region-locked. Use a **VPN (USA)** if Earth Events fail to load. |

---

## 📦 Key Dependencies

*   **3D/AR**: `three`, `@react-three/fiber`, `@react-three/drei`, `@react-three/xr`.
*   **Map/Globe**: `react-globe.gl`, `mapbox-gl`.
*   **Mobile**: `expo`, `expo-av`, `expo-speech`, `expo-camera`, `expo-sensors`.
*   **AI**: `groq-sdk`, `multer` (for file handling).

---

> Built for the **SpaceProject Code-A-Thon**. 🚀
>>>>>>> ar-vr
