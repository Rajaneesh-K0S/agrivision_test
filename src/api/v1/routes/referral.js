const { Router } = require('express');
const router = Router();
const {getReferralData, redeemCashback} = require('../controllers/referralController')
const passport = require('passport');

router.get('/referralData', passport.authenticate('jwt', { session:false }), getReferralData);
router.post('/redeemCashback', passport.authenticate('jwt', { session:false }), redeemCashback);



module.exports = router;