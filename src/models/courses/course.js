const mongoose = require('mongoose');
const {Schema} = mongoose;

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
    feedbacks:[{
        type:Schema.Types.ObjectId,
        ref:'Feedback'
    }],
    chapters:[{
        type:Schema.Types.ObjectId,
        ref:'Chapter'
    }],
    fullTests:[{
        type:Schema.Types.ObjectId,
        ref:'Quiz'
    }] 
})

const Course = mongoose.model('Course',courseSchema);
module.exports = Course