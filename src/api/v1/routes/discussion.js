const { Router } = require("express");
const router = Router();
const passport = require("passport");
const discussionController = require("../controllers/discussionController");
const { isCourseSubscribed } = require("../../../config/subscriptionCheck");

//localhost:3000/v1/discussion/

router.get(
	"/:id",
	passport.authenticate("jwt", { session: false }),
	isCourseSubscribed,
	discussionController.getDiscussionQuestions
);

router.get(
	"/discussionFilter/:id",
	passport.authenticate("jwt", { session: false }),
	isCourseSubscribed,
	discussionController.filterDiscussionQuestions
);

router.post(
	"/askQuestion/:id",
	passport.authenticate("jwt", { session: false }),
	isCourseSubscribed,
	discussionController.createQuestion
);
router.post(
	"/addreply/:id",
	passport.authenticate("jwt", { session: false }),
	isCourseSubscribed,
	discussionController.createReply
);

router.post(
	"/upvote/:id",
	passport.authenticate("jwt", { session: false }),
	isCourseSubscribed,
	discussionController.upVote
);

module.exports = router;
