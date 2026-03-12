const { prisma } = require('../config/database');

const MAX_CHANGE_PERCENT = 0.005; // ±0.5% per step
const MIN_PRICE = 0.01;
const PRICE_HISTORY_RETENTION_DAYS = 90; // delete rows older than this

function randomDelta() {
  return (Math.random() * 2 - 1) * MAX_CHANGE_PERCENT;
}

async function runSimulationStep() {
  const stocks = await prisma.stock.findMany();
  const updates = [];

  for (const stock of stocks) {
    const current = Number(stock.currentPrice);
    const change = 1 + randomDelta();
    let newPrice = Math.round(current * change * 100) / 100;
    if (newPrice < MIN_PRICE) newPrice = MIN_PRICE;

    await prisma.stock.update({
      where: { id: stock.id },
      data: { currentPrice: newPrice },
    });

    await prisma.stockPrice.create({
      data: { stockId: stock.id, price: newPrice },
    });

    updates.push({ symbol: stock.symbol, currentPrice: newPrice });
  }

  await runRetention();

  return updates;
}

async function runRetention() {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - PRICE_HISTORY_RETENTION_DAYS);
  await prisma.stockPrice.deleteMany({
    where: { timestamp: { lt: cutoff } },
  });
}

function startSimulation(intervalMs, onUpdate) {
  const run = async () => {
    try {
      const updates = await runSimulationStep();
      if (onUpdate && updates.length > 0) onUpdate(updates);
    } catch (err) {
      console.error('Market simulation step failed:', err.message);
    }
  };
  run(); // run once immediately
  return setInterval(run, intervalMs);
}

module.exports = { runSimulationStep, startSimulation };
