const mongoose = require('mongoose');
const {Schema} = mongoose;

const collegeSchema = new Schema({
    name:String,
    location:String,
    bigImage:String,
    smallImage:String,
    domain:String,
    isTopFeatured:{
        type:Boolean,
        default:false
    },
    degree:[{
        type:String
    }],
    courseFees: String,
    courseFeesNumber: Number,
    Duration:String,
    salaryOffered:String,
    opportunities:String,
    feedbacks:[{
        type:Schema.Types.ObjectId,
        ref:'Review'
    }],
    ratings:[{
        type:Number,
        min:0,
        max:10,
        default:7
    }]  //array of 6 elements


})

const College = mongoose.model('College',collegeSchema);
module.exports = College;