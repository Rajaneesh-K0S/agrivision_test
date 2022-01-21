const { Router } = require('express');
const router = Router();
const { getResult } = require('../controllers/chatbotController');

router.post('/get-response', getResult);
module.exports = router;