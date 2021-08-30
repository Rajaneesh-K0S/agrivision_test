const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;

let opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWTsecret
};

const { User } = require('../../models');
// opts.issuer = 'agrivision4u.com';
// opts.audience = 'agrivision4u.com';

// const logger = require('../../logger');

passport.use(new JwtStrategy(opts, function (jwt_payload, done) {
    // called everytime a protected URL is being served
    // payload has the email not the id

    User.findOne({ email: jwt_payload.data }, function (err, user) {
        if (err) {
            return done(err, false);
        }
        if (user) {
            return done(null, user);
        } else {
            return done(null, false);
        }
    });
}));

