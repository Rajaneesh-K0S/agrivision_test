const {User, Course, Chapter, Topic, SubTopic, TestSeries, Package, Event}  = require("../../../models");
const {getLocalTimeString} = require("../../../utils");

module.exports.addReminder = async function(req, res){
    try {
        let user = await User.findById(req.user._id);
        let reminder = {
            task:req.body.task,
            date:req.body.date
        };
        user.reminder.push(reminder);
        await user.save();
        return res.status(200).json({
            success:true,
            message:'reminder added successfully'
        });
    } catch (error) {
        return res.status(500).json({
            success:false,
            message: error.message
        });
    }
};

module.exports.getReminder = async function(req, res){
    try {
        let user = await User.findById(req.user._id);
        const data = user.reminder;
        return res.status(200).json({
            data:data,
            success:true
        });
    } catch (error) {
        res.status(500).json({
            message : error.message,
            success : false
        });
    }
};


module.exports.getUserProgress = async function(req, res){
    try {
        let user = await User.findById(req.user._id);
        let todayDate = getLocalTimeString(new Date());
        let testsCompleted= 0, totalTimeSpent = 0;
        user.readingDuration.forEach(dur=>{
            totalTimeSpent += (dur.duration)?(dur.duration):0;
            totalTimeSpent += (dur.watchDuration)?(dur.watchDuration):0;
        })
        user.testDuration.forEach(dur=>{
            testsCompleted += (dur.testsCompleted)?(dur.testsCompleted):0;
            totalTimeSpent += (dur.duration)?(dur.duration):0;
        })
        const data = {
            readingDuration:user.readingDuration,
            testDuration:user.testDuration,
            minutesGoal:user.minutesGoal,
            readingGoal:user.readingGoal,
            currentStreakDay:user.currentStreakDay,
            longestStreakDay:user.longestStreakDay,
        };
        data['testsCompleted'] = testsCompleted;
        data['totalTimeSpent'] = totalTimeSpent;
        if(user.readingDuration.filter(obj=> obj.date == todayDate).length){
            data['todayReadingDuration'] = user.readingDuration.filter(obj=> obj.date == todayDate)[0].duration;
        }else{
            data['todayReadingDuration'] = 0;
        }
        if(user.testDuration.filter(obj=> obj.date == todayDate).length){
            data['todayTestCompleted'] = user.testDuration.filter(obj=> obj.date == todayDate)[0].testsCompleted;
        }else{
            data['todayTestsCompleted'] = 0;
        }
        let lastCompletedSubTopic = user.lastCompleted;
        let topic = await Topic.findOne({"subTopics" : lastCompletedSubTopic}, {"_id" : 1});
        let chapter = await Chapter.findOne({"topics" : topic._id}, {"_id" : 1});
        let course = await Course.findOne({"chapters" : chapter._id}, {"_id" : 1});
        let lastCompleted = {courseId : course._id, chapterId : chapter._id, topicId : topic._id, subTopicId : lastCompletedSubTopic};
        data['lastCompleted'] = lastCompleted;
        return res.status(200).json({
            data:data,
            success:true
        });
    } catch (error) {
        res.status(500).json({
            message : error.message,
            success : false
        });
    }
};


module.exports.getSchedule = async (req, res)=>{
    try{
        let userCourses = req.user.courses;
        let todayDate = getLocalTimeString(new Date());
        console.log(todayDate);
        let events = await Event.find({date: todayDate});
        console.log(events);
        let data = [];
        userCourses.forEach(courseId=>{
            let courseEvents = events.filter(obj=> obj.relatedCourses.includes(courseId));
            data = data.concat(courseEvents);
        })
        let allEvents = events.filter(obj=> obj.eventForAll == true);
        data = data.concat(allEvents);
        console.log(data);
        data = Array.from(new Set(data));
        data.forEach((event, i)=>{
            event = event.toJSON();
            let startDate = new Date(event.startTime);
            let endDate = new Date(event.endTime);
            event.startTime = startDate.getTime();
            event.endTime = endDate.getTime();
            data[i] = event;
        })
        res.status(200).json({
            data,
            message : "successfully fetched events data",
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

module.exports.setGoal = async (req, res)=>{
    try{
        let {readingGoal, watchingGoal} = req.body;
        let userId = req.user._id;
        if(readingGoal){
            await User.updateOne({_id : userId}, {readingGoal});
        }
        if(watchingGoal){
            await User.updateOne({_id : userId}, {minutesGoal:watchingGoal});
        }
        res.status(200).json({
            message : "Successfully updated goals",
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
