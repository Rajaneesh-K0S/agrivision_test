const mongoose = require('mongoose');
const { Schema } = mongoose;

const registrationSchema = new Schema({
    
    examName: String,
    date: String,
    time: String,
    exam: String,
    current: Boolean,
    quizId: {
        type:Schema.Types.ObjectId,
        ref: 'Quiz'
    },
    usersEnrolled: [{
        userId: {
            type:String
        },
        name: [{
            type: String,
            required: true,
        }],
        email: {
            type: String,
            required: true
        },
        contact: {
            type:Number,
            required: true
        },
        parentContact: {
            type:Number
        },
        branch : String,
        specialization : String,
        state : String,
        college: {
            type:String
        },
        currentYear: {
            type:String
        },
        givenGate: {
            type:Boolean
        },
        ownerCode : {
            type : String
        },
        friendCode : {
            type : String
        }
    }]


})

const Registration = mongoose.model('Registeration',registrationSchema);
module.exports =Registration;
