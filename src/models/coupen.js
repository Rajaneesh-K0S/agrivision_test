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
                                      // all discounts in percentage.
    discount : String,                // normal discount for type 0 coupens.
    generatorDiscount : String,       // discount for the user who has generated the referral link.
    receiverDiscount : String,        // discount for the user who is using referral link.
    noOfReferralsReq : {    // no of referrals req for type 1 coupens.
        type : Number, 
        default : 1
    },
    active : {
        type : Boolean,
        default : false
    },
    noOfRedeems : {        //no of times a coupen can be used(for type 0 coupens.).
        type : Number,
        default : 0
    },  
    generatedUsers : {    // users who have created a referral link.(for type 1 coupens)
        type : Map,
        of : Number       // represents the number of remaining referrals a user has to do.
    }
});


const Coupen = mongoose.model('Coupen', coupenSchema);

module.exports = Coupen;