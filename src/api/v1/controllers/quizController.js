const { Question,Quiz ,Rank} = require("../../../models");


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
        const quiz = await Quiz.findById(id).populate({path:'sections',populate:{path:'questions'}});
        if(!quiz){
            return res.status(400).json({
                message: 'no such quiz exist',
                success:false
            })
        }
   
        let rank =  await Rank.findOne({userId:req.user._id,quizId:id});
        if(!rank){
            rank = new Rank({quizId:id,userId:req.user._id,userName:req.user.name,unattempted:quiz.totalNoQuestions,markedAns:{}});
            await rank.save();
        }
        
        res.status(200).json({
            data: quiz,
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
    const userId= req.user._id;
    const { quesId, markedAns } = req.body;
    try{
        const rank = await Rank.findOne({userId:userId,quizId:id});
        rank.markedAns.set(quesId,markedAns);
        await rank.save();

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

module.exports.clearAnswer = async(req,res) =>{
    const {id} = req.params;
    const userId= req.user._id;
    const quesId = req.query.quesId;
    try{
        const rank = await Rank.findOne({userId:userId,quizId:id});
        rank.markedAns.delete(quesId);
        await rank.save();

        res.status(200).json({
            message:'answer cleared successfully',
            success: true
        });
    }
    catch(err) {
        return res.status(500).json({
            message : err.message,
            success : false
        });
    }  
}
