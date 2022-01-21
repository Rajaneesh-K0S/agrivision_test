const mongoose = require('mongoose');
const { Schema } = mongoose;


const collegeSchema = new Schema({
    name: String,
    location: String,
    bigImage: String,
    smallImage: String,
    domain: String,
    isGlobal:Boolean,
    isTopFeatured: {
        type: Boolean,
        default: false
    },
    degree: [
        {
            name: String,
            courseFees: String,
            courseFeesCategory: Number,
            Duration: String,
            salaryOffered: String,
            opportunities: String,
            feedbacks: [{
                type: Schema.Types.ObjectId,
                ref: 'Review'
            }]
        }
    ],   
    ratings: [{
        type: Number,
        min: 0,
        max: 10,
        default: 7
    }]  //array of 6 elements


})

const College = mongoose.model('College', collegeSchema);
module.exports = College;