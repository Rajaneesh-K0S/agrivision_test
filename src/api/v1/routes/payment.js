const { Router } = require('express');
const router = Router();

const { order, success } = require('../controllers/paymentController');
const passport = require('passport');

router.post('/:amount/', passport.authenticate('jwt', { session:false }), order);

router.post('/success', success);


module.exports = router;