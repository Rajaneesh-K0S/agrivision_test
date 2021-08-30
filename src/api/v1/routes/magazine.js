const { Router } = require('express');
const router = Router();

const { allMagazine, specificMagazine } = require('../controllers/magazineController');



router.get('/', allMagazine);
router.get('/:id', specificMagazine);

module.exports = router;