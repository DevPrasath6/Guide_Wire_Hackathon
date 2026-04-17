# Earnings Shield — Guidewire DEVTrails 2026

## Live Links
- Dashboard Frontend: https://guidewire-dashboard.vercel.app/
- App Frontend: https://gig-worker-app.vercel.app/
- Dashboard Backend: https://guidewire-dashboard.onrender.com
- App Backend: https://gig-worker-app.onrender.com
- ML Backend: https://guidewire-ml.onrender.com

## Pitch Deck
https://drive.google.com/file/d/1TYCSyfoO4eGa3ortgWDO384WEIxhy0xZ/view?usp=sharing

## Recorded Video
- Add demo video link here (publicly accessible)

## Repository Access
- Repository: https://github.com/DevPrasath6/Guide_Wire_Hackathon
- Keep this repository public (or provide collaborator access) for judges.

## Source Code
This repository contains the complete source code for:
- `Corporate-Dashboard` (Dashboard frontend + backend)
- `Gig-Worker-App-PWA` (Worker app frontend + backend)
- `ML` (FastAPI ML backend)

## Local Setup and Installation

### Prerequisites
- Node.js 18+
- npm 9+
- Python 3.10+

---

### 1) Dashboard (Frontend + Backend)

```bash
cd /home/runner/work/Guide_Wire_Hackathon/Guide_Wire_Hackathon/Corporate-Dashboard
npm install
```

Run dashboard frontend:
```bash
npm run dev
```

Run dashboard backend:
```bash
npm run dev:server
```

Run both together:
```bash
npm run dev:all
```

Default ports:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5001`

---

### 2) Gig Worker App (Frontend + Backend)

Install and run frontend:
```bash
cd /home/runner/work/Guide_Wire_Hackathon/Guide_Wire_Hackathon/Gig-Worker-App-PWA
npm install
npm run dev
```

Install and run backend:
```bash
cd /home/runner/work/Guide_Wire_Hackathon/Guide_Wire_Hackathon/Gig-Worker-App-PWA/server
npm install
npm run dev
```

Default ports:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`

---

### 3) ML Backend (FastAPI)

```bash
cd /home/runner/work/Guide_Wire_Hackathon/Guide_Wire_Hackathon/ML
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

(Optional, first-time setup):
```bash
python scripts/generate_data.py
python scripts/train_models.py
```

Run server:
```bash
python scripts/run_server.py
```

Default port:
- ML API: `http://localhost:8000`

---

## Environment Variables (Optional)
If needed, configure these in local `.env` files:
- Dashboard backend: `JWT_SECRET`, `JWT_EXPIRES_IN`, `MONGO_URI`, `PRIVATE_MONGO_URI`, `PUBLIC_MONGO_URI`, `FASTAPI_URL`
- App backend: `PORT`, `MONGO_URI`, `JWT_SECRET`, `FASTAPI_URL`
- ML backend: see `ML/.env.example`

## Notes
- If frontend apps and backends run on different ports, ensure API base URLs are set correctly in each frontend config.
- Use the hosted links above if you prefer testing without local setup.
