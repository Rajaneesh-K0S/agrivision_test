const mongoose = require('mongoose');
const { Schema } = mongoose;

const reviewSchema = new Schema({
    review:String,
    rating:Number,
    user:{
        type:Schema.Types.ObjectId,
        ref:'User'
    }
}, { timestamps : true });


const courseSchema = new Schema({
    name:String,
    exam:[String],
    subject:[String],
    bigImage:String,
    smallImage:String,
    duration:Number,
    userEnrolled:Number,
    rating:Number,  //total course rating
    price:Number,
    description:String,
    highlights:[{
        type:String
    }],
    feedbacks:[{
        type : Schema.Types.ObjectId,
        ref : 'Review'
    }],
    chapters:[{
        type:Schema.Types.ObjectId,
        ref:'Chapter'
    }],
    fullTests:[{
        type:Schema.Types.ObjectId,
        ref:'Quiz'
    }],
    totalSubTopics:Number,
    similarCourses : [{
        type : Schema.Types.ObjectId,
        ref : 'Course'
    }],
    shareAndEarnCoupen : {
        type : Schema.Types.ObjectId,
        ref : 'Coupen'
    }
});

const packageSchema = new Schema({
    name:String,
    exam:[String],
    subject:[String],
    type: Number,        // 0 for MEGA, 1 for MICRO, 2 for NANO, 3 for CRASH, 4 for NUCLEUS
    bigImage:String,
    smallImage:String,
    duration:{
        type:Number,
        default:30
    },
    userEnrolled:{
        type:Number,
        default:100
    },
    testNumber:{
        type:Number,
        default: 2
    },
    videosNumber:{
        type:Number,
        default:30
    },
    rating:{
        type:Number,
        default:4.5
    },  //total course rating
    price:Number,
    description:String,
    highlights:[{
        type:String
    }],
    feedbacks:[{
        type : Schema.Types.ObjectId,
        ref : 'Review'
    }],
    similarCourses : [{
        type : Schema.Types.ObjectId,
        ref : 'Course'
    }],
    courses: [{
        type:Schema.Types.ObjectId,
        ref:'Course'
    }],
    testSeries: [{
        type : Schema.Types.ObjectId,
        ref: 'TestSeries'
    }],
    shareAndEarnCoupen : {
        type : Schema.Types.ObjectId,
        ref : 'Coupen'
    }
})


const Course = mongoose.model('Course', courseSchema);
const Review = mongoose.model('Review', reviewSchema);
const Package = mongoose.model('Package',packageSchema)
module.exports = { Course, Review, Package };

