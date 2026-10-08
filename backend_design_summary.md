# Backend Design Summary for Real-time Sketchpad

## Discovered Frontend Requirements

After inspecting the existing Next.js + TypeScript frontend, we found:

1. **Authentication Simulation**: 
   - Login and signup pages (`/app/(auth)/login/LoginClient.tsx` and `/app/(auth)/signup/SignupClient.tsx`) currently simulate API calls using `setTimeout` and store a demo token in `localStorage`.
   - No actual API calls are made; authentication is purely client-side simulated.

2. **Real-time Collaboration**:
   - The sketchpad functionality uses WebSocket for real-time communication.
   - WebSocket connection: `ws://localhost:8000/ws/${roomId}` (hardcoded in `/app/lib/websocket.ts`).
   - Message types: 
     - `drawing_operation`: Points, color, size, tool, userId, timestamp
     - `cursor_move`: userId, position, timestamp
     - `user_joined`: user object (userId, name, color, joinedAt)
     - `user_left`: userId
     - `clear_canvas`: userId, timestamp
   - The frontend generates a random user identity (userId, name, color) on each page load using utilities in `/app/lib/room.ts`.

3. **Room Management**:
   - Rooms are identified by an 8-character alphanumeric code (uppercase letters and digits).
   - Room IDs are generated client-side using `crypto.getRandomValues` (in `/app/components/room-actions.tsx`).
   - No persistent storage of rooms or drawing operations; state is lost when leaving the room.

4. **No REST API Calls**:
   - The frontend does not make any REST API calls for data fetching or mutations.
   - All data exchange happens via WebSocket or is simulated (authentication).

## Proposed Backend Architecture

### Technology Stack
- **Language**: Python 3.12+
- **Framework**: FastAPI
- **Authentication**: JWT (PyJWT) with password hashing (Passlib)
- **Database**: SQLAlchemy 2.x with PostgreSQL (development can use SQLite)
- **Migrations**: Alembic
- **Validation**: Pydantic v2
- **Real-time**: Native FastAPI WebSocket support

### Directory Structure
```
backend/
  app/
    api/
      deps.py
      routes/
        auth.py
        websocket.py
    core/
      config.py
      security.py
      database.py
    db/
      models.py
    schemas/
      user.py
      token.py
    services/
      auth_service.py
    repositories/
      user_repo.py
  alembic/
  tests/
  .env.example
  pyproject.toml
  main.py
```

### Database Models
1. **User**
   - id: UUID (primary key)
   - email: String, unique, indexed
   - hashed_password: String
   - full_name: String, nullable
   - is_active: Boolean, default True
   - created_at: DateTime
   - updated_at: DateTime

2. **Room** (optional, for persistence)
   - id: UUID (primary key)
   - room_id: String (8-char code), unique, indexed
   - created_at: DateTime
   - updated_at: DateTime

3. **DrawingOperation** (optional, for persistence)
   - id: UUID (primary key)
   - room_id: ForeignKey to Room
   - user_id: ForeignKey to User
   - points: JSON (list of {x, y})
   - color: String
   - size: Integer
   - tool: String
   - timestamp: DateTime

### API Endpoints
#### Authentication
- `POST /api/v1/auth/signup`
  - Request: {email: string, password: string, full_name?: string}
  - Response: {access_token: string, token_type: "bearer", user: UserResponse}
- `POST /api/v1/auth/login`
  - Request: {email: string, password: string}
  - Response: {access_token: string, token_type: "bearer", user: UserResponse}

#### WebSocket
- `WS /ws/{room_id}?token={jwt_token}`
  - Authenticates user via JWT token in query parameter
  - Upon connection, retrieves user profile from database
  - Manages room membership and broadcasts real-time events

### WebSocket Message Types (unchanged from frontend)
- drawing_operation
- cursor_move
- user_joined
- user_left
- clear_canvas
- error

### Key Features
1. **Authentication**:
   - Secure password hashing using bcrypt
   - JWT tokens with expiration (e.g., 24 hours)
   - Token refresh strategy (optional)

2. **Room Management**:
   - Rooms created on-demand when first user joins via WebSocket
   - Room ID validation (8-character alphanumeric)
   - Automatic cleanup of empty rooms (optional)

3. **Real-time Communication**:
   - Efficient broadcasting of drawing operations, cursor moves, etc.
   - User join/leave notifications
   - Canvas state synchronization for new users

4. **Security**:
   - CORS middleware configured for frontend origin
   - Input validation and sanitization
   - Protection against common WebSocket attacks (message size limits, etc.)

### Integration Points with Frontend
1. **Authentication Flow**:
   - Frontend sends email/password to `/api/v1/auth/login` or `/api/v1/auth/signup`
   - Backend returns JWT token
   - Frontend stores token in `localStorage` (replaces current demo-token simulation)
   - Frontend uses token for subsequent authenticated requests

2. **WebSocket Connection**:
   - Frontend reads token from `localStorage` and appends it to WebSocket URL:
     `ws://localhost:8000/ws/${roomId}?token=${token}`
   - Backend verifies token, extracts user ID, and fetches user profile from database
   - Backend uses the authenticated user's identity (instead of generating random one)
   - Frontend continues to use the same WebSocket message format

3. **User Identity**:
   - Backend provides consistent user identity across sessions (based on database record)
   - Frontend no longer needs to generate random identity; uses the one from token
   - User's name and color can be stored in user profile or generated deterministically from userId

### Development Setup
1. Environment variables in `.env.example`:
   ```
   DATABASE_URL=postgresql://user:password@localhost/dbname
   SECRET_KEY=your-super-secret-jwt-secret-key-here
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=1440  # 24 hours
   ```

2. Dependencies in `pyproject.toml`:
   ```
   [project]
   name = "sketchpad-backend"
   version = "0.1.0"
   dependencies = [
     "fastapi>=0.104.0",
     "uvicorn[standard]>=0.24.0",
     "python-multipart>=0.0.6",
     "python-jose[cryptography]>=3.3.0",
     "passlib[bcrypt]>=1.7.4",
     "sqlalchemy>=2.0.0",
     "psycopg2-binary>=2.9.0",
     "alembic>=1.13.0",
     "pydantic>=2.0.0"
   ]
   ```

### Next Steps
1. Set up database configuration and models
2. Implement authentication service (signup, login, JWT handling)
3. Create auth routes
4. Implement WebSocket endpoint with authentication
5. Add CORS and security middleware
6. Create Alembic migration scripts
7. Write basic tests for auth and WebSocket connectivity
8. Update frontend to use real authentication endpoints and WebSocket with token
9. Run verification: lint, TypeScript checks, backend tests

This design reuses the existing WebSocket message formats and room ID generation logic from the frontend, minimizing changes to the client-side code while providing a secure, scalable backend.