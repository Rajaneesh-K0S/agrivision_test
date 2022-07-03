const {
	Course,
	Chapter,
	SubTopic,
	User,
	DiscussionQuestion,
	Reply,
} = require("../../../models");
const { getLocalTimeString } = require("../../../utils");

let chapterWiseProgress = async (courseId, chapters, user) => {
	const data = user.courseProgress.filter(
		element => element.courseId == courseId
	);
	chapters.forEach(chapter => {
		z;
		let chapterProg = data.filter(
			obj => obj.chapterId == chapter._id.toString()
		);
		chapter["completedSubtopics"] = chapterProg.length
			? chapterProg[0].subTopics.length
			: 0;
	});
	return chapters;
};

let subTopicWiseProgress = async (courseId, chapter, user) => {
	const data = user.courseProgress.filter(
		element => element.courseId == courseId
	);
	let chapterProg = data.filter(
		obj => obj.chapterId == chapter._id.toString()
	);
	chapter.topics.forEach(topic => {
		topic.subTopics.forEach(subTopic => {
			if (chapterProg.length) {
				if (chapterProg[0].subTopics.includes(subTopic._id)) {
					subTopic["isCompleted"] = true;
				} else {
					subTopic["isCompleted"] = false;
				}
			} else {
				subTopic["isCompleted"] = false;
			}
		});
	});
	return chapter;
};

module.exports.allCourse = async function (req, res) {
	try {
		let courses;
		if (req.query.exam) {
			courses = await Course.find({ exam: req.query.exam, show: true });
		} else if (req.query.subject) {
			courses = await Course.find({
				subject: req.query.subject,
				show: true,
			});
		} else {
			courses = await Course.find({ show: true });
		}
		let data = [];
		courses.forEach(element => {
			data.push({
				courseId: element._id,
				name: element.name,
				subject: element.subject,
				exam: element.exam,
				image: element.bigImage,
				duration: element.duration,
				chapters: element.chapters,
				fullTests: element.fullTests,
				includes: element.includes,
				rating: element.rating,
				price: element.price,
				originalPrice: element.originalPrice,
				highlights: element.highlights,
			});
		});

		res.status(200).json({
			message: "courses fetched",
			data: data,
			success: true,
		});
	} catch (error) {
		res.status(400).json({
			message: error,
			success: false,
		});
	}
};

module.exports.courseById = async function (req, res) {
	try {
		let courseId = req.params.id;
		//queryParam = 0 for chapters and topics only(Desktop25 in figma)
		if (req.query.queryParam == 0) {
			let course = await Course.findById(courseId).populate({
				path: "chapters",
				populate: { path: "topics", select: "name totalSubtopics" },
			});
			course = course.toJSON();
			course.chapters = await chapterWiseProgress(
				courseId,
				course.chapters,
				req.user
			);
			course.chapters.forEach(chapter => {
				if (chapter.freeTrialTopics.length) {
					chapter["isFreeTrial"] = true;
				} else {
					chapter["isFreeTrial"] = false;
				}
			});
			res.status(200).json({
				message: "course fetched",
				data: course,
				success: true,
			});
		}

		//queryParam = 1 for topic and subtopic list of a specific chapter( Desktop11 in figma).
		//Also specify anothery query parameter named "chapterID" which contains the id of the required chapter.
		else if (req.query.queryParam == 1) {
			let chapterId = req.query.chapterID;
			let course = await Course.find({ _id: courseId }, { name: 1 });
			let chapter = await Chapter.findById(chapterId).populate({
				path: "topics",
				populate: { path: "subTopics", select: "name" },
			});
			chapter = chapter.toJSON();
			chapter = await subTopicWiseProgress(courseId, chapter, req.user);
			chapter.freeTrialTopics = chapter.freeTrialTopics.map(
				topic => (topic._id = topic._id.toString())
			);
			chapter.topics.forEach(topic => {
				if (chapter.freeTrialTopics.includes(topic._id.toString())) {
					topic["isFreeTrial"] = true;
				} else {
					topic["isFreeTrial"] = false;
				}
			});
			res.status(200).json({
				message: "course fetched",
				data: { course, chapter },
				success: true,
			});
		}
		// queryParam = 2 for payment page for a specific course
		else if (req.query.queryParam == 2) {
			let course = await Course.findById(courseId).populate([
				{
					path: "feedbacks",
					populate: { path: "user", select: "name image" },
				},
				{
					path: "similarCourses",
					select: "name userEnrolled image chapters fullTests",
				},
			]);
			let ratingsCount = [0, 0, 0, 0, 0];
			let totalRatings = course.feedbacks.length;
			course.feedbacks.forEach(feedback => {
				ratingsCount[5 - feedback.rating]++;
			});
			for (let i = 0; i < ratingsCount.length; i++) {
				ratingsCount[i] = (ratingsCount[i] * 100) / totalRatings;
			}
			let similarCourseData = [];
			course.similarCourses.forEach(course => {
				let obj = {};
				obj["courseId"] = course._id;
				obj["name"] = course.name;
				obj["image"] = course.bigImage;
				obj["userEnrolled"] = course.userEnrolled;
				obj["chapterCount"] = course.chapters.length;
				obj["fullTestCount"] = course.fullTests.length;
				similarCourseData.push(obj);
			});
			let courseData = {};
			courseData["courseId"] = course._id;
			courseData["name"] = course.name;
			courseData["price"] = course.price;
			courseData["chapterCount"] = course.chapters.length;
			courseData["fullTestCount"] = course.fullTests.length;
			courseData["description"] = course.description;
			courseData["rating"] = course.rating;
			courseData["highlights"] = course.highlights;
			courseData["includes"] = course.includes;
			courseData["feedbacks"] = course.feedbacks;
			courseData["ratingPercentages"] = ratingsCount;
			courseData["similarCourses"] = similarCourseData;
			res.status(200).json({
				data: courseData,
				message: "payment page data fetched successfully",
				success: true,
			});
		}
	} catch (error) {
		res.status(500).json({
			message: error.message,
			success: false,
		});
	}
};

// to get the content of a subtopic

module.exports.subTopics = async (req, res) => {
	let subTopicId = req.params.id;
	try {
		let subTopic = await SubTopic.findById(subTopicId).populate("quiz");
		if (subTopic.contentType == 0) {
			res.status(200).json({
				contentType: 0,
				data: subTopic.content,
				message: "pdf data fetched successfully.",
				success: "true",
			});
		} else if (subTopic.contentType == 1) {
			let videoData = subTopic.content;
			res.status(200).json({
				contentType: 1,
				data: videoData,
				message: "Quiz data fetched successfully.",
				success: "true",
			});
		} else if (subTopic.contentType == 2) {
			let quizData = subTopic.quiz;
			res.status(200).json({
				contentType: 2,
				data: quizData,
				message: "Quiz data fetched successfully.",
				success: "true",
			});
		}
	} catch (error) {
		res.status(400).json({
			message: error,
			success: "false",
		});
	}
};

module.exports.markCompleted = async function (req, res) {
	try {
		let courseId = req.params.id;
		let userId = req.user._id;
		const { subTopicId, chapterId } = req.body;

		const user = await User.findById(userId);

		const subTopic = await SubTopic.findById(subTopicId);
		let flag = 0;
		user.courseProgress.forEach(element => {
			if (element.courseId == courseId && element.chapterId == chapterId) {
				flag = 1;
				if (!element.subTopics.includes(subTopicId)) {
					element.subTopics.push(subTopicId);
				}
			}
		});
		if (!flag) {
			user.courseProgress.push({
				courseId: courseId,
				chapterId: chapterId,
				subTopics: [subTopicId],
			});
		}
		user.lastCompleted = subTopicId;
		user.totalTimeSpent += subTopic.duration;
		const date = getLocalTimeString(new Date());
		let readingDuration =
			user.readingDuration[user.readingDuration.length - 1];
		if (!readingDuration || !(readingDuration.date == date)) {
			user.readingDuration.push({
				date: date,
				duration: subTopic.duration,
			});
		} else {
			readingDuration.duration += subTopic.duration;
		}
		await user.save();
		return res.status(200).json({
			success: true,
			message: "subtopic marked as completed",
		});
	} catch (error) {
		console.log(error);
		return res.status(400).json({
			success: false,
			message: "something went wrong",
		});
	}
};

module.exports.liveClass = async function (req, res) {
	try {
		let courseId = req.params.id;
		let course = await Course.findById(courseId);
		let courseData = {};

		courseData["courseId"] = course._id;
		courseData["dateTime"] = course.dateTime;
		courseData["platform"] = course.platform;
		res.status(200).json({
			data: courseData,
			message: "live Class data fetched successfully",
			success: true,
		});
	} catch (error) {
		console.log(error);
		res.status(500).json({
			message: error.message,
			success: false,
		});
	}
};
