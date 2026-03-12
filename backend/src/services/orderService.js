const { prisma } = require('../config/database');

async function placeOrder(userId, symbol, type, quantity) {
  const stock = await prisma.stock.findUnique({ where: { symbol: symbol.toUpperCase() } });
  if (!stock) throw new Error('Stock not found');
  const price = Number(stock.currentPrice);
  const cost = price * quantity;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('User not found');

  if (type === 'BUY') {
    const cash = Number(user.cashBalance);
    if (cash < cost) throw new Error('Insufficient balance');
  } else if (type === 'SELL') {
    const holding = await prisma.holding.findUnique({
      where: { userId_stockId: { userId, stockId: stock.id } },
    });
    if (!holding || holding.quantity < quantity) throw new Error('Insufficient holdings');
  } else {
    throw new Error('Invalid order type');
  }

  return prisma.$transaction(async (tx) => {
    const order = await tx.order.create({
      data: {
        userId,
        stockId: stock.id,
        type,
        quantity,
        price,
        status: 'FILLED',
      },
    });

    await tx.trade.create({
      data: {
        userId,
        orderId: order.id,
        stockId: stock.id,
        quantity,
        price,
        side: type,
      },
    });

    if (type === 'BUY') {
      await tx.user.update({
        where: { id: userId },
        data: { cashBalance: { decrement: cost } },
      });
      const existing = await tx.holding.findUnique({
        where: { userId_stockId: { userId, stockId: stock.id } },
      });
      if (existing) {
        const newQty = existing.quantity + quantity;
        const newAvg = (Number(existing.averagePrice) * existing.quantity + cost) / newQty;
        await tx.holding.update({
          where: { id: existing.id },
          data: { quantity: newQty, averagePrice: newAvg },
        });
      } else {
        await tx.holding.create({
          data: {
            userId,
            stockId: stock.id,
            quantity,
            averagePrice: price,
          },
        });
      }
    } else {
      const holding = await tx.holding.findUnique({
        where: { userId_stockId: { userId, stockId: stock.id } },
      });
      await tx.user.update({
        where: { id: userId },
        data: { cashBalance: { increment: cost } },
      });
      if (holding.quantity === quantity) {
        await tx.holding.delete({ where: { id: holding.id } });
      } else {
        await tx.holding.update({
          where: { id: holding.id },
          data: { quantity: { decrement: quantity } },
        });
      }
    }

    return { order, price };
  });
}

module.exports = { placeOrder };
