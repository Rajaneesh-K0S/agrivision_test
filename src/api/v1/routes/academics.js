const { Router } = require('express');
const router = Router();
const {showAllColleges,collegeDetails,customSearch} = require('../controllers/academicController')
const passport = require('passport');

router.get('/',showAllColleges);
router.get('/advanceCollegeSearch', customSearch);
router.get('/:id',collegeDetails);

module.exports = router;
