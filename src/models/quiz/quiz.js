const mongoose = require('mongoose');
const { Schema } = mongoose;

const quizTableSchema = new Schema({
    name : String,
    live : Boolean,
    quizStartDate : Date,
    isPublic: {
        type:Boolean,
        default:false
    },
    syllabus:[{
        type:String
    }],
    quizType: Number, //[0-General,1-Test Series,2-Course,3-practice]
    sections:[{
        name:String,
        questions : [{
            type : Schema.Types.ObjectId,
            ref : "Question"
        }]
    }],
    totalNoQuestions : Number,
    maxScore : Number,
    exam: String,
    chapter: String,

    subject:String,
    category : Number,                  // 0 for previous year mocks, 1 for sectional tests, 2 for full length tests
    generalPYQ : Boolean,
    calculator : Boolean,
    totalTime : Number,
    startTime : Number,
    endTime: Number,
    showAnalysisTime: Number,
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