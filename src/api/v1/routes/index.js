const { Router } = require('express');
const router = Router();

const logger = require('../../../logger');

router.use('/user', require('./user'));

router.get('/', (req, res) => {
    logger.debug('GET /v1');
    res.json({
        message: 'Hello Agrivision!',
    });
});

module.exports = router;
