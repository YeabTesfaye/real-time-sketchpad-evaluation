# Real-time Collaborative Sketchpad

A lightweight, real-time collaborative sketchpad for teams to visually share ideas, wireframes, and notes instantly.

![Real-time Collaborative Sketchpad](https://via.placeholder.com/800x400/4f46e5/ffffff?text=Real-time+Collaborative+Sketchpad+Demo)

## 🚀 Features

- **Real-time Drawing Synchronization**: Experience seamless collaboration with instant updates using WebSocket technology
- **Effortless Room Creation**: Generate shareable collaboration rooms with simple URLs
- **Live Cursor Tracking**: See other users' cursors move in real-time with name/color indicators
- **Robust Network Handling**: Automatic reconnection and state recovery after network interruptions
- **Late Joiner Support**: New participants instantly receive the current canvas state
- **Clean Minimal Interface**: Distraction-free drawing environment optimized for creativity
- **Multiple Drawing Tools**: Pen, rectangle, ellipse, and line tools with customizable colors and sizes
- **Canvas Clearing**: One-click reset to start fresh
- **User Presence Indicators**: Visual indicators showing who's currently in the room

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 16+ with App Router and TypeScript
- **UI Library**: Custom canvas implementation with `requestAnimationFrame` for optimal performance
- **Styling**: Tailwind CSS 4 for utility-first styling
- **State Management**: React hooks for efficient state updates
- **Real-time Communication**: Custom WebSocket hook with exponential backoff reconnection
- **Icons**: Lucide React for clean, consistent icons

### Backend
- **Framework**: FastAPI for high-performance API development
- **Real-time Engine**: WebSocket support via Uvicorn server
- **Data Validation**: Pydantic for robust data validation
- **Database**: SQLAlchemy ORM with Alembic for migrations
- **Authentication**: JWT-based secure authentication system
- **Environment**: Python 3.9+

### Infrastructure
- **Deployment**: Frontend optimized for Vercel/Netlify, Backend for Render/Fly.io
- **Development**: Concurrent development setup with hot reload
- **Production**: Health check endpoints and proper error handling

## 📁 Project Structure

```
real-time-sketchpad/
├── frontend/                   # Next.js application
│   ├── app/                    # App router pages and components
│   ├── components/             # Reusable UI components
│   ├── lib/                    # Custom hooks and utilities
│   ├── public/                 # Static assets
│   └── package.json
├── backend/                    # FastAPI/Python backend
│   ├── app/                    # Application modules
│   │   ├── api/                # API routes
│   │   ├── core/               # Core configurations
│   │   ├── db/                 # Database models
│   │   └── services/           # Business logic services
│   ├── main.py                 # Application entry point
│   ├── requirements.txt        # Python dependencies
│   └── .env.example            # Environment variables template
├── blueprint/                  # AI Blueprint workflow files
├── README.md                   # Root documentation
└── package.json                # Root project scripts
```

## 🔧 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Python 3.9+

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/real-time-sketchpad.git
cd real-time-sketchpad
```

2. Install dependencies:
```bash
# Install frontend dependencies
npm install -w frontend

# Install backend dependencies
cd backend
pip install -r requirements.txt
cd ..
```

3. Set up environment variables:
```bash
# Backend configuration
cd backend
cp .env.example .env
# Edit .env to configure DATABASE_URL and SECRET_KEY
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

### Linting & Type Checking

```bash
# Run ESLint and TypeScript checks
npm run lint

# Type checking
npx tsc --noEmit
```

## 🔌 API Endpoints

### Authentication
- `POST /api/v1/auth/signup` - Register a new user
- `POST /api/v1/auth/login` - Login user and receive JWT token
- `GET /api/v1/auth/me` - Get current user information

### Health
- `GET /` - Root endpoint returning API information
- `GET /health` - Health check endpoint

### WebSocket
- `WS /ws/{room_id}` - Real-time WebSocket connection for room collaboration
  - Supported message types:
    - `drawing_operation` - Send drawing actions
    - `cursor_move` - Share cursor position
    - `clear_canvas` - Reset canvas
    - `undo_operation` - Undo last action
    - `redo_operation` - Redo last undone action

## 🚀 Deployment

### Frontend (Vercel/Netlify)
1. Connect your Git repository
2. Set the root directory to `./frontend`
3. Vercel/Netlify will automatically detect and build the Next.js app
4. Configure environment variables:
   - `NEXT_PUBLIC_BACKEND_URL` - URL of your deployed backend

### Backend (Render/Fly.io)
1. Deploy the `backend/` directory
2. Set the start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
3. Ensure PORT environment variable is set by the platform
4. Configure environment variables in your hosting platform:
   - `DATABASE_URL` - PostgreSQL connection string
   - `SECRET_KEY` - JWT secret key
   - `FRONTEND_URL` - URL of your deployed frontend
   - `HOST` - 0.0.0.0
   - `PORT` - Provided by platform

## 🌐 Environment Variables

### Backend (`.env` file)
```
# Database connection
DATABASE_URL=postgresql://user:password@localhost:5432/sketchpad

# JWT settings
SECRET_KEY=your-super-secret-jwt-secret-key-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440  # 24 hours

# CORS settings
FRONTEND_URL=http://localhost:3000

# Server settings
HOST=0.0.0.0
PORT=8000
```

### Frontend (via `next.config.js` or environment)
```
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

## 🧪 Testing

### Backend Tests
```bash
# Run backend tests
cd backend
pytest
```

### Frontend Tests
*(Testing setup is opt-in - add your preferred testing framework)*

## 📜 License

MIT License - feel free to use this project for your portfolio or learning purposes.

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing-feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🙏 Acknowledgments

- Built with Next.js, FastAPI, and Tailwind CSS
- Inspired by the need for simple, real-time collaboration tools
- Special thanks to the open-source community for the amazing tools used

---
*Developed with ❤️ for seamless visual collaboration*