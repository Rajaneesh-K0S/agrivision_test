const mongoose = require('mongoose');
const {Schema} = mongoose;

const reviewSchema = new Schema({
    review:String,
    rating:Number,
    user:{
        type:Schema.Types.ObjectId,
        ref:'User'
    }
})

const Review = mongoose.model('Coursereview',reviewSchema);
module.exports = Review;