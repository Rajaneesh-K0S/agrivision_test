const { Router } = require('express');
const router = Router();
const passport = require('passport');

const courseController = require('../controllers/courseController');

router.get('/', courseController.allCourse );
router.get('/:id', passport.authenticate('jwt', { session:false }), courseController.courseById);
router.get('/subtopics/:id', passport.authenticate('jwt', { session:false }), courseController.subTopics);

module.exports = router;
