const mongoose = require('mongoose');
const logger = require('../logger');

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
}).then(() => {
    logger.info('Mongoose connected to ' + process.env.MONGO_URI);
}).catch((err) => {
    logger.error('Mongoose connection error: ' + err);
});

const db = mongoose.connection;

db.on('error', () => {
    logger.info('Error connecting to Database');
});

db.once('open', () => {
    logger.info('Connected to Database');
});
