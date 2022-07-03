const mongoose = require("mongoose");
const { Schema } = mongoose;

const questionSchema = new Schema(
	{
		question: { type: String, required: true },
		user: {
			type: Schema.Types.ObjectId,
			ref: "User",
		},
		courseId: {
			type: Schema.Types.ObjectId,
		},
		replies: [
			{
				type: Schema.Types.ObjectId,
				ref: "Reply",
			},
		],
		topics: [String], // not sure
		upvotes: [Schema.Types.ObjectId],
		upvotesNumber: { type: Number, default: 0 },
	},
	{
		timestamps: true,
	}
);

const replySchema = new Schema(
	{
		reply: { type: String, required: true },
		user: {
			type: Schema.Types.ObjectId,
			ref: "User",
		},
	},
	{
		timestamps: true,
	}
);

const DiscussionQuestion = mongoose.model("DiscussionQuestion", questionSchema);
const Reply = mongoose.model("Reply", replySchema);

module.exports = {
	DiscussionQuestion,
	Reply,
};
