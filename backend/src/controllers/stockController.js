const stockService = require('../services/stockService');
const tradeService = require('../services/tradeService');

async function getStocks(req, res) {
  try {
    const stocks = await stockService.getAllStocks();
    res.json(stocks);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stocks' });
  }
}

async function getStockBySymbol(req, res) {
  try {
    const { symbol } = req.params;
    const stock = await stockService.getStockBySymbol(symbol);
    if (!stock) {
      return res.status(404).json({ error: 'Stock not found' });
    }
    res.json(stock);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stock' });
  }
}

async function getOrderbook(req, res) {
  try {
    const { symbol } = req.params;
    const orderbook = await stockService.getOrderbookBySymbol(symbol);
    if (!orderbook) {
      return res.status(404).json({ error: 'Stock not found' });
    }
    res.json(orderbook);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orderbook' });
  }
}

async function getStockTrades(req, res) {
  try {
    const { symbol } = req.params;
    const trades = await tradeService.getTradesByStock(symbol);
    if (trades === null) {
      return res.status(404).json({ error: 'Stock not found' });
    }
    res.json(trades);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch trades' });
  }
}

async function getPriceHistory(req, res) {
  try {
    const { symbol } = req.params;
    const range = req.query.range || '1w';
    const points = await stockService.getPriceHistory(symbol, range);
    if (points === null) {
      return res.status(404).json({ error: 'Stock not found' });
    }
    res.json(points);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch price history' });
  }
}

module.exports = {
  getStocks,
  getStockBySymbol,
  getOrderbook,
  getStockTrades,
  getPriceHistory,
};
