const { Course, Chapter, SubTopic, User } = require('../../../models');
const { mdToStringConverter } = require('../../../config/mdToString');

module.exports.allCourse = async function (req, res) {
    try {
        let courses;
        if(req.query.exam){
            courses = await Course.find({ 'exam':req.query.exam });
        }
        else if (req.query.subject) {
            courses = await Course.find({ 'subject':req.query.subject });
        } else {
            courses = await Course.find({});
        }
        let data = [];
        courses.forEach(element => {
            data.push({
                courseId: element._id,
                name: element.name,
                image: element.bigImage,
                duration: element.duration,
                chapters: element.chapters,
                fullTests: element.fullTests
            });
        });

        res.status(200).json({
            message: 'courses fetched',
            data: data,
            success: true
        });
    } catch (error) {
        res.status(400).json({
            message: error,
            success: false
        });
    }
};


module.exports.courseById = async function (req, res) {
    try {
        //queryParam = 0 for chapters and topics only(Desktop25 in figma)
        if (req.query.queryParam == 0) {
            let course = await Course.findById(req.params.id).populate({ path: 'chapters', populate: { path: 'topics', select: 'name' } });
            res.status(200).json({
                message: 'course fetched',
                data: course,
                success: true
            });
        }
        
        //queryParam = 1 for topic and subtopic list of a specific chapter( Desktop11 in figma). 
        //Also specify anothery query parameter named "chapterID" which contains the id of the required chapter.
        else if (req.query.queryParam == 1) {
            let courseId = req.params.id;
            let chapterId = req.query.chapterID;
            let course = await Course.find({ _id: courseId }, { 'name': 1 });
            let allChapters = await Chapter.find({}, { 'name' : 1 });
            let chapter = await Chapter.findById(chapterId).populate({ path: 'topics', populate: { path: 'subTopics', select: 'name' } });
            res.status(200).json({
                message: 'course fetched',
                data: { course, allChapters, chapter },
                success: true
            });
        }
        // queryParam = 2 for payment page for a specific course
        else if(req.query.queryParam == 2){
            let courseId = req.params.id;
            let course = await Course.findById(courseId).populate([{ path : 'feedbacks', populate : { path : 'user', select : 'name image' } }, { path : 'similarCourses', select : 'name userEnrolled image chapters fullTests' }]);
            let ratingsCount = [0, 0, 0, 0, 0];
            let totalRatings = course.feedbacks.length;
            course.feedbacks.forEach(feedback=>{
                ratingsCount[5 - feedback.rating]++;
            });
            for(let i = 0;i < ratingsCount.length ; i++){
                ratingsCount[i] = ratingsCount[i] * 100 / totalRatings;
            }
            let similarCourseData = [];
            course.similarCourses.forEach(course=>{
                let obj = {};
                obj['courseId'] = course._id;
                obj['name'] = course.name;
                obj['image'] = course.bigImage;
                obj['userEnrolled'] = course.userEnrolled;
                obj['chapterCount'] = course.chapters.length;
                obj['fullTestCount'] = course.fullTests.length;
                similarCourseData.push(obj);
            });
            let courseData = {};
            courseData['courseId'] = course._id;
            courseData['name'] = course.name;
            courseData['price'] = course.price;
            courseData['chapterCount'] = course.chapters.length;
            courseData['fullTestCount'] = course.fullTests.length;
            courseData['description'] = course.description;
            courseData['rating'] = course.rating;
            courseData['highlights'] = course.highlights;
            courseData['feedbacks'] = course.feedbacks;
            courseData['ratingPercentages'] = ratingsCount;
            courseData['similarCourses'] = similarCourseData;
            res.status(200).json({
                data : courseData,
                message : 'payment page data fetched successfully',
                success : true
            });
        }
    } catch (error) {
        res.status(400).json({
            message: error,
            success: false
        });
    }
};


// to get the content of a subtopic 

module.exports.subTopics = async (req, res) => {
    let subTopicId = req.params.id;
    try {
        let subTopic = await SubTopic.findById(subTopicId).populate('quiz');
        if (subTopic.contentType == 0) {
            let stringData = await mdToStringConverter(subTopic.content);
            res.status(200).json({
                data: stringData,
                message: 'pdf data fetched successfully.',
                success: 'true'
            });
        }
        else if (subTopic.contentType == 2) {
            let quizData = subTopic.quiz;
            res.status(200).json({
                data: quizData,
                message: 'Quiz data fetched successfully.',
                success: 'true'
            });
        }
    }
    catch (error) {
        res.status(400).json({
            message: error,
            success: 'false'
        });
    }
};



module.exports.markCompleted = async function(req, res){
    try {
        let courseId = req.params.id;
        const { subTopicId, chapterId } = req.body;

        const user = await User.findById(req.user._id);

        const subTopic = await SubTopic.findById(subTopicId);
        let flag = 0;
        user.courseProgress.forEach(element => {
            if(element.courseId == courseId && element.chapterId == chapterId){
                flag = 1;
                element.subTopics.push(subTopicId);                
            }
        });
        if(!flag){
            user.courseProgress.push({
                courseId:courseId,
                chapterId:chapterId,
                subTopics:[subTopicId]
            });
        }
        await user.save();
        user.lastCompleted = subTopicId;
        user.totalTimeSpent += subTopic.duration;
        const date = new Date().toLocaleString(undefined, { timeZone: 'Asia/Kolkata' }).split(',')[0];
        let readingDuration = user.readingDuration[user.readingDuration.length - 1];
        if(!readingDuration || !readingDuration.date == date){
            user.readingDuration.push({
                date:date,
                duration:subTopic.duration
            });
        }else{
            readingDuration.duration += subTopic.duration;
        }
        await user.save();
        return res.status(200).json({
            success:true,
            message:'subtopic marked as completed'
        });
    } catch (error) {
        console.log(error);
        return res.status(400).json({
            success:false,
            message:'something went wrong'
        });
    }
};


module.exports.courseProgress = async function(req, res){
    try {
            const courseId = req.params.id;
            let course = await Course.findOne({ _id : courseId}, {"totalSubTopics" : 1});
            let user = await User.findById(req.user._id);
            const data = user.courseProgress.filter(element => element.courseId == courseId);
            if(!data){
                return res.status(400).json({
                    message : 'invalid id',
                    success : false
                });
            }
            let chapterWiseProgress = [];
            let totalCompletedSubtopics = 0;
            for(let i=0 ;i< data.length ;i++) {
                totalCompletedSubtopics += data[i].subTopics.length;
                let chapter = await Chapter.findOne({_id : data[i].chapterId}, {"totalSubTopics" : 1});
                console.log(chapter);
                let obj = {};
                obj['chapterId'] = data[i].chapterId;
                obj['completedSubtopics'] = data[i].subTopics.length;
                obj['totalSubtopics'] = chapter.totalSubTopics;
                console.log(obj);
                chapterWiseProgress.push(obj);
            }
            let courseProgress = {};
            courseProgress['completedSubtopics'] = totalCompletedSubtopics;
            courseProgress['totalSubtopics'] = course.totalSubTopics;
            return res.status(200).json({
                message : "successfully fetched course progress",
                data: {courseProgress, chapterWiseProgress},
                success:true
            });
        
    } catch (error) {
        console.log(error);
        res.status(400).json({
            message : 'something went wrong',
            success : false
        });
    }
};
