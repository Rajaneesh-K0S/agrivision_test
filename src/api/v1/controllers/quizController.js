const { Question, Quiz, Rank, Course, TestSeries, User,Registration } = require("../../../models");
const { getLocalTimeString } = require('../../../utils')

let markedAnsData = async (quizId, userId) => {
    let marked = await Rank.findOne({ quizId, userId }, { markedAns: 1 });
    if (marked) {
        let markedAnswers = marked.markedAns;
        let allQuestions = await Question.find({ quizId }, { 'topic': 1, 'correctAnswer': 1, 'marking': 1, 'negMarking': 1, 'questionType': 1 });
        return { markedAnswers, allQuestions };
    } else {
        throw new Error("User did not attempt the quiz.");
    }
}


let calculateRank = (markedAnswers, allQuestions) => {
    let obj = {
        totalCorrect: 0,
        totalIncorrect: 0,
        unattempted: 0,
        positiveMarks: 0,
        totalScore: 0
    }
    allQuestions.forEach(ques => {
        if (markedAnswers.has(ques._id.toString())) {
            let markedAnsArray = markedAnswers.get(ques._id.toString());
            let correctAnsArray = ques.correctAnswer;
            let isCorrect = false;
            if (ques.questionType != 2) {
                markedAnsArray = markedAnsArray.map(v => v + 1);
            } else if (ques.questionType == 2 && correctAnsArray.length == 2) {
                markedAnsArray.forEach(markedAns => {
                    if (markedAns >= correctAnsArray[0] && markedAns <= correctAnsArray[1]) {
                        isCorrect = true;
                    }
                })
            } else if (ques.questionType == 2 && correctAnsArray.length == 4) {
                markedAnsArray.forEach(markedAns => {
                    if ((markedAns >= correctAnsArray[0] && markedAns <= correctAnsArray[1]) || (markedAns >= correctAnsArray[2] && markedAns <= correctAnsArray[3])) {
                        isCorrect = true;
                    }
                })
            }
            let markedAnsString = markedAnsArray.sort().join(',');
            let correctAnsString = ques.correctAnswer.sort().join(',');
            if (isCorrect || (markedAnsString == correctAnsString)) {
                obj['totalCorrect']++;
                obj['positiveMarks'] += ques.marking;
                obj['totalScore'] += ques.marking;
            } else {
                obj['totalIncorrect']++;
                obj['totalScore'] -= ques.negMarking;
            }
        } else {
            obj['unattempted']++;
        }
    })
    return obj;
}

module.exports.calculateRankForAll = async (req, res) => {
    let quizId = req.params.id;
    try {
        let ranks = await Rank.find({ quizId });
        for (let i = 0; i < ranks.length; i++) {
            let userId = ranks[i].userId;
            let { markedAnswers, allQuestions } = await markedAnsData(quizId, userId);
            let obj = calculateRank(markedAnswers, allQuestions);
            obj['isSubmitted'] = true;
            await Rank.findOneAndUpdate({ userId, quizId }, obj);
            if(!ranks[i].isSubmitted){
                await User.updateOne({_id : userId}, {"$push" : {"completedQuizes" : quizId}});
            }
        }
        res.status(200).json({
            message: "successfully calculated rank for all the users of the quiz",
            success: true
        })
    }
    catch (err) {
        res.status(500).json({
            message: err.message,
            success: false
        })
    }
}


let findTopicList = (allQuestions) => {
    let data = [];
    allQuestions.forEach(question => {
        if (data.length == 0) {
            data.push({ topicName: question.topic, attempted: 0, correct: 0, incorrect: 0, skipped: 0, score: 0 });
        }
        let pp = data.filter(topic => topic.topicName == question.topic);
        if (!pp.length) {
            data.push({ topicName: question.topic, attempted: 0, correct: 0, incorrect: 0, skipped: 0, score: 0 });
        }
    })
    return data;
}


let findAnalysisByTopic = async (markedAnswers, allQuestions) => {
    let data = findTopicList(allQuestions);
    allQuestions.forEach(question => {
        let obj = data.find(topic => topic.topicName === question.topic);
        if (markedAnswers.has(question._id.toString())) {
            obj['attempted']++;
            let markedAnsArray = markedAnswers.get(question._id.toString());
            let correctAnsArray = question.correctAnswer;
            let isCorrect = false;
            if (question.questionType != 2) {
                markedAnsArray = markedAnsArray.map(v => v + 1);
            } else if (question.questionType == 2 && correctAnsArray.length == 2) {
                markedAnsArray.forEach(markedAns => {
                    if (markedAns >= correctAnsArray[0] && markedAns <= correctAnsArray[1]) {
                        isCorrect = true;
                    }
                })
            } else if (question.questionType == 2 && correctAnsArray.length == 4) {
                markedAnsArray.forEach(markedAns => {
                    if ((markedAns >= correctAnsArray[0] && markedAns <= correctAnsArray[1]) || (markedAns >= correctAnsArray[2] && markedAns <= correctAnsArray[3])) {
                        isCorrect = true;
                    }
                })
            }
            let markedAnsString = markedAnsArray.sort().join(',');
            let correctAnsString = question.correctAnswer.sort().join(',');
            if (isCorrect || (markedAnsString == correctAnsString)) {
                obj['correct']++;
                obj['score'] += question.marking;
            }
            else {
                obj['incorrect']++;
                obj['score'] -= question.negMarking;
            }
        } else {
            obj['skipped']++;
        }
    })
    data.sort((topicA, topicB) => {
        return (topicA.score < topicB.score) ? 1 : -1;
    })
    return data;
}

let smallAnalysisByTopic = (analysisByTopic) => {
    let data = JSON.parse(JSON.stringify(analysisByTopic));
    let maxSkippedTopic = data.sort((topicA, topicB) => {
        return (topicA.skipped < topicB.skipped) ? 1 : -1;
    })[0].topicName;
    let topics = data.sort((topicA, topicB) => {
        return (topicA.incorrect < topicB.incorrect) ? 1 : -1;
    })
    let maxIncorrectTopic = topics[0].topicName;
    let additionalTopics;
    if (topics.length == 1) {
        additionalTopics = topics[0].topicName;
    } else {
        additionalTopics = topics[1].topicName;
    }
    return { maxSkippedTopic, maxIncorrectTopic, additionalTopics };
}


module.exports.showAllQuizzes = async (req, res) => {
    try {
        const quizzes = await Quiz.find({});
        res.status(200).json({
            data: quizzes,
            message: 'All quizzes',
            success: true
        });
    }
    catch (err) {
        return res.status(500).json({
            message: err.message,
            success: false
        });
    }
};

module.exports.isSubscribed = async (req, res, next) => {
    let quizId = req.params.id;
    let userId = req.user._id;
    let isSubscribed = false;
    try {
        if (quizId && userId) {
            let quiz = await Quiz.findOne({ _id: quizId }, { "isPublic": 1, "registeredUsers": 1, "quizType": 1 });
            if (quiz) {
                if (quiz.isPublic || quiz.registeredUsers.includes(userId)) {
                    isSubscribed = true;
                } else {
                    if (quiz.quizType == 1) {
                        let testSeries = await TestSeries.find({ "quizzes": quizId }, { _id: 1, "freeTrialQuizzes": 1 });
                        if (testSeries.length) {
                            for (let i = 0; i < testSeries.length; i++) {
                                if (testSeries[i].freeTrialQuizzes.includes(quizId.toString())) {
                                    isSubscribed = true;
                                    break;
                                } else {
                                    let user = await User.findOne({ _id: userId, "testSeries": testSeries[i]._id }, { _id: 1 });
                                    if (user) {
                                        isSubscribed = true;
                                        break;
                                    }
                                }
                            }
                        }
                    } else if (quiz.quizType == 2) {
                        let course = await Course.find({ "fullTests": quizId }, { _id: 1 });
                        if (course.length) {
                            for (let i = 0; i < course.length; i++) {
                                let user = await User.findOne({ _id: userId, "courses": course[i]._id }, { _id: 1 });
                                if (user) {
                                    isSubscribed = true;
                                    break;
                                }
                            }
                        }
                    }
                }
                req.body['isSubscribed'] = isSubscribed;
                next();
            }
            else {
                throw new Error("no such quiz exist");
            }
        }
    }
    catch (err) {
        res.status(500).json({
            message: err.message,
            success: false
        })
    }

}

module.exports.startQuiz = async (req, res) => {
    let userId = req.user._id;
    let quizId = req.params.id;
    try {
        let quiz = await Quiz.findById(quizId).populate({ path: 'sections', populate: { path: 'questions' } });
        if(quiz.isShuffled){
            if (req.body.isSubscribed) {
                let isAttempted = false;
                let msg = '';
                let rank = await Rank.findOne({ userId, quizId });
                if (!rank) {
                    let startTime = Date.now();
                    for(let i =0; i< quiz.sections.length; i++){
                        let section = quiz.sections[i].toJSON();
                        let shuffled_questions = shuffle_q(section.questions, 30);
                        section.questions = shuffled_questions;
                        quiz.sections[i] = section;
                    }
                    rank = new Rank({ quizId, userId, userName: req.user.name, startTime, unattempted: quiz.totalNoQuestions, markedAns: {} });
                    await rank.save();
                    msg = 'quiz was successfully found and sent';
                } else if (!rank.isSubmitted) {
                    for(let i =0; i< quiz.sections.length; i++){
                        let section = quiz.sections[i].toJSON();
                        let shuffled_questions = shuffle_q(section.questions, 30);
                        section.questions = shuffled_questions;
                        quiz.sections[i] = section;
                    }
                    msg = 'quiz was successfully found and sent';
                } else if (rank.isSubmitted) {
                    isAttempted = true;
                    msg = 'You have already attempted the quiz';
                }
                // console.log(quiz, "hi");
                res.status(200).json({
                    isSubscribed: true,
                    isAttempted,
                    data: (req.body.isSubscribed) ? quiz : null,
                    message: msg,
                    success: true
                });

            } else {
                res.status(200).json({
                    isSubscribed: false,
                    data: quiz,
                    message: "You are not registered for this quiz.",
                    success: true
                })
            }
        }else{
            if (req.body.isSubscribed) {
                let isAttempted = false;
                let msg = '';
                let rank = await Rank.findOne({ userId, quizId });
                if (!rank) {
                    let startTime = Date.now();
                    
                    rank = new Rank({ quizId, userId, userName: req.user.name, startTime, unattempted: quiz.totalNoQuestions, markedAns: {} });
                    await rank.save();
                    msg = 'quiz was successfully found and sent';
                } else if (!rank.isSubmitted) {
                    msg = 'quiz was successfully found and sent';
                } else if (rank.isSubmitted) {
                    isAttempted = true;
                    msg = 'You have already attempted the quiz';
                }
                // console.log(quiz, "bi");
                res.status(200).json({
                    isSubscribed: true,
                    isAttempted,
                    data: (req.body.isSubscribed) ? quiz : null,
                    message: msg,
                    success: true
                });

            } else {
                res.status(200).json({
                    isSubscribed: false,
                    data: quiz,
                    message: "You are not registered for this quiz.",
                    success: true
                })
            }
        }
    } catch (err) {
        return res.status(500).json({
            message: err.message,
            success: false
        });
    }

};

module.exports.saveAnswer = async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id;
    const { quesId, markedAns } = req.body;
    try {
        const rank = await Rank.findOne({ userId: userId, quizId: id });
        rank.markedAns.set(quesId, markedAns);
        await rank.save();

        res.status(200).json({
            message: 'answer saved successfully',
            success: true
        });
    }
    catch (err) {
        return res.status(500).json({
            message: err.message,
            success: false
        });
    }
};

module.exports.clearAnswer = async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id;
    const quesId = req.query.quesId;
    try {
        const rank = await Rank.findOne({ userId: userId, quizId: id });
        rank.markedAns.delete(quesId);
        await rank.save();

        res.status(200).json({
            message: 'answer cleared successfully',
            success: true
        });
    }
    catch (err) {
        return res.status(500).json({
            message: err.message,
            success: false
        });
    }
}


module.exports.submitQuiz = async (req, res) => {
    try {
        const quizId = req.params.id;
        const userId = req.user._id;
        // const userId = '616a40b67a5512001682343c';

        const quiz = await Quiz.findOne({ _id: quizId }, { "totalTime": 1, "quizType": 1, "endTime": 1 });
        const rank = await Rank.findOne({ quizId, userId }, { "startTime": 1 });
        let startTime = rank.startTime;
        if (!startTime) {
            startTime = Date.now() - quiz.totalTime * 60000
        }
        const quizEndTime = (quiz.quizType == 0) ? (quiz.endTime) : (startTime + quiz.totalTime * 60000);
        const finishedTime = Math.min(Date.now(), quizEndTime);
        const totalTimeTaken = (finishedTime - startTime) / 60000;

        await Rank.findOneAndUpdate({ userId, quizId }, { isSubmitted: true, totalTime: totalTimeTaken });
        if (quiz.quizType == 1 || quiz.quizType == 2 || quiz.quizType == 3) {
            let { markedAnswers, allQuestions } = await markedAnsData(quizId, userId);
            let rankObj = calculateRank(markedAnswers, allQuestions);
            await Rank.findOneAndUpdate({ userId, quizId }, rankObj);
        }
        let user = await User.findOne({ _id: userId }, { "testDuration": 1, "completedQuizes": 1 });
        const date = getLocalTimeString(new Date());
        let testDuration = user.testDuration[user.testDuration.length - 1];
        if (!testDuration || !(testDuration.date == date)) {
            user.testDuration.push({
                date: date,
                duration: quiz.totalTime,
                testsCompleted: 1
            });
        } else {
            testDuration.duration += quiz.totalTime;
            testDuration.testsCompleted += 1;
        }
        user.completedQuizes.push(quiz._id);
        await user.save();
        res.status(200).json({
            message: 'succesfully submitted the quiz',
            success: true
        });
    }
    catch (err) {
        res.status(500).json({
            message: err.message,
            success: false
        })
    }
}

module.exports.getAnalysis = async (req, res) => {
    let quizId = req.params.id;
    let userId = req.user._id;
    let userName = req.user.name;
    // let userId = '616a40b67a5512001682343c';
    // 0 for overview, 1 for solution, 2 for weakness, 3 for comprasion 
    try {
        if (req.query.queryParam == 0) {
            let rank = await Rank.findOne({ userId, quizId });

            let sortedRank = await Rank.find({ quizId: quizId, isSubmitted: true }, { userName: 1, totalScore: 1, userId: 1 }).sort({ totalScore: -1, totalTime: 1 });

            let quizData = await Quiz.findOne({ _id: quizId }, { name: 1, maxScore: 1, totalNoQuestions: 1, totalTime: 1, chapters: 1 });
            if (rank) {
                let quizName = quizData.name;
                let obtainedMarks = rank.totalScore;
                let maxMarks = quizData.maxScore;
                let totalQuestions = quizData.totalNoQuestions;
                let totalIncorrect = rank.totalIncorrect;
                let totalCorrectPercentage = (rank.totalCorrect) * 100 / totalQuestions;
                let totalIncorrectPercentage = (rank.totalIncorrect) * 100 / totalQuestions;
                let totalSkippedPercentage = (rank.unattempted) * 100 / totalQuestions;
                let totalAttempted = totalQuestions - rank.unattempted;
                let totalTimeTaken = rank.totalTime;
                let totalAllotedTime = quizData.totalTime;
                let timeSpentPerQuestion = (totalAttempted) ? (totalTimeTaken / (totalAttempted)) : (totalTimeTaken);
                let advisedTimePerQuestion = totalAllotedTime / totalQuestions;

                let { markedAnswers, allQuestions } = await markedAnsData(quizId, userId);
                let analysisByTopic = await findAnalysisByTopic(markedAnswers, allQuestions);
                let { maxSkippedTopic, maxIncorrectTopic, additionalTopics } = smallAnalysisByTopic(analysisByTopic);

                res.status(200).json({
                    message: "successfully fetched overview data in summary.",
                    data: { quizName, userId, obtainedMarks, maxMarks, totalQuestions, totalIncorrect, totalCorrectPercentage, totalIncorrectPercentage, totalSkippedPercentage, totalTimeTaken, timeSpentPerQuestion, advisedTimePerQuestion, maxSkippedTopic, maxIncorrectTopic, additionalTopics, sortedRank },
                    success: true
                })
            }
            else {
                throw new Error("user did not attempt the quiz.");
            }
        }
        else if (req.query.queryParam == 1) {
            let quiz = await Quiz.findById(quizId).populate({ path: 'sections', populate: { path: 'questions' } });
            quiz = quiz.toJSON();
            let sections = quiz.sections;
            let marked = await Rank.findOne({ quizId, userId }, { markedAns: 1 });
            if (marked) {
                let markedAnswers = marked.markedAns;
                for (let i = 0; i < sections.length; i++) {
                    for (let j = 0; j < sections[i].questions.length; j++) {
                        let question = sections[i].questions[j];
                        if (markedAnswers.has(question._id.toString())) {
                            let markedAnsArray = markedAnswers.get(question._id.toString());
                            let correctAnsArray = question.correctAnswer;
                            let isCorrect = false;
                            if (question.questionType != 2) {
                                markedAnsArray = markedAnsArray.map(v => v + 1);
                            } else if (question.questionType == 2 && correctAnsArray.length == 2) {
                                markedAnsArray.forEach(markedAns => {
                                    if (markedAns >= correctAnsArray[0] && markedAns <= correctAnsArray[1]) {
                                        isCorrect = true;
                                    }
                                })
                            } else if (question.questionType == 2 && correctAnsArray.length == 4) {
                                markedAnsArray.forEach(markedAns => {
                                    if ((markedAns >= correctAnsArray[0] && markedAns <= correctAnsArray[1]) || (markedAns >= correctAnsArray[2] && markedAns <= correctAnsArray[3])) {
                                        isCorrect = true;
                                    }
                                })
                            }
                            let markedAnsString = markedAnsArray.sort().join(',');
                            let correctAnsString = question.correctAnswer.sort().join(',');
                            if (isCorrect || (markedAnsString == correctAnsString)) {
                                quiz.sections[i].questions[j]['status'] = 1;
                                quiz.sections[i].questions[j]['markedAns'] = markedAnsArray;
                            }
                            else {
                                quiz.sections[i].questions[j]['status'] = -1;
                                quiz.sections[i].questions[j]['markedAns'] = markedAnsArray;
                            }
                        } else {
                            quiz.sections[i].questions[j]['status'] = 0;
                        }
                    }
                }
                res.status(200).json({
                    message: "successfully fetched solution data",
                    data: { quiz, userName },
                    success: true
                })
            } else {
                throw new Error("user did not attempt the quiz.");
            }

        }
        else if (req.query.queryParam == 2) {
            try {
                let { markedAnswers, allQuestions } = await markedAnsData(quizId, userId);
                let analysisByTopic = await findAnalysisByTopic(markedAnswers, allQuestions);
                let { maxSkippedTopic, maxIncorrectTopic, additionalTopics } = smallAnalysisByTopic(analysisByTopic);
                let rank = await Rank.findOne({ quizId, userId }, { totalIncorrect: 1 });
                if (rank) {
                    totalIncorrect = rank.totalIncorrect;
                } else {
                    throw new Error("user did not attempt the quiz");
                }
                res.status(200).json({
                    message: "successfully fetched weakness data",
                    data: { totalIncorrect, analysisByTopic, maxSkippedTopic, maxIncorrectTopic, additionalTopics },
                    success: true
                })
            }
            catch (error) {
                throw new Error(error.message);
            }
        }
        else if (req.query.queryParam == 3) {
            try {
                let { markedAnswers, allQuestions } = await markedAnsData(quizId, userId);
                let userMarkedAnswers = markedAnswers;

                let sortedRank = await Rank.find({ quizId: quizId, isSubmitted: true }, { userName: 1, totalScore: 1, userId: 1 }).sort({ totalScore: -1, totalTime: 1 });
                let topperMarked = await Rank.findOne({ quizId: quizId, isSubmitted: true }, { markedAns: 1 }).sort({ totalScore: -1, totalTime: 1 }).limit(0);

                let topperMarkedAnswers = topperMarked.markedAns;
                let userAnalysisByTopic = await findAnalysisByTopic(userMarkedAnswers, allQuestions);
                let topperAnalysisByTopic = await findAnalysisByTopic(topperMarkedAnswers, allQuestions);
                res.status(200).json({
                    message: "successfully fetched comparing data",
                    data: { userId, userAnalysisByTopic, topperAnalysisByTopic, sortedRank },
                    success: true
                })
            }
            catch (error) {
                throw new Error(error.message);
            }
        }
    }
    catch (error) {
        res.status(400).json({
            message: error.message,
            success: false
        })
    }

}





module.exports.quizRegistration = async (req, res) => {
    try {
        const quizId = req.params.id;
        const userId = req.user._id;
        const { contact, parentContact, college, currentYear, givenGate, friendCode } = req.body;
        const registration = await Registration.findOne({ 'current': true }, {"usersEnrolled" : 1});
        const quiz = await Quiz.findOne({_id : quizId}, {"registeredUsers" : 1});
        let msg;
        let randomCode;
        if(!quiz.registeredUsers.includes(userId)){
            randomCode = "AGV" + String(registration.usersEnrolled.length).padStart(3, '0') + "TH";
            registration.usersEnrolled.push({
                userId: req.user._id,
                name: req.user.name,
                email: req.user.email,
                contact: contact,
                parentContact: parentContact,
                college: college,
                currentYear: currentYear,
                givenGate: givenGate,
                ownerCode: randomCode,
                friendCode: friendCode
            })
            await registration.save();
            quiz.registeredUsers.push(userId);
            await quiz.save();
            msg = 'Successfuly registered for quiz'
        }else{
            randomCode = registration.usersEnrolled.filter(obj=> obj.userId == userId)[0].ownerCode;
            msg = 'You are already registered for quiz'
        }
        res.status(200).json({
            message: msg,
            randomCode: randomCode,
            success: true
        })
    }
    catch (error) {
        res.status(500).json({
            message: error.message,
            success: false
        })
    }
}
//its a fischer yates function which takes parameters as array and number of questions required
let shuffle_q = (array, no_questions) => {
    let i = array.length - 1;
    while (i != 0) {
        var r = Math.floor(Math.random() * i);
        var t = array[i];
        array[i] = array[r];
        array[r] = t;
        i--;
    }
    return array.slice(0, no_questions);
}

