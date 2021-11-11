let {User, TestSeries} = require("../models");

module.exports.isTestSeriesSubscribed = async (req, res, next) => {
    let userId = req.user._id;
    let testSeriesId = req.params.id;
    let user = await User.findOne({_id : userId}, {'testSeries' : 1});
    let testSeries = await TestSeries.findOne({_id : testSeriesId}, {isPublic : 1});
    if(testSeries.isPublic || user.testSeries.includes(testSeriesId)){
        req.body['isSubscribed'] = true;
    }
    else{
        req.body['isSubscribed'] = false;
    }
    next();
}