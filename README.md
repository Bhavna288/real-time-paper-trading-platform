# Real-Time Paper Trading Platform

A full-stack simulated paper trading platform. Users can view live simulated stock prices, place buy/sell orders, track portfolio and holdings, maintain a watchlist, and view trade history.

**Tech stack:** React (frontend), Node.js + Express (backend), PostgreSQL + Prisma, Socket.io (real-time), Recharts, Tailwind CSS.

---

## Prerequisites

- **Node.js** (v18+)
- **PostgreSQL** (local or cloud)
- **npm**

---

## Setup

### 1. Clone and install dependencies

```bash
# Backend
cd backend
npm install

# Frontend (from project root)
cd frontend
npm install
```

### 2. Database

Create a PostgreSQL database (e.g. `paper_trading`). With PostgreSQL on your PATH:

```bash
createdb paper_trading
```

If `createdb` is not found, use the full path to the Postgres bin (e.g. `$(brew --prefix postgresql@16)/bin/createdb paper_trading`) or create the database via your DB tool.

### 3. Backend environment

```bash
cd backend
cp .env.example .env
```

Edit `.env` and set:

- **DATABASE_URL** – Your Postgres connection string, e.g.  
  `postgresql://YOUR_USERNAME@localhost:5432/paper_trading`
- **PORT** – Optional; defaults to `3001`

### 4. Apply schema and seed data

```bash
cd backend
npx prisma generate
npx prisma db push
npm run db:seed
```

You should see: `Seeded demo user: demo-user-id` and `Seeded 5 stocks: AAPL, MSFT, NVDA, TSLA, AMZN`.

### 5. Run the app

**Terminal 1 – Backend**

```bash
cd backend
npm start
```

Server runs at **http://localhost:3001**. Check: `curl http://localhost:3001/api/health`

**Terminal 2 – Frontend**

```bash
cd frontend
npm run dev
```

Frontend runs at **http://localhost:5173**. The Vite proxy forwards `/api` and `/socket.io` to the backend.

---

## Project structure

- **backend/** – Express API, Prisma, services, controllers, routes
- **frontend/** – React app (Vite), pages, components, API helpers
- **backend/prisma/** – Schema and seed script

---

## Demo user

The app uses a single seeded demo user:

- **ID:** `demo-user-id`
- **Starting cash:** $100,000
- No login; all actions use this user.

---

## Features

- **Dashboard** – List of stocks (symbol, name, price) with links to detail
- **Stock detail** – Price and order form (buy/sell)
- **Portfolio** – Cash balance, holdings value, total portfolio value, unrealized P&amp;L, holdings table
- **Watchlist** – Add/remove symbols (AAPL, MSFT, NVDA, TSLA, AMZN)
- **Orders** – Place buy/sell orders at current simulated price; portfolio and holdings update

Real-time price updates and trade notifications (WebSockets) can be added in a later version.
