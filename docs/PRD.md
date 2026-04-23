# Product Requirements Document (PRD)
## Real-Time Chat Application

**Version:** 1.0.0
**Last Updated:** April 2026
**Status:** Draft

---

## 1. Overview

### 1.1 Product Summary
A real-time chat application that allows users to register, log in, join named chat rooms, and exchange messages instantly with other active participants. The application is built on Next.js (frontend), Strapi (backend/CMS), and Socket.io (real-time communication layer).

### 1.2 Goals
- Provide a seamless real-time messaging experience within named chat rooms.
- Implement secure user authentication (username/password).
- Display a live list of active users within each room.
- Persist chat history for future reference.

### 1.3 Non-Goals (v1.0)
- Native mobile applications (iOS/Android).
- File/image sharing within chat.
- Direct (private) messaging between users.
- Message editing or deletion.

---

## 2. User Stories

| ID | As a… | I want to… | So that… |
|----|-------|------------|----------|
| US-01 | New user | Register with a username and password | I can access the application |
| US-02 | Returning user | Log in with my credentials | I can resume chatting |
| US-03 | Authenticated user | Join a chat room by name | I can participate in a specific conversation |
| US-04 | Room participant | Send a message in real time | Other users see it instantly |
| US-05 | Room participant | Receive messages from others in real time | I stay up to date without refreshing |
| US-06 | Room participant | See a list of currently active users | I know who is present in the room |
| US-07 | Authenticated user | View chat history on room entry | I have context from previous messages |
| US-08 | Any user | Receive clear error feedback | I understand what went wrong and how to fix it |

---

## 3. Functional Requirements

### 3.1 Authentication

- **FR-AUTH-01:** Users must be able to register with a unique username and a password.
- **FR-AUTH-02:** Passwords must be stored hashed; plain-text storage is not permitted.
- **FR-AUTH-03:** Users must be able to log in using their registered credentials.
- **FR-AUTH-04:** Authenticated sessions must be maintained via JWT tokens.
- **FR-AUTH-05:** Unauthenticated users must be redirected to the login page when accessing protected routes.

### 3.2 Chat Rooms

- **FR-ROOM-01:** Authenticated users can join a chat room by entering a room name.
- **FR-ROOM-02:** If a room with the given name does not exist, it is created automatically.
- **FR-ROOM-03:** A user can only be active in one room at a time per session.
- **FR-ROOM-04:** Leaving a room (navigating away or disconnecting) removes the user from the active users list.

### 3.3 Messaging

- **FR-MSG-01:** Users can compose and send text messages within their active room.
- **FR-MSG-02:** Messages are broadcast in real time to all users currently in the same room.
- **FR-MSG-03:** Each message displays the sender's username and a timestamp.
- **FR-MSG-04:** New messages are stored in the Strapi database via the Messages Content-Type.
- **FR-MSG-05:** On joining a room, users are presented with recent chat history (last 50 messages).

### 3.4 Active Users

- **FR-USERS-01:** The chat room interface displays a list of users currently connected to that room.
- **FR-USERS-02:** The list updates in real time when a user joins or leaves.

### 3.5 Error Handling & Feedback

- **FR-ERR-01:** Invalid login credentials surface a user-friendly error message.
- **FR-ERR-02:** Duplicate username registration surfaces a descriptive error.
- **FR-ERR-03:** Network disconnection is detected and a reconnecting indicator is shown.
- **FR-ERR-04:** Empty message submissions are ignored (no-op on the client side).

---

## 4. Non-Functional Requirements

| Category | Requirement |
|----------|-------------|
| **Performance** | Messages must appear within 200 ms under normal network conditions |
| **Scalability** | Architecture should support horizontal scaling of the Socket.io server via Redis adapter (future) |
| **Security** | All API endpoints must validate JWT; Socket connections must authenticate on handshake |
| **Accessibility** | Chat interface must meet WCAG 2.1 AA contrast and keyboard-navigation requirements |
| **Browser Support** | Latest two versions of Chrome, Firefox, Safari, and Edge |

---

## 5. System Architecture (High-Level)

```
┌──────────────────────────────────────────────────────────────┐
│                        Browser (Next.js)                     │
│  ┌─────────────┐   ┌──────────────────┐   ┌───────────────┐ │
│  │  Auth Pages │   │  Chat Room Page  │   │  Components   │ │
│  └──────┬──────┘   └────────┬─────────┘   └───────────────┘ │
│         │ REST               │ Socket.io                      │
└─────────┼───────────────────┼────────────────────────────────┘
          │                   │
┌─────────▼───────────────────▼────────────────────────────────┐
│                   Node.js / Strapi Backend                    │
│  ┌──────────────────┐   ┌──────────────────────────────────┐ │
│  │  REST API        │   │  Socket.io Server                │ │
│  │  /auth/register  │   │  Events: join-room, new-message  │ │
│  │  /auth/login     │   │          user-list-update        │ │
│  │  /messages       │   └──────────────────────────────────┘ │
│  └─────────┬────────┘            │ Strapi Webhook             │
│            │                     │                            │
│  ┌─────────▼─────────────────────▼──────────────────────────┐│
│  │               PostgreSQL / SQLite Database               ││
│  └──────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────┘
```

---

## 6. User Interface Requirements

### 6.1 Pages & Routes

| Route | Description | Auth Required |
|-------|-------------|---------------|
| `/` | Redirects to `/login` or `/lobby` | — |
| `/login` | Login form | No |
| `/register` | Registration form | No |
| `/lobby` | Room name entry | Yes |
| `/room/[name]` | Chat room interface | Yes |

### 6.2 Chat Room Interface Components

- **MessageList** — scrollable feed of messages, auto-scrolls to latest.
- **MessageInput** — text input + Send button; disabled when disconnected.
- **ActiveUsersList** — sidebar panel listing connected usernames.
- **RoomHeader** — displays room name and connection status indicator.

---

## 7. API Endpoints (Strapi)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/auth/local/register` | Register new user | None |
| `POST` | `/api/auth/local` | Login | None |
| `GET` | `/api/messages?filters[room][$eq]=:name&sort=createdAt:asc&pagination[limit]=50` | Fetch room history | JWT |
| `POST` | `/api/messages` | Create message (triggers webhook) | JWT |

### 7.1 Message Content-Type Schema

| Field | Type | Notes |
|-------|------|-------|
| `text` | Text | Required, max 2000 chars |
| `room` | String | Required, room name |
| `sender` | Relation → User | Required |
| `createdAt` | DateTime | Auto-managed by Strapi |

---

## 8. Socket.io Events

| Event | Direction | Payload | Description |
|-------|-----------|---------|-------------|
| `join-room` | Client → Server | `{ room, username }` | User joins a room |
| `leave-room` | Client → Server | `{ room, username }` | User leaves a room |
| `send-message` | Client → Server | `{ room, text }` | User sends a message |
| `new-message` | Server → Client | `{ id, text, sender, createdAt }` | Broadcast new message |
| `user-list` | Server → Client | `{ users: string[] }` | Updated active user list |
| `error` | Server → Client | `{ message }` | Server-side error |

---

## 9. Milestones

| Milestone | Deliverable | Target |
|-----------|-------------|--------|
| M1 | Project scaffolding (Next.js + Strapi) | Week 1 |
| M2 | Auth (register, login, JWT) | Week 1 |
| M3 | Strapi Message Content-Type + REST endpoints | Week 2 |
| M4 | Socket.io server integration + basic events | Week 2 |
| M5 | Next.js chat room UI + Socket.io client | Week 3 |
| M6 | Active users list + chat history on load | Week 3 |
| M7 | Error handling, styling, QA | Week 4 |
| M8 | Documentation + final review | Week 4 |

---

## 10. Out of Scope

- Push notifications
- Message reactions / threading
- Video or voice chat
- Admin dashboard
- Rate limiting (deferred to v1.1)
