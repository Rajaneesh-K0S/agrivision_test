const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
    name: [{
        type: String,
        required: true,
    }],
    image : {
        type : String
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String
    },
    provider: {
        type: String
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    randString: {
        type: String
    },
    courses:[{
        type: Schema.Types.ObjectId,
        ref: 'Course'
    }],
    courseProgress:[{
        courseId:Schema.Types.ObjectId,
        chapterId:Schema.Types.ObjectId,
        subTopics:[{
            type:Schema.Types.ObjectId,
            unique:true
        }]
    }],
    lastCompleted:{
        type: Schema.Types.ObjectId,
        ref:'SubTopic'
    },
    readingDuration:[{
        date:{
            type:String
        },
        duration:{
            type:Number
        }
    }],
    testDuration:[{
        date:{
            type:Date,
            default:Date.now
        },
        type:Number,
        default:0
    }],
    minutesGoal:{
        type:Number,
        default:60
    },
    readingGoal:{
        type:Number,
        default:60
    },
    currentStreakDay:Number,
    longestStreakDay:Number,
    testsCompleted:Number,
    coursesCompleted:Number,
    totalTimeSpent:Number,
    reminder:[{
        task:String,
        date:Date
    }]
});

const User = mongoose.model('User', userSchema);

module.exports = User;