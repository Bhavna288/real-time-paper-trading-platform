const alertService = require('../services/alertService');

async function getAlerts(req, res) {
  try {
    const { userId } = req.params;
    const alerts = await alertService.getAlerts(userId);
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
}

async function createAlert(req, res) {
  try {
    const { userId } = req.params;
    const { symbol, direction, targetPrice } = req.body;
    if (!symbol || !direction || targetPrice == null) {
      return res.status(400).json({ error: 'Missing required fields: symbol, direction, targetPrice' });
    }
    const alert = await alertService.createAlert(userId, symbol, direction, targetPrice);
    res.status(201).json(alert);
  } catch (err) {
    if (err.message === 'Stock not found') return res.status(404).json({ error: err.message });
    if (err.message === 'Direction must be ABOVE or BELOW' || err.message === 'Target price must be a positive number') {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: 'Failed to create alert' });
  }
}

async function deleteAlert(req, res) {
  try {
    const { userId, alertId } = req.params;
    await alertService.deleteAlert(userId, alertId);
    res.json({ deleted: alertId });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete alert' });
  }
}

module.exports = { getAlerts, createAlert, deleteAlert };
