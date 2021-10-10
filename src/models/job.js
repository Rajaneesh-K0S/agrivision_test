const mongoose = require('mongoose');

let Schema =  mongoose.Schema;


let jobSchema = new Schema({
    title : String,
    type : Number,          // 0 for jobs, 1 for internships, 2 for scholarships
    organisation : String,
    location : String,
    stipend : Number,      // in INR per month
    duration : Number,     // in months
    description : String,
    image : String,
    applicants : [{
        type : Schema.Types.ObjectId,
        ref : 'User'
    }]
});


let Jobs = mongoose.model('Job', jobSchema);

module.exports = Jobs;