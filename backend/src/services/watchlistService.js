const { prisma } = require('../config/database');

async function getWatchlist(userId) {
  const items = await prisma.watchlistItem.findMany({
    where: { userId },
    orderBy: { createdAt: 'asc' },
  });
  return items.map((item) => ({ symbol: item.symbol, id: item.id }));
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
