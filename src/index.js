const express = require('express');
const app = express();


const passport=require('passport')
const db = require('./config/mongoose');
const logger = require('./logger');
const googleAuth=require('./config/auth/passport-google-auth');
const JwtStrategy=require('./config/auth/passportJWT');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(passport.initialize());
app.use('/api', require('./api'));
app.listen(process.env.PORT, (err) => {
    if (err) {
        logger.error(err);
    }
    logger.info('Server started');
});
