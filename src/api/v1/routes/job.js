const { Router } = require('express');
const router = Router();
const passport = require('passport');

let { getJobs } = require('../controllers/jobController');


router.get('/', passport.authenticate('jwt', { session:false }), getJobs);
//router.post('/', passport.authenticate('jwt', { session:false }), postJobs);


module.exports = router;