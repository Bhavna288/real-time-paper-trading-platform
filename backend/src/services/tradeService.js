const { prisma } = require('../config/database');

async function getTradesByUser(userId) {
  const trades = await prisma.trade.findMany({
    where: { userId },
    include: { stock: true },
    orderBy: { createdAt: 'desc' },
  });
  return trades.map((t) => ({
    id: t.id,
    symbol: t.stock.symbol,
    quantity: t.quantity,
    price: Number(t.price),
    side: t.side,
    createdAt: t.createdAt,
  }));
}

async function getTradesByStock(symbol) {
  const stock = await prisma.stock.findUnique({
    where: { symbol: symbol.toUpperCase() },
  });
  if (!stock) return null;

  const trades = await prisma.trade.findMany({
    where: { stockId: stock.id },
    orderBy: { createdAt: 'desc' },
  });
  return trades.map((t) => ({
    id: t.id,
    symbol: stock.symbol,
    quantity: t.quantity,
    price: Number(t.price),
    side: t.side,
    createdAt: t.createdAt,
  }));
}

module.exports = { getTradesByUser, getTradesByStock };
