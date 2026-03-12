const express = require('express');
const portfolioController = require('../controllers/portfolioController');
const watchlistController = require('../controllers/watchlistController');
const tradeController = require('../controllers/tradeController');
const orderController = require('../controllers/orderController');
const alertController = require('../controllers/alertController');

const router = express.Router();

router.get('/:userId/portfolio', portfolioController.getPortfolio);
router.get('/:userId/orders', orderController.getOrders);
router.get('/:userId/holdings', portfolioController.getHoldings);
router.get('/:userId/balance', portfolioController.getBalance);
router.get('/:userId/watchlist', watchlistController.getWatchlist);
router.post('/:userId/watchlist', watchlistController.addToWatchlist);
router.delete('/:userId/watchlist/:symbol', watchlistController.removeFromWatchlist);
router.get('/:userId/trades', tradeController.getTrades);
router.get('/:userId/alerts', alertController.getAlerts);
router.post('/:userId/alerts', alertController.createAlert);
router.delete('/:userId/alerts/:alertId', alertController.deleteAlert);

module.exports = router;
