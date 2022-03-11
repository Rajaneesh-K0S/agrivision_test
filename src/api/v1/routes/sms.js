const { Router } = require('express');
const router = Router();
const passport = require('passport');
var unirest = require("unirest");
let {generateOTP} = require('../../../utils');
const {User} = require("../../../models/");




router.post('/sendOtp', passport.authenticate('jwt', { session:false }), async (req, res) => {
    try {
        const { number } = req.body;
        let otp = generateOTP();
        await User.updateOne({_id : req.user._id}, {"randString" : otp});
        let data = {
            "route": "v3",
            "sender_id": process.env.senderId,
            "message": `Your otp for verification is ${otp}`,
            "language": "english",
            "flash": 0,
            "numbers": number,
        }

        const request = unirest("POST", "https://www.fast2sms.com/dev/bulkV2");
        request.headers({
            "authorization": process.env.smsApiKey,
            "Content-Type": "application/json"
        })
        request.form(data)

        request.end(function (response) {
            let message, statusCode = 500, success = false;
            if(response.body.return == false){
                message = response.body.message;
            }else{
                message = "Otp sent successfully.";
                statusCode = 200;
                success = true;
            } 
            res.status(statusCode).json({
                success,
                message
            })
        });
    }
    catch (error) {
        res.status(500).json({
            message: error.message,
            success: false
        });
    }
})






module.exports = router;