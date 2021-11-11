const { TestSeries, User } = require('../../../models');


module.exports.allTestSeries = async function (req, res) {
    try {
        let testSeries;
        if(req.query.exam){
            testSeries = await TestSeries.find({ 'exam':req.query.exam });
        }
        else if (req.query.subject) {
            testSeries = await TestSeries.find({ 'subject':req.query.subject });
        } else {
            testSeries = await TestSeries.find({});
        }
        let data = [];
        testSeries.forEach(element => {
            data.push({
                testSeriesId: element._id,
                name: element.name,
                image: element.bigImage,
                includes: element.includes,
                isPublic: element.isPublic
            });
        });

        res.status(200).json({
            message: 'test series fetched',
            data: data,
            success: true
        });
    } catch (error) {
        res.status(400).json({
            message: error.message,
            success: false
        });
    }
};


module.exports.testSeriesById = async function (req, res) {
    let testSeriesId = req.params.id;
    try {
        if (req.query.queryParam == 0) {

            let testSeries = await TestSeries.findOne({_id : testSeriesId}, {"name" : 1}).populate({ path: 'quizzes', select : "name Poster"});
            res.status(200).json({
                isSbuscribed : req.body.isSubscribed,
                message: 'test series fetched',
                data: testSeries,
                success: true
            });
        }
        
        // queryParam = 1 for payment page for a specific test series
        else if(req.query.queryParam == 1){
            if(!req.body.isSubscribed){
                let testSeries = await TestSeries.findById(testSeriesId).populate([{ path : 'feedbacks', populate : { path : 'user', select : 'name image' } }, { path : 'similarTestSeries', select : 'name userEnrolled bigImage' }]);
                let ratingsCount = [0, 0, 0, 0, 0];
                let totalRatings = testSeries.feedbacks.length;
                testSeries.feedbacks.forEach(feedback=>{
                    ratingsCount[5 - feedback.rating]++;
                });
                for(let i = 0;i < ratingsCount.length ; i++){
                    ratingsCount[i] = ratingsCount[i] * 100 / totalRatings;
                }
                let similarTestSeriesData = [];
                testSeries.similarTestSeries.forEach(testSeries=>{
                    let obj = {};
                    obj['testSeriesId'] = testSeries._id;
                    obj['name'] = testSeries.name;
                    obj['image'] = testSeries.bigImage;
                    obj['userEnrolled'] = testSeries.userEnrolled;
                    similarTestSeriesData.push(obj);
                });
                let testSeriesData = {};
                testSeriesData['testSeriesId'] = testSeries._id;
                testSeriesData['isPublic'] = testSeries.isPublic;
                testSeriesData['name'] = testSeries.name;
                testSeriesData['price'] = testSeries.price;
                testSeriesData['description'] = testSeries.description;
                testSeriesData['noOfQuizzes'] = testSeries.quizzes.length;
                testSeriesData['rating'] = testSeries.rating;
                testSeriesData['highlights'] = testSeries.highlights;
                testSeriesData['includes'] = testSeries.includes;
                testSeriesData['feedbacks'] = testSeries.feedbacks;
                testSeriesData['ratingPercentages'] = ratingsCount;
                testSeriesData['similarTestSeries'] = similarTestSeriesData;
                res.status(200).json({
                    isSubscribed : false,
                    data : testSeriesData,
                    message : 'payment page data fetched successfully',
                    success : true
                });
            }else{
                res.status(200).json({
                    isSubscribed : true,
                    message : 'test series already subscribed.',
                    success : true
                });
            }
            
        }
    } catch (error) {
        res.status(400).json({
            message: error.message,
            success: false
        });
    }
};



module.exports.markCompleted = async function(req, res){
    try {
        let testSeriesId = req.params.id;
        const { quizId } = req.body;

        const user = await User.findById(req.user._id);

        let flag = 0;
        user.testSeriesProgress.forEach(element => {
            if(element.testSeriesId == testSeriesId ){
                flag = 1;
                element.quizzes.push(quizId);                
            }
        });
        if(!flag){
            user.testSeriesProgress.push({
                testSeriesId:testSeriesId,
                quizzes:[quizId]
            });
        }
        await user.save();
        // user.lastCompleted = subTopicId;
        // user.totalTimeSpent += subTopic.duration;
        // const date = new Date().toLocaleString(undefined, { timeZone: 'Asia/Kolkata' }).split(',')[0];
        // let readingDuration = user.readingDuration[user.readingDuration.length - 1];
        // if(!readingDuration || !readingDuration.date == date){
        //     user.readingDuration.push({
        //         date:date,
        //         duration:subTopic.duration
        //     });
        // }else{
        //     readingDuration.duration += subTopic.duration;
        // }
        // await user.save();
        return res.status(200).json({
            success:true,
            message:'quiz marked as completed'
        });
    } catch (error) {
        console.log(error);
        return res.status(400).json({
            success:false,
            message:error.message
        });
    }
};


module.exports.testSeriesProgress = async function(req, res){
    try {
        const testSeriesId = req.params.id;
        let user = await User.findOne({_id : req.user._id}, {'testSeriesProgress' : 1});
        let testSeries = await TestSeries.findOne({_id : testSeriesId}, {"quizzes" : 1});
        const data = user.testSeriesProgress.filter(element => element.testSeriesId == testSeriesId);
        if(!data){
            return res.status(400).json({
                message : 'invalid id',
                success : false
            });
        }
        let completedQuizzes = data[0].quizzes;
        let totalQuizCount = testSeries.quizzes.length;
        return res.status(200).json({
            message : 'successfully fetched testSeries progress',
            data: {totalQuizCount, completedQuizzes},
            success:true
        });
        
    } catch (error) {
        console.log(error);
        res.status(400).json({
            message : error.message,
            success : false
        });
    }
};
