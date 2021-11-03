const {Coupen, Course, TestSeries, Package} = require('../../../models');

let findCoupenId = async (item, itemId) => {
    let coupenId = '';
    try{ 
        if(item == 0){
            let course = await Course.findOne({_id : itemId}, {'shareAndEarnCoupen' : 1});
            coupenId = course.shareAndEarnCoupen;
        }else if(item == 1){
            let testSeries = await TestSeries.findOne({_id : itemId}, {'shareAndEarnCoupen' : 1});
            coupenId = testSeries.shareAndEarnCoupen;
        }else if(item == 2){
            let package = await Package.findOne({_id : itemId}, {'shareAndEarnCoupen' : 1});
            coupenId = package.shareAndEarnCoupen;
        }
        return coupenId;
    }
    catch(err){
        throw new Error(err.message);
    }
   
    
}

module.exports.createReferralLink = async (req, res) => {
    let userId = req.user._id;
    let {item, itemId} = req.query; // item = 0 for course, 1 for testSeries, 2 for package
    try{
        let coupenId = await findCoupenId(item, itemId);
        let isCoupen = false;
        let msg = '';
        let referralData = {};
        if(coupenId){
            let coupen = await Coupen.findOne({_id : coupenId});
            if(coupen.type == 1 && coupen.active){
                if(!coupen.generatedUsers.has(userId.toString())){
                    coupen.generatedUsers.set(userId, coupen.noOfReferralsReq);
                    await coupen.save();
                }
                referralData = {userId, coupenId};
                isCoupen = true;
                msg = 'successfully generated referral link.'
            }else{
                isCoupen = false;
                msg = 'Coupen is not valid or has expired.'
            }
        }else{
            isCoupen = false;
            msg = 'Coupen is not active on this item.'
        }

        res.status(200).json({
            isCoupen,
            referralData,
            message : msg,
            success : true
        })
    }
    catch(err){
        console.log(err);
        res.status(500).json({
            message : err.message,
            success : false
        })
    }
}

module.exports.useReferralLink = async (req, res) => {
    let userId = req.user._id;
    // let userId = "616a53997a55120016824f32";
    let {item, itemId} = req.query;
    let {generator, coupen}= req.body;
    try{
        let isCoupen = false;
        let msg = '';
        let discount = null;
        if(generator != userId){
            let coupenId = await findCoupenId(item, itemId);
            if(coupen == coupenId){
                let coup = await Coupen.findById(coupenId);
                if(coup.type == 1 && coup.active){
                    discount = coup.receiverDiscount;
                    isCoupen = true;
                    msg = "successfully applied discount.";
                }else{
                    isCoupen = false;
                    msg = "Coupen is not valid or has expired.";
                }
            }else{
                isCoupen = false;
                msg = "Coupen not matched."
            }
        }else{
            isCoupen = false;
            msg = "You cannot use your own referral link.";
        }
        res.status(200).json({
            isCoupen,
            discount,
            message : msg,
            success : true
        })
    }
    catch(err){
        res.status(500).json({
            message : err.message,
            success : false
        })
    }
}


module.exports.applyDiscountForGeneratorUser = async (req, res) => {
    let userId = req.user._id;
    let {item, itemId} = req.query;
    try{
        let isCoupen = false;
        let msg = '';
        let discount = null;
        let coupenId = await findCoupenId(item, itemId);
        if(coupenId){
            let coupen = await Coupen.findById(coupenId);
            if(coupen.type == 1 && coupen.active){
                if(coupen.generatedUsers.has(userId.toString())){
                    let val = coupen.generatedUsers.get(userId);
                    if(val == 0){
                        let discount = coupen.generatorDiscount;
                        isCoupen = true;
                        msg = "successfully applied discount."
                    }else{
                        isCoupen = false;
                        msg = "You have not completed the number of referrals."
                    }
                }else{
                    isCoupen = false;
                    msg = "You have not generated the referral link yet."
                }
            }else{
                isCoupen = false;
                msg = "Coupen is not valid or has expired."
            }
            
        }else{
            isCoupen = false;
            msg = "Coupen is not active on this item.";
        }

        res.status(200).json({
            isCoupen,
            discount,
            message : msg,
            success : true
        })
    }
    catch(err){
        res.status(500).json({
            message : err.message,
            success : false
        })
    }
}