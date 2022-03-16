const { Coupen, CoupenType, Course, TestSeries, Package } = require('../../../models');
const { findDiscount } = require('../../../utils/index')

let checkIsCoupenAvailable = async (itemType, itemId, availableItems) => {
    try {
        let isCoupenAvailable = false;
        if (itemType == 0) {
            if (availableItems.courses.includes(itemId)) {
                isCoupenAvailable = true;
            }
        } else if (itemType == 1) {
            if (availableItems.testSeries.includes(itemId)) {
                isCoupenAvailable = true;
            }
        } else if (itemType == 2) {
            if (availableItems.packages.includes(itemId)) {
                isCoupenAvailable = true;
            }
        }
        return isCoupenAvailable;
    }
    catch (err) {
        throw new Error(err.message);
    }
}


// let generateUniqueCoupenCode = (coupenType, email)=>{
//     return coupenType + email.split('@')[0].toUpperCase();
// }



module.exports.generateCoupen = async (req, res) => {
    let userId = req.user._id;
    let { coupenTypeId } = req.body; 
    let coupenCode;
    try {
        let coupen = await Coupen.findOne({genUserId : userId, type : coupenTypeId}).populate({path : 'type', select : 'name'});
        if(coupen){
            coupenCode = coupen.code;
        }else{
            let coupenType = await CoupenType.findOne({_id : coupenTypeId}, {"name" : 1});
            // coupenCode = generateUniqueCoupenCode(coupenType.name, req.user.email);
            let coupens = await Coupen.find({type : coupenTypeId}, {"_id" : 1});
            coupenCode = "HOLI" + coupens.length + "UPTO1000"
            let coupen = new Coupen({
                name : coupenCode,
                genUserId : userId,
                type : coupenTypeId,
                code : coupenCode
            })
            await coupen.save();
        }
        res.status(200).json({
            coupenCode,
            message: "Successfully Generated Coupen Code.",
            success: true
        })
    }
    catch (err) {
        res.status(500).json({
            message: err.message,
            success: false
        })
    }
}

module.exports.useCoupen = async (req, res) => {
    let userId = req.user._id;
    // let userId = "616a53997a55120016824f32";
    let { coupenCode } = req.body;
    try {
        let isCoupen = false;
        let msg = '';
        let discount = null;
        let itemType = req.query.item;
        let itemId = req.query.itemId;
        let coupen = await Coupen.findOne({ code: coupenCode }).populate({ path: 'type' });
        if (coupen) {
            availableItems = { courses: coupen.type.courses, testSeries: coupen.type.testSeries, packages: coupen.type.packages }
            let isCoupenAvailable = await checkIsCoupenAvailable(itemType, itemId, availableItems);
            if (isCoupenAvailable) {
                if (coupen.type.category == 0) {
                    if (coupen.type.expiryDate.getTime() > Date.now()) {
                        discount = findDiscount(coupen.type.receiverDiscount);
                        isCoupen = true;
                        msg = "Successfully applied discount."
                    } else {
                        msg = "Coupen has expired."
                    }
                } else {
                    if (coupen.genUserId.toString() != userId.toString()) {
                        if (coupen.type.expiryDate.getTime() > Date.now()) {
                            discount = findDiscount(coupen.type.receiverDiscount);
                            isCoupen = true;
                            msg = "Successfully applied discount."
                        } else {
                            msg = "Coupen has expired."
                        }
                    } else {
                        msg = "You cannot use your own Coupen."
                    }
                }
            } else {
                msg = "This coupen is not valid on current item."
            }
        } else {
            msg = "Coupen is not valid."
        }
        res.status(200).json({
            isCoupen,
            discount,
            message: msg,
            success: true
        })
    }
    catch (err) {
        res.status(500).json({
            message: err.message,
            success: false
        })
    }
}


