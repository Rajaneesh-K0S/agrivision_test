 const CronJob = require('cron').CronJob;
 const { User } = require('../../models');
 var job = new CronJob('* 1 0 * * *', async function() {
     const user =await User.find({});
     let date = new Date();
     date.setDate(date.getDate() - 1);
     user.forEach(async(user) => {
         if(user.readingDuration[0]){
            if(user.readingDuration[user.readingDuration.length - 1].date == date.toLocaleString(undefined, { timeZone: 'Asia/Kolkata' }).split(',')[0]){
                user.currentStreakDay++;
            }else{
                user.currentStreakDay = 0;
            }
            user.longestStreakDay = Math.max(user.longestStreakDay, user.currentStreakDay);
             await user.save();
         }
     });
 }, null, true, 'Asia/Kolkata');
 module.exports = job;
