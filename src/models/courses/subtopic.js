const mongoose = require('mongoose');
const { Schema } = mongoose;

const subTopicSchema = new Schema({
    name:String,
    contentType:Number, //0-pdf,1-video,2-quiz
    content:String, //if contentType is pdf or video
    duration:Number,
    quiz:{
        type:Schema.Types.ObjectId,
        ref:'Quiz'
    },       //if contentType is quiz
    topicId:Schema.Types.ObjectId,
    chapterId:Schema.Types.ObjectId,
    courseId:Schema.Types.ObjectId
});

const SubTopic = mongoose.model('SubTopic', subTopicSchema);
module.exports = SubTopic;