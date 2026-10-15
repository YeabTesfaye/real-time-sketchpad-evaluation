# Real-time Sketchpad Frontend

The frontend component of the real-time collaborative sketchpad application, built with Next.js and TypeScript.

![Frontend Architecture](https://via.placeholder.com/800x400/2563eb/ffffff?text=Frontend+Architecture+Diagram)

## 📋 Overview

A performant, reactive frontend that provides a seamless drawing experience with real-time collaboration capabilities. Built with modern React patterns and optimized for smooth canvas rendering.

## 🔑 Key Features

- **High-Performance Canvas**: Custom canvas implementation using `requestAnimationFrame` for 60fps drawing
- **Real-time Synchronization**: Instant updates via WebSocket connection with intelligent message queuing
- **Multi-user Cursor Tracking**: See other users' cursors with names and colors in real-time
- **Robust Connection Handling**: Automatic reconnection with exponential backoff and state recovery
- **Tool Selection**: Pen, rectangle, ellipse, and line tools with customizable properties
- **Color & Size Controls**: Intuitive controls for brush color and size adjustment
- **Undo/Redo Functionality**: Complete history tracking with unlimited undo/redo capabilities
- **Room Management**: Create, join, and share collaboration rooms via URL
- **Responsive Design**: Works seamlessly on desktop and tablet devices
- **Accessibility**: Keyboard navigation and screen reader friendly
- **Clean UI**: Minimal interface that focuses on the drawing experience

## 🏗️ Architecture

### Core Components

```
frontend/
├── app/
│   ├── (main)/
│   │   └── sketchpad/
│   │       └── [roomId]/     # Dynamic room routes
│   │           └── page.tsx  # Room page wrapper
│   └── layout.tsx            # Root layout with global providers
├── components/
│   ├── sketchpad/            # Sketchpad-specific components
│   │   ├── Canvas.tsx        # Main drawing canvas with WebSocket integration
│   │   ├── panels/           # Side panels (tools, people)
│   │   │   ├── ToolPanel.tsx # Drawing tools and controls
│   │   │   ├── PeoplePanel.tsx # User list and presence indicators
│   │   │   └── CopyLinkButton.tsx # Share room URL functionality
│   │   └── RoomClient.tsx    # Main room orchestrator
│   └── ui/                   # Reusable UI primitives (shadcn/ui)
├── lib/
│   ├── operations.ts         # Drawing operation types and utilities
│   ├── websocket.ts          # Custom WebSocket hook with reconnection logic
│   ├── room-code.ts          # Room code generation and validation
│   └── utils.ts              # Utility functions
├── hooks/                    # Custom React hooks
│   └── useAuth.ts            # Authentication hook
├── public/                   # Static assets
└── package.json              # Frontend dependencies and scripts
```

### Data Flow

1. **User Interaction**: Pointer events on canvas → Local operation buffering
2. **Message Creation**: Client creates operation with temporary ID
3. **WebSocket Send**: Operation sent to server via persistent connection
4. **Server Processing**: Server validates, saves, broadcasts to all clients
5. **State Update**: Clients receive operation → Add to local canvas state
6. **Render Loop**: `requestAnimationFrame` updates canvas display

### WebSocket Communication

The frontend uses a custom WebSocket hook (`useWebSocket`) that provides:
- Automatic connection management
- Exponential backoff reconnection (max 5 attempts)
- Message queuing during disconnection
- Connection status tracking
- Error handling and recovery
- Token-based authentication

## 🛠️ Technology Stack

### Framework & Language
- **Next.js 16+**: React framework with App Router, server components, and edge capabilities
- **TypeScript 5**: Strict type safety for enhanced developer experience

### UI & Styling
- **Tailwind CSS 4**: Utility-first CSS framework with JIT compiler
- **shadcn/ui**: Reusable component primitives built on Radix UI
- **Lucide Icons**: Consistent, lightweight icon set
- **Custom Canvas**: Optimized drawing surface with `requestAnimationFrame`

### State Management
- **React Hooks**: useState, useEffect, useContext for local state
- **Custom Hooks**: Encapsulated WebSocket and authentication logic
- **Immutable Updates**: Efficient state updates with structural sharing

### Real-time Communication
- **WebSocket API**: Full-duplex communication channel
- **JSON Messaging**: Structured message format for all operations
- **Message Validation**: Client-side and server-side validation
- **Sequence Numbers**: Server-generated sequencing for message ordering
- **Operation Deduplication**: Client-side ID generation to prevent duplicates

### Development Experience
- **ESLint 9**: Code quality and style checking
- **TypeScript Compiler**: Strict type checking
- **Hot Module Replacement**: Instant updates during development
- **Fast Refresh**: Preserves component state during edits

## 🔧 Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

### Development

Start the development server:
```bash
npm run dev
```

The application will be available at http://localhost:3000

### Building for Production

Create an optimized production build:
```bash
npm run build
```

Preview the production build:
```bash
npm run start
```

### Linting & Type Checking

```bash
# Run ESLint
npm run lint

# Type checking
npx tsc --noEmit
```

## 🧩 Component Guide

### Canvas.tsx
The main drawing surface that handles:
- Pointer event capture (mouse, touch, pen)
- Local operation buffering and rendering
- WebSocket message processing
- RequestAnimationFrame render loop
- Remote cursor display
- History state management (undo/redo)
- Tool-specific drawing logic

### RoomClient.tsx
The main room orchestrator that manages:
- WebSocket connection via custom hook
- User authentication and identity
- Tool panel and people panel coordination
- Room state synchronization
- Copy link functionality
- Responsive layout adaptation

### ToolPanel.tsx
Drawing controls including:
- Tool selection (pen, rectangle, ellipse, line)
- Color picker with preset options
- Size slider (1-100px)
- Action buttons (clear, undo, redo)
- Connection status indicator

### PeoplePanel.tsx
User presence display showing:
- Current user identification ("You")
- Remote users with names and colors
- User join/leave notifications
- Room code display and sharing

### Custom Hooks

#### useWebSocket.ts
Handles WebSocket lifecycle:
- Connection establishment and reconnection
- Message sending and receiving
- Connection status tracking (connecting, connected, disconnected, error)
- Automatic token refresh
- Exponential backoff reconnection strategy
- Message queueing during disconnections

#### useAuth.ts
Manages authentication state:
- JWT token storage and retrieval
- User data persistence
- Login/logout flow management
- Protected route redirection

## 📦 Dependencies

### Production Dependencies
- `next@16.3.8` - React framework
- `react@19.2.8` & `react-dom@19.2.8` - UI library
- `tailwindcss@4` - Utility-first CSS framework
- `lucide-react@1.52.0` - Icon library
- `react-hook-form@7.89.0` - Form validation and management
- `@hookform/resolvers@5.9.1` - Form validation resolvers
- `zod@4.6.5` - Schema validation
- `class-variance-authority@0.7.1` - CVA for component variants
- `clsx@2.1.1` - Class name utility
- `tailwind-merge@3.7.0` - Tailwind class merging
- `next-themes@0.4.6` - Theme switching support
- `@radix-ui/react-dialog@1.2.0` - Accessible dialog primitive
- `@radix-ui/react-slot@1.4.0` - Slot composition utility
- `react-dialog@0.1.0` - Dialog component

### Development Dependencies
- `@types/node@20` & `@types/react@19` - TypeScript definitions
- `eslint@9` - Linter
- `eslint-config-next@16.3.8` - Next.js ESLint configuration
- `typescript@5` - TypeScript compiler

## 🌐 Environment Variables

Create a `.env.local` file in the frontend directory:

```
# Backend API URL
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

## 🔐 Authentication Flow

1. **Token Storage**: JWT tokens stored in localStorage
2. **Automatic Attachment**: Tokens automatically attached to WebSocket connections
3. **Validation**: Client-side validation of token presence
4. **Refresh Handling**: Token refresh on WebSocket reconnection
5. **Logout**: Token removal and redirect to login page

## 🎨 Styling Approach

### Design Tokens
- **Colors**: Semantic color variables defined in Tailwind configuration
- **Spacing**: Consistent 4px-based spacing scale
- **Typography**: Hierarchical type scale with appropriate line heights
- **Radii**: Consistent border radius values
- **Shadows**: Layered shadow system for depth

### Component Styling
- **Utility-first**: Primarily using Tailwind utility classes
- **Component Extension**: Extending shadcn/ui components via variants
- **Dark Mode**: Built-in dark mode support via next-themes
- **Responsive Design**: Mobile-first breakpoints

## 🧪 Testing

While testing setup is opt-in, recommended approaches include:

### Unit Testing
- **Vitest**: Fast, modern test runner compatible with Vite/Jest
- **React Testing Library**: Component testing best practices
- **TS-Jest**: TypeScript support for Jest (if preferred)

### End-to-End Testing
- **Playwright**: Reliable end-to-end testing for web applications
- **Cypress**: Feature-rich end-to-end testing framework

### Visual Testing
- **Chromatic**: Visual regression testing for Storybook
- **Percy**: Visual testing integrated with CI/CD pipelines

## 🚂 Deployment

### Vercel (Recommended)
1. Push code to GitHub/GitLab/Bitbucket
2. Import project in Vercel
3. Set `NEXT_PUBLIC_BACKEND_URL` environment variable
4. Vercel automatically detects Next.js app and optimizes build
5. Enable automatic deployments on branch updates

### Netlify
1. Connect repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `.next`
4. Configure `NEXT_PUBLIC_BACKEND_URL` environment variable
5. Enable branch deployments and form handling if needed

### Docker (Alternative)
```dockerfile
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build

# Production stage
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY frontend/package*.json ./
RUN npm install --production
EXPOSE 3000
CMD ["npm", "start"]
```

## 🔍 Browser Support

- **Chrome**: Latest ✓
- **Firefox**: Latest ✓
- **Safari**: Latest ✓
- **Edge**: Latest ✓
- **Mobile Safari**: Latest ✓
- **Chrome Android**: Latest ✓

*Note: Application is responsive and functional on all modern browsers*

## 📱 Responsive Breakpoints

- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px
- **Wide Desktop**: > 1280px

## 🧭 Navigation & Routing

### App Router Structure
- `/` - Landing page (redirects to /sketchpad)
- `/sketchpad` - Room creation/lobby
- `/sketchpad/[roomId]` - Active collaboration room

### Route Characteristics
- **Server Components**: Default rendering strategy
- **Client Boundaries**: Minimal client components for interactivity
- **Streaming**: Progressive loading of room interfaces
- **Metadata**: Dynamic room titles and descriptions
- **Error Handling**: Custom error boundaries for room access

## 🛡️ Security Considerations

### Client-Side Protections
- **Input Sanitization**: All user inputs sanitized before processing
- **XSS Prevention**: JSX escaping for dynamic content
- **CSRF Protection**: Same-site cookies and token validation
- **Authentication**: JWT-based auth with expiration
- **Authorization**: Route protection for authenticated users

### WebSocket Security
- **Token Authentication**: JWT verification on connection
- **Message Validation**: Schema validation on all incoming messages
- **Rate Limiting**: Connection-level throttling
- **Error Graceful Degradation**: Fail-safe message handling

### Data Protection
- **Client-Side Validation**: Form validation with Zod
- **Secure Storage**: httpOnly cookies for tokens (when implemented)
- **XSS Prevention**: DOM sanitization for user-generated content
- **CORS Policies**: Restricted origin policies

## 🤝 Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

### Development Setup
1. Fork the repository
2. Clone your fork: `git clone https://github.com/yourusername/real-time-sketchpad.git`
3. Navigate to frontend: `cd frontend`
4. Install dependencies: `npm install`
5. Create feature branch: `git checkout -b feature/your-feature-name`
6. Make changes and commit: `git commit -m 'Add some feature'`
7. Push to fork: `git push origin feature/your-feature-name`
8. Submit pull request

### Code Style
- Follow existing TypeScript and React patterns
- Maintain consistent code formatting
- Write descriptive commit messages
- Update documentation when changing functionality
- Add JSDoc comments for complex functions

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js Team**: For the incredible React framework
- **Tailwind Labs**: For the utility-first CSS approach
- **Radix UI Team**: For the accessible component primitives
- **Lucide Contributors**: For the beautiful icon set
- **Open Source Community**: For all the tools that make this possible

---
*Built with ❤️ for effortless visual collaboration*