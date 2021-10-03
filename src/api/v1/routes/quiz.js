const { Router } = require('express');
const router = Router();
// // const {isAdmin} = require('../config/middleware/isAdmin')
// const { showAllQuizzes, startQuiz, saveAnswer, submitQuiz } = require('../controllers/quizController');

// router.get('/', showAllQuizzes);
// //612a97d7be74275fbc15b080
// router.get('/:id', startQuiz);

// router.post('/:id', saveAnswer);
// router.get('/:id/submit', submitQuiz);

// router.post('/:id',async(req,res)=>{

// });

// router.get('/:id/calculate',isAdmin,async(req,res) =>{
//     const {id} = req.params;
//     try{
//         const ids = await Rank.find({"quizId":id});
//         //console.log(ids);
//         ids.forEach(async(uid) =>{
//             console.log(uid._id);
//             // for the section part
//             const markedAnsArray = await Rank.find({"_id": uid._id});
//             const {markedAns} = markedAnsArray[0];
            
//             const quizData = await Quiz.find({"_id": id});
//             let sectionIdArray = quizData[0].sectionId;
//             let sections = new Map();
//             let chapters = new Map();
//             let totalMarks = 0,minMarks = 0;
//             for(let i = 0;i < sectionIdArray.length;i++)
//             {
//                 const sectionData = await Section.find({"_id":sectionIdArray[i]}); 
//                 for(let j =0;j < sectionData.length;j++){
//                     const qidArray = sectionData[j].questions;
//                     let correct = 0,incorrect = 0,attempted = 0,marks = 0,score = 0,totalques = 0;

//                     for(let k =0;k < qidArray.length;k++){
//                         const questionsData  = await Question.find({"_id": qidArray[k]});
//                         const qid = (questionsData[0]._id),correctAnswer = questionsData[0].correctAnswer;
//                         const cid = questionsData[0].chapterId;
//                         const chapterName = await Chapter.find({"_id":cid},{name: 1,_id:0});
//                         const {name} = chapterName[0];
//                         marks += questionsData[0].marking;
//                         minMarks -= questionsData[0].negMarking;
//                         totalques++;
//                         if(markedAns.get(qid) !== undefined){
//                             let flag = 0;
//                             for(let i = 0;i < correctAnswer.length;i++){
//                                 let flag1 = 0;
//                                 for(let j = 0;j < markedAns.get(qid).length;j++){
//                                     if((correctAnswer[i]) === markedAns.get(qid)[j])flag1 = 1;
//                                 }
//                                 if(flag1 === 0)flag = 1;
//                             }
//                             if(flag === 0){
//                                 correct++;
//                                 score += questionsData[0].marking;
//                                 if(!chapters.has(name)){
//                                     chapters.set(name,{
//                                         correct:1,incorrect:0,skipped:0
//                                     });
//                                 }
//                                 else{
//                                     let c = chapters.get(name);
//                                     chapters.set(name,{
//                                         correct:c.correct + 1,incorrect:c.incorrect,skipped:c.skipped
//                                     })
//                                 }
//                             }
//                             else{
//                                 incorrect++;
//                                 score -= questionsData[0].negMarking;
//                                 if(!chapters.has(name)){
//                                     chapters.set(name,{
//                                         correct:0,incorrect:1,skipped:0
//                                     });
//                                 }
//                                 else{
//                                     let c = chapters.get(name);
//                                     chapters.set(name,{
//                                         correct:c.correct,incorrect:c.incorrect+1,skipped:c.skipped
//                                     })
//                                 }
//                             }
//                         }
//                         else{
//                             if(!chapters.has(name)){
//                                 chapters.set(name,{
//                                     correct:0,incorrect:0,skipped:1
//                                 });
//                             }
//                             else{
//                                 let c = chapters.get(name);
//                                 chapters.set(name,{
//                                     correct:c.correct,incorrect:c.incorrect,skipped:c.skipped + 1
//                                 })
//                             }
//                         }
//                     }
//                     attempted = (correct + incorrect);
//                     totalMarks += marks;

//                     sections.set(sectionData[j].name,{
//                         correct:correct,incorrect:incorrect,attempted:attempted,marks:marks,score:score.toFixed(2),totalques: totalques
//                     })
//                 }
//             }

//             const rankData = await Rank.find({"_id":uid._id});
//             const sortedRankData = await Rank.find({"quizId":id}).sort({totalScore: -1});
//             //console.log(sortedRankData)
            
//             // // any way to get only relevant users
//             const userData = await User.find({});
            
//             const q = new RankTrial({
//                 userId:uid._id,
//                 quizId:id,
//                 markedAns:markedAns,
//                 totalCorrect:rankData[0].totalCorrect,
//                 totalIncorrect:rankData[0].totalIncorrect,
//                 unattempted:rankData[0].unattempted,
//                 totalPositive:rankData[0].totalPositive,
//                 totalScore:rankData[0].totalScore,
//                 totalTime:rankData[0].totalTime,
//                 sections:sections,
//                 chapters:chapters,
//                 minMarks:minMarks,
//                 totalMarks:totalMarks
//             })
//             await q.save();
//         })
//         res.send("Hello World!!")
//     }
//     catch(err){
//         //console.log('error' + err);
//     }
// })

// router.get('/:id',async(req,res)=>{
//     try{
    
//         // if user hasn't logged in
//         if(req.user === undefined){
//             return res.redirect('/user/login');
//         }

//         // get the userid
//         let _id = req.user._id;
//         if(!req.session.ans){
//             req.session.ans = {};
//         }

//         const {id} = req.params;
//         const rank = await Rank.findOne({_id:_id, quizId: id});
//         // //console.log(rank);

//         // if given redirect to summary page
//         if(rank !== null){
//             return res.redirect(`/${id}/summary`);
//         }
//         // else show the quiz questions
//         const quiz =await Quiz.findById(req.params.id).populate({path:'sectionId',populate:{path: 'questions'}});
//         // var today = new Date();
//         const end_time = quiz.endTime.getTime();
//         if(!req.session.endTime){
//             var today = new Date();
//             req.session.startTime = today.getTime();
//             req.session.endTime =  Math.min(end_time,today.getTime()+60000*(quiz.totalTime));
//         }
//         const startTime = req.session.startTime;
//         const endTime = req.session.endTime
//         const ans = req.session.ans;
//         const name = req.user.name;
//         const image = req.user.userImage;
//         const currentTime = new Date();
//         //console.log(Number(currentTime.getTime()),Number(req.session.endTime));
//         if(Number(currentTime.getTime()) > Number(req.session.endTime)){
//             req.session.destroy();
//             return res.send('Session Expired')
//         }
//         else{
//             res.render('quiz_portal/index',{quiz,startTime,endTime,ans,name,image});
//         }
//     }
//     catch(err){
//         //console.log(err);
//     }
    
// });

// router.get('/:id/instruction',async(req,res)=>{
//     if(req.user === undefined){
//         return res.redirect('/user/login');
//     }
//     try{
//         let _id = req.user._id;
//         const {id} = req.params;
//         const rank = await Rank.findOne({_id:_id, quizId: id});
//         //console.log('Instruction route ');
//         // ////console.log(rank);
//         if(rank !== null){
//             return res.redirect(`/quiz/${req.params.id}/summary`);
//         }
//         const name = req.user.name;
//         const image = req.user.userImage;
//         const quiz = await Quiz.findById(id);
//         //////console.log(quiz);
//         const quiz_name = quiz.name; 
//         res.render('quiz_portal/instruction',{id,name,image,quiz_name});
//     }
//     catch(err){
//         ////console.log("Error on instruction page")
//     }
// });

// router.post('/:id',(req,res)=>{
    
//     const {id} = req.params;
//     const {q_id,option,q_type,opt_clear,msq_id,msq_opt_clear}=req.body;
//     //console.log(`msq_id hai ${msq_id} aur msq_opt_clear hai ${msq_opt_clear}`)
//     if(msq_id){
        
//         function arrayRemove(arr, value) {
 
//             return arr.filter(function(geeks){
//                 return geeks != value;
//             });
          
//          }
//          req.session.ans[msq_id]=arrayRemove(req.session.ans[msq_id],msq_opt_clear);
//         // req.session.ans[msq_id].filter((el)=>{
//         //     //console.log(typeof el,typeof msq_opt_clear)
//         //     return el !=msq_opt_clear
//         // })
//     }
//     if(opt_clear){
//         if(typeof req.session.ans[opt_clear]=="string"){
//             delete req.session.ans[opt_clear];
//         }else{
//             req.session.ans[opt_clear]=[];
//         }
//     }
//     if(q_type=='checkbox'){
//         if(!req.session.ans[q_id])req.session.ans[q_id] = [];
//         req.session.ans[q_id].push(option);
//     }else{
//         req.session.ans[q_id]= option;
//     }
    
//     //console.log(req.session.ans);
//     res.redirect(`/quiz/${id}`);
// })

// router.get('/:id/submit',async(req,res)=>{ 
//     const {id} = req.params;
//     let _id = req.user._id;
//     let totalTime = ( Number(req.session.submitTime) - Number(req.session.startTime))/(1000);
//     try{
//         const {markedAns} = await Rank.findById(_id);
//         const quizData = await Quiz.find({"_id": id});
        
//         //const {markedAns} = markedAnsArray[0];
//         let totalTime;
//         if(req.session.submitTime){
//             totalTime = ( Number(req.session.submitTime) - Number(req.session.startTime))/(60000);
//             console.log(totalTime);
//         } 
//         else{
//             console.log('helllo');
//             const rank = await Rank.findOne({_id:_id, quizId: id});
//             console.log(rank);
//             if(rank === null || !rank.totalTime)totalTime = quizData[0].totalTime;
//             else totalTime = rank.totalTime;
//         }
//         console.log(markedAns);
//         let sectionIdArray = quizData[0].sectionId;
//         totalTime = Math.min(totalTime,quizData[0].totalTime);
//         let totalCorrect = 0,totalIncorrect = 0,totalPositive = 0,totalQuestions = 0,totalScore = 0,unattempted = 0;
//         let totalMarks = 0,totalNegative = 0;
//         for(let i = 0;i < sectionIdArray.length;i++)
//         {
//             const sectionData = await Section.find({"_id":sectionIdArray[i]});
//             for(let j =0;j < sectionData.length;j++){
//                 const qidArray = sectionData[j].questions;

//                 for(let k =0;k < qidArray.length;k++){
//                     const questionsData  = await Question.find({"_id": qidArray[k]});
//                     const qid = (questionsData[0]._id),correctAnswer = questionsData[0].correctAnswer;
//                     // assuming single correct
//                     // //console.log(correctAnswer);
//                     if(markedAns.get(qid) !== undefined){
//                         let flag = 0;
//                         for(let i = 0;i < correctAnswer.length;i++){
//                             let flag1 = 0;
//                             for(let j = 0;j < markedAns.get(qid).length;j++){
//                                 if((correctAnswer[i]) === markedAns.get(qid)[j])flag1 = 1;
//                             }
//                             if(flag1 === 0)flag = 1;
//                         }
//                         if(flag === 0){
//                             totalCorrect++;
//                             totalPositive += questionsData[0].marking;
//                         }
//                         else {
//                             totalIncorrect++;
//                             totalNegative -= questionsData[0].negMarking;
//                         }
//                     }
//                     else unattempted++;
//                     totalMarks += (questionsData[0].marking);
//                 }
//                 totalQuestions += sectionData[j].totalQuestions;
//             }
//         }
//         totalScore += (totalPositive + totalNegative);
//         let rankData = ({
//             "totalCorrect": totalCorrect,
//             "totalIncorrect": totalIncorrect,
//             "unattempted": unattempted,
//             "totalPositive": totalPositive,
//             "totalScore": totalScore.toFixed(2),
//             "totalTime": totalTime
//         });
//         //console.log(rankData);
//         await Rank.updateOne(
//             {"_id": _id,"quizId": id},
//             {   $set: rankData }
//         );
//         const sortedRankData = await Rank.find({"quizId":id}).sort({totalScore: -1,totalPositive:1});
//         console.log(quizData[0]);
//         res.render('quiz_portal/submit',{
//             quizData: quizData[0],
//             data: rankData,
//             totalMarks: totalMarks,
//             sortedRankData: sortedRankData,
//             totalQuestions: totalQuestions
//         }); 
//     }
//     catch(err){
//         //console.log(err);
//     }
//         //res.send('Hello World')
//     //res.
    
//     // req.session.destroy();
// })

// router.post('/:id/submit',async(req,res)=>{
//     //console.log("on Post submit")
//     const {id}=req.params;
//     try{
//         // submit time
//         const submitTime = new Date().getTime();
//         req.session.submitTime = submitTime;
        
//         let _id = req.user._id;
//         let quizId = id;
//         let markedAns = req.session.ans;
//         //console.log(_id,markedAns);
//         const q = new Rank({_id,quizId,markedAns});
//         await q.save();
//         res.redirect(`/quiz/${id}/submit`);
//         //res.send('Updated rank success!!!');
//     }
//     catch(err){
//         //console.log(err);
//     }
// })



// router.get('/:id/summary',async(req,res)=>{
//     //console.log("Final rank page");
//     //return res.redirect('/');
//     if(req.user === undefined){
//         return res.redirect('/user/login');
//     }
//     const {id} = req.params;
//     let _id = req.user._id;
//     //console.log(req.session.ans);
//     try{
//         console.log(_id,'Hell00')
//         // // any way to get only relevant users
//         const quizData = await Quiz.find({"_id": id});
//         const userData = await User.find({});
//         const sortedRankData = await RankTrial.find({"quizId":id}).sort({totalScore: -1,totalPositive:1});
//         const rankTrial = await RankTrial.find({"userId":_id});
//         let scores = [];
//         sortedRankData.forEach((data) =>{
//             scores.push(data.totalScore);
//         })

//         // console.log(scores[0]);
//         //res.send(`He${rankTrial[0]}`);
//         res.render('quiz_portal/summary',{
//             quizData: quizData[0],
//             data: rankTrial[0],
//             sections: rankTrial[0].sections,
//              minMarks: rankTrial[0].minMarks.toFixed(2),
//              totalMarks : rankTrial[0].totalMarks,
//             chapters: rankTrial[0].chapters,
//             sortedRankData: sortedRankData,
//              userData: userData,
//              userId: _id,
//              scores: scores
//         })
        
//         //  res.send("Helloooooooo World!!")
//     }
//     catch(err){
//         //console.log('error' + err);
//     }
//     // req.session.destroy();
// })

module.exports = router;
