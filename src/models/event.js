const mongoose = require('mongoose');
const { Schema } = mongoose;

const eventSchema = new Schema({
    heading: String,
    type: Number,         // 0 for normal events, 1 for daily tasks
    date: String,
    startTime: Date,
    endTime: Date,
    link: String,
    eventForAll: Boolean,      // true if event is for all users.
    relatedCourses: [{
        type: Schema.Types.ObjectId,    
        ref: 'Course'      
    }]
});

const Event = mongoose.model('Event', eventSchema);
module.exports = Event;