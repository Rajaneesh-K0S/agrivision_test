const express = require('express');
const app = express();

const db = require('./config/mongoose');
const logger = require('./logger');

app.use('/api', require('./api'));

app.listen(process.env.PORT, (err) => {
    if (err) {
        logger.error(err);
    }
    logger.info('Server started');
});
