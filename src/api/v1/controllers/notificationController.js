const { Notification } = require('../../../models/');

module.exports.allnotifications = async function (req, res) {
    try {
        let userId = req.user._id;
        let presentTime = Math.floor(Date.now() / 1000);
        let expectedTime = presentTime - 7 * 24 * 3600;
        let allNotif = await Notification.find({ createdat: { $gte: expectedTime } });
        let userNotif = [];
        let userCourses = req.user.courses;
        let userTestSeries = req.user.testSeries;
        let userQuizzes = req.user.completedQuizes;
        userCourses.forEach(courseId=>{
            let courseNotif = allNotif.filter(obj=> obj.relatedCourses.includes(courseId));
            userNotif = userNotif.concat(courseNotif);
        })
        userTestSeries.forEach(testSeriesId=>{
            let testSeriesNotif = allNotif.filter(obj=> obj.relatedTestSeries.includes(testSeriesId));
            userNotif = userNotif.concat(testSeriesNotif);
        })
        userQuizzes.forEach(quizId=>{
            let quizNotif = allNotif.filter(obj=> obj.relatedQuizzes.includes(quizId));
            userNotif = userNotif.concat(quizNotif);
        })
        userSpecificNotif = allNotif.filter(obj=> obj.relatedUsers.includes(userId));
        userNotif = userNotif.concat(userSpecificNotif);
        let generalNotif = allNotif.filter(obj=> obj.notificationForAll == true);
        userNotif = userNotif.concat(generalNotif);
        userNotif = Array.from(new Set(userNotif));
        userNotif.forEach((notif, i)=>{
            notif = notif.toJSON();
            delete notif.relatedCourses;
            delete notif.relatedTestSeries;
            delete notif.relatedQuizzes;
            delete notif.relatedUsers;
            delete notif.notificationForAll;
            userNotif[i] = notif;
        })
        res.status(200).json({
            message: 'All valid notifications found ',
            data: userNotif,
            success: true
        });
    }
    catch (error) {
        res.status(500).json({
            message: error.message,
            success: false
        });
    }
};



