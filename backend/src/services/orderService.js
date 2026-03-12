const { prisma } = require('../config/database');

async function placeOrder(userId, symbol, type, quantity, orderKind = 'MARKET', limitPrice, stopPrice) {
  const stock = await prisma.stock.findUnique({ where: { symbol: symbol.toUpperCase() } });
  if (!stock) throw new Error('Stock not found');
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('User not found');

  const upperType = type.toUpperCase();
  if (upperType !== 'BUY' && upperType !== 'SELL') throw new Error('Invalid order type');
  const kind = String(orderKind || 'MARKET').toUpperCase();
  if (!['MARKET', 'LIMIT', 'STOP'].includes(kind)) throw new Error('Order kind must be MARKET, LIMIT, or STOP');

  if (kind === 'MARKET') {
    const price = Number(stock.currentPrice);
    const cost = price * quantity;
    if (upperType === 'BUY') {
      if (Number(user.cashBalance) < cost) throw new Error('Insufficient balance');
    } else {
      const holding = await prisma.holding.findUnique({
        where: { userId_stockId: { userId, stockId: stock.id } },
      });
      if (!holding || holding.quantity < quantity) throw new Error('Insufficient holdings');
    }
    return executeMarketOrder(userId, stock, upperType, quantity, price);
  }

  if (kind === 'LIMIT') {
    const lp = Number(limitPrice);
    if (!Number.isFinite(lp) || lp <= 0) throw new Error('Limit price must be a positive number');
    const order = await prisma.order.create({
      data: {
        userId,
        stockId: stock.id,
        type: upperType,
        quantity,
        orderKind: 'LIMIT',
        price: 0,
        limitPrice: lp,
        status: 'PENDING',
        filledAt: null,
      },
    });
    return { order, price: null, pending: true };
  }

  if (kind === 'STOP') {
    const sp = Number(stopPrice);
    if (!Number.isFinite(sp) || sp <= 0) throw new Error('Stop price must be a positive number');
    const order = await prisma.order.create({
      data: {
        userId,
        stockId: stock.id,
        type: upperType,
        quantity,
        orderKind: 'STOP',
        price: 0,
        stopPrice: sp,
        status: 'PENDING',
        filledAt: null,
      },
    });
    return { order, price: null, pending: true };
  }

  throw new Error('Invalid order kind');
}

async function executeMarketOrder(userId, stock, type, quantity, price) {
  const cost = price * quantity;
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.create({
      data: {
        userId,
        stockId: stock.id,
        type,
        quantity,
        orderKind: 'MARKET',
        price,
        status: 'FILLED',
        filledAt: new Date(),
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

    return { order, price, pending: false };
  });
}

async function getPendingOrdersByStock(stockId) {
  return prisma.order.findMany({
    where: { stockId, status: 'PENDING' },
    include: { stock: true, user: true },
    orderBy: { createdAt: 'asc' },
  });
}

function shouldTriggerLimitBuy(currentPrice, limitPrice) {
  return currentPrice <= limitPrice;
}
function shouldTriggerLimitSell(currentPrice, limitPrice) {
  return currentPrice >= limitPrice;
}
function shouldTriggerStopBuy(currentPrice, stopPrice) {
  return currentPrice >= stopPrice;
}
function shouldTriggerStopSell(currentPrice, stopPrice) {
  return currentPrice <= stopPrice;
}

async function tryFillOrder(order, currentPrice) {
  const type = order.type;
  const quantity = order.quantity;
  const cost = currentPrice * quantity;
  const user = await prisma.user.findUnique({ where: { id: order.userId } });
  if (!user) return null;

  if (type === 'BUY' && Number(user.cashBalance) < cost) return null;
  if (type === 'SELL') {
    const holding = await prisma.holding.findUnique({
      where: { userId_stockId: { userId: order.userId, stockId: order.stockId } },
    });
    if (!holding || holding.quantity < quantity) return null;
  }

  return prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: order.id },
      data: { price: currentPrice, status: 'FILLED', filledAt: new Date() },
    });

    await tx.trade.create({
      data: {
        userId: order.userId,
        orderId: order.id,
        stockId: order.stockId,
        quantity,
        price: currentPrice,
        side: type,
      },
    });

    if (type === 'BUY') {
      await tx.user.update({
        where: { id: order.userId },
        data: { cashBalance: { decrement: cost } },
      });
      const existing = await tx.holding.findUnique({
        where: { userId_stockId: { userId: order.userId, stockId: order.stockId } },
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
            userId: order.userId,
            stockId: order.stockId,
            quantity,
            averagePrice: currentPrice,
          },
        });
      }
    } else {
      const holding = await tx.holding.findUnique({
        where: { userId_stockId: { userId: order.userId, stockId: order.stockId } },
      });
      await tx.user.update({
        where: { id: order.userId },
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

    return { orderId: order.id, symbol: order.stock.symbol, type, quantity, price: currentPrice };
  });
}

async function processPendingOrdersForStock(stockId, currentPrice) {
  const orders = await getPendingOrdersByStock(stockId);
  const filled = [];
  for (const order of orders) {
    let trigger = false;
    if (order.orderKind === 'LIMIT' && order.limitPrice != null) {
      const lp = Number(order.limitPrice);
      trigger = order.type === 'BUY' ? shouldTriggerLimitBuy(currentPrice, lp) : shouldTriggerLimitSell(currentPrice, lp);
    } else if (order.orderKind === 'STOP' && order.stopPrice != null) {
      const sp = Number(order.stopPrice);
      trigger = order.type === 'BUY' ? shouldTriggerStopBuy(currentPrice, sp) : shouldTriggerStopSell(currentPrice, sp);
    }
    if (trigger) {
      const result = await tryFillOrder(order, currentPrice);
      if (result) filled.push(result);
    }
  }
  return filled;
}

async function getOrdersByUser(userId) {
  const orders = await prisma.order.findMany({
    where: { userId },
    include: { stock: true },
    orderBy: { createdAt: 'desc' },
  });
  return orders.map((o) => ({
    id: o.id,
    symbol: o.stock.symbol,
    type: o.type,
    quantity: o.quantity,
    orderKind: o.orderKind,
    price: Number(o.price),
    limitPrice: o.limitPrice != null ? Number(o.limitPrice) : null,
    stopPrice: o.stopPrice != null ? Number(o.stopPrice) : null,
    status: o.status,
    filledAt: o.filledAt,
    createdAt: o.createdAt,
  }));
}

module.exports = {
  placeOrder,
  getOrdersByUser,
  getPendingOrdersByStock,
  processPendingOrdersForStock,
};
