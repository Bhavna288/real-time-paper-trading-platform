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

module.exports = {
  getAllStocks,
  getStockBySymbol,
  getOrderbookBySymbol,
};
