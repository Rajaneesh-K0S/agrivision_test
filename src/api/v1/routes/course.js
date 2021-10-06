const { Router } = require('express');
const router = Router();

const courseController = require('../controllers/courseController');

router.get('/', courseController.allCourse );
router.get('/:id', courseController.courseById);
router.get('/:id/progress', courseController.courseProgress);
router.post('/:id/markcompleted', courseController.markCompleted);
router.get('/subtopics/:id', courseController.subTopics);

module.exports = router;
