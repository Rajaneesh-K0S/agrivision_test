const mongoose = require('mongoose');
const { Schema } = mongoose;

const questionSchema = new Schema({
    quizId:{
        type:Schema.Types.ObjectId,
        ref:'Quiz'
    },
    question: {
        type: String
    },
    questionImage: {
        type: String
    },
    questionType: {
        type: Number,   //[0-MCQ,1-MSQ,2-NAT]  
        //required: true
    },
    marking: Number,
    negMarking:Number,
    options:[{
        type: String,
        isImage: {
            type: Boolean,
            default: false
        }
    }],
    correctAnswer: [{
        type: Number //1,2,3,4
    }],
    explanation:{
        type:String
    },
    explanationImage: {
        data: Buffer,
        contentType: String
    },
    section:{
        type: String
    },
    chapterId: {
        type: Schema.Types.ObjectId,
        ref: 'Chapter', 
    },
    topicId: {
        type: Schema.Types.ObjectId,
        ref: 'Topic'
    }
});

const Question = mongoose.model('Question', questionSchema);
module.exports = Question;