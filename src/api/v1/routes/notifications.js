const { Router } = require('express');
const router = Router();
const passport = require('passport');

const { allnotifications } =require('../controllers/notificationController'); 

router.get('/', passport.authenticate('jwt', { session:false }), allnotifications);
module.exports = router;
