const { prisma } = require('../config/database');

async function getAlerts(userId) {
  const alerts = await prisma.priceAlert.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
  return alerts.map((a) => ({
    id: a.id,
    symbol: a.symbol,
    direction: a.direction,
    targetPrice: Number(a.targetPrice),
    createdAt: a.createdAt,
    triggeredAt: a.triggeredAt,
  }));
}

async function createAlert(userId, symbol, direction, targetPrice) {
  const sym = symbol.toUpperCase().trim();
  const dir = direction.toUpperCase();
  if (dir !== 'ABOVE' && dir !== 'BELOW') throw new Error('Direction must be ABOVE or BELOW');
  const price = Number(targetPrice);
  if (!Number.isFinite(price) || price <= 0) throw new Error('Target price must be a positive number');

  const stock = await prisma.stock.findUnique({ where: { symbol: sym } });
  if (!stock) throw new Error('Stock not found');

  const alert = await prisma.priceAlert.create({
    data: { userId, symbol: sym, direction: dir, targetPrice: price },
  });
  return {
    id: alert.id,
    symbol: alert.symbol,
    direction: alert.direction,
    targetPrice: Number(alert.targetPrice),
    createdAt: alert.createdAt,
    triggeredAt: alert.triggeredAt,
  };
}

async function deleteAlert(userId, alertId) {
  await prisma.priceAlert.deleteMany({
    where: { id: alertId, userId },
  });
  return { deleted: alertId };
}

async function getAndMarkTriggeredAlerts(symbol, currentPrice) {
  const sym = symbol.toUpperCase();
  const price = Number(currentPrice);

  const alerts = await prisma.priceAlert.findMany({
    where: {
      symbol: sym,
      triggeredAt: null,
      OR: [
        { direction: 'ABOVE', targetPrice: { lte: price } },
        { direction: 'BELOW', targetPrice: { gte: price } },
      ],
    },
  });

  if (alerts.length === 0) return [];

  const now = new Date();
  const payloads = [];
  for (const a of alerts) {
    await prisma.priceAlert.update({
      where: { id: a.id },
      data: { triggeredAt: now },
    });
    payloads.push({
      id: a.id,
      userId: a.userId,
      symbol: a.symbol,
      direction: a.direction,
      targetPrice: Number(a.targetPrice),
      currentPrice: price,
    });
  }
  return payloads;
}

module.exports = {
  getAlerts,
  createAlert,
  deleteAlert,
  getAndMarkTriggeredAlerts,
};
