# Conventions
## Real-Time Chat Application

**Version:** 1.0.0
**Last Updated:** April 2026

---

## 1. Repository Structure

```
chat-app/
├── frontend/                   # Next.js application
│   ├── public/
│   ├── src/
│   │   ├── app/                # App Router pages (Next.js 14+)
│   │   │   ├── (auth)/
│   │   │   │   ├── login/
│   │   │   │   └── register/
│   │   │   ├── lobby/
│   │   │   └── room/
│   │   │       └── [name]/
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   ├── chat/
│   │   │   └── ui/
│   │   ├── hooks/              # Custom React hooks
│   │   ├── lib/                # Utility functions, API client
│   │   ├── store/              # Global state (Zustand/Context)
│   │   └── types/              # Shared TypeScript types
│   ├── .env.local
│   └── package.json
│
├── backend/                    # Strapi project
│   ├── config/
│   ├── src/
│   │   ├── api/
│   │   │   └── message/
│   │   │       ├── content-types/
│   │   │       ├── controllers/
│   │   │       ├── routes/
│   │   │       └── services/
│   │   ├── extensions/
│   │   └── socket/             # Custom Socket.io server code
│   ├── .env
│   └── package.json
│
└── docs/                       # Project documentation
    ├── PRD.md
    ├── Conventions.md
    └── Techstack.md
```

---

## 2. Naming Conventions

### 2.1 Files & Folders

| Artifact | Convention | Example |
|----------|------------|---------|
| React components | PascalCase | `MessageList.tsx` |
| Hooks | camelCase, `use` prefix | `useSocket.ts` |
| Utility / lib files | camelCase | `apiClient.ts` |
| Pages (App Router) | lowercase kebab-case folder | `room/[name]/page.tsx` |
| Strapi controllers | camelCase | `message.ts` |
| Strapi content-types | kebab-case | `message/` |
| CSS modules | PascalCase matching component | `MessageList.module.css` |
| Environment files | `.env.local` (Next.js), `.env` (Strapi) | — |

### 2.2 Variables & Functions

- **Variables & function names:** `camelCase`
- **Constants:** `UPPER_SNAKE_CASE` (e.g., `MAX_MESSAGE_LENGTH`)
- **TypeScript interfaces:** `PascalCase`, no `I` prefix (e.g., `ChatMessage`, not `IChatMessage`)
- **TypeScript types:** `PascalCase`
- **Enums:** `PascalCase` name, `UPPER_SNAKE_CASE` members

### 2.3 Socket.io Events

All event names use `kebab-case`:

```
join-room | leave-room | send-message | new-message | user-list | error
```

### 2.4 API Routes (Strapi REST)

Follow Strapi's default pluralized convention:

```
/api/messages
/api/auth/local
/api/auth/local/register
```

---

## 3. TypeScript

- Strict mode must be enabled (`"strict": true` in `tsconfig.json`).
- Avoid `any`; use `unknown` with type guards when necessary.
- All component props must have an explicit interface or type alias.
- API response shapes must be typed; do not destructure untyped responses.

```typescript
// ✅ Good
interface ChatMessage {
  id: string;
  text: string;
  sender: { username: string };
  createdAt: string;
}

// ❌ Bad
const handleMessage = (msg: any) => { ... }
```

---

## 4. React & Next.js

### 4.1 Component Rules

- Prefer **functional components** with hooks; no class components.
- One component per file; export as a named export and a default export.
- Keep components under ~150 lines; extract sub-components when they grow beyond this.
- Side effects belong in custom hooks (`hooks/`), not inline in components.

### 4.2 Data Fetching

- Server Components handle initial data fetching (chat history, user verification).
- Client Components (`"use client"`) handle interactive UI and Socket.io integration.
- Use Next.js `fetch` with `cache: 'no-store'` for real-time-sensitive requests.

### 4.3 State Management

- Local UI state → `useState` / `useReducer`.
- Cross-component shared state (auth, socket connection) → Zustand store or React Context.
- Server state (message history) → fetched via Server Components or SWR.

### 4.4 Routing

- Use the **App Router** (`src/app/`) exclusively.
- Protected routes are guarded by middleware (`middleware.ts` at project root).
- Dynamic room routes use `[name]` segment.

---

## 5. Styling

- **Framework:** Tailwind CSS.
- Utility classes are preferred over custom CSS; keep custom CSS to a minimum.
- Component-specific overrides go in `*.module.css` files co-located with the component.
- No inline `style` props except for dynamic values (e.g., scroll position).
- Color palette, spacing, and typography tokens are defined in `tailwind.config.ts`.

---

## 6. Backend (Strapi)

- Use Strapi's built-in user auth plugin for registration and JWT issuance; do not roll a custom auth system.
- Custom business logic goes in **services**, not controllers.
- Strapi lifecycle hooks (`afterCreate`) are used to emit Socket.io events after a message is persisted.
- All non-public endpoints must have the **Authenticated** permission in the Strapi admin.
- Sensitive configuration (DB credentials, JWT secret) lives in `.env`; never committed to version control.

---

## 7. Socket.io

- The Socket.io server is initialized in a **custom Strapi server file** (`src/index.ts` bootstrap).
- Socket connections must authenticate on the `connection` handshake using the JWT from the client.
- Each chat room maps to a Socket.io **room** (`socket.join(roomName)`).
- Emitting to a room uses `io.to(roomName).emit(...)`, never `io.emit(...)` globally.
- Active user lists are maintained in an in-memory `Map<roomName, Set<username>>` on the server.

---

## 8. Environment Variables

### Frontend (`frontend/.env.local`)

```
NEXT_PUBLIC_API_URL=http://localhost:1337
NEXT_PUBLIC_SOCKET_URL=http://localhost:1337
```

### Backend (`backend/.env`)

```
HOST=0.0.0.0
PORT=1337
APP_KEYS=<generated>
API_TOKEN_SALT=<generated>
ADMIN_JWT_SECRET=<generated>
JWT_SECRET=<generated>
DATABASE_CLIENT=sqlite          # or postgres
DATABASE_URL=                   # used for postgres
```

> **Rule:** Never commit `.env` or `.env.local` files. Both are listed in `.gitignore`.

---

## 9. Git Workflow

### 9.1 Branch Naming

```
feature/<short-description>     # e.g., feature/auth-registration
fix/<short-description>         # e.g., fix/socket-reconnect
chore/<short-description>       # e.g., chore/update-dependencies
docs/<short-description>        # e.g., docs/api-reference
```

### 9.2 Commit Messages

Follow **Conventional Commits**:

```
<type>(scope): <short imperative description>

feat(auth): add JWT refresh token support
fix(chat): prevent duplicate message emission on reconnect
chore(deps): update socket.io to v4.7
docs(readme): add setup instructions
```

**Types:** `feat` | `fix` | `chore` | `docs` | `test` | `refactor` | `style`

### 9.3 Pull Requests

- All changes go through PRs; direct pushes to `main` are not allowed.
- PRs require at least one approval before merging.
- PR title must follow the Conventional Commits format.
- Link the related issue/story in the PR description.

---

## 10. Error Handling

- API errors from Strapi are caught in the API client (`lib/apiClient.ts`) and re-thrown as typed `AppError` objects.
- React components display user-friendly error messages; raw error strings from the server are never shown to end users.
- Socket errors are handled in the `useSocket` hook and surfaced via a toast/notification component.
- Unhandled promise rejections must not be silently swallowed; always log or propagate.

---

## 11. Code Quality

- **Linter:** ESLint with `eslint-config-next` and `@typescript-eslint`.
- **Formatter:** Prettier (configured in `.prettierrc`).
- **Pre-commit hooks:** Husky + lint-staged runs ESLint and Prettier on staged files.
- **No `console.log` in production code;** use a logger utility that respects `NODE_ENV`.

---

## 12. Testing (Baseline)

| Layer | Tool | Coverage Target |
|-------|------|-----------------|
| Unit (utils, hooks) | Jest + React Testing Library | ≥ 70% |
| Integration (API routes) | Jest + Supertest | Key auth & message endpoints |
| E2E | Playwright | Happy-path chat flow |

Tests live alongside their source files: `MessageList.test.tsx` next to `MessageList.tsx`.
