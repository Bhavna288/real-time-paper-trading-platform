const app = require('./app');
const { prisma } = require('./config/database');

const PORT = process.env.PORT || 3001;

const server = app.listen(PORT, async () => {
  try {
    await prisma.$connect();
    console.log(`Server running on http://localhost:${PORT}`);
    console.log('Database connected');
  } catch (err) {
    console.error('Database connection failed:', err.message);
    process.exit(1);
  }
});

module.exports = server;
