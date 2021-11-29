const { Router } = require('express');
const router = Router();
const { getResponseFromDialogflow } = require('../controllers/chatbotController');

router.post('/get-response', getResponseFromDialogflow);
module.exports = router;