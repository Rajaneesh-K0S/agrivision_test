const mongoose = require('mongoose');
const { Schema } = mongoose;

const questionSchema = new Schema({
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
    }],
    optionsImage:[{
        type: String,
    }],
    correctAnswer: [{
        type: Number //1,2,3,4
    }],
    explanation:{
        type:String
    },
    explanationImage: {
        type:String
    },
    topic : String,
    quizId : {
        type : Schema.Types.ObjectId,
        ref : 'Quiz'
    }
});

const Question = mongoose.model('Question', questionSchema);
module.exports = Question;