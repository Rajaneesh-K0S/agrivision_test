const { Router } = require('express');
const router = Router();

const { registerUser } = require('../controllers/userController');

router.post('/register', registerUser)

module.exports = router;