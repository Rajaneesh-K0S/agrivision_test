const express = require('express');
const app = express();
const passport = require('passport');
const logger = require('./logger');
const cors = require('cors');

require('./config/mongoose');
require('./config/auth/passport-google-token');
require('./config/auth/passportJWT');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session(sessionConfig));
app.use(passport.initialize());

app.use('/', require('./api'));


app.listen(process.env.PORT, (err) => {
    if (err) {
        logger.error(err);
    }
    logger.info('Server started');
});
