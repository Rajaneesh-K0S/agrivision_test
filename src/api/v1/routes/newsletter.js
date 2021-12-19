const { Router } = require('express');
const router = Router();

const { addSubscription } = require('../controllers/newsletterController');


router.post('/add', addSubscription);
// router.get('/get', getAllSubscription);

module.exports = router;