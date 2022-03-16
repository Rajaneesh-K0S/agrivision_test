const Razorpay = require('razorpay');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { User, Course, TestSeries, Package, Coupen, ReferralData, Article } = require('../../../models');
const { generateRandomToken, findDiscount } = require('../../../utils/index');
const transporter = require('../../../config/nodemailer');
let mongoose = require('mongoose');

let returnIndividualPrice = async (item, type) => {
    try {
        let price = 0;
        if (type == 0) {
            let course = await Course.findOne({ _id: item }, { "price": 1 });
            price += course.price;
        }
        else if (type == 1) {
            let testSeries = await TestSeries.findOne({ _id: item }, { "price": 1 });
            price += testSeries.price;
        }
        else if (type == 2) {
            let package = await Package.findOne({ _id: item }, { "price": 1 });
            price += package.price;
        }
        else if (type == 3) {
            let subscription = item.subscription;
            let profession = item.profession;
            if (subscription == "single") {
                if (profession == 0)
                    price += 100;
                else if (profession == 1)
                    price += 125;
                else if (profession == 2)
                    price += 150;
            }
            else {
                if (profession == 0)
                    price += 250;
                else if (profession == 1)
                    price += 450;
                else if (profession == 2)
                    price += 500;
            }
        }
        return price;
    }
    catch (err) {
        throw err;
    }
}

let calculatePaymentAmount = async (entities) => {
    try {
        let entityLength = entities.length;
        let totalAmount = 0;
        for (let i = 0; i < entityLength; i++) {
            let entity = entities[i];
            if (entity.type == 3) {
                totalAmount += await returnIndividualPrice(entity.item, entity.type);
            } else {
                if (entity.itemIds) {
                    let itemsLength = entity.itemIds.length;
                    for (let j = 0; j < itemsLength; j++) {
                        let item = entity.itemIds[j];
                        totalAmount += await returnIndividualPrice(item, entity.type);
                    }
                }
            }
            // bug if multiple items bought and discount is flat then it does not apply for each item.
            if (entity.type == 4) {
                let coupen = await Coupen.findOne({ code: entity.item.coupenCode }).populate({ path: 'type', select: 'receiverDiscount' });
                let disc = findDiscount(coupen.type.receiverDiscount);
                totalAmount -= (disc.discountType == 0) ? (Math.ceil((totalAmount * disc.discount) / 100)) : (disc.discount);
            }
        }
        return totalAmount;
    }
    catch (err) {
        throw err;
    }
}

let pushReferralData = async (disc, itemIds, itemType, userId) => {
    let completedReferrals = [];
    for(let i =0; i<itemIds.length; i++){
        let price = await returnIndividualPrice(itemIds[i], itemType);
        let generatorExpectedAmount = (disc.discountType == 0) ? (Math.ceil((price * disc.discount) / 100)) : (disc.discount);
            completedReferrals.push({
            _id : new mongoose.Types.ObjectId(),
            date: new Date(),
            referredUserId: userId,
            itemType: itemType,
            itemId: itemIds[i],
            itemPrice: price,
            expectedPayment: generatorExpectedAmount
        })
    }
    return completedReferrals;
}




let shareAndEarnPostCalc = async (coupenCode, userId, courseIds, testSeriesIds, packageIds) => {
    try {
        if (coupenCode) {
            let coupen = await Coupen.findOne({ code: coupenCode }).populate({ path: 'type', select: 'generatorDiscount category' });
            if (coupen.type.category == 1) {
                let disc = findDiscount(coupen.type.generatorDiscount);
                let currentCompRefs = [];
                let temp = await pushReferralData(disc, courseIds, 0, userId);
                currentCompRefs = currentCompRefs.concat(temp);
                temp = await pushReferralData(disc, testSeriesIds, 1, userId);
                currentCompRefs = currentCompRefs.concat(temp);
                temp = await pushReferralData(disc, packageIds, 2, userId);
                currentCompRefs = currentCompRefs.concat(temp);
                coupen.completedReferrals = coupen.completedReferrals.concat(currentCompRefs)
                await coupen.save();
            }
        }
    } catch (err) {
        throw new Error(err);
    }

}


module.exports.order = async (req, res) => {

    try {
        let userId = req.user._id.toString();
        let { courseIds, testSeriesIds, packageIds, origin, shareAndEarn, articlePayment } = req.body;
        let courseIdString = "", testSeriesIdString = "", packageIdString = "", shareAndEarnString = "", articleString = "", articleSubscriptionType = "";
        let paymentAmount = 0;
        let entities = [{ itemIds: courseIds, type: 0 }, { itemIds: testSeriesIds, type: 1 }, { itemIds: packageIds, type: 2 }];
        if (articlePayment) {
            articleString = articlePayment.articleFilePath.toString();
            articleSubscriptionType = articlePayment.subscriptionType;
            articleString = generateRandomToken(articleString);
            entities.push({ item: { subscription: articlePayment.subscriptionType, profession: articlePayment.profession }, type: 3 });
        }
        if (shareAndEarn) {
            shareAndEarnString =  shareAndEarn.coupenCode.toString();
            entities.push({ item: shareAndEarn, type: 4 });
        }

        paymentAmount += await calculatePaymentAmount(entities);

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
            amount: paymentAmount * 100,
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
        console.log(error);
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
        if(shareAndEarnString){
            await shareAndEarnPostCalc(shareAndEarnString, userId, courseIds, testSeriesIds, packageIds);
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