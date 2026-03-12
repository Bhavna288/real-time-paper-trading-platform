const { prisma } = require('../config/database');

const DAILY_RETENTION_DAYS = 365;

/**
 * Group raw StockPrice rows by day (UTC) and take last price per day as close.
 * Upsert into StockPriceDaily so 1Y chart can read up to 365 daily points.
 * Deletes daily rows older than DAILY_RETENTION_DAYS.
 */
async function runCondensing() {
  const stocks = await prisma.stock.findMany({ select: { id: true } });

  for (const stock of stocks) {
    const rows = await prisma.stockPrice.findMany({
      where: { stockId: stock.id },
      orderBy: { timestamp: 'asc' },
    });

    if (rows.length === 0) continue;

    const byDay = new Map(); // date string YYYY-MM-DD -> { price }
    for (const r of rows) {
      const d = r.timestamp;
      const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
      byDay.set(key, Number(r.price));
    }

    for (const [key, price] of byDay) {
      const [y, m, d] = key.split('-').map(Number);
      const dateOnly = new Date(Date.UTC(y, m - 1, d));

      await prisma.stockPriceDaily.upsert({
        where: {
          stockId_date: { stockId: stock.id, date: dateOnly },
        },
        create: { stockId: stock.id, date: dateOnly, price },
        update: { price },
      });
    }
  }

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - DAILY_RETENTION_DAYS);
  cutoff.setUTCHours(0, 0, 0, 0);
  await prisma.stockPriceDaily.deleteMany({
    where: { date: { lt: cutoff } },
  });
}

module.exports = { runCondensing };
