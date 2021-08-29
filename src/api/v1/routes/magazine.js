const { Router } = require('express');
const router = Router();

const magazineController = require('../controllers/magazineController');



router.get('/', magazineController.allMagazine);
router.get('/:id', magazineController.specificMagazine);

module.exports = router;