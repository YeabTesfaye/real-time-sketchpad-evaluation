# Real-time Sketchpad Backend

A high-performance backend for real-time collaborative sketching applications, built with FastAPI and Python.

![Backend Architecture](https://via.placeholder.com/800x400/059669/ffffff?text=Backend+Architecture+Diagram)

## 🚀 Overview

The backend provides real-time WebSocket communication, user authentication, and data persistence for a collaborative drawing application. Designed for scalability, reliability, and ease of deployment.

## 🔑 Key Features

### Real-time Collaboration
- **WebSocket Communication**: Full-duplex real-time messaging via FastAPI/WebSocket
- **Room-based Architecture**: Isolated collaboration spaces with unique identifiers
- **Operation Broadcasting**: Efficient distribution of drawing actions to all connected clients
- **Presence Tracking**: Real-time user join/leave notifications and cursor sharing
- **Message Sequencing**: Server-generated sequence numbers for deterministic ordering
- **Idempotency Protection**: Client-side operation ID generation to prevent duplicate processing

### Data Management
- **Drawing Operations**: Persistent storage of all canvas operations with full history
- **User Persistence**: SQLAlchemy ORM models for users, rooms, and operations
- **Migration System**: Alembic for schema versioning and migrations
- **Room State Management**: In-memory active connection tracking with optional persistence
- **Canvas Synchronization**: Full state snapshots for late-joining users

### Security & Reliability
- **JWT Authentication**: Secure token-based authentication system
- **Input Validation**: Comprehensive Pydantic validation for all API inputs
- **Error Handling**: Structured error responses with proper HTTP status codes
- **Connection Graceful Degradation**: Proper WebSocket cleanup on disconnects
- **Rate Limiting**: Built-in protection against abuse
- **CORS Support**: Configurable cross-origin resource sharing

### Developer Experience
- **Automatic Documentation**: Interactive Swagger UI and ReDoc endpoints
- **Type Safety**: Full Python type hints throughout
- **Development Hot Reload**: Uvicorn with reload flag for rapid iteration
- **Environment Configuration**: .env file support for different environments
- **Comprehensive Logging**: Structured logging with multiple output formats

## 🏗️ Architecture

### Core Components
```
backend/
├── app/
│   ├── api/                    # API route definitions
│   │   ├── routes/             # Individual API routers
│   │   │   ├── auth.py         # Authentication endpoints
│   │   │   └── websocket.py    # WebSocket connection handling
│   │   └── deps.py             # Dependency injection
│   ├── core/                   # Core configurations and utilities
│   │   ├── config.py           # Application configuration
│   │   ├── database.py         # Database connection management
│   │   ├── error_handler.py    # Centralized error handling
│   │   ├── exceptions.py       # Custom exception classes
│   │   └── security.py         # Authentication and authorization utilities
│   ├── db/                     # Database models and migrations
│   │   ├── models.py           # SQLAlchemy ORM models
│   │   └── alembic/            # Database migration scripts
│   ├── services/               # Business logic layer
│   │   ├── auth_service.py     # Authentication business logic
│   │   └── drawing_service.py  # Drawing operation processing
│   ├── schemas/                # Pydantic models for validation
│   │   ├── user.py             # User-related schemas
│   │   └── drawing.py          # Drawing operation schemas
│   └── main.py                 # Application entry point
├── migrations/                 # Alembic migration versions
├── requirements.txt            # Production dependencies
├── pyproject.toml              # Project metadata and build configuration
├── .env.example                # Environment variables template
└── README.md                   # This file
```

### Data Flow

1. **Client Connection**: WebSocket connection established with JWT authentication
2. **User Verification**: Token validation and user retrieval from database
3. **Room Assignment**: User added to room's active connections
4. **State Synchronization**: New users receive current canvas state
5. **Operation Processing**: 
   - Client sends drawing operation via WebSocket
   - Server validates operation structure and data
   - Server assigns canonical user ID and timestamp
   - Operation persisted to database
   - Operation broadcast to all room participants
   - Sender receives updated history state
6. **Presence Updates**: 
   - User join/leave events broadcast to room
   - Cursor positions shared (excluding sender to prevent echo)
   - Room user lists maintained and updated
7. **Connection Handling**: 
   - Automatic cleanup on disconnect
   - Stale connection detection and removal
   - Graceful error recovery

### WebSocket Message Types

#### Client → Server
- `drawing_operation` - Draw shapes/lines with client-generated ID
- `cursor_move` - Share cursor position (throttled)
- `clear_canvas` - Reset canvas to empty state
- `undo_operation` - Request undo of last action
- `redo_operation` - Request redo of last undone action

#### Server → Client
- `drawing_operation` - Broadcasting of drawing operations (with server ID/timestamp)
- `cursor_move` - Remote cursor position updates
- `user_joined` - New user notification
- `user_left` - User departure notification
- `room_users` - Complete user list snapshot
- `clear_canvas` - Canvas reset command
- `undo_operation` - Undo action confirmation
- `redo_operation` - Redo action confirmation
- `history_state` - Undo/redo availability status
- `canvas_state` - Full canvas state snapshot (for new users)
- `error` - Error messages with optional client operation ID

## 🛠️ Technology Stack

### Framework & Language
- **FastAPI 0.104.0+**: Modern, fast web framework with automatic API documentation
- **Python 3.9+**: Type-hinted, asynchronous-capable language
- **Pydantic 2.0.0+**: Data validation and settings management
- **Uvicorn 0.24.0+**: Lightning-fast ASGI server

### Database & ORM
- **SQLAlchemy 2.0.0+**: Enterprise-grade SQL toolkit and ORM
- **Alembic 1.13.0+**: Database migration tool for SQLAlchemy
- **PSPG2-binary 2.9.10+**: PostgreSQL adapter for Python
- **SQLite**: Development database (zero-configuration)

### Authentication & Security
- **Python-Jose 3.3.0+**: JWT implementation with cryptography support
- **Passlib 1.7.4+**: Secure password hashing (bcrypt)
- **Python-Multipart 0.0.6+**: Streaming form data parser

### Development & Testing
- **Pytest 7.0.0+**: Testing framework
- **Pytest-Asyncio 0.21.0+**: Asynchronous test support
- **Httpx 0.24.0+**: HTTP client for API testing
- **Ruff 0.1.0+**: Extremely fast Python linter

## 🔧 Getting Started

### Prerequisites
- Python 3.9+
- pip (Python package manager)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/real-time-sketchpad.git
cd real-time-sketchpad/backend
```

2. Install dependencies:
```bash
# For production
pip install -r requirements.txt

# For development (includes testing tools)
pip install -e ".[dev]"
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env to configure your environment
```

4. Initialize the database:
```bash
# For first-time setup
alembic upgrade head
```

### Development

Start the development server with auto-reload:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- Main API: http://localhost:8000
- Interactive Docs: http://localhost:8000/docs
- Alternative Docs: http://localhost:8000/redoc

### Production Deployment

```bash
# Production server with multiple workers
uvicorn main:app --host 0.0.0.0 --port $PORT --workers 4
```

Or using Docker:
```bash
docker build -t sketchpad-backend .
docker run -p 8000:8000 --env-file .env sketchpad-backend
```

### Database Migrations

Create a new migration:
```bash
alembic revision --autogenerate -m "description"
```

Apply migrations:
```bash
alembic upgrade head
```

Rollback last migration:
```bash
alembic downgrade -1
```

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/auth/signup` | Register new user |
| `POST` | `/api/v1/auth/login` | Authenticate user and receive JWT |
| `GET`  | `/api/v1/auth/me` | Get current user profile |

### Health & Info
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/` | API information and status |
| `GET`  | `/health` | Health check endpoint |

### WebSocket
| Protocol | Endpoint | Description |
|----------|----------|-------------|
| `WS`     | `/ws/{room_id}` | Real-time collaboration socket |

## 📦 Dependencies

### Core Dependencies
- `fastapi>=0.104.0` - Web framework with automatic docs
- `uvicorn[standard]>=0.24.0` - ASGI server
- `python-multipart>=0.0.6` - Form parsing
- `python-jose[cryptography]>=3.3.0` - JWT handling
- `passlib[bcrypt]>=1.7.4` - Password hashing
- `sqlalchemy>=2.0.0` - ORM and database toolkit
- `psycopg2-binary>=2.9.10` - PostgreSQL adapter
- `alembic>=1.13.0` - Database migrations
- `pydantic>=2.0.0` - Data validation
- `pydantic-settings>=2.0.0` - Settings management

### Development Dependencies (`[dev]` extra)
- `pytest>=7.0.0` - Testing framework
- `pytest-asyncio>=0.21.0` - Async testing support
- `httpx>=0.24.0` - HTTP client for testing
- `ruff>=0.1.0` - Fast Python linter

## 🌐 Environment Variables

Create a `.env` file based on `.env.example`:

```env
# Database connection (choose one)
# For development (SQLite - zero config):
DATABASE_URL=sqlite:///./sketchpad.db

# For production (PostgreSQL):
DATABASE_URL=postgresql://postgres:password@localhost:5432/sketchpad

# JWT settings (REQUIRED)
SECRET_KEY=your-super-secret-jwt-secret-key-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440  # 24 hours

# CORS settings
FRONTEND_URL=http://localhost:3000

# Server settings
HOST=0.0.0.0
PORT=8000
```

## 🧪 Testing

### Running Tests
```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=app --cov-report=term-missing

# Run specific test file
pytest tests/test_auth.py

# Run tests with verbose output
pytest -v
```

### Test Structure
```
tests/
├── test_auth.py          # Authentication endpoint tests
└── ...                   # Additional test modules
```

### Writing Tests
- Use `TestClient` from FastAPI for endpoint testing
- Mock database sessions for service layer testing
- Follow Arrange-Act-Assert pattern
- Test both success and failure cases
- Use fixtures for common setup/teardown

## 🚂 Deployment Options

### Traditional Server
1. Install Python 3.9+
2. Clone repository and install dependencies
3. Configure `.env` file
4. Run migrations: `alembic upgrade head`
5. Start server: `uvicorn main:app --host 0.0.0.0 --port $PORT`

### Docker
```dockerfile
# Build stage
FROM python:3.12-slim AS builder
WORKDIR /app
COPY pyproject.toml ./
RUN pip install --upgrade pip
COPY requirements.txt ./
RUN pip install -r requirements.txt
COPY . .

# Production stage
FROM python:3.12-slim
WORKDIR /app
COPY --from=builder /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages
COPY --from=builder /app ./app
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Cloud Platforms

#### Render.com
1. Create new Web Service
2. Connect your Git repository
3. Set build command: `pip install -r requirements.txt`
4. Set start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables from `.env`
6. Enable automatic deploys

#### Fly.io
1. Launch app: `fly launch`
2. Configure Dockerfile (provided above)
3. Set secrets: `fly secrets set SECRET_KEY=... DATABASE_URL=...`
4. Deploy: `fly deploy`

#### AWS Elastic Beanstalk
1. Create Python 3.12 environment
2. Upload application bundle
3. Configure environment properties
4. Set WSGI path to `main:app`

## 📊 Monitoring & Observability

### Health Checks
- `/health` endpoint returns 200 OK when service is healthy
- Includes basic connectivity checks
- Can be extended to include database checks

### Logging
- Structured logging via Python's `logging` module
- Configurable log levels (DEBUG, INFO, WARNING, ERROR)
- Timestamped output with module information
- Error tracking with stack traces

### Metrics (Future Enhancement)
- Prometheus endpoints for custom metrics
- Connection counts and message throughput
- Database query performance
- Authentication success/failure rates

## 🔐 Security Considerations

### Authentication
- JWT tokens with HS256 algorithm
- 24-hour token expiration (configurable)
- Secure secret key management
- Token validation on every WebSocket connection
- Password hashing with bcrypt (via Passlib)

### Input Validation
- Comprehensive Pydantic models for all inputs
- String length limits and format validation
- Numeric range validation for coordinates and sizes
- Enum validation for operation types and tools
- XSS prevention through JSON serialization

### WebSocket Security
- Token authentication on connection establishment
- Message validation and sanitization
- Size limits on incoming messages (1MB max)
- Rate limiting consideration for future implementation
- Proper connection cleanup on errors and disconnects

### Data Protection
- Parameterized queries to prevent SQL injection
- ORM usage prevents most injection attacks
- Environment-based configuration for secrets
- CORS policies restrict origins when needed
- HTTPS termination recommended at proxy level

## 🤝 Contributing

Please read [CONTRIBUTING.md](../CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

### Development Setup
1. Fork the repository
2. Clone your fork: `git clone https://github.com/yourusername/real-time-sketchpad.git`
3. Navigate to backend: `cd backend`
4. Install dependencies: `pip install -e ".[dev]"`
5. Set up environment: `cp .env.example .env && edit .env`
6. Initialize DB: `alembic upgrade head`
7. Create feature branch: `git checkout -b feature/your-feature-name`
8. Make changes and commit: `git commit -m 'Add some feature'`
9. Push to fork: `git push origin feature/your-feature-name`
10. Submit pull request

### Code Style
- Follow PEP 8 and Python typing conventions
- Use descriptive variable and function names
- Write clear docstrings for public functions and classes
- Keep functions focused and under 50 lines when possible
- Add type hints for all function parameters and returns
- Use Ruff for linting: `ruff check .`
- Format code with Ruff: `ruff format .`

### Commit Messages
- Use conventional commits format:
  - `feat:` for new features
  - `fix:` for bug fixes
  - `docs:` for documentation changes
  - `refactor:` for code restructuring
  - `test:` for test additions/changes
  - `chore:` for build/tool updates
- Reference issues when applicable: `fix: resolve WebSocket send error (#123)`

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

## 🙏 Acknowledgments

- **FastAPI Team**: For the incredible performance and developer experience
- **Pydantic Team**: For revolutionizing data validation in Python
- **SQLAlchemy Team**: For the gold standard in Python ORMs
- **Uvicorn Team**: For the blazing fast ASGI server
- **Open Source Community**: For all the tools that make modern development possible

---
*Built with ⚡ for seamless real-time collaboration*