const tradeService = require('../services/tradeService');

async function getTrades(req, res) {
  try {
    const { userId } = req.params;
    const trades = await tradeService.getTradesByUser(userId);
    res.json(trades);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch trades' });
  }
}

module.exports = { getTrades };
