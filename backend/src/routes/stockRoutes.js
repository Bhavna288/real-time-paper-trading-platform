const express = require('express');
const stockController = require('../controllers/stockController');

const router = express.Router();

router.get('/', stockController.getStocks);
router.get('/:symbol/orderbook', stockController.getOrderbook);
router.get('/:symbol', stockController.getStockBySymbol);

module.exports = router;
