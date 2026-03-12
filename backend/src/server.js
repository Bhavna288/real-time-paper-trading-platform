const { Server } = require('socket.io');
const app = require('./app');
const { prisma } = require('./config/database');
const { startSimulation } = require('./services/marketSimulationService');
const { runCondensing } = require('./services/condensingService');

const PORT = process.env.PORT || 3001;
const SIMULATION_INTERVAL_MS = 5000; // 5 seconds
const CONDENSING_INTERVAL_MS = 6 * 60 * 60 * 1000; // 6 hours

const server = app.listen(PORT, async () => {
  try {
    await prisma.$connect();
    console.log(`Server running on http://localhost:${PORT}`);
    console.log('Database connected');

    const io = new Server(server, {
      cors: { origin: 'http://localhost:5173', methods: ['GET', 'POST'] },
    });
    app.set('io', io);

    startSimulation(SIMULATION_INTERVAL_MS, (updates, triggeredAlerts, filledOrders) => {
      if (updates && updates.length > 0) io.emit('price_update', updates);
      if (triggeredAlerts && triggeredAlerts.length > 0) {
        triggeredAlerts.forEach((payload) => io.emit('price_alert', payload));
      }
      if (filledOrders && filledOrders.length > 0) {
        filledOrders.forEach((payload) => io.emit('trade_update', { ...payload, type: payload.type }));
      }
    });
    console.log('Market simulation started (prices update every 5s)');

    await runCondensing();
    console.log('Condensing job ran (daily price history for 1Y chart)');
    setInterval(() => {
      runCondensing().catch((err) => console.error('Condensing job failed:', err.message));
    }, CONDENSING_INTERVAL_MS);
  } catch (err) {
    console.error('Database connection failed:', err.message);
    process.exit(1);
  }
});

module.exports = server;
