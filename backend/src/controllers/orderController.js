const orderService = require('../services/orderService');

async function createOrder(req, res) {
  try {
    const { userId, symbol, type, quantity, orderKind, limitPrice, stopPrice } = req.body;

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

    const kind = orderKind ? String(orderKind).toUpperCase() : 'MARKET';
    if (!['MARKET', 'LIMIT', 'STOP'].includes(kind)) {
      return res.status(400).json({ error: 'Order kind must be MARKET, LIMIT, or STOP' });
    }
    if (kind === 'LIMIT' && (limitPrice == null || Number(limitPrice) <= 0)) {
      return res.status(400).json({ error: 'Limit orders require a positive limitPrice' });
    }
    if (kind === 'STOP' && (stopPrice == null || Number(stopPrice) <= 0)) {
      return res.status(400).json({ error: 'Stop orders require a positive stopPrice' });
    }

    const { order, price, pending } = await orderService.placeOrder(
      userId,
      symbol,
      upperType,
      qty,
      kind,
      kind === 'LIMIT' ? limitPrice : undefined,
      kind === 'STOP' ? stopPrice : undefined
    );

    const payload = {
      id: order.id,
      symbol: symbol.toUpperCase(),
      type: upperType,
      quantity: qty,
      price: price ?? 0,
      status: order.status,
      orderKind: order.orderKind,
      limitPrice: order.limitPrice != null ? Number(order.limitPrice) : null,
      stopPrice: order.stopPrice != null ? Number(order.stopPrice) : null,
    };

    const io = req.app.get('io');
    if (io && !pending) io.emit('trade_update', payload);
    res.status(201).json(payload);
  } catch (err) {
    if (err.message === 'Stock not found' || err.message === 'User not found') {
      return res.status(404).json({ error: err.message });
    }
    if (err.message === 'Insufficient balance' || err.message === 'Insufficient holdings' || err.message === 'Invalid order type' ||
        err.message === 'Invalid order kind' || err.message === 'Limit price must be a positive number' || err.message === 'Stop price must be a positive number') {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: 'Failed to place order' });
  }
}

async function getOrders(req, res) {
  try {
    const { userId } = req.params;
    const orders = await orderService.getOrdersByUser(userId);
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
}

module.exports = { createOrder, getOrders };
