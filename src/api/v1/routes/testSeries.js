const { Router } = require('express');
const router = Router();
const passport = require('passport');

let {allTestSeries, testSeriesById, markCompleted, testSeriesProgress} = require('../controllers/testSeriesController');
let {isTestSeriesSubscribed} = require('../../../config/subscriptionCheck');

router.get('/', allTestSeries);
router.get('/:id', passport.authenticate('jwt', { session:false }), isTestSeriesSubscribed, testSeriesById);
router.post('/:id/markcompleted', passport.authenticate('jwt', { session:false }), markCompleted);
router.get('/:id/progress', passport.authenticate('jwt', { session:false }), testSeriesProgress);


module.exports  = router;

