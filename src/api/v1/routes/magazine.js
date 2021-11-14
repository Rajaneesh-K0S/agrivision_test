const { Router } = require('express');
const router = Router();

const { allMagazine } = require('../controllers/magazineController');



router.get('/', allMagazine);


module.exports = router;