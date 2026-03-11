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

module.exports = {
  getAllStocks,
  getStockBySymbol,
};
