const { Router } = require('express');
const router = Router();
const passport=require('passport')

const { registerUser,login,googleCallback,confirmEmail,resetPassword,forgotPassword } = require('../controllers/userController');

router.post('/register', registerUser);
router.post('/login',login);
router.get('/oauth/google',  passport.authenticate('google', { scope: ['profile','email'] }));
router.get('/oauth/google/callback', passport.authenticate('google'),googleCallback);
router.get('/confirmEmail/:id',confirmEmail);
router.post('/forgot-password',forgotPassword)
router.post('/reset-password/:id',resetPassword);

module.exports = router;