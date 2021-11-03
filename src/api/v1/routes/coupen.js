const { Router } = require('express');
const router = Router();
const passport = require('passport');
const {createReferralLink, useReferralLink, applyDiscountForGeneratorUser} = require('../controllers/coupenController');

router.get('/generatereflink', passport.authenticate('jwt', { session:false }), createReferralLink);
router.post('/usereflink', passport.authenticate('jwt', { session:false }), useReferralLink);
router.get('/usereflinkforgenuser', passport.authenticate('jwt', { session:false }), applyDiscountForGeneratorUser);


module.exports = router;