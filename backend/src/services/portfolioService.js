const { prisma } = require('../config/database');

async function getPortfolio(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      holdings: { include: { stock: true } },
    },
  });
  if (!user) return null;

  const cashBalance = Number(user.cashBalance);
  const holdingsList = user.holdings.map((h) => {
    const qty = h.quantity;
    const avgPrice = Number(h.averagePrice);
    const currentPrice = Number(h.stock.currentPrice);
    const marketValue = qty * currentPrice;
    const costBasis = qty * avgPrice;
    const pnl = marketValue - costBasis;
    return {
      symbol: h.stock.symbol,
      name: h.stock.name,
      quantity: qty,
      averagePrice: avgPrice,
      currentPrice,
      marketValue,
      pnl,
    };
  });

  const totalHoldingsValue = holdingsList.reduce((sum, h) => sum + h.marketValue, 0);
  const totalPortfolioValue = cashBalance + totalHoldingsValue;
  const unrealizedPnl = holdingsList.reduce((sum, h) => sum + h.pnl, 0);

  return {
    cashBalance,
    totalHoldingsValue,
    totalPortfolioValue,
    unrealizedPnl,
    holdings: holdingsList,
  };
}

async function getHoldings(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      holdings: { include: { stock: true } },
    },
  });
  if (!user) return null;

  return user.holdings.map((h) => {
    const qty = h.quantity;
    const avgPrice = Number(h.averagePrice);
    const currentPrice = Number(h.stock.currentPrice);
    const marketValue = qty * currentPrice;
    const pnl = marketValue - qty * avgPrice;
    return {
      symbol: h.stock.symbol,
      name: h.stock.name,
      quantity: qty,
      averagePrice: avgPrice,
      currentPrice,
      marketValue,
      pnl,
    };
  });
}

async function getBalance(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { cashBalance: true },
  });
  if (!user) return null;
  return { cashBalance: Number(user.cashBalance) };
}

module.exports = { getPortfolio, getHoldings, getBalance };
