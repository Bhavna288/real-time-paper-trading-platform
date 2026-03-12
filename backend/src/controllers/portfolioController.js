const portfolioService = require('../services/portfolioService');

async function getPortfolio(req, res) {
  try {
    const { userId } = req.params;
    const portfolio = await portfolioService.getPortfolio(userId);
    if (!portfolio) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(portfolio);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch portfolio' });
  }
}

module.exports = { getPortfolio };
