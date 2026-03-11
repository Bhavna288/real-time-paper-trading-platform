const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const DEMO_USER_ID = 'demo-user-id';

const STOCKS = [
  { symbol: 'AAPL', name: 'Apple Inc.', currentPrice: 185.50 },
  { symbol: 'MSFT', name: 'Microsoft Corporation', currentPrice: 378.90 },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', currentPrice: 875.20 },
  { symbol: 'TSLA', name: 'Tesla Inc.', currentPrice: 242.80 },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', currentPrice: 178.25 },
];

async function main() {
  await prisma.user.upsert({
    where: { id: DEMO_USER_ID },
    create: {
      id: DEMO_USER_ID,
      name: 'Demo User',
      email: 'demo@example.com',
      cashBalance: 100000,
    },
    update: { name: 'Demo User', email: 'demo@example.com', cashBalance: 100000 },
  });
  console.log('Seeded demo user:', DEMO_USER_ID);

  for (const stock of STOCKS) {
    await prisma.stock.upsert({
      where: { symbol: stock.symbol },
      create: stock,
      update: { name: stock.name, currentPrice: stock.currentPrice },
    });
  }
  console.log('Seeded 5 stocks:', STOCKS.map((s) => s.symbol).join(', '));
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
