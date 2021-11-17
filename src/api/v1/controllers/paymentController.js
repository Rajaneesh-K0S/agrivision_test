const Razorpay = require('razorpay');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { User, Package, Coupen, Article } = require('../../../models');
const { generateRandomToken } = require('../../../utils/index');
const transporter = require('../../../config/nodemailer');




module.exports.order = async (req, res) => {
    let userId = req.user._id.toString();
    let { courseIds, testSeriesIds, packageIds, origin, shareAndEarn, articlePayment } = req.body;
    let courseIdString = "", testSeriesIdString = "", packageIdString = "", shareAndEarnString = "", articleString = "", articleSubscriptionType = "";
    if (shareAndEarn) {
        shareAndEarnString = shareAndEarn.case.toString() + '$' + shareAndEarn.generator.toString() + '$' + shareAndEarn.coupenId.toString();
    }
    if (articlePayment) {
        articleString = articlePayment.articleFilePath.toString();
        articleSubscriptionType = articlePayment.subscriptionType
    }
    articleString = generateRandomToken(articleString);
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
                "userId": userId,
                "shareAndEarn": shareAndEarnString,
                "articlePayment": articleString,
                "articleSubscriptionType": articleSubscriptionType
            }
        };

        const order = await instance.orders.create(options);
        if (!order) {
            return res.status(500).json({
                message: "some error occurred!",
                success: false
            });
        }

        res.status(200).json({
            message: "successfully created order",
            body: order,
            success: true
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
            success: false
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
        let shareAndEarnString = req.body.payload.payment.entity.notes.shareAndEarn;
        let articlePaymentString = req.body.payload.payment.entity.notes.articlePayment;
        let articleSubscriptionType = req.body.payload.payment.entity.notes.articleSubscriptionType;
        if (articlePaymentString) {
            jwt.verify(articlePaymentString, process.env.JWT_SECRET, (err, decodedToken) => {
                if (err) {
                    console.log(err);
                }
                else {
                    articlePaymentString = decodedToken.article;
                }
            })
        }
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
        if (courseIds.length) {
            await User.updateOne({ _id: userId }, { '$push': { 'courses': { '$each': courseIds } } });
        }
        if (testSeriesIds.length) {
            await User.updateOne({ _id: userId }, { '$push': { 'testSeries': { '$each': testSeriesIds } } });
        }
        if (packageIds.length) {
            await User.updateOne({ _id: userId }, { '$push': { 'packages': { '$each': packageIds } } });
            for (let i = 0; i < packageIds.length; i++) {
                let pack = await Package.findOne({ _id: packageIds[i] }, { "courses": 1, "testSeries": 1 });
                await User.updateOne({ _id: userId }, { '$push': { 'courses': { '$each': pack.courses } } });
                await User.updateOne({ _id: userId }, { '$push': { 'testSeries': { '$each': pack.testSeries } } });
            }
        }
        if (origin == 1) {
            if (courseIds.length) {
                await User.updateOne({ _id: userId }, { '$pullAll': { 'cart.courses': courseIds } });
            }
            if (testSeriesIds.length) {
                await User.updateOne({ _id: userId }, { '$pullAll': { 'cart.testSeries': testSeriesIds } });
            }
            if (packageIds.length) {
                await User.updateOne({ _id: userId }, { '$pullAll': { 'cart.packages': packageIds } });
            }
        }

        let articlePath = "";
        if (articlePaymentString) {
            articlePath = articlePaymentString;
        }

        if (articlePath) {
            let articlesRem = (articleSubscriptionType == 'single') ? (0) : 3;
            let article = new Article({ author: userId });
            await article.save();
            let user = await User.findById(userId);
            user.articlesRemaining = articlesRem;
            await user.save();
            let html = `Author Name : ${user.name[0] + user.name[1]}<br>Article ID : ${article._id}`
            let mailOptions = {
                from: process.env.SMTP_EMAIL,
                to: process.env.EDITOR_EMAIL,
                subject: `Article for review`,
                html: html,
                attachments: [{
                    path: articlePath
                }]
            };
            await transporter.sendMail(mailOptions);
        }
        let orderId = req.body.payload.payment.entity.order_id;
        let amount = req.body.payload.payment.entity.amount / 100;

        let paymentDetails = { courseIds, testSeriesIds, packageIds, orderId, time: Date.now(), amount }
        await User.updateOne({ _id: userId }, { '$push': { 'paymentHistory': paymentDetails } });

        if (shareAndEarnString) {
            let arr = shareAndEarnString.split('$');
            let generatorId = arr[1];
            let coupenId = arr[2];
            let coupen = await Coupen.findById(coupenId);
            if (arr[0] == 1) {       // 0 for generator, 1 for receiver.
                let val = coupen.generatedUsers.get(generatorId.toString());
                val -= 1;
                coupen.generatedUsers.set(generatorId, val);
                await coupen.save();
            } else if (arr[0] == 0) {
                coupen.generatedUsers.delete(generatorId);
                await coupen.save();
            } else if (arr[0] == 2) {
                let val = coupen.noOfRedeems;
                val -= 1;
                coupen.noOfRedeems = val;
                if (val == 0) {
                    coupen.active = false;
                }
                await coupen.save();
            }
        }
        res.status(200).json({
            msg: 'success',
            orderId
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: error.message,
            success: false
        });
    }
};