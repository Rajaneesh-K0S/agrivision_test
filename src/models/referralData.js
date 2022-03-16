const mongoose = require('mongoose');
const Schema = mongoose.Schema;


let referralDataSchema = new Schema({
    generatorUserId: { type: Schema.Types.ObjectId, ref: 'User' },
    paidCount: { type: Number, default: 0 },
    newReferrals: { type: Number, default: 0 },
    totalAmountPaid: { type: Number, default: 0 },
    completedReferrals: [{
        date: Date,                               // date when the referred user has done payment.
        referredUserId: { type: Schema.Types.ObjectId, ref: 'User' },
        itemType: Number,                         // 0 for courses, 1 for testseries, 2 for packages
        itemId: { type: Schema.Types.ObjectId },
        status: {type : Number, default : 0},       // 0 for new referals, 1 for paid, 2 for rejected, 3 for pending;
        paidAmount : { type: Number, default: 0 },
        expectedPayment : Number,                   // cashback expected by referre.
        paymentId : String,
        paymentDate : Date,                          // date when we have given cashback to the ca.
        comment : String
    }]
})


let ReferralData = mongoose.model('referralData', referralDataSchema);

module.exports = ReferralData;