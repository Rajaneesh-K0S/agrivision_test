const { Router } = require('express');
const router = Router();
const {paymentController} = require('../controllers/paymentController');
const passport = require('passport');

router.post('/payment',passport.authenticate('jwt', { session:false }),paymentController.order)
router.post('/payment/success',paymentController.success)

module.exports = router;