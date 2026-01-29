# 🚀 SpaceScope Deployment Guide

This guide covers how to deploy your **SpaceScope** project completely for free using **Vercel** (Frontend) and **Render** (Backend). It ensures a smooth experience for users while keeping your local development environment fully functional.

## 🏗️ Architecture Overview

- **Frontend**: Hosted on **Vercel**. Serves your React/Three.js app.
- **Backend**: Hosted on **Render**. Runs your Node.js/Express API.
- **Data**: Reads from local CSV files (included in repo) and external APIs (NASA, Groq).
- **Optimization**: Heavy 3D models should be compressed to ensure the site doesn't "lag".

---

## ⚡ Step 1: Optimization (Crucial for 3D Models)

You mentioned "heavy processing" and large models. To prevent lag, you **must** compress your `.glb` files before deployment.

1.  **Locate your models**: They are in `frontend/public/models/`.
    - `iss.glb` (~22MB) -> Goal: < 5MB
    - `moon.glb` (~15MB) -> Goal: < 3MB
    - `hubble_space_telescope.glb` (~8MB) -> Goal: < 2MB

2.  **Compress them**:
    - Go to [gltf.report](https://gltf.report/).
    - Drag and drop your `.glb` file.
    - Click **Script** near the top right, choose **Draco Compression**.
    - Click **Run**, then **Export**.
    - Replace the original files in your `frontend/public/models/` folder with these new smaller versions.

---

## 🔒 Step 2: Prepare for Production

1.  **Push your code to GitHub**:
    - Ensure your project is in a GitHub repository.
    - **Security Note**: We have already added `.env` to `.gitignore` to prevent leaking your API keys.

---

## 🌍 Step 3: Deploy Backend (Render)

We use Render because it offers a free tier for Node.js web services.

1.  Create an account at [render.com](https://render.com).
2.  Click **"New +"** -> **"Web Service"**.
3.  Connect your GitHub repository.
4.  **Configure the Service**:
    - **Name**: `spacescope-backend` (or similar)
    - **Root Directory**: `backend` (⚠️ Important: Do not fetch from root, fetch from `backend` folder)
    - **Environment**: `Node`
    - **Build Command**: `npm install`
    - **Start Command**: `node server.js`
    - **Instance Type**: Free
5.  **Environment Variables**:
    - Scroll down to "Environment Variables" and add these (copy values from your local `.env`):
        - `Key`: `NASA_API_KEY` | `Value`: `...`
        - `Key`: `GROQ_API_KEY` | `Value`: `...`
        - `Key`: `ASTRONOMY_APP_ID` | `Value`: `...`
        - `Key`: `ASTRONOMY_APP_SECRET` | `Value`: `...`
        - `Key`: `PORT` | `Value`: `10000` (Render acts on port 10000 by default, but your code adapts to `process.env.PORT`)
6.  Click **Create Web Service**.
    - Wait for it to deploy.
    - Once finished, copy the URL (e.g., `https://spacescope-backend.onrender.com`). **You will need this.**

---

## 🎨 Step 4: Deploy Frontend (Vercel)

We use Vercel because it is optimized for Vite/React and serves 3D assets via a fast global CDN.

1.  Create an account at [vercel.com](https://vercel.com).
2.  Click **"Add New..."** -> **"Project"**.
3.  Import your GitHub repository.
4.  **Configure the Project**:
    - **Root Directory**: Click "Edit" and select `frontend`. (⚠️ Important!)
    - **Framework Preset**: Vite (should auto-detect).
    - **Build Command**: `vite build` (default).
    - **Output Directory**: `dist` (default).
5.  **Environment Variables**:
    - Expand the "Environment Variables" section.
    - Add:
        - `Key`: `VITE_API_BASE_URL`
        - `Value`: `https://spacescope-backend.onrender.com/api` (Paste your Render Backend URL here + `/api`)
6.  Click **Deploy**.

---

## 🔄 Step 5: Verify & Simultaneous Workflow

### ✅ Deployment Check
- Open your Vercel URL (e.g., `https://spacescope.vercel.app`).
- Check if dynamic data (Missions, Chatbot) loads. If it fails, check the "Console" (F12) for errors.
- **CORS**: If you see CORS errors, your Backend might not be allowing the Vercel domain.
    - *Quick Fix*: Your current `server.js` uses `app.use(cors())` which allows **all** connections. This should work immediately.

### 💻 Local Development (Simultaneous)
You don't need to change anything!
- **Frontend**: When running `npm run dev` locally, the code:
  `const LOCAL_API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';`
  ...will automatically fall back to `localhost:5000` because `VITE_API_BASE_URL` is undefined locally.
- **Backend**: Run `npm start` in `backend/` and it runs on port 5000.

Your local and production environments are now completely separate but work with the same codebase! 🚀
