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
    subject:String,
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
    similarCourses : [{
        type : Schema.Types.ObjectId,
        ref : 'Course'
    }] 
});


const Course = mongoose.model('Course', courseSchema);
const Review = mongoose.model('Review', reviewSchema);
module.exports = { Course, Review };

