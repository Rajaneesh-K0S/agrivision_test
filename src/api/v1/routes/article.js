const { Router } = require('express');
const router = Router();

const articleController = require('../controllers/articleController');



router.get('/', articleController.allArticle);
router.get('/:id', articleController.specificArticle);

module.exports = router;