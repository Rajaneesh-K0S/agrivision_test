const logger = require('../../../logger');
const mongoose = require('mongoose');
const { QuizCollection, User } = require('../../../models');
const { Quiz, Rank, Chapter, Question } = QuizCollection;

async function createQuiz(){
    const q = new Question({ question:'What is your name' });
    const q1 = new Question({ question:'What is your name' });
    await q.save();
    await q1.save();
    const quiz = new Quiz({ name:'quiz 1', sections:[{ name:'GA' }, { name:'Food Technology' }] });
    quiz.sections[0].questions.push(q);
    quiz.sections[1].questions.push(q1);
    await quiz.save();

}
// createQuiz();

module.exports.showAllQuizzes = async(req, res)=>{
    try{
        const quizzes = await Quiz.find({});
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

module.exports.startQuiz = async (req, res) => {
    try{
        const { id } = req.params;
        const quiz = await Quiz.findById(id).populate({ path:'sections', populate:{ path: 'questions' } });
        if(!req.session.ans){
            req.session.ans = {};
        }
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

module.exports.saveAnswer = async (req, res) => {
    const { id } = req.params;
    const { quesId, markedAns } = req.body;
    try{
        req.session.ans[quesId] = markedAns;
        logger.info(req.session.ans);
        res.status(200).json({
            message:'answer saved successfully',
            success: true
        });
    }
    catch(err) {
        return res.status(500).json({
            message : err.message,
            success : false
        });
    }
    
};

module.exports.submitQuiz = async (req, res) => {
    
};