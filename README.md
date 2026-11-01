# YANOMIX BUSINESS HUB

A modern business ecosystem platform designed for Angola and international expansion, built with a React + TypeScript frontend and a FastAPI + SQLAlchemy backend.

## Features

- Premium dark theme with glassmorphism and motion effects
- Marketplace for ads and products
- Business directory and opportunities portal
- User dashboard and admin dashboard
- AI assistant for ad creation and business ideas
- FastAPI backend with SQLite database for MVP
- Ready for deployment and future scaling

## Stack

Frontend:
- React
- TypeScript
- Tailwind CSS
- Framer Motion
- Three.js

Backend:
- Python
- FastAPI
- SQLAlchemy
- SQLite (MVP)

## Repository layout

- `frontend/` — React application
- `backend/` — FastAPI API and database models
- `.env.example` — environment variables

## Quick start

### 1) Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 2) Frontend

```bash
cd frontend
npm install
cp ../.env.example .env.local
npm run dev
```

The frontend will use VITE_API_URL from `.env.example` and communicate with the FastAPI backend running on `http://localhost:8000`.

## Environment variables

Root `.env.example`:

```env
VITE_API_URL=http://localhost:8000
BACKEND_PORT=8000
DATABASE_URL=sqlite:///./data/yanomix.db
SECRET_KEY=change-me-in-production
```

## Production notes

- Replace SQLite with PostgreSQL for production
- Use real payment gateway credentials and secret keys
- Configure CORS properly in production
- Add authentication and RBAC for admin users
- Deploy the frontend separately from the backend

## License

MIT
