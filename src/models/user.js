const mongoose = require('mongoose');
const { Schema } = mongoose;

const PaymentDetailsSchema = mongoose.Schema({
    package_id:{
        type:String 
    },
    order_id:{
        type:String
    },
    payment_id:{
        type:String
    },
    time:{
        type:Date,
        default:Date.now()
    },
    amount:{
        type:String
    }
});


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
    contactNumber : {
        type : Number
    },
    dob : {
        type : Date
    },
    address : {
        type : String
    },
    category : {
        type : String
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
            type:String,
            default:Date.now
        },
        duration:{
            type:Number,
            default:0
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
    currentStreakDay:{
        type:Number,
        defaut:0
    },
    longestStreakDay:{
        type:Number,
        defaut:0
    },
    testsCompleted:{
        type:Number,
        defaut:0
    },
    coursesCompleted:{
        type:Number,
        defaut:0
    },
    totalTimeSpent:{
        type:Number,
        defaut:0
    },
    reminder:[{
        task:String,
        date:Date
    }],
    cart:{
        testSeries : [{
            type : mongoose.Schema.Types.ObjectId,
            
        }],
        courses : [{
            type : mongoose.Schema.Types.ObjectId,
            ref : 'Course'
        }]
    },
    testSeries : [{
        type : Schema.Types.ObjectId,
        ref : 'TestSeries'
    }],
    testSeriesProgress:[{
        testSeriesId:Schema.Types.ObjectId,
        quizzes:[{
            type:Schema.Types.ObjectId,
            unique:true
        }]
    }]
    
});

const User = mongoose.model('User', userSchema);

module.exports = User;