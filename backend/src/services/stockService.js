const { prisma } = require('../config/database');

async function getAllStocks() {
  const stocks = await prisma.stock.findMany({
    orderBy: { symbol: 'asc' },
  });
  return stocks.map((s) => ({
    id: s.id,
    symbol: s.symbol,
    name: s.name,
    currentPrice: Number(s.currentPrice),
  }));
}

async function getStockBySymbol(symbol) {
  const stock = await prisma.stock.findUnique({
    where: { symbol: symbol.toUpperCase() },
  });
  if (!stock) return null;
  return {
    id: stock.id,
    symbol: stock.symbol,
    name: stock.name,
    currentPrice: Number(stock.currentPrice),
  };
}

function getOrderbook(stock) {
  const price = Number(stock.currentPrice);
  const spread = price * 0.002;
  const bids = [];
  const asks = [];
  for (let i = 5; i >= 1; i--) {
    bids.push({ price: Math.round((price - spread * i) * 100) / 100, quantity: 100 * i });
  }
  for (let i = 1; i <= 5; i++) {
    asks.push({ price: Math.round((price + spread * i) * 100) / 100, quantity: 100 * i });
  }
  return { symbol: stock.symbol, bids, asks };
}

async function getOrderbookBySymbol(symbol) {
  const stock = await prisma.stock.findUnique({
    where: { symbol: symbol.toUpperCase() },
  });
  if (!stock) return null;
  return getOrderbook(stock);
}

const RANGE_DAYS = { '1d': 1, '1w': 7, '3m': 90, '1y': 365 };
const MAX_POINTS = 500;

async function getPriceHistory(symbol, range) {
  const stock = await prisma.stock.findUnique({
    where: { symbol: symbol.toUpperCase() },
  });
  if (!stock) return null;

  const days = RANGE_DAYS[range] ?? 7;
  const from = new Date();
  from.setDate(from.getDate() - days);

  if (range === '1y') {
    const fromDate = new Date(from);
    fromDate.setUTCHours(0, 0, 0, 0);
    const rows = await prisma.stockPriceDaily.findMany({
      where: { stockId: stock.id, date: { gte: fromDate } },
      orderBy: { date: 'asc' },
    });
    let points = rows.map((r) => ({ time: r.date.getTime(), price: Number(r.price) }));
    if (points.length > MAX_POINTS) {
      const step = Math.ceil(points.length / MAX_POINTS);
      points = points.filter((_, i) => i % step === 0);
    }
    return points;
  }

  const rows = await prisma.stockPrice.findMany({
    where: { stockId: stock.id, timestamp: { gte: from } },
    orderBy: { timestamp: 'asc' },
  });

  let points = rows.map((r) => ({ time: r.timestamp.getTime(), price: Number(r.price) }));
  if (points.length > MAX_POINTS) {
    const step = Math.ceil(points.length / MAX_POINTS);
    points = points.filter((_, i) => i % step === 0);
  }
  return points;
}

module.exports = {
  getAllStocks,
  getStockBySymbol,
  getOrderbookBySymbol,
  getPriceHistory,
};
