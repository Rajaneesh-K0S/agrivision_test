const { Router } = require('express');
const router = Router();
const passport = require('passport');
const {createReferralLink, useReferralLink, applyDiscountForGeneratorUser, checkoutDiscount} = require('../controllers/coupenController');

router.get('/generatereflink', passport.authenticate('jwt', { session:false }), createReferralLink);
router.post('/usereflink', passport.authenticate('jwt', { session:false }), useReferralLink);
router.get('/usereflinkforgenuser', passport.authenticate('jwt', { session:false }), applyDiscountForGeneratorUser);
router.get('/checkoutdiscount', passport.authenticate('jwt', { session:false }), checkoutDiscount);

module.exports = router;