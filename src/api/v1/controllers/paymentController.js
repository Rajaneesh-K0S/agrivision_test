const Razorpay = require('razorpay');
const crypto = require('crypto');
const { User } = require('../../../models');




module.exports.order = async (req, res) => {
    let {courseIds, testSeriesIds, origin} = req.body;
    let courseIdString = courseIds.join('$');
    let testSeriesIdString = testSeriesIds.join('$');

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
                "origin": origin    // 0 for buy now, 1 for checkout
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
       
        const {
            orderCreationId,
            razorpayPaymentId,
            razorpayOrderId,
            razorpaySignature,
        } = req.body;


        console.log(req.body);
     
        const shasum = crypto.createHmac('sha256', process.env.RAZORPAY_SECRET);

        shasum.update(`${orderCreationId}|${razorpayPaymentId}`);

        const digest = shasum.digest('hex');

        // comparing our digest with the actual signature
        if (digest !== razorpaySignature)
            return res.status(400).json({ msg: 'Transaction not legit!' });

        console.log(req.body.payload.payment);    

        let userEmail = req.body.payload.payment.entity.email;
        let courseIdString = req.body.payload.payment.entity.courseId;
        let testSeriesIdString = req.body.payload.payment.entity.testSeriesId;
        let origin = req.body.payload.payment.entity.origin;
        let courseIds = courseIdString.split('$');
        let testSeriesIds = testSeriesIdString.split('$');
        await User.updateOne({email : userEmail}, {'$push' : {courses : {'$each' :courseIds}, testSeries : {'$each' : testSeriesIds}}});
        if(origin == 1){
            await User.updateOne({email : userEmail}, {'$pull' : {'cart.courses' : {'$each' : courseIds}, 'cart.courses' : {'$each' : testSeriesIds}}});
        }
        let order_id = orderCreationId;
        let payment_id =  razorpayPaymentId;
        let amount = req.body.payload.payment.entity.amount / 100;
        let package_id = req.body.payload.payment.entity.description;
           

        // curr_user.payment_history.unshift({ package_id, order_id, payment_id, time:Date.now(), amount });
        // let paymentDetails = {courseIds, testSeriesIds, orderId : orderCreationId, paymentId : razorpayPaymentId, time : Date.now(), amount}
        // await User.updateOne({email : userEmail}, {'$push' : {'paymentHistory' : paymentDetails}});

        res.json({
            msg: 'success',
            orderId: razorpayOrderId,
            paymentId: razorpayPaymentId,
        });
    } catch (error) {
        res.status(500).send(error);
    }
};