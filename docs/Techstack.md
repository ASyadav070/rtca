# Tech Stack
## Real-Time Chat Application

**Version:** 1.0.0
**Last Updated:** April 2026

---

## 1. Overview

| Layer | Technology | Version |
|-------|------------|---------|
| Frontend framework | Next.js | 14.x (App Router) |
| UI language | TypeScript | 5.x |
| Styling | Tailwind CSS | 3.x |
| Backend / CMS | Strapi | 4.x |
| Real-time engine | Socket.io | 4.x |
| Database | SQLite (dev) / PostgreSQL (prod) | — |
| Package manager | pnpm | 8.x |

---

## 2. Frontend

### 2.1 Core

**Next.js 14 (App Router)**
The primary frontend framework. The App Router enables a clear split between Server Components (data fetching, auth validation) and Client Components (interactive chat UI, socket integration). Key Next.js features used:

- File-based routing with dynamic segments (`/room/[name]`)
- Middleware for route protection (JWT validation before page load)
- Server Actions for form submissions (login, register)
- `next/navigation` for programmatic routing

**TypeScript 5**
Strict typing across all frontend code. Eliminates runtime type errors and provides autocomplete for API response shapes, Socket.io payloads, and component props.

**React 18**
Concurrent features, including Suspense boundaries around message history loading and the `useTransition` hook for non-blocking UI updates during socket events.

### 2.2 Styling

**Tailwind CSS 3**
Utility-first CSS framework. Chosen for rapid iteration, consistent design tokens (spacing, color, typography), and elimination of dead CSS. The `tailwind.config.ts` file defines the project's design system.

**clsx / tailwind-merge**
Used together to conditionally merge Tailwind class names without specificity conflicts.

### 2.3 State & Data

**Zustand**
Lightweight global state for the authenticated user session and the active Socket.io connection instance. Avoids prop drilling across deeply nested chat components.

**SWR**
Used for fetching and caching message history on room entry. Provides built-in revalidation and loading/error states without boilerplate.

### 2.4 Real-time (Client)

**socket.io-client 4**
Establishes a persistent WebSocket connection to the Strapi backend. Handles automatic reconnection and exposes a typed event emitter. Wrapped in a `useSocket` custom hook to manage connection lifecycle alongside the React component tree.

### 2.5 Forms & Validation

**React Hook Form**
Manages login and registration form state with minimal re-renders.

**Zod**
Schema-based validation for form inputs and API response parsing. Schemas are defined once in `src/types/` and shared across client validation and server-side type guards.

---

## 3. Backend

### 3.1 Strapi 4

Headless CMS and REST API server. Provides:

- **User authentication** via the built-in `users-permissions` plugin (JWT-based, bcrypt password hashing).
- **Content-Type Builder** for the `Message` model (text, room, sender relation, timestamp).
- **Auto-generated REST endpoints** for CRUD operations on messages.
- **Lifecycle hooks** (`afterCreate` on Message) to trigger Socket.io broadcasts after a message is persisted to the database.
- **Role & Permission management** to restrict message creation and retrieval to authenticated users only.

Strapi's plugin architecture means no custom auth code is required; the project extends only what is necessary.

### 3.2 Socket.io Server 4

Initialized inside Strapi's custom bootstrap (`src/index.ts`). Shares the same HTTP server instance as Strapi so no separate port is needed.

**Key server-side responsibilities:**

- Authenticate incoming socket connections by verifying the JWT passed in the handshake auth payload.
- Manage Socket.io rooms mapped 1-to-1 with chat room names.
- Maintain an in-memory `Map<roomName, Set<username>>` for the active user list.
- Listen for Strapi lifecycle events and broadcast `new-message` to the appropriate room.
- Emit `user-list` updates on join and leave.

### 3.3 Database

| Environment | Engine | Rationale |
|-------------|--------|-----------|
| Development | SQLite | Zero-config, file-based, ships with Strapi by default |
| Production | PostgreSQL 15 | ACID-compliant, connection pooling, scales with the app |

Strapi's database abstraction (Knex under the hood) means the switch is a configuration change in `.env` with no code changes.

---

## 4. Infrastructure & Tooling

### 4.1 Development

| Tool | Purpose |
|------|---------|
| **pnpm** | Fast, disk-efficient package manager with workspace support |
| **ESLint** | Linting (`eslint-config-next`, `@typescript-eslint/recommended`) |
| **Prettier** | Opinionated code formatting |
| **Husky + lint-staged** | Pre-commit hook to lint and format staged files |
| **Concurrently** | Runs Next.js dev server and Strapi dev server in parallel from root |

### 4.2 Testing

| Tool | Scope |
|------|-------|
| **Jest** | Unit and integration tests |
| **React Testing Library** | Component rendering and interaction tests |
| **Supertest** | HTTP integration tests for Strapi API endpoints |
| **Playwright** | End-to-end browser tests (happy-path chat flow) |

### 4.3 Environment Management

- `.env.local` for Next.js (never committed).
- `.env` for Strapi (never committed).
- `.env.example` files committed for both to document required variables.

---

## 5. Key Libraries Summary

```jsonc
// frontend/package.json (selected dependencies)
{
  "next": "^14.0.0",
  "react": "^18.0.0",
  "typescript": "^5.0.0",
  "tailwindcss": "^3.0.0",
  "socket.io-client": "^4.7.0",
  "zustand": "^4.5.0",
  "swr": "^2.2.0",
  "react-hook-form": "^7.50.0",
  "zod": "^3.22.0",
  "clsx": "^2.1.0",
  "tailwind-merge": "^2.2.0"
}

// backend/package.json (selected dependencies)
{
  "@strapi/strapi": "^4.20.0",
  "@strapi/plugin-users-permissions": "^4.20.0",
  "socket.io": "^4.7.0",
  "better-sqlite3": "^9.0.0",   // dev
  "pg": "^8.11.0"                // prod
}
```

---

## 6. Architecture Decision Log

| Decision | Option Chosen | Alternatives Considered | Rationale |
|----------|---------------|------------------------|-----------|
| Frontend framework | Next.js 14 | Remix, Vite + React | Assignment requirement; App Router suits SSR + client split |
| Backend / API | Strapi 4 | Express, NestJS, Fastify | Assignment requirement; built-in auth and CMS reduce boilerplate |
| Real-time | Socket.io 4 | native WebSocket, Ably | Assignment requirement; mature ecosystem, room support built-in |
| Styling | Tailwind CSS | CSS Modules, Styled Components | Rapid prototyping, consistent tokens, widely used |
| Global state | Zustand | Redux Toolkit, Jotai | Minimal API, no reducers needed for simple session state |
| DB (dev) | SQLite | In-memory, MongoDB | Zero-config, Strapi default; easy to swap for prod |
| DB (prod) | PostgreSQL | MySQL, PlanetScale | ACID guarantees, Strapi first-class support, cloud availability |
| Package manager | pnpm | npm, yarn | Faster installs, strict dependency resolution, disk efficiency |

---

## 7. Local Development Setup

```bash
# Prerequisites: Node.js >= 20, pnpm >= 8

# 1. Clone the repository
git clone <repo-url> && cd chat-app

# 2. Install all dependencies (root workspace)
pnpm install

# 3. Configure environment variables
cp frontend/.env.example frontend/.env.local
cp backend/.env.example backend/.env
# Edit both files with your local values

# 4. Start both servers concurrently
pnpm dev
# Next.js → http://localhost:3000
# Strapi   → http://localhost:1337
# Strapi admin → http://localhost:1337/admin

# 5. (First run) Create Strapi admin user via the admin UI
# 6. (First run) Set permissions in Strapi admin:
#    Settings → Roles → Authenticated → enable find/create on Message
```
