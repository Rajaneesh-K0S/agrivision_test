const { Router } = require('express');
const router = Router();
const passport = require('passport');
const {generateCoupen, useCoupen} = require('../controllers/coupenController');

router.post('/generatecoupen', passport.authenticate('jwt', { session:false }), generateCoupen);
router.post('/usecoupen', passport.authenticate('jwt', { session:false }), useCoupen);

module.exports = router;