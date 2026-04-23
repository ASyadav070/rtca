# Technical Documentation

## 🏗️ System Overview

The application follows a standard Client-Server architecture with a real-time event layer.

### Frontend (Next.js)
- **Framework**: Next.js 14 with App Router.
- **State Management**: Zustand for global authentication state (`useAuthStore`).
- **Real-time Hook**: `useSocket` custom hook manages the connection life-cycle, event listeners, and local message state.
- **Styling**: Tailwind CSS with custom Neo-Brutalist utility configurations.
- **API Communication**: Custom `apiClient` fetch wrapper with automated JWT injection.

### Backend (Strapi)
- **Framework**: Strapi 4 (Headless CMS).
- **Database**: SQLite (Development) / PostgreSQL (Optional Production).
- **Socket Integration**: Socket.io server initialized within the `bootstrap` lifecycle (`src/index.ts`).
- **Persistence**: Handled via `strapi.entityService` during the `send-message` socket event.
- **Permissions**: Programmatically assigned during bootstrap to ensure `api::message.message` is accessible to authenticated users.

---

## 📡 Socket Event Lifecycle

| Event | Direction | Payload | Description |
| :--- | :--- | :--- | :--- |
| `join-room` | Client → Server | `{ room, username }` | Joins a socket room and updates the presence map. |
| `leave-room` | Client → Server | `{ room, username }` | Leaves a room and broadcasts the updated user list. |
| `send-message` | Client → Server | `{ room, username, text }` | Persists message to DB and broadcasts to the room. |
| `new-message` | Server → Client | `Message` object | Broadcasted to all participants in a room. |
| `user-list` | Server → Client | `string[]` | Broadcasted whenever the room presence changes. |

---

## 🔐 Security & Legibility

- **JWT Auth**: All REST and Socket communications are protected.
- **Theme Stability**: Explicit `text-black` and CSS variable overrides in `globals.css` prevent browser dark-mode "force-inversion" from breaking contrast.
- **Sanitization**: Room names are URI-encoded during navigation to prevent injection.
