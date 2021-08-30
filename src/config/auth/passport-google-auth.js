const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const { User } = require('../../models');

passport.use('google', new GoogleStrategy({
    clientID: process.env.googleClientId,
    clientSecret: process.env.googleClientSecret,
    callbackURL: process.env.googleCallback
}, async function (accessToken, refreshToken, profile, done) {
    try {
        let user = await User.findOne({ email: profile._json.email });
        if (user) {
            return done(null, user);
        }
        user = await User.create({
            email: profile._json.email,
            name: [profile._json.given_name, profile._json.family_name],
            provider: 'google',
            isVerified: true
        });
        return done(null, user);

    } catch (err) {
        return done(err, null);
    }
}
));

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
        done(err, user);
    });
});