const passport=require('passport');
const JwtStrategy=require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
var opts = {}
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = process.env.JWTsecret;
// opts.issuer = 'agrivision4u.com';
// opts.audience = 'agrivision4u.com';

const logger=require('../../logger')

passport.use(new JwtStrategy(opts, function(jwt_payload, done) {
   // called everytime a protected URL is being served
   logger.info('err')
   // payload has the email  not the id
   User.findOne({email: jwt_payload.sub}, function(err, user) {
    if (err) {
        console.log(err)
        return done(err, false);
    }
    if (user) {
        return done(null, user);
    } else {
        console.log("not user")
        return done(null, false);
    }
});
}));
// not required  serialization and desensitization 
// passport.serializeUser(function(user, done) {
//  
//   return done(null, user)
// })
// passport.deserializeUser(function(obj, done) {
//   
//   return done(null, obj)
// })
