const Razorpay = require('razorpay');
const crypto = require('crypto');
const { User } = require('../../../models');




module.exports.order = async (req, res) => {
    let userId = req.user._id.toString();
    let { courseIds, testSeriesIds, origin } = req.body;
    let courseIdString = "", testSeriesIdString = "";
    if (courseIds.length) {
        courseIdString = courseIds.join('$');
    }
    if (testSeriesIds.length) {
        testSeriesIdString = testSeriesIds.join('$');
    }

    try {
        const instance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_SECRET,
        });

        const options = {
            amount: req.params.amount * 100,
            currency: 'INR',
            receipt: 'receipt_order_',
            notes: {
                "courseId": courseIdString,
                "testSeriesId": testSeriesIdString,
                "origin": origin,    // 0 for buy now, 1 for checkout
                "userId": userId,
            }
        };

        const order = await instance.orders.create(options);

        if (!order) return res.status(500).send('Some error occurred');

        res.status(200).json(order);
    } catch (error) {
        res.status(500).send(error);
    }
};


module.exports.success = async (req, res) => {
    try {
        const secret = process.env.RAZORPAY_SECRET2;
        const shasum = crypto.createHmac('sha256', secret)
        shasum.update(JSON.stringify(req.body))
        const digest = shasum.digest('hex')

        if (digest !== req.headers['x-razorpay-signature'])
            return res.status(400).json({ msg: 'Transaction not legit!' });

        let courseIdString = req.body.payload.payment.entity.notes.courseId;
        let testSeriesIdString = req.body.payload.payment.entity.notes.testSeriesId;
        // let testSeriesIdString = '6179241cd07a1a2d27daa791';
        let origin = req.body.payload.payment.entity.notes.origin;
        let userId = req.body.payload.payment.entity.notes.userId;
        let courseIds = [], testSeriesIds = [];
        if (courseIdString != "") {
             courseIds = courseIdString.split('$');
        }
        if (testSeriesIdString != "") {
             testSeriesIds = testSeriesIdString.split('$');
        }
        if(courseIds.length){
            await User.updateOne({ _id: userId }, { '$push': { 'courses': { '$each': courseIds }}});
        }
        if(testSeriesIds.length){
            await User.updateOne({ _id: userId }, { '$push': { 'testSeries': { '$each': testSeriesIds } } });
        }
        if (origin == 1) {
            if(courseIds.length){
                await User.updateOne({ _id: userId }, { '$pullAll': { 'cart.courses': courseIds } });
            }
            if(testSeriesIds.length){
                await User.updateOne({ _id: userId }, { '$pullAll': { 'cart.testSeries': testSeriesIds } });
            }
        }
        let orderId = req.body.payload.payment.entity.order_id;
        let amount = req.body.payload.payment.entity.amount / 100;

        let paymentDetails = {courseIds, testSeriesIds, orderId, time : Date.now(), amount}
        await User.updateOne({_id : userId}, {'$push' : {'paymentHistory' : paymentDetails}});

        res.json({
            msg: 'success',
            orderId
        });
    } catch (error) {
        res.status(500).send(error);
    }
};