const {
	TestSeries,
	Subject,
	User,
	Quiz,
	Registration,
} = require("../../../models");

module.exports.allTestSeries = async function (req, res) {
	try {
		let data = {};
		if (req.query.page == 0) {
			let testSeries = await TestSeries.find({ show: true }).populate({
				path: "quizzes",
				select: "category",
			});
			testSeries.forEach((test, i) => {
				test = test.toJSON();
				test["fullLengthTestCount"] = test.quizzes.filter(
					obj => obj.category == 2
				).length;
				test["sectionalTestCount"] = test.quizzes.filter(
					obj => obj.category == 1
				).length;
				test["previousTestCount"] = test.quizzes.filter(
					obj => obj.category == 0
				).length;
				test["modelTestCount"] = test.fullLengthTestCount;
				delete test.quizzes;
				testSeries[i] = test;
				// console.log(fullLengthTestCount, sectionalTestCount, previousTestCount, modelTestCount);
			});
			let popularTestSeries = testSeries.filter(
				obj => obj.isPopular == true
			);
			let freeTestSeries = testSeries.filter(
				obj => obj.price == 0 || obj.isPublic == true
			);
			let examTestSeries = testSeries;
			const examMap = new Map();
			examTestSeries.forEach(testSeries => {
				examMap.set(testSeries.exam, []);
			});
			examTestSeries.forEach(testSeries => {
				let testSeriesArray = examMap.get(testSeries.exam);
				examMap[testSeries.exam] = testSeriesArray.push(testSeries);
			});
			examTestSeries = examMap;

			data = {
				popularTestSeries: popularTestSeries,
				freeTestSeries: freeTestSeries,
				examTestSeries: [...examTestSeries],
			};
		}

		if (req.query.page == 1) {
			if (req.query.exam) {
				let examWiseQuizes = await Quiz.find(
					{ category: 0, generalPYQ: true, exam: req.query.exam },
					{
						name: 1,
						category: 1,
						quizStartDate: 1,
						Poster: 1,
						syllabus: 1,
					}
				);
				data = { exam: req.query.exam };
				data["quizzes"] = examWiseQuizes;
			} else {
				let attemptedQuizes = [];
				if (req.query.userId) {
					let user = await User.findOne({
						_id: req.query.userId,
					}).populate({ path: "completedQuizes", select: "name subject" });
					attemptedQuizes = user.completedQuizes;
				}
				let examWiseQuizes = await Quiz.find(
					{ category: 0, generalPYQ: true },
					{ exam: 1 }
				);
				let exams = [];
				examWiseQuizes.forEach(quiz => {
					let ob = exams.filter(e => e.exam == quiz.exam);
					if (ob.length) {
						ob[0].quizCount++;
					} else {
						exams.push({ exam: quiz.exam, quizCount: 1 });
					}
				});
				data = {
					examWiseQuizes: exams,
					attemptedQuizes: [...attemptedQuizes],
				};
			}
		}

		if (req.query.page == 2) {
			let quizzes = await Quiz.find({ quizType: 3 });
			let subjectWiseQuizes = quizzes;
			let chapterWiseQuizes = quizzes;
			let fullLengthTest = quizzes.filter(obj => obj.category == 2);
			let freeQuizes = quizzes.filter(obj => obj.Price == 0);
			const subjectMap = new Map();
			subjectWiseQuizes.forEach(quiz => {
				subjectMap.set(quiz.subject, []);
			});
			subjectWiseQuizes.forEach(quiz => {
				let quizArray = subjectMap.get(quiz.subject);
				subjectMap[quiz.subject] = quizArray.push(quiz);
			});
			subjectWiseQuizes = subjectMap;

			const chapterMap = new Map();
			chapterWiseQuizes.forEach(quiz => {
				chapterMap.set(quiz.chapter, []);
			});
			chapterWiseQuizes.forEach(quiz => {
				let chapterQuizArray = chapterMap.get(quiz.chapter);
				chapterMap[quiz.chapter] = chapterQuizArray.push(quiz);
			});
			chapterWiseQuizes = chapterMap;

			data = {
				fullLengthTest: fullLengthTest,
				freeQuizes: freeQuizes,
				subjectWiseQuizes: [...subjectWiseQuizes],
				chapterWiseQuizes: [...chapterWiseQuizes],
			};
		}

		if (req.query.page == 3) {
			const quiz = await Registration.findOne({ current: true });
			let isAlreadyRegistered = false;
			let randomCode = "";
			if (req.query.userId) {
				quiz.usersEnrolled.forEach(user => {
					if (user.userId == req.query.userId) {
						isAlreadyRegistered = true;
						randomCode = user.ownerCode;
					}
				});
			}

			data = {
				quizName: quiz.examName,
				date: quiz.date,
				time: quiz.time,
				quizId: quiz.quizId,
				isAlreadyRegistered: isAlreadyRegistered,
				randomCode: randomCode,
			};
		}

		res.status(200).json({
			message: "test series fetched",
			data: data,
			success: true,
		});
	} catch (error) {
		res.status(400).json({
			message: error.message,
			success: false,
		});
	}
};

module.exports.testSeriesById = async function (req, res) {
	let testSeriesId = req.params.id;
	try {
		if (req.query.queryParam == 0) {
			let category = req.query.category;
			let testSeries = await TestSeries.findOne(
				{ _id: testSeriesId },
				{ name: 1, freeTrialQuizzes: 1 }
			).populate({
				path: "quizzes",
				select: "name category Poster quizStartDate syllabus",
			});
			if (category) {
				let categoryWiseQuizzes = testSeries.quizzes.filter(
					quiz => quiz.category == category
				);
				testSeries.quizzes = categoryWiseQuizzes;
			}
			testSeries = testSeries.toJSON();
			testSeries.freeTrialQuizzes = testSeries.freeTrialQuizzes.map(
				quiz => (quiz._id = quiz._id.toString())
			);
			testSeries.quizzes.forEach(quiz => {
				let date = new Date(quiz.quizStartDate);
				quiz.quizStartDate = date.getTime();
				if (testSeries.freeTrialQuizzes.includes(quiz._id.toString())) {
					quiz["isFreeTrial"] = true;
				} else {
					quiz["isFreeTrial"] = false;
				}
			});

			res.status(200).json({
				isSbuscribed: req.body.isSubscribed,
				message: "test series fetched",
				data: testSeries,
				success: true,
			});
		}

		// queryParam = 1 for payment page for a specific test series
		else if (req.query.queryParam == 1) {
			if (!req.body.isSubscribed) {
				let testSeries = await TestSeries.findById(testSeriesId).populate([
					{
						path: "feedbacks",
						populate: { path: "user", select: "name image" },
					},
					{
						path: "similarTestSeries",
						select: "name userEnrolled bigImage",
					},
				]);
				let ratingsCount = [0, 0, 0, 0, 0];
				let totalRatings = testSeries.feedbacks.length;
				testSeries.feedbacks.forEach(feedback => {
					ratingsCount[5 - feedback.rating]++;
				});
				for (let i = 0; i < ratingsCount.length; i++) {
					ratingsCount[i] = (ratingsCount[i] * 100) / totalRatings;
				}
				let similarTestSeriesData = [];
				testSeries.similarTestSeries.forEach(testSeries => {
					let obj = {};
					obj["testSeriesId"] = testSeries._id;
					obj["name"] = testSeries.name;
					obj["image"] = testSeries.bigImage;
					obj["userEnrolled"] = testSeries.userEnrolled;
					similarTestSeriesData.push(obj);
				});
				let testSeriesData = {};
				testSeriesData["testSeriesId"] = testSeries._id;
				testSeriesData["isPublic"] = testSeries.isPublic;
				testSeriesData["name"] = testSeries.name;
				testSeriesData["price"] = testSeries.price;
				testSeriesData["description"] = testSeries.description;
				testSeriesData["noOfQuizzes"] = testSeries.quizzes.length;
				testSeriesData["rating"] = testSeries.rating;
				testSeriesData["highlights"] = testSeries.highlights;
				testSeriesData["includes"] = testSeries.includes;
				testSeriesData["feedbacks"] = testSeries.feedbacks;
				testSeriesData["ratingPercentages"] = ratingsCount;
				testSeriesData["similarTestSeries"] = similarTestSeriesData;
				res.status(200).json({
					isSubscribed: false,
					data: testSeriesData,
					message: "payment page data fetched successfully",
					success: true,
				});
			} else {
				res.status(200).json({
					isSubscribed: true,
					message: "test series already subscribed.",
					success: true,
				});
			}
		}
	} catch (error) {
		res.status(400).json({
			message: error.message,
			success: false,
		});
	}
};

module.exports.markCompleted = async function (req, res) {
	try {
		let testSeriesId = req.params.id;
		const { quizId } = req.body;

		const user = await User.findById(req.user._id);

		let flag = 0;
		user.testSeriesProgress.forEach(element => {
			if (element.testSeriesId == testSeriesId) {
				flag = 1;
				element.quizzes.push(quizId);
			}
		});
		if (!flag) {
			user.testSeriesProgress.push({
				testSeriesId: testSeriesId,
				quizzes: [quizId],
			});
		}
		await user.save();
		// user.lastCompleted = subTopicId;
		// user.totalTimeSpent += subTopic.duration;
		// const date = new Date().toLocaleString(undefined, { timeZone: 'Asia/Kolkata' }).split(',')[0];
		// let readingDuration = user.readingDuration[user.readingDuration.length - 1];
		// if(!readingDuration || !readingDuration.date == date){
		//     user.readingDuration.push({
		//         date:date,
		//         duration:subTopic.duration
		//     });
		// }else{
		//     readingDuration.duration += subTopic.duration;
		// }
		// await user.save();
		return res.status(200).json({
			success: true,
			message: "quiz marked as completed",
		});
	} catch (error) {
		console.log(error);
		return res.status(400).json({
			success: false,
			message: error.message,
		});
	}
};

module.exports.testSeriesProgress = async function (req, res) {
	try {
		const testSeriesId = req.params.id;
		let user = await User.findOne(
			{ _id: req.user._id },
			{ testSeriesProgress: 1 }
		);
		let testSeries = await TestSeries.findOne(
			{ _id: testSeriesId },
			{ quizzes: 1 }
		);
		const data = user.testSeriesProgress.filter(
			element => element.testSeriesId == testSeriesId
		);
		if (!data) {
			return res.status(400).json({
				message: "invalid id",
				success: false,
			});
		}
		let completedQuizzes = data[0].quizzes;
		let totalQuizCount = testSeries.quizzes.length;
		return res.status(200).json({
			message: "successfully fetched testSeries progress",
			data: { totalQuizCount, completedQuizzes },
			success: true,
		});
	} catch (error) {
		console.log(error);
		res.status(400).json({
			message: error.message,
			success: false,
		});
	}
};
