const Razorpay = require('razorpay');
const crypto = require('crypto');
const { User, Package } = require('../../../models');




module.exports.order = async (req, res) => {
    let userId = req.user._id.toString();
    let { courseIds, testSeriesIds, packageIds, origin } = req.body;
    let courseIdString = "", testSeriesIdString = "", packageIdString = "";
    try {
        if (courseIds && courseIds.length) {
            courseIdString = courseIds.join('$');
        }
        if (testSeriesIds && testSeriesIds.length) {
            testSeriesIdString = testSeriesIds.join('$');
        }
        if (packageIds && packageIds.length) {
            packageIdString = packageIds.join('$');
        }
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
                "packageId": packageIdString,
                "origin": origin,    // 0 for buy now, 1 for checkout
                "userId": userId
            }
        };

        const order = await instance.orders.create(options);

        if (!order){
            return res.status(500).json({
                message : "some error occurred!",
                success : false
            });
        } 

        res.status(200).json({
             message : "successfully created order",
             body : order,
             success : true
        });
    } catch (error) {
        res.status(500).json({
            message : error.message,
            success : false
        });
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
        let packageIdString = req.body.payload.payment.entity.notes.packageId;
        // let testSeriesIdString = '6179241cd07a1a2d27daa791';
        let origin = req.body.payload.payment.entity.notes.origin;
        let userId = req.body.payload.payment.entity.notes.userId;
        let courseIds = [], testSeriesIds = [], packageIds = [];
        if (courseIdString != "") {
             courseIds = courseIdString.split('$');
        }
        if (testSeriesIdString != "") {
             testSeriesIds = testSeriesIdString.split('$');
        }
        if (packageIdString != "") {
             packageIds = packageIdString.split('$');
        }
        if(courseIds.length){
            await User.updateOne({ _id: userId }, { '$push': { 'courses': { '$each': courseIds }}});
        }
        if(testSeriesIds.length){
            await User.updateOne({ _id: userId }, { '$push': { 'testSeries': { '$each': testSeriesIds } } });
        }
        if(packageIds.length){
            await User.updateOne({ _id: userId }, { '$push': { 'packages': { '$each': packageIds } } });
            for(let i = 0 ;i< packageIds.length; i++){
                let pack = await Package.findOne({_id : packageIds[i]}, {"courses" : 1});
                await User.updateOne({_id : userId}, {'$push' : {'courses' : {'$each' : pack.courses}}});
            }
        }
        if (origin == 1) {
            if(courseIds.length){
                await User.updateOne({ _id: userId }, { '$pullAll': { 'cart.courses': courseIds } });
            }
            if(testSeriesIds.length){
                await User.updateOne({ _id: userId }, { '$pullAll': { 'cart.testSeries': testSeriesIds } });
            }
            if(packageIds.length){
                await User.updateOne({ _id: userId }, { '$pullAll': { 'cart.packages': packageIds } });
            }
        }
        let orderId = req.body.payload.payment.entity.order_id;
        let amount = req.body.payload.payment.entity.amount / 100;

        let paymentDetails = {courseIds, testSeriesIds, packageIds, orderId, time : Date.now(), amount}
        await User.updateOne({_id : userId}, {'$push' : {'paymentHistory' : paymentDetails}});

        res.status(200).json({
            msg: 'success',
            orderId
        });
    } catch (error) {
        res.status(500).json({
            message : error.message,
            success : false
        });
    }
};