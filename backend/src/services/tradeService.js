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

module.exports = { getTradesByUser };
