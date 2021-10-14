require("dotenv").config();

const express = require('express');
const app = express();
const passport = require('passport');
const logger = require('./logger');
const cors = require('cors');
const streakCalculatorJob = require('./utils/scheduledJobs/streakCalculator');

require('./config/mongoose');
require('./config/auth/passport-google-token');
require('./config/auth/passportJWT');


streakCalculatorJob.start();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(passport.initialize());

app.use('/', require('./api'));

app.use((req, res, next) => {
    const error = new Error('Not found');
    error.status = 404;
    next(error);
});

// error handler middleware
app.use((error, req, res) => {
    res.status(error.status || 500).send({
        error: {
            status: error.status || 500,
            message: error.message || 'Internal Server Error',
        },
    });
});

app.listen(process.env.PORT, (err) => {
    if (err) {
        logger.error(err);
    }
    logger.info('Server started');
});
