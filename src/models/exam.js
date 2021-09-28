const mongoose = require('mongoose');
const { Schema } = mongoose;

const examSchema = new Schema({
    name:String,
    courses:{
        type:Schema.Types.ObjectId,
        ref:'Course'
    }
});

const Exam = mongoose.model('Exam', examSchema);
module.exports = Exam;