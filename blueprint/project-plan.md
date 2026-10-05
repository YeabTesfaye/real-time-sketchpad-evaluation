# Project Plan

## 1. Problem - What problem are we solving?
Remote teams and individuals need lightweight, instant ways to collaborate on visual ideas—sketching user flows, wireframes, or brainstorming notes—without the overhead of heavyweight tools that require accounts, installations, or steep learning curves. Existing solutions are either too basic (no persistence, no real-time sync) or too complex for quick, ad-hoc sessions.

## 2. Users - Who is this for?
- Product designers and developers running remote workshops or design sprints
- Educators conducting virtual whiteboard sessions
- Engineering teams doing quick architecture discussions
- Anyone needing to share and iterate on visual ideas in real-time with others

## 3. Features - What does the MVP need?
High level list of features. One line each, don't go into deep detail
- Create/join a collaboration room via a simple shareable URL
- Draw freely with pen tool (variable size/color)
- See your own cursor on canvas
- See remote users' cursors move in real-time (with name/color indicators)
- See remote users' drawing operations appear in real-time (event/operation-based sync)
- Handle reconnections gracefully (resume drawing after network interruption)
- Support late-joining users (sync current canvas state to new participants)
- Clear the canvas
- Optional later: Shape tools (rectangle, ellipse, line)
- Optional later: Text tool (insert and edit text boxes)
- Optional later: Eraser tool
- Optional later: Undo/redo functionality
- Optional later: Color and size selectors for pen
- Optional later: Save/load rooms for later reuse (persisted backend)
- Optional later: Mobile/touch support

## 4. Data - What are we storing?
List of data that will be stored eg. users, products, stats
- Room metadata: room ID, creation timestamp, last accessed, in-memory room object reference
- Canvas state: Drawing operations/events queue (ordered list of draw actions with properties: type, coordinates, color, size, tool, timestamp, userId)
- User presence: usernames/colors, cursor positions (ephemeral, not persisted in room state)
- Room/UI state separation: Room metadata and user presence managed separately from canvas drawing state
- Optional persistence: Serialized drawing operations queue for save/load functionality (later feature)

## 5. Tech - What stack are we using?
The stack this project will use eg. Next.js, Neon Postgres, ShadCN UI, Claude Haiku for content generation
- Frontend: Next.js 16+, TypeScript, React
- Drawing engine: Custom canvas with requestAnimationFrame (prioritizing performance over heavy library)
- Real-time communication: WebSocket via FastAPI/Uvicorn
- Backend: Python 3.9+, FastAPI
- Data storage (initial): In-memory room management (start simple, add Redis only when scaling needed)
- Data storage (optional later): SQLite for development, PostgreSQL/Supabase for production (free tier) - for persistence only
- Styling: Tailwind CSS 4 (already in stack)
- Icons: Heroicons or similar (free)

## 6. Monetize - How will this make money?
Explain how you plan to make money. eg. Ads, memberships, etc
Not applicable for MVP—this is a portfolio/demo tool. Future options could include premium templates, team workspaces, or export features (but core remains free).

## 7. UI/UX - How should this look and feel?
Describe the look and feel. Add examples if you want
- Clean, minimal interface: toolbar on left/canvas center/user list on right
- Intuitive tool selection: click to activate pen/eraser/shape/text
- Real-time feedback: see others' cursors as colored dots with names, see their strokes appear smoothly
- Responsive: works on desktop and tablet (touch support for drawing)
- Feedback layer: subtle notifications for user joins/leaves, save status
- Export-ready: clean canvas with optional background grid

## 8. Deployment - Where and how will this ship?
Target host if known, such as Render or Vercel. Include app type, build command,
start command or output directory, env vars by name, database or storage needs,
workers or cron jobs, health check path, and domain notes if you know them.
- Frontend: Vercel (Next.js optimized) or Netlify
- Backend: Render (free web service) or Fly.io
- Build: `npm run build` (frontend), `uvicorn main:app --host 0.0.0.0 --port $PORT` (backend)
- Start: Same as build commands for production
- Output: Standard Next.js export
- Env vars: 
  - `DATABASE_URL` (for PostgreSQL/Supabase, optional for SQLite dev - only needed if persistence feature added later)
  - `NEXT_PUBLIC_BACKEND_URL` (for frontend to connect to backend)
  - `PORT` (backend port, provided by host)
- Health check: `/health` endpoint returning 200 OK
- Database: SQLite file for dev (zero-config); free-tier Supabase/PostgreSQL for persistence option (added only when persistence feature implemented)
- Initial deployment: Uses in-memory room management (no external database required for MVP)

## 9. Usage model and constraints (optional)
Record only what is known and relevant: expected user count and approximate scale;
local, internal, or internet-facing operation; trusted or adversarial users;
single-tenant or multi-tenant use when applicable; required security, compliance,
availability, or audit constraints; and explicit non-requirements. Leave this
section unanswered when those facts are not established. Unknown does not mean
enterprise, hostile, multi-tenant, or single-user.
- Internet-facing operation (designed for public sharing via URL)
- Trusted users: assumed to be collaborators in good faith (not adversarial)
- Single-tenant per room (each room is isolated)
- Approximate scale: 2-10 concurrent users per room (designed for small group collaboration)
- Availability: best-effort (free tier hosting); no SLAs
- Non-requirements: 
  - No end-to-end encryption (not needed for non-sensitive sketching)
  - No user authentication (rooms accessed via URL sharing)
  - No compliance requirements (GDPR, HIPAA, etc.) for MVP