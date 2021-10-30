const { Question, Quiz, Rank, Course, TestSeries, User } = require("../../../models");


let markedAnsData = async (quizId, userId) => {
    let marked = await Rank.findOne({ quizId, userId }, { markedAns: 1 });
    if (marked) {
        let markedAnswers = marked.markedAns;
        let allQuestions = await Question.find({ quizId }, { 'topic': 1, 'correctAnswer': 1, 'marking': 1, 'negMarking': 1 });
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
            let markedAnsArray = markedAnswers.get(question._id.toString());
            if (ques.questionType != 2) {
                markedAnsArray = markedAnsArray.map(v => v + 1);
            }
            let markedAnsString = markedAnsArray.sort().join(',');
            let correctAnsString = question.correctAnswer.sort().join(',');
            if (markedAnsString == correctAnsString) {
                obj['totalCorrect']++;
                obj['positiveMarks'] += ques.positiveMarks;
                obj['totalScore'] += ques.positiveMarks;
            } else {
                obj['totalInorrect']++;
                obj['totalScore'] -= ques.negativeMarks;
            }
        } else {
            obj['unattempted']++;
        }
    })
    return obj;
}

module.exports.calculateRankForAll = async (quizId) => {
    try {
        let ranks = await Rank.find({ quizId });
        for (let i = 0; i < ranks.length; i++) {
            let userId = ranks[i].userId;
            let { markedAnswers, allQuestions } = await markedAnsData(quizId, userId);
            let obj = calculateRank(markedAnswers, allQuestions);
            await Rank.findOneAndUpdate({ userId, quizId }, obj);
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
            if (question.questionType != 2) {
                markedAnsArray = markedAnsArray.map(v => v + 1);
            }
            let markedAnsString = markedAnsArray.sort().join(',');
            let correctAnsString = question.correctAnswer.sort().join(',');
            if (markedAnsString == correctAnsString) {
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
                        let testSeries = await TestSeries.findOne({ "quizzes": quizId }, { _id: 1 });
                        if (testSeries) {
                            let user = await User.findOne({ _id: userId, "testSeries": testSeries._id }, { _id: 1 });
                            if (user) {
                                isSubscribed = true;
                            }
                        }
                    } else if (quiz.quizType == 2) {
                        let course = await Course.findOne({ "fullTests": quizId }, { _id: 1 });
                        if (course) {
                            let user = await User.findOne({ _id: userId, "courses": course._id }, { _id: 1 });
                            if (user) {
                                isSubscribed = true;
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
        if (req.body.isSubscribed) {
            let isSubscribed = true;
            let msg = '';
            const quiz = await Quiz.findById(quizId).populate({ path: 'sections', populate: { path: 'questions' } });
            let rank = await Rank.findOne({ userId, quizId });
            if (!rank) {
                rank = new Rank({ quizId, userId, userName: req.user.name, unattempted: quiz.totalNoQuestions, markedAns: {} });
                await rank.save();
                isSubscribed = true;
                msg = 'quiz was successfully found and sent';
            }else if(!rank.isSubmitted){
                isSubscribed = true;
                msg = 'quiz was successfully found and sent';
            }else if(rank.isSubmitted){
                isSubscribed = false;
                msg = 'You have already attempted the quiz';
            }
            res.status(200).json({
                    isSubscribed: isSubscribed,
                    data: (isSubscribed)?quiz:null,
                    message: msg,
                    success: true
                });

        } else {
            res.status(200).json({
                isSubscribed: false,
                message: "You are not registered for this quiz.",
                success: true
            })
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
        const userId = req.user._id
        const quiz = await Quiz.findById(quizId);
        const startTime = quiz.startTime;
        const finishedTime = Math.min(new Date().getTime(), quiz.endTime);
        const totalTime = finishedTime - startTime;
        await Rank.findOneAndUpdate({ userId, quizId }, { isSubmitted: true, totalTime: totalTime });
        if (quiz.quizType == 1 || quiz.quizType == 2 || quiz.quizType == 3) {
            let { markedAnswers, allQuestions } = await markedAnsData(quizId, userId);
            let rankObj = calculateRank(markedAnswers, allQuestions);
            await Rank.findOneAndUpdate({ userId, quizId }, rankObj);
        }
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
    // let userId = '616a40b67a5512001682343c';
    // 0 for overview, 1 for solution, 2 for weakness, 3 for comprasion 
    try {
        if (req.query.queryParam == 0) {
            let rank = await Rank.findOne({ userId, quizId });
            let sortedRank = await Rank.find({ quizId }, { userName: 1, totalScore: 1, userId : 1 }).sort({ totalScore: -1, totalTime: 1 });
            let quizData = await Quiz.findOne({ _id: quizId }, { name: 1, maxScore: 1, totalNoQuestions: 1, totalTime: 1, chapters: 1 });
            if (rank) {
                let obtainedMarks = rank.totalScore;
                let maxMarks = quizData.maxScore;
                let totalQuestions = quizData.totalNoQuestions;
                let totalIncorrect = rank.totalIncorrect;
                let totalCorrectPercentage = (rank.totalCorrect) * 100 / totalQuestions;
                let totalIncorrectPercentage = (rank.totalIncorrect) * 100 / totalQuestions;
                let totalSkippedPercentage = (rank.unattempted) * 100 / totalQuestions;
                let totalTimeTaken = rank.totalTime;
                let totalAllotedTime = quizData.totalTime;
                let timeSpentPerQuestion = totalTimeTaken / (totalQuestions);
                let advisedTimePerQuestion = totalAllotedTime / totalQuestions;

                let { markedAnswers, allQuestions } = await markedAnsData(quizId, userId);
                let analysisByTopic = await findAnalysisByTopic(markedAnswers, allQuestions);
                let { maxSkippedTopic, maxIncorrectTopic, additionalTopics } = smallAnalysisByTopic(analysisByTopic);

                res.status(200).json({
                    message: "successfully fetched overview data in summary.",
                    data: { userId, obtainedMarks, maxMarks, totalQuestions, totalIncorrect, totalCorrectPercentage, totalIncorrectPercentage, totalSkippedPercentage, totalTimeTaken, timeSpentPerQuestion, advisedTimePerQuestion, maxSkippedTopic, maxIncorrectTopic, additionalTopics, sortedRank },
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
                            if (question.questionType != 2) {
                                markedAnsArray = markedAnsArray.map(v => v + 1);
                            }
                            let markedAnsString = markedAnsArray.sort().join(',');
                            let correctAnsString = question.correctAnswer.sort().join(',');
                            if (markedAnsString == correctAnsString) {
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
                    data: quiz,
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
                let sortedRank = await Rank.find({ quizId }, { userName: 1, totalScore: 1, userId : 1 }).sort({ totalScore: -1, totalTime: 1 });
                let topperMarked = await Rank.findOne({ quizId }, { markedAns: 1 }).sort({ totalScore: -1, totalTime: 1 }).limit(0);
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





