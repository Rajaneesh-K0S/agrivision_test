const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const notificationSchema = new mongoose.Schema({
    content:{
        type: String,
        required: true
    },
    link: String,
    notificationForAll:{
        type: Boolean,
        default: false
    },
    relatedCourses : [{
        type : Schema.Types.ObjectId,
        ref : 'Course'
    }],
    relatedTestSeries : [{
        type : Schema.Types.ObjectId,
        ref : 'TestSeries'
    }],
    relatedQuizzes : [{
        type : Schema.Types.ObjectId,
        ref : 'Quiz'
    }],
    relatedUsers : [{
        type : Schema.Types.ObjectId,
        ref : 'User'
    }],
    createdat:{
        type: Number,
        default: Math.floor(Date.now() / 1000)
    }
})


const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification; 