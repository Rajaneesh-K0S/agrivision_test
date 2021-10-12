const mongoose = require('mongoose');
const { Schema } = mongoose;

const rank = new Schema({
    userId:{
        type: Schema.Types.ObjectId,          // change it to object id 
    },
    userName: String,
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
    totalCorrect: Number,
    totalIncorrect: Number,
    unattempted: Number,
    positiveMarks:Number,
    totalScore: Number,
    totalTime: Number,
    chapters:{
        type:Map,
        of:Object
    },
    topics:{
        type:Map,
        of:Object
    },
    totalMarks:Number
});

const Rank = mongoose.model('Rank', rank);