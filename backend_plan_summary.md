# Backend Implementation Plan

## Entities Discovered
- **User**: email (unique), hashed password, optional full name
- **Room**: 8-character alphanumeric code (generated client-side)
- **Drawing Operation**: points, color, size, tool, userId, timestamp
- **Cursor Move**: userId, position, timestamp
- **User Joined/Left**: user info (userId, name, color, timestamp)
- **Clear Canvas**: userId, timestamp

## API Endpoints to Implement
1. **POST /api/v1/auth/signup** - User registration
2. **POST /api/v1/auth/login** - User login (returns JWT)
3. **WS /ws/{room_id}?token={jwt_token}** - Authenticated WebSocket for real-time collaboration

## Architecture Overview
- **FastAPI** application with CORS middleware
- **SQLAlchemy 2.x** models for User (and optionally Room/DrawingOperation for persistence)
- **JWT authentication** using PyJWT and Passlib for bcrypt hashing
- **WebSocket endpoint** that authenticates via token query parameter
- **In-memory connection manager** for room state (can be replaced with Redis/PubSub for scaling)
- **Environment configuration** via `.env.example`
- **Alembic** for database migrations

## Key Implementation Steps
1. Set up project structure and dependencies
2. Create database models and configuration
3. Implement authentication service (JWT, password hashing)
4. Build auth routes (signup, login)
5. Implement WebSocket endpoint with authentication
6. Add error handling and validation
7. Create Alembic migration scripts
8. Write basic tests
9. Update frontend to use real auth endpoints and WebSocket with token (minimal changes)

## Frontend Changes Required (Minimal)
1. Replace simulated auth in `LoginClient.tsx` and `SignupClient.tsx` with real API calls
2. Store JWT token in `localStorage` (instead of demo-token)
3. Modify `useWebSocket` hook to append token to WebSocket URL
4. Remove client-side identity generation; use identity from backend
5. Keep all WebSocket message formats unchanged

Let's proceed with implementation.