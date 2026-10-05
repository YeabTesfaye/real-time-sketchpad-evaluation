# Real-time Collaborative Sketchpad

A lightweight, real-time collaborative sketchpad for teams to visually share ideas, wireframes, and notes instantly.

## Features

- Real-time drawing synchronization using WebSockets
- Create/share collaboration rooms via simple URLs
- See other users' cursors and drawings in real-time
- Handle network reconnections gracefully
- Support for late-joining users
- Clean, minimal interface

## Tech Stack

**Frontend:** Next.js 16+, TypeScript, React, Custom canvas with requestAnimationFrame, Tailwind CSS 4

**Backend:** Python 3.9+, FastAPI, WebSocket via Uvicorn

**Data Storage (MVP):** In-memory room management (Redis optional for scaling)

## Project Structure

```
real-time-sketchpad/
├── frontend/          # Next.js application
│   ├── app/
│   ├── public/
│   ├── package.json
│   ├── next.config.ts
│   ├── tsconfig.json
│   └── ...
├── backend/           # FastAPI/Python backend
│   ├── main.py
│   ├── requirements.txt
│   └── app/
├── README.md
├── package.json       # Root project scripts
└── blueprint/         # AI Blueprint workflow files
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Python 3.9+

### Installation

1. Clone the repository
2. Install dependencies:

```bash
# Install frontend dependencies
npm install -w frontend

# Install backend dependencies
cd backend
pip install -r requirements.txt
cd ..
```

### Development

To run both frontend and backend concurrently:

```bash
npm run dev
```

This will start:
- Frontend: http://localhost:3000
- Backend: http://localhost:8000

To run only the frontend:
```bash
npm run dev:frontend
```

To run only the backend:
```bash
npm run dev:backend
```

### Building for Production

```bash
npm run build
```

This builds the frontend for production. The backend is ready to run as-is.

### Linting

```bash
npm run lint
```

## API Endpoints

- `GET /` - Root endpoint returning API info
- `GET /health` - Health check endpoint

WebSocket endpoints are handled at `/ws/{room_id}` for real-time communication.

## Deployment

### Frontend (Vercel/Netlify)
- Connect your Git repository
- Set the root directory to `./frontend`
- Vercel/Netlify will automatically detect and build the Next.js app

### Backend (Render/Fly.io)
- Deploy the `backend/` directory
- Set the start command to: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- Ensure PORT environment variable is set by the platform

## Environment Variables

Create a `.env` file in the backend directory:

```
PORT=8000
# Add DATABASE_URL here if adding persistence later
```

## License

MIT