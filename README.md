# Ricky Admin Panel

An admin dashboard for managing a ride-sharing / auto-rickshaw platform ("Autometer"). It provides real-time management of drivers, vehicles, fares, SOS alerts, and live vehicle tracking.

## Features

- **Dashboard** — Overview statistics, live map preview, today's revenue, and emergency alerts
- **Drivers** — Create, search, edit, and delete driver profiles
- **Vehicles** — Manage vehicle inventory and assign vehicles to drivers
- **Ride Data (Fares)** — Browse all ride records with fare breakdowns
- **SOS Alerts** — Real-time emergency alert monitoring via WebSocket (STOMP)
- **Autometer Data** — Ride statistics and test ride submission
- **Fare Settings** — Configure the global base fare rate (₹/km)
- **Live Map** — Full-screen Leaflet map with green (active), red (SOS), and orange (geofence) markers

## Tech Stack

| Layer | Technology |
|-------|-----------|
| UI | React 19 + Vite 7 |
| Styling | Tailwind CSS 3 + Tailwind Forms |
| Maps | Leaflet / React-Leaflet |
| Real-time | STOMP WebSocket (@stomp/stompjs) + SockJS |
| HTTP | Axios |
| Icons | Lucide React |
| Deployment | Vercel (serverless API proxy) |

## Getting Started

### Prerequisites

- Node.js ≥ 18
- npm ≥ 9

### Installation

```bash
npm install
```

### Environment Variables

Copy `.env.example` to `.env` and fill in the required values:

```bash
cp .env.example .env
```

| Variable | Description |
|----------|-------------|
| `VITE_API_BASE_URL` | Full base URL of the backend REST API (e.g. `https://your-server/api`) |
| `VITE_WS_URL` | WebSocket endpoint URL used for real-time STOMP messages |

### Development

```bash
npm run dev
```

Opens the app at [http://localhost:5173](http://localhost:5173) with Hot Module Replacement enabled.

### Production Build

```bash
npm run build      # outputs to /dist
npm run preview    # serve the production build locally
```

### Linting

```bash
npm run lint
```

## Project Structure

```
src/
├── components/
│   ├── AutometerData/   # Ride statistics & test ride submission
│   ├── Dashboard/       # Main dashboard with stats and map
│   ├── Drivers/         # Driver list, search, create, edit, delete
│   ├── Fares/           # Ride fare records
│   ├── Layout/          # Navigation header
│   ├── Maps/            # Leaflet live-tracking map
│   ├── Settings/        # Fare rate configuration
│   ├── SOS/             # Emergency alerts & WebSocket updates
│   └── Vehicles/        # Vehicle inventory and assignment
├── services/
│   └── api.js           # Axios instance + all API service methods
├── App.jsx              # Root component with tab-based navigation
└── main.jsx             # React entry point
api/
└── [...path].js         # Vercel serverless CORS proxy to the backend
```

## Deployment

The project is configured for **Vercel**. The `api/[...path].js` serverless function proxies all `/api/*` requests to the backend, solving CORS issues in production.

```bash
vercel deploy
```

Make sure to set the environment variables (`VITE_API_BASE_URL`, `VITE_WS_URL`) in the Vercel project settings.
