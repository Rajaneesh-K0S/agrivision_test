const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//copentype -> backend name,gd,rd,courseApplicable


//coupen -> generate user

const coupenTypeSchema = new Schema({
    name: String,
    generatorDiscount: String,
    receiverDiscount: String,
    expiryDate: Date,
    category: Number,  // 0 for coupens generated by us, 1 for coupens generated by user.
    courses: [{
        type: Schema.Types.ObjectId,
        ref: 'Course'
    }],
    packages: [{
        type: Schema.Types.ObjectId,
        ref: 'Package'
    }],
    testSeries: [{
        type: Schema.Types.ObjectId,
        ref: 'TestSeries'
    }]
})




const coupenSchema = new Schema({
    name: {
        type: String,
        unique: true
    },
    code: {
        type: String,
        unique: true
    },
    genUserId : {
        type : Schema.Types.ObjectId,
        ref : 'User'
    },
    type: {
        type:Schema.Types.ObjectId,
        ref: 'CoupenType'
    },
    completedReferrals : [{
        _id: Schema.Types.ObjectId,
        date: Date,                               // date when the referred user has done payment.
        referredUserId: { type: Schema.Types.ObjectId, ref: 'User' },
        itemType: Number,                         // 0 for courses, 1 for testseries, 2 for packages
        itemId: { type: Schema.Types.ObjectId },
        status: {type : Number, default : 0},       // 0 for new referals, 1 for paid, 2 for rejected, 3/5 for pending;
        itemPrice : { type: Number, default: 0 },
        expectedPayment : Number,                   // cashback expected by referre.
        paidAmount : {type : Number, default: 0},
        paymentId : String,
        paymentDate : Date,                          // date when we have given cashback to the ca.
        comment : String
    }]
});


const Coupen = mongoose.model('Coupen', coupenSchema);
const CoupenType = mongoose.model('CoupenType', coupenTypeSchema);

module.exports = { Coupen, CoupenType };