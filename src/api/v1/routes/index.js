const { Router } = require('express');
const router = Router();

const logger = require('../../../logger');

const passport = require('passport');


router.use('/user', require('./user'));
router.use('/user', require('./dashboard'));
router.use('/user', require('./referral'));
router.use('/quiz', require('./quiz'));
router.use('/course', require('./course'));
router.use('/package', require('./package'));
router.use('/jobs', require('./job'));
router.use('/testseries', require('./testSeries'));
router.use('/chatbot', require('./chatbot'));
router.use('/payment', require('./payment'));
router.use('/article', require('./article'));
router.use('/coupens', require('./coupen'));

router.use('/magazine', require('./magazine'));
router.use('/academics', require('./academics'));
router.use('/carousels', require("./carousel"));
router.use('/newsletter', require("./newsletter"));
router.use('/notifications', require("./notifications"));
router.use('/sms',require('./sms'));


router.get('/', (req, res) => {
    logger.debug('GET /v1');
    res.json({
        message: 'Hello Agrivision!',
    });
});
router.get('*', (req, res) => {
    res.status(404).json({
        message: 'Page Not Found',
        success: false
    });
});

module.exports = router;
