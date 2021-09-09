const MongoStore = require('connect-mongo');

const sessionConfig = {
    name: 'agrivision4u',
    // TODO change the secret before deployment in production mode
    secret: process.env.sessionSecret,
    saveUninitialized: false,
    resave: false,
    cookie: {
        maxAge: (1000 * 60 * 60*24*7)
    },
    store: new MongoStore(
        {
            mongoUrl: process.env.MONGO_URI,
            clear_interval: 1
        },
        function (err) {
            console.log(err || 'connect-mongodb setup ok');
        }
    )
};

module.exports = sessionConfig
