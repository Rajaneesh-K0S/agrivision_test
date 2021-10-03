const { Router } = require('express');
const router = Router();
const passport = require('passport');

const { registerUser, login, googleOauth, confirmEmail, resetPassword, forgotPassword, getCart, deleteProductInCart, addToCart } = require('../controllers/userController');

router.post('/register', registerUser);

router.post('/login', login);
router.post('/oauth/google', passport.authenticate(
    'google-token', { session: false }), googleOauth);
router.get('/confirmEmail/:secret', confirmEmail);
router.post('/forgotPassword', forgotPassword);
router.post('/resetPassword/:id', resetPassword);
router.get('/cart/:id', getCart);
router.delete('/cart/:id', deleteProductInCart);
router.post('/cart/:id', addToCart);
module.exports = router;
