const mongoose = require('mongoose');
const Schema = mongoose.Schema;


let referralDataSchema = new Schema({
    generatorUserId: { type: Schema.Types.ObjectId, ref: 'User' },
    paidCount: { type: Number, default: 0 },
    newReferrals: { type: Number, default: 0 },
    totalAmountPaid: { type: Number, default: 0 },
    completedReferrals: [{
        date: Date,
        referredUserId: { type: Schema.Types.ObjectId, ref: 'User' },
        itemType: Number,
        itemId: { type: Schema.Types.ObjectId },
        isPaymentDone : {type : Boolean, default: false},
        paidAmount : { type: Number, default: 0 },
        paymentId : String,
        rejectionReason : String
    }]
})


let ReferralData = mongoose.model('referralData', referralDataSchema);

module.exports = ReferralData;