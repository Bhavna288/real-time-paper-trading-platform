const express = require('express');
const portfolioController = require('../controllers/portfolioController');

const router = express.Router();

router.get('/:userId/portfolio', portfolioController.getPortfolio);

module.exports = router;
