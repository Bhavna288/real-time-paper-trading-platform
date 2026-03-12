const { Server } = require('socket.io');
const app = require('./app');
const { prisma } = require('./config/database');
const { startSimulation } = require('./services/marketSimulationService');

const PORT = process.env.PORT || 3001;
const SIMULATION_INTERVAL_MS = 5000; // 5 seconds

const server = app.listen(PORT, async () => {
  try {
    await prisma.$connect();
    console.log(`Server running on http://localhost:${PORT}`);
    console.log('Database connected');

    const io = new Server(server, {
      cors: { origin: 'http://localhost:5173', methods: ['GET', 'POST'] },
    });
    app.set('io', io);

    startSimulation(SIMULATION_INTERVAL_MS, (updates) => {
      io.emit('price_update', updates);
    });
    console.log('Market simulation started (prices update every 5s)');
  } catch (err) {
    console.error('Database connection failed:', err.message);
    process.exit(1);
  }
});

module.exports = server;
