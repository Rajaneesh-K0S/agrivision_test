const { Router } = require('express');
const router = Router();
const passport = require('passport')
// // const {isAdmin} = require('../config/middleware/isAdmin')
const { showAllQuizzes, startQuiz ,saveAnswer,clearAnswer} = require('../controllers/quizController');

router.get('/',passport.authenticate('jwt', { session:false }), showAllQuizzes);
// //612a97d7be74275fbc15b080
router.get('/:id',passport.authenticate('jwt', { session:false }) ,startQuiz);

router.post('/:id', passport.authenticate('jwt', { session:false }),saveAnswer);
router.delete('/:id', passport.authenticate('jwt', { session:false }),clearAnswer);

module.exports = router;
