const mongoose = require('mongoose');
const { Schema } = mongoose;

const rank = new Schema({
    userId:{
        type: Schema.Types.ObjectId,          // change it to object id 
    },
    userName: [{
        type:String
    }],
    quizId:{
        type:Schema.Types.ObjectId,
        ref:'Quiz'
    },
    markedAns:{ 
        type: Map,
        of: [
            Number
        ]
    },
    totalCorrect: {
        type:Number,
        default:0
    },
    totalIncorrect: {
        type:Number,
        default:0
    },
    unattempted: {
        type:Number
    },
    positiveMarks:{
        type:Number,
        default:0
    },
    totalScore: {
        type:Number,
        default:0
    },
    totalTime: {
        type:Number,
        default:0
    },
    chapters:{
        type:Map,
        of:Object
    },
    totalMarks:{
        type:Number,
        default:0
    }
});

const Rank = mongoose.model('Rank', rank);
module.exports = Rank;