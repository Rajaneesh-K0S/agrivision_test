const { Router } = require('express');
const router = Router();
const passport = require('passport');
const {sendOtp, verifyOtp} = require('../controllers/smsController');



router.post('/sendOtp', passport.authenticate('jwt', { session:false }), sendOtp);
router.post('/verifyOtp', passport.authenticate('jwt', { session:false }), verifyOtp);


module.exports = router;