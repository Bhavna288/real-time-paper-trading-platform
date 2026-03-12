const express = require('express');
const portfolioController = require('../controllers/portfolioController');
const watchlistController = require('../controllers/watchlistController');

const router = express.Router();

router.get('/:userId/portfolio', portfolioController.getPortfolio);
router.get('/:userId/watchlist', watchlistController.getWatchlist);
router.post('/:userId/watchlist', watchlistController.addToWatchlist);
router.delete('/:userId/watchlist/:symbol', watchlistController.removeFromWatchlist);

module.exports = router;
