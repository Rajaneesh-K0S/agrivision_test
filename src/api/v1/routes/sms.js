const { Router } = require('express');
const router = Router();
var unirest = require("unirest");




router.post('/send',async(req,res)=>{
    try{
        const {otpMessage,number}=req.body;
        
        
        let data = {
            "route" : "v3",
            "sender_id" : process.env.sender_id,
            "message" : otpMessage,
            "language" : "english",
            "flash" : 0,
            "numbers" : number,
            }
        const request=unirest("POST", "https://www.fast2sms.com/dev/bulkV2");
        request.headers({
            "authorization": process.env.sms_api_key,
            "Content-Type":"application/json"
        })
        request.form(data)
        
        request.end(function (response) {
            if (response.error) throw new Error(response.error);
            
        });

        
        
        res.status(200).json({
            success:true,
            message:"otp sent successfully"
        });
    }
    catch(error){
        res.status(400).json({
            error: error.message,
            message: 'Something went wrong',
            success: false
        });
    }
    
})






module.exports = router;