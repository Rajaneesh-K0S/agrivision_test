const mongoose = require('mongoose');
const { Schema } = mongoose;

const reviewSchema = new Schema({
    review:String,
    rating:Number,
    user:{
        type:Schema.Types.ObjectId,
        ref:'User'
    }
});


const courseSchema = new Schema({
    name:String,
    image:String,
    duration:Number,
    userEnrolled:Number,
    rating:Number,  //total course rating
    price:Number,
    description:String,
    highlights:[{
        type:String
    }],
    subject:String,
    feedbacks:[reviewSchema],
    chapters:[{
        type:Schema.Types.ObjectId,
        ref:'Chapter'
    }],
    fullTests:[{
        type:Schema.Types.ObjectId,
        ref:'Quiz'
    }] 
});


const Course = mongoose.model('Course', courseSchema);
module.exports = Course;
