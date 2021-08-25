const { Router } = require('express');
const router = Router();

const logger = require('../../../logger');

router.get('/', (req, res) => {
    logger.debug('GET /');
    res.json({
        message: 'Hello Agrivision!',
    });
});

module.exports = router;
