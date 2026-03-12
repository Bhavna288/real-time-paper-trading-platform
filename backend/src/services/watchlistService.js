const { prisma } = require('../config/database');

async function getWatchlist(userId) {
  const items = await prisma.watchlistItem.findMany({
    where: { userId },
    orderBy: { createdAt: 'asc' },
  });
  if (items.length === 0) return [];
  const stocks = await prisma.stock.findMany({
    where: { symbol: { in: items.map((i) => i.symbol) } },
  });
  const priceBySymbol = Object.fromEntries(stocks.map((s) => [s.symbol, Number(s.currentPrice)]));
  return items.map((item) => ({
    id: item.id,
    symbol: item.symbol,
    currentPrice: priceBySymbol[item.symbol] ?? null,
  }));
}

async function addToWatchlist(userId, symbol) {
  const sym = symbol.toUpperCase().trim();
  const stock = await prisma.stock.findUnique({ where: { symbol: sym } });
  if (!stock) throw new Error('Stock not found');
  const item = await prisma.watchlistItem.upsert({
    where: { userId_symbol: { userId, symbol: sym } },
    create: { userId, symbol: sym },
    update: {},
  });
  return { symbol: item.symbol, id: item.id };
}

async function removeFromWatchlist(userId, symbol) {
  const sym = symbol.toUpperCase().trim();
  await prisma.watchlistItem.deleteMany({
    where: { userId, symbol: sym },
  });
  return { removed: sym };
}

module.exports = {
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
};
