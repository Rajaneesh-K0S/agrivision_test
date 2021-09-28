const { Course, Chapter, SubTopic } = require('../../../models');
const { mdToStringConverter } = require('../../../config/mdToString');

module.exports.allCourse = async function (req, res) {
    try {
        let courses;
        if (req.query) {
            courses = await Course.find(req.query);
        } else {
            courses = await Course.find({});
        }
        let data = [];
        courses.forEach(element => {
            data.push({
                courseId: element._id,
                name: element.name,
                image: element.image,
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
        }//queryParam = 1 for topic and subtopic list of a specific chapter( Desktop11 in figma). 
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


