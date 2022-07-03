let { User, TestSeries } = require("../models");

module.exports.isTestSeriesSubscribed = async (req, res, next) => {
	try {
		let userId = req.user._id;
		let testSeriesId = req.params.id;
		let user = await User.findOne({ _id: userId }, { testSeries: 1 });
		let testSeries = await TestSeries.findOne(
			{ _id: testSeriesId },
			{ isPublic: 1 }
		);
		if (testSeries.isPublic || user.testSeries.includes(testSeriesId)) {
			req.body["isSubscribed"] = true;
		} else {
			req.body["isSubscribed"] = false;
		}
		next();
	} catch (err) {
		next(err);
	}
};

module.exports.isCourseSubscribed = async (req, res, next) => {
	try {
		let userId = req.user._id;
		// let userId = req.body.user; testing purpose
		let courseId = req.params.id;
		let user = await User.findById(userId);
		if (user.courses.includes(courseId)) {
			req.body["isSubscribed"] = true;
			next();
		} else {
			req.body["isSubscribed"] = false;
			res.status(403).json({
				success: false,
				message: "you need to subscribe to the course first",
			});
		}
	} catch (err) {
		next(err);
	}
};
