const { DiscussionQuestion, Reply } = require("../../../models");

module.exports.getDiscussionQuestions = async function (req, res) {
	try {
		let courseId = req.params.id;
		let questions = await DiscussionQuestion.find({ courseId })
			.populate({
				path: "user",
				select: "name image",
			})
			.populate({
				path: "replies",
				populate: { path: "user", select: "name image updatedAt" },
			});
		res.status(200).json({
			success: true,
			length: questions.length,
			data: {
				questions,
			},
		});
	} catch (error) {
		console.log(error);
		res.status(500).json({
			message: error.message,
			success: false,
		});
	}
};

module.exports.filterDiscussionQuestions = async function (req, res) {
	try {
		let questions = DiscussionQuestion.find({
			courseId: req.params.id,
		});
		//127.0.0.1:3000/v1/discussion/discussionFilter/616db84b47d4a9bc084a699e?sort=upvotes&topics=organic,inorganic&ownQuestions=1

		if (req.query.topics) {
			const topics = req.query.topics.split(",");
			questions = questions.find({ topics: { $all: topics } });
		}
		if (req.query.ownQuestions == "1") {
			// questions = questions.find({ user: req.body.user }); for testing purpose
			questions = questions.find({ user: req.user._id });
		}
		if (req.query.sort) {
			if (req.query.sort === "upvotes") {
				questions = questions.sort({ upvotesNumber: -1 });
			} else if (req.query.sort === "recent") {
				questions = questions.sort("-createdAt");
				// return last created first
			}
		}

		questions = await questions
			.populate({
				path: "user",
				select: "name image",
			})
			.populate({
				path: "replies",
				populate: { path: "user", select: "name image" },
			});
		res.status(200).json({
			success: true,
			length: questions.length,
			data: questions,
		});
	} catch (error) {
		console.log(error);
		res.status(500).json({
			message: error.message,
			success: false,
		});
	}
};

module.exports.createQuestion = async function (req, res) {
	// question / user / course / topics
	try {
		let question = await DiscussionQuestion.create({
			question: req.body.question,
			topics: req.body.topics,
			user: req.user._id,
			// user: req.body.user, testing purpose
			courseId: req.params.id,
		});
		res.status(200).json({
			success: true,
			data: question,
		});
	} catch (error) {
		console.log(error);
		res.status(500).json({
			message: error.message,
			success: false,
		});
	}
};

module.exports.createReply = async function (req, res) {
	// reply / req.params.questionId
	try {
		const reply = await Reply.create({
			reply: req.body.reply,
			user: req.user._id,
			// user: req.body.user, testing purpose
		});
		const question = await DiscussionQuestion.findById(req.params.id);
		question.replies.push(reply._id);
		await question.save();

		res.status(200).json({
			success: true,
			data: reply,
		});
	} catch (error) {
		console.log(error);
		res.status(500).json({
			message: error.message,
			success: false,
		});
	}
};

module.exports.upVote = async function (req, res) {
	// QuestionId req.user._id
	const question = await DiscussionQuestion.findById(req.params.id);
	// if (!question.upvotes.includes(req.user._id)) {
	if (!question.upvotes.includes(req.body._id)) {
		question.upvotesNumber++;
		question.upvotes.push(req.user._id);
		// question.upvotes.push(req.body._id); testing purpose
		await question.save();

		res.status(200).json({
			success: true,
			message: "upvoted",
			upvotes: question.upvotesNumber,
		});
	} else {
		res.status(200).json({
			success: false,
			message: "cannot upvote again",
			upvotes: question.upvotesNumber,
		});
	}
};
