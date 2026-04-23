# RTC App | Real-Time Chat Monorepo

A high-fidelity, real-time chat application built with **Next.js 14**, **Strapi 4**, and **Socket.io**. Featuring a premium Neo-Brutalist design, persistent chat history, and real-time presence tracking.

## 🚀 Quick Start

### 1. Prerequisites
- Node.js >= 18.x
- pnpm >= 8.x

### 2. Installation
```bash
pnpm install
```

### 3. Running the Project
```bash
pnpm dev
```
- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend (Strapi)**: [http://localhost:1337](http://localhost:1337)

---

## ✨ Key Features

- **Real-Time Messaging**: Instant communication powered by Socket.io.
- **Chat Persistence**: Full history retrieval from Strapi on room entry.
- **Presence Tracking**: Real-time sidebar showing active participants in each room.
- **Neo-Brutalist UI**: Premium, high-contrast design with tactile shadows and smooth animations.
- **Auth System**: Secure registration and login with JWT stored in cookies.
- **Responsive Design**: Optimized for desktop and mobile, including a togglable user list.

---

## 🛠️ Architecture

The project is structured as a pnpm monorepo:

- `/frontend`: Next.js 14 (App Router) using Tailwind CSS and Zustand.
- `/backend`: Strapi 4 with a custom Socket.io integration embedded in the bootstrap lifecycle.

For more technical details, see [TECHNICAL.md](./TECHNICAL.md).

---

## 📖 Evaluation Deliverables

- **Next.js App**: Located in `/frontend`. Implements App Router, Server/Client components, and protected routes.
- **Strapi Project**: Located in `/backend`. Includes the `Message` content-type and custom socket logic.
- **Documentation**: Comprehensive guides in `README.md` and `TECHNICAL.md`.
