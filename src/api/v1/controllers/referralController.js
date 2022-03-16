const { User, Coupen, Course, TestSeries, Package } = require('../../../models');

let findItemName = async (itemType, itemId) => {
    let itemName = "";
    if(itemType == 0){
        let course = await Course.findOne({_id : itemId}, {"name" : 1});
        itemName = course.name;
    }
    if(itemType == 1){
        let testSeries = await TestSeries.findOne({_id : itemId}, {"name" : 1});
        itemName = testSeries.name;
    }
    if(itemType == 2){
        let package = await Package.findOne({_id : itemId}, {"name" : 1, "type" : 1});
        let suffix = "";
        if(package.type == 0){
            suffix = " MEGA";
        }else if(package.type == 1){
            suffix = " MICRO";
        }else if(package.type == 2){
            suffix = " NANO";
        }else if(package.type == 3){
            suffix = " CRASH COURSE";
        }else if(package.type == 4){
            suffix = " NUCLEUS";
        }
        itemName = package.name + suffix;
    }
    return itemName;
}


module.exports.getReferralData = async (req, res) => {
    try {
        let userId = req.user._id;
        let coupens = await Coupen.find({ genUserId: userId }).populate({path : 'type', select : '_id'});
        let data = [];
        for (let i = 0; i < coupens.length; i++) {
            let completedReferrals = coupens[i].completedReferrals;
            for (let i = 0; i < completedReferrals.length; i++) {
                let tempObj = completedReferrals[i].toJSON();
                let referre = await User.findOne({ _id: tempObj.referredUserId }, { "name": 1 });
                tempObj.referreName = referre.name[0] + " " + referre.name[1];
                tempObj.itemName = await findItemName(tempObj.itemType, tempObj.itemId);
                completedReferrals[i] = tempObj;
            }
            data = data.concat(completedReferrals);
        }

        res.status(200).json({
            success: true,
            data: {
                referralData : data,
                coupenTypeId : coupens[0].type._id
            },
            message: "successfully fetched referral data."
        })
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        })
    }
}




module.exports.redeemCashback = async (req, res) => {
    try{
        let userId = req.user._id;
        const { referralDataId } = req.body;
        const coupen = await Coupen.findOne({genUserId : userId});
        let stat = 3;
        if(referralDataId.length > 1){
            stat = 5;
        }
        referralDataId.forEach(refId=>{
            coupen.completedReferrals.forEach(ref=>{
                if(ref._id == refId){
                    ref.status = stat;
                }
            })
        })
        
        await coupen.save();
        res.status(200).json({
            success: true,
            message: "Redeem Requested successfully.Our team will verify your referral and will be giving you your expected cashback in 24 Hrs.Thankyou!!!"
        })
    }
    catch(err){
        res.status(500).json({
            success : false,
            message : err.message
        })
    }
}