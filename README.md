# Real-Time Paper Trading Platform

A full-stack simulated paper trading platform. View live simulated stock prices, place market/limit/stop orders, track portfolio and holdings, maintain a watchlist with live prices, set price alerts, and view order and trade history.

**Tech stack:** React (Vite), Node.js + Express, PostgreSQL + Prisma, Socket.io (real-time), Recharts, Tailwind CSS.

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
npm run dev
```

Server runs at **http://localhost:3001**. Use `npm run dev` for development (nodemon); use `npm start` for production.

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

- **Dashboard** – Portfolio summary (total value, unrealized P&amp;L), watchlist preview, recent trades, and full market table with live prices
- **Stock detail** – Live price, price chart (Live / 1D / 1W / 3M / 1Y), order form, order book, and recent trades for that symbol
- **Orders** – **Market** (immediate fill), **Limit** (fill when price reaches your limit), **Stop** (trigger a market order when price hits your stop; e.g. stop loss = Sell + Stop). Pending limit/stop orders are checked every simulation step and fill when conditions are met
- **Order history** – List of all orders with kind (Market/Limit/Stop), status (PENDING/FILLED), and trigger/execution price
- **Portfolio** – Cash balance, holdings value, total portfolio value, unrealized P&amp;L, holdings table with live prices
- **Watchlist** – Add/remove symbols with live prices; dashboard shows a preview
- **Trade history** – List of filled trades
- **Price alerts** – Notify when a stock goes above or below a target price; alerts trigger once and show a toast
- **Real-time** – Live prices via WebSockets; toasts for order fills and price alerts

---

## Real-time (WebSockets)

- **Market simulation** – Every 5 seconds the backend updates each stock’s price by a small random amount (±0.5%). Prices are stored; raw ticks are kept for 90 days. A **condensing job** runs on startup and every 6 hours, aggregating raw prices into daily rows so the 1Y chart can show up to a year of history.
- **Limit/stop orders** – Pending limit and stop orders are evaluated after each price update. When the price crosses the limit or stop level and the user has sufficient balance/holdings, the order fills and a trade is created.
- **Socket.io** – The server emits:
  - **`price_update`** – After each simulation step (array of `{ symbol, currentPrice }`).
  - **`trade_update`** – When an order is filled (market or triggered limit/stop).
  - **`price_alert`** – When a price alert condition is met (e.g. stock reached target).
- The frontend connects to the same origin in dev; Vite proxies `/api` and `/socket.io` to the backend.
