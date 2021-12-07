const mongoose = require('mongoose');
const { Schema } = mongoose;

const PaymentDetailsSchema = mongoose.Schema({
    courseIds : Array,
    testSeriesIds : Array,
    packageIds : Array,
    orderId:{
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
    linkedinProfile: {
        type: String
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
    institute:{
        type: String
    },
    department:{
        type: String
    },
    designation:{
        type: String
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    randString: {
        type: String
    },
    articlesRemaining: {
        type : Number,
        default : 0
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
        },
        watchDuration:{
            type:Number,
            default:0
        }
    }],
    testDuration:[{
        date:{
            type:String,
            default:Date.now
        },
        duration: {
            type: Number,
            default: 0
        },
        testsCompleted:{
            type:Number,
            default:0
        },
    }], 
    minutesGoal:{          // goal for watching videos
        type:Number,
        default:60
    },
    readingGoal:{
        type:Number,
        default:60
    },
    currentStreakDay:{
        type:Number,
        default:0
    },
    longestStreakDay:{
        type:Number,
        default:0
    },
    coursesCompleted:{
        type:Number,
        default:0
    },
    totalTimeSpent:{
        type:Number,
        default:0
    },
    reminder:[{
        task:String,
        date:Date
    }],
    cart:{
        testSeries : [{
            type : mongoose.Schema.Types.ObjectId,
            ref : 'TestSeries'  
        }],
        courses : [{
            type : mongoose.Schema.Types.ObjectId,
            ref : 'Course'
        }],
        packages : [{
            type : mongoose.Schema.Types.ObjectId,
            ref : 'Package'
        }]

    },
    packages : [{
        type:Schema.Types.ObjectId,
        ref:'Package'
    }],
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
    }],
    paymentHistory : [PaymentDetailsSchema]
});

const User = mongoose.model('User', userSchema);

module.exports = User;
