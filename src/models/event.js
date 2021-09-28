const mongoose = require('mongoose');
const {Schema} = mongoose;

const eventSchema = new Schema({
    heading:String,
    date:Date,
    relatedCourse:{
        type:Schema.Types.ObjectId,
        default:0           //0 is for general events
    }
});

const Event = mongoose.model('Event',eventSchema);
module.exports = Event;