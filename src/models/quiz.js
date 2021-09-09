const mongoose = require('mongoose');
const {Schema} = mongoose;

const quizTableSchema = new Schema({
    name : String,
    live : Boolean,
    syllabus:[{
        type:String
    }],
     
    sections:[{
        name:String,
        questions : [{
            type : Schema.Types.ObjectId,
            ref : "Question"
        }]
    }],
    //[0-Weekly,1-Test Series,2-Course]
    quizType: Number,
    totalNoQuestions : Number,
    relatedCourses : [{
        type : Schema.Types.ObjectId,
        ref : "Course"
    }],
    entranceExam : [{
        type : Schema.Types.ObjectId,
        ref : "EnteranceExam"
    }],
    recommendedVideo : String,
    calculator : Boolean,
    totalTime : Number,
    startTime : Number,
    endTime: Number,
    registeredUsers :[{
        type : Schema.Types.ObjectId,
        ref : 'User'
    }],
    quizPoster : {
        type : String
    },
    quizPrice : {
        type : Number
    }
})

const Quiz = mongoose.model('Quiz', quizTableSchema);

const questionSchema = new Schema({
    question: {
        type: String
    },
    questionType: {
        type: Number,   //[0-MCQ,1-MSQ,2-NAT]  
        //required: true
    },
    marking: Number,
    negMarking:Number,
    options:[{
       type: String
    }],
    correctAnswer: [{
        type: Number,
        required: true
    }],
    section:{
        type: String
    },
    explanation:{
        type:String
    },
    explanationImage: {
        data: Buffer,
        contentType: String
    },
    chapterId: {
        type: Schema.Types.ObjectId,
        ref: 'Chapter',
        
    },
    questionImage: {
        type: String
    }
})

const Question = mongoose.model('Question',questionSchema);

const chapter = new Schema({
    name:String,
    // // sectionId:{
    // //     type:Schema.Types.ObjectId,
    // //     ref:'Section'
    // // },
    // totalCorrect: Number,
    // totalIncorrect: Number,
    // totalScore: Number,
    video:[{
        type: Schema.Types.ObjectId,
        ref: 'videolecture'
    }]

})

const Chapter = mongoose.model('Chapter',chapter);


// const section= new Schema({
//     name: String,
//     sectionType: String,
//     totalQuestions: Number,
    
//     questions:[{
//         type: Schema.Types.ObjectId,
//         ref:'Question'
//     }],
//     // entanceExam: {
//     //     type: Schema.Types.ObjectId,
//     //     ref:'Entrance_exam'
//     // }
// })


// const Section = mongoose.model('Section',section);

const rank = new Schema({
    userId:{
        type: Schema.Types.ObjectId,          // change it to object id 
        ref:'User'
    },
    userName: String,
    quizId:{
        type:Schema.Types.ObjectId,
        ref:'Quiz'
    },
    markedAns:{ 
        type: Map,
        of: [
            Number
        ]
    },
    totalCorrect: Number,
    totalIncorrect: Number,
    unattempted: Number,
    totalPositive:Number,
    totalScore: Number,
    totalTime: Number,
    sections:{
        type:Map,
        of:Object
    },
    chapters:{
        type:Map,
        of:Object
    },
    minMarks:Number,
    totalMarks:Number
})

const Rank = mongoose.model('Rank',rank);

module.exports = {
    Quiz:Quiz,
    Question:Question,
    Chapter:Chapter,
    Rank:Rank
}

