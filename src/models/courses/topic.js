const mongoose = require('mongoose');
const { Schema } = mongoose;

const topicSchema = new Schema({
    name:String,
    subTopics:[{
        type:Schema.Types.ObjectId,
        ref:'SubTopic'
    }]
});

const Topic = mongoose.model('Topic', topicSchema);
module.exports = Topic;