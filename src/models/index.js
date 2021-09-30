module.exports.User = require('./user');

module.exports.Magazine = require('./magazine');
module.exports.Article = require('./article');

module.exports.QuizCollection = require('./quiz');


let exportedCourseObject = require('./courses/course');
module.exports.Course = exportedCourseObject.Course;
module.exports.Review = exportedCourseObject.Review;
module.exports.Chapter = require('./courses/chapter');
module.exports.Topic = require('./courses/topic');
module.exports.SubTopic = require('./courses/subtopic');
module.exports.Exam = require('./exam');

module.exports.Event=require('./event')


