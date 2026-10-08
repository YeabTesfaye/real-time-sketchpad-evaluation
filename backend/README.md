# Sketchpad Backend

This is the backend for the real-time sketchpad application.

## Requirements

- Python 3.12+
- Dependencies listed in `pyproject.toml`

## Setup

1. Clone the repository
2. Navigate to the backend directory
3. Install dependencies:
   ```bash
   pip install -e .
   ```
   or for development:
   ```bash
   pip install -e ".[dev]"
   ```

4. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```
   Edit the `.env` file to set your database URL and secret key.

5. Run database migrations:
   ```bash
   alembic upgrade head
   ```

6. Start the server:
   ```bash
   uvicorn main:app --reload
   ```

## API Documentation

Once the server is running, visit:
- http://localhost:8000/docs for Swagger UI
- http://localhost:8000/redoc for ReDoc

## Environment Variables

See `.env.example` for required variables.

## License

MIT