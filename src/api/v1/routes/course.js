const { Router } = require('express');
const router = Router();

const courseController = require('../controllers/courseController');



router.get('/', courseController.allCourse );
router.get('/:id', courseController.courseById);

module.exports = router;