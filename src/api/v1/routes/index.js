const { Router } = require('express');
const router = Router();

const logger = require('../../../logger');

const passport=require('passport')


router.use('/user', passport.authenticate('jwt', { session: false }),require('./user'));


router.use('/magazine', require('./magazine'));

router.get('/', (req, res) => {
    logger.debug('GET /v1');
    res.json({
        message: 'Hello Agrivision!',
    });
});

module.exports = router;
