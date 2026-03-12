const stockService = require('../services/stockService');

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

module.exports = {
  getStocks,
  getStockBySymbol,
  getOrderbook,
};
