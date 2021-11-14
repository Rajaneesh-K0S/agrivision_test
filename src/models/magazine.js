const mongoose = require('mongoose');

const magazineSchema = new mongoose.Schema({
    url:{
        type:String
    },
    month:{
        type:Number,
        min: 1,
        max: 12
    },
    bigImage:{
        type:String
    },
    smallImage:{
        type:String
    }
}, {
    timestamps: true
});

const Magazine = mongoose.model('Magazine', magazineSchema);

module.exports = Magazine;