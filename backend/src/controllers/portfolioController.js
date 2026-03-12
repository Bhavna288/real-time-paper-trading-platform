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

async function getHoldings(req, res) {
  try {
    const { userId } = req.params;
    const holdings = await portfolioService.getHoldings(userId);
    if (holdings === null) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(holdings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch holdings' });
  }
}

async function getBalance(req, res) {
  try {
    const { userId } = req.params;
    const balance = await portfolioService.getBalance(userId);
    if (balance === null) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(balance);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch balance' });
  }
}

module.exports = { getPortfolio, getHoldings, getBalance };
