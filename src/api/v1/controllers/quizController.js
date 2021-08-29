const logger = require('../../../logger');
const mongoose = require('mongoose');
const {QuizCollection, User}= require('../../../models');
const {Quiz,Section,Rank,Chapter,Question}=QuizCollection;

module.exports.showAllQuizzes = async(req,res)=>{
    try{
        const quizzes = await Quiz.find({})
        res.status(200).json({
            data : quizzes,
            message : 'All quizzes',
            success : true
        });
    }
    catch(err){
        return res.status(500).json({
            message : err.message,
            success : false
        });
    }
};

module.exports.showQuiz = async (req, res) => {
    try{
        const {id} = req.params;
        const quiz = await Quiz.findById(id).populate({path:'sectionId',populate:{path: 'questions'}});
        res.status(200).json({
            data:quiz,
            message:'quiz was successfully found and sent',
            success: true
        });
        
    }catch(err){
        return res.status(500).json({
            message : err.message,
            success : false
        });
    }

};