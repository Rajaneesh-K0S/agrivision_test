let {User} = require("../models");

module.exports.isTestSeriesSubscribed = async (req, res, next) => {
    let userId = req.user._id;
    let testSeriesId = req.params.id;
    let user = await User.findOne({_id : userId}, {'testSeries' : 1});
    if(user.testSeries.includes(testSeriesId)){
        req.body['isSubscribed'] = true;
    }
    else{
        req.body['isSubscribed'] = false;
    }
    next();
}