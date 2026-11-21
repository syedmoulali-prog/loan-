# Vercel Deployment Guide - Customer Loan Eligibility System

This project contains a **React + Vite Frontend** and a **Java 21 Spring Boot Backend**.

---

## 1. How Vercel Deployment Works

- **Vercel Hosts the Frontend**: Vercel serves the React Single-Page Application (SPA) with lightning-fast global CDN edge routing and automatic HTTPS.
- **Backend Service (Spring Boot)**: Vercel is a Node/Edge runtime and does not run Java Spring Boot (JVM/Tomcat). The Spring Boot backend runs on [Render](https://render.com) or [Railway](https://railway.app) (using the included `backend/Dockerfile` or `render.yaml`), which are free and take 2 minutes to set up.
- **Connecting Frontend to Backend**: In Vercel, you set one environment variable: `VITE_API_BASE_URL` pointing to your live backend.

---

## 2. Deploying on Vercel (Step-by-Step)

### Step 1: Log in to Vercel
1. Go to [https://vercel.com](https://vercel.com) and log in with your GitHub account (`syedmoulali-prog`).

### Step 2: Import the GitHub Repository
1. Click **"Add New..."** → **"Project"**.
2. Find `loan-` (or `syedmoulali-prog/loan-`) and click **"Import"**.

### Step 3: Configure Project Settings
- **Framework Preset**: `Vite` (automatically detected)
- **Root Directory**: Leave as `./` (or select `frontend` if you want frontend-only root)
- **Build Command**: `npm --prefix frontend run build` (pre-configured in `vercel.json`)
- **Output Directory**: `frontend/dist` (pre-configured in `vercel.json`)

### Step 4: Add Backend Environment Variable (Optional / Recommended)
In the **Environment Variables** section:
- **Key**: `VITE_API_BASE_URL`
- **Value**: `https://<YOUR-RENDER-BACKEND-URL>/api` (e.g. `https://customer-loan-system.onrender.com/api` or your backend server IP)

### Step 5: Click "Deploy"
Vercel will build the frontend in ~20 seconds and provide you with a live URL:
`https://loan-xxx.vercel.app`

---

## 3. Deploying the Spring Boot Backend (Render / Railway)

Because Vercel does not host long-running Java applications, your backend has already been configured with:
1. `backend/Dockerfile` — Multi-stage Java 21 build.
2. `render.yaml` — 1-click Render blueprint.

### 2-Minute Free Backend Deploy on Render:
1. Go to [https://render.com](https://render.com) and sign in with GitHub.
2. Click **"New +"** → **"Web Service"**.
3. Select `loan-`.
4. Runtime: **Docker** (it automatically detects `backend/Dockerfile`).
5. Click **"Create Web Service"**.
6. Copy your live backend URL (e.g. `https://loan-backend.onrender.com`) and paste it as `VITE_API_BASE_URL` in Vercel!
