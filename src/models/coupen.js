const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const coupenSchema = new Schema({
    name : {
        type : String,
        unique : true
    },
    code : {
        type : String,
        unique : true
    },
    type : Number, // [0 for coupens on checkout page, 1 for share and earn]
    discount : Number,
    generatorDiscount : Number,
    receiverDiscount : Number, 
    noOfReferralsReq : {
        type : Number, 
        default : 1
    },
    active : {
        type : Boolean,
        default : false
    },
    noOfRedeems : {        //no of times a coupen can be used.
        type : Number,
        default : 0
    },  
    generatedUsers : {
        type : Map,
        of : Number
    }
});


const Coupen = mongoose.model('Coupen', coupenSchema);

module.exports = Coupen;