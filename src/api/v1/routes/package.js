const { Router } = require('express');
const router = Router();
const passport = require('passport');
const {getAllPackages, packageById}= require('../controllers/packageController');

router.get('/',getAllPackages);
router.get('/:id',passport.authenticate('jwt', { session:false }),packageById);


module.exports = router;