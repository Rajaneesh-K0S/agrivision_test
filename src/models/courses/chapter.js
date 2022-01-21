const mongoose = require('mongoose');
const { Schema } = mongoose;

const chapterSchema = new Schema({
    name:String,
    topics:[{
        type:Schema.Types.ObjectId,
        ref:'Topic'
    }],
    freeTrialTopics:[{
        type:Schema.Types.ObjectId,
        ref:'Topic'
    }],
    totalSubTopics:Number 
});

const Chapter = mongoose.model('Chapter', chapterSchema);
module.exports = Chapter;