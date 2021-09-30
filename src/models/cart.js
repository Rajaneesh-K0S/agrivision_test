const mongoose = require('mongoose');

let cartSchema = new mongoose.Schema({
    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User'
    },
    testSeries : [{
        type : mongoose.Schema.Types.ObjectId,
        
    }],
    courses : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Course'
    }],
});


const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;