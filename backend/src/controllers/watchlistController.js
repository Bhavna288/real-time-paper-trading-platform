const watchlistService = require('../services/watchlistService');

async function getWatchlist(req, res) {
  try {
    const { userId } = req.params;
    const items = await watchlistService.getWatchlist(userId);
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch watchlist' });
  }
}

async function addToWatchlist(req, res) {
  try {
    const { userId } = req.params;
    const { symbol } = req.body;
    if (!symbol || !String(symbol).trim()) {
      return res.status(400).json({ error: 'Symbol is required' });
    }
    const item = await watchlistService.addToWatchlist(userId, symbol);
    res.status(201).json(item);
  } catch (err) {
    if (err.message === 'Stock not found') {
      return res.status(404).json({ error: err.message });
    }
    res.status(500).json({ error: 'Failed to add to watchlist' });
  }
}

async function removeFromWatchlist(req, res) {
  try {
    const { userId, symbol } = req.params;
    await watchlistService.removeFromWatchlist(userId, symbol);
    res.json({ removed: symbol.toUpperCase() });
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove from watchlist' });
  }
}

module.exports = {
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
};
