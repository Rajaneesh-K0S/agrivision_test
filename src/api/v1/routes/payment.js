const { Router } = require('express');
const router = Router();

const { order, success } = require('../controllers/paymentController');
const passport = require('passport');

router.post('/success', success);
router.post('/:amount/', passport.authenticate('jwt', { session:false }), order);




module.exports = router;