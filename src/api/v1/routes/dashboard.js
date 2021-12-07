const {Router} = require('express');
const router = new Router();
const passport = require('passport');


const {getUserProgress, getReminder, addReminder, getSchedule} = require('../controllers/dashboardController');



router.get('/userProgress', passport.authenticate('jwt', { session:false }), getUserProgress);
router.get('/getReminder', passport.authenticate('jwt', { session:false }), getReminder);
router.post('/addReminder', passport.authenticate('jwt', { session:false }), addReminder);
router.get('/getSchedule', passport.authenticate('jwt', { session:false }), getSchedule)

module.exports = router;



