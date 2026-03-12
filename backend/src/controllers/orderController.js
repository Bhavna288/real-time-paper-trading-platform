const orderService = require('../services/orderService');

async function createOrder(req, res) {
  try {
    const { userId, symbol, type, quantity } = req.body;

    if (!userId || !symbol || !type || quantity == null) {
      return res.status(400).json({ error: 'Missing required fields: userId, symbol, type, quantity' });
    }
    const qty = Number(quantity);
    if (!Number.isInteger(qty) || qty < 1) {
      return res.status(400).json({ error: 'Quantity must be a positive integer' });
    }
    const upperType = String(type).toUpperCase();
    if (upperType !== 'BUY' && upperType !== 'SELL') {
      return res.status(400).json({ error: 'Type must be BUY or SELL' });
    }

    const { order, price } = await orderService.placeOrder(userId, symbol, upperType, qty);
    const payload = {
      id: order.id,
      symbol: symbol.toUpperCase(),
      type: upperType,
      quantity: qty,
      price,
      status: order.status,
    };
    const io = req.app.get('io');
    if (io) io.emit('trade_update', payload);
    res.status(201).json(payload);
  } catch (err) {
    if (err.message === 'Stock not found' || err.message === 'User not found') {
      return res.status(404).json({ error: err.message });
    }
    if (err.message === 'Insufficient balance' || err.message === 'Insufficient holdings' || err.message === 'Invalid order type') {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: 'Failed to place order' });
  }
}

module.exports = { createOrder };
