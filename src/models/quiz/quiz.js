const mongoose = require('mongoose');
const { Schema } = mongoose;

const quizTableSchema = new Schema({
    name : String,
    live : Boolean,
    isPublic: {
        type:Boolean,
        default:false
    },
    syllabus:[{
        type:String
    }],
    quizType: Number, //[0-General,1-Test Series,2-Course]
    totalNoQuestions : Number,
    exam: String,
    subject:String,
    calculator : Boolean,
    totalTime : Number,
    startTime : Number,
    endTime: Number,
    courseId:{
        type: Schema.Types.ObjectId,
        ref:'Course'
    },
    testSeriesId:{
        type: Schema.Types.ObjectId,
        //ref:'TestSeries'
    },
    registeredUsers :[{
        type : Schema.Types.ObjectId,
        ref : 'User'
    }],
    Poster : {
        type : String
    },
    Price : {
        type : Number
    }
});

const Quiz = mongoose.model('Quiz', quizTableSchema);
module.exports = Quiz;