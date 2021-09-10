const mongoose = require('mongoose');
const {Schema} = mongoose;

const topicSchema = new Schema({
    name:String,
    subTopics:[{
        type:Schema.Types.ObjectId,
        ref:'SubTopic'
    }],
    freeTrialSubTopic:[{
        type:Schema.Types.ObjectId,
        ref:'SubTopic'
    }]
})

const Topic = mongoose.model('CTopic',topicSchema);
module.exports = Topic;