const express = require('express');
const app = express();
const passport = require('passport');
const logger = require('./logger');

require('./config/mongoose');
require('./config/auth/passport-google-auth');
require('./config/auth/passportJWT');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(passport.initialize());
app.use('/', require('./api'));

app.listen(process.env.PORT, (err) => {
    if (err) {
        logger.error(err);
    }
    logger.info('Server started');
});
