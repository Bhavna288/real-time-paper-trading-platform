const express = require('express');
const cors = require('cors');
const stockRoutes = require('./routes/stockRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/stocks', stockRoutes);
app.use('/api/users', userRoutes);

module.exports = app;
