const mongoose = require('mongoose');

const magazineSchema = new mongoose.Schema({
    url:{
        type:String
    }
}, {
    timestamps: true
});

const Magazine = mongoose.model('Magazine',magazineSchema);

module.exports = Magazine;