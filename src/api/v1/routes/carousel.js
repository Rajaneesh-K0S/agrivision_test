const { Router } = require('express');
const router = Router();
const carouselController = require('../controllers/carouselController');

router.get('/', carouselController.allCarousels );

module.exports = router;
