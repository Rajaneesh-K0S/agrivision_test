const { Router } = require('express');
const router = Router();
const passport = require('passport');
const {allArticle,specificArticle,addComment,addLike,articleSubmission,articlePaymentSuccess} = require('../controllers/articleController');

router.get('/', allArticle);
router.get('/:id', specificArticle);
router.post('/:id/addComment',passport.authenticate('jwt', { session:false }), addComment);
router.post('/:id/addLike',passport.authenticate('jwt', { session:false }), addLike);
router.post('articleSubmission',passport.authenticate('jwt',{session:false}),articleSubmission);
router.post('articleSubmission/paymentSuccess',passport.authenticate('jwt',{session:false}),articlePaymentSuccess);
module.exports = router;