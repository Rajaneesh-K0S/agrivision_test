const { Router } = require('express');
const router = Router();
const {showAllColleges,collegeDetails} = require('../controllers/academicController')
const passport = require('passport');

router.get('/',passport.authenticate('jwt', { session:false }),showAllColleges);
router.get('/:id',passport.authenticate('jwt', { session:false }),collegeDetails);

module.exports = router;