const { CronJob } = require("cron");
const { User } = require("../../models");
const { getLocalTimeString } = require("../");
var streakCalculatorJob = new CronJob(
	"0 0 1 * * *",
	async function () {
		try {
			console.log("hi everynight 1 am");
			const users = await User.find({});
			let previousDate = new Date();
			previousDate.setDate(previousDate.getDate() - 1);
			previousDate = getLocalTimeString(previousDate);
			for (let i = 0; i < users.length; i++) {
				let user = users[i];
				let readingDuration = user.readingDuration;
				let testDuration = user.testDuration;

				let prevDateReadingDuration = readingDuration.filter(
					obj => obj.date == previousDate
				);
				if (prevDateReadingDuration.length) {
					user.currentStreakDay++;
				} else {
					let prevDateTestDuration = testDuration.filter(
						obj => obj.date == previousDate
					);
					if (prevDateTestDuration.length) {
						user.currentStreakDay++;
					} else {
						user.currentStreakDay = 0;
					}
				}

				user.longestStreakDay = Math.max(
					user.longestStreakDay,
					user.currentStreakDay
				);
				await user.save();
			}
		} catch (err) {
			console.log(err);
		}
	},
	null,
	true,
	"Asia/Kolkata"
);

module.exports = streakCalculatorJob;
