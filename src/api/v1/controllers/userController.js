const { User,  SubTopic } = require('../../../models');
const bcrypt = require('bcrypt');
const { randString, generateToken } = require('../../../utils');
const transporter = require('../../../config/nodemailer');

// const { boolean } = require('joi');
// module.exports.userProfile=async(req,res)=>{
//    try {
//        let user=await User.findById(req.user._id);
//        return res.status(200).json({
//            user:{
//                name:user.name,
//                email:user.email,
//                _id:user._id,
//                courses:user.courses
//            },
//            success:true
//        })
//    } catch (error) {
//     res.status(500).json({
//         message: 'something went wrong',
//         success: false,
//     });
//    }
// }


module.exports.registerUser = async (req, res) => {
    try {

        let user = await User.findOne({ email: req.body.email });

        if (user) {
            return res.status(400).json({
                message: 'User already exists',
                success: false,
            });
        }
        let confirmationCode = randString();
        await transporter.sendMail({
            from: 'AgriVision4U <sprajapati14012002@gmail.com>',
            to: req.body.email,
            subject: 'Please confirm your Email',
            html: `<h1>Email Confirmation</h1>
                      <h2>Hello ${req.body.name[0]}  ${req.body.name[1]}</h2>
                      <br>
                      <h3>We welcome you as a part of our <b>AgriVision4U</b> family.</h3>
                      <p>Kindly click on the link below to confirm your e-mail address.</p>
                      <a href='https://www.agrivision4u.com?confirm=${confirmationCode}'><h3> Click here</h3></a>
                      <p style = "color : rbg(150, 148, 137)">Please do not reply to this e-mail. This address is automated and cannot help with questions or requests.</p>
                      <h4>If you have questions please write to info@agrivision4u.com. You may also call us at <a href="tel:7510545225">7510545225</a></h4>
                      </div>`,
        });

        let hash = await bcrypt.hash(req.body.password, 10);

        user = new User({
            name: req.body.name,
            email: req.body.email,
            password: hash,
            randString: confirmationCode
        });

        let token = generateToken(user);

        await user.save();

        res.status(200).json({
            message: 'Please verify your email to login',
            data: {
                user: user,
                token: token,
            },
            success: true,
        });
    } catch (err) {
        res.status(500).json({
            error: err.message,
            message: 'something went wrong',
            success: false,
        });
    }
};

module.exports.login = async function (req, res) {

    try {
        let user = await User.findOne({ email: req.body.email });

        if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
            return res.status(400).json({
                message: 'invalid email or password',
                success: false,
            });

        }

        if (!user.isVerified) {
            return res.status(200).json({
                message: 'Please verify your email',
                success: false
            });
        }

        let token = generateToken(user);

        res.status(200).json({
            message: 'User logged in successfully',
            data: {
                user:{
                    name:user.name,
                    email:user.email,
                    _id:user._id,
                    courses:user.courses
                }, token
            },
            success: true,
        });

    } catch (error) {
        res.status(500).json({
            message: 'something went wrong',
            success: false,
        });
    }
};

module.exports.googleOauth = async function (req, res) {
    const user = await User.findOne({ email: req.user.email });
    const token = generateToken(user);
    return res.status(200).send({ token, user });
};


module.exports.confirmEmail = async function (req, res) {

    const secret = req.query.confirm;
    const user = await User.findOne({ randString: secret });
    try {
        if (user) {
            user.isVerified = true;
            user.randString = null;
            await user.save();
            let token = generateToken(user);

            return res.status(200).json({
                message: 'Email verified. Welcome to AgriVision4u',
                data: {
                    user: user,
                    token: token,
                    success: true
                }
            });

        } else {
            return res.status(400).json({
                message: 'user doesnt exist',
                success: false
            });
        }
    }
    catch (err) {
        res.status(500).json({
            message: 'something went wrong',
            success: false,
        });
    }
};

module.exports.resetPassword = async function (req, res) {

    try {
        let user = await User.findOne({ randString: req.query.forgot });
        if (!user) {
            return res.status(400).json({
                message: 'Bad Request',
                success: false
            });
        } else {
            const hash = await bcrypt.hash(req.body.password, 10);
            user.password = hash;
            user.randString = null;
            await user.save();
            return res.status(200).json({
                message: 'Password updated.Please login using new password',
                success: true
            });
        }
    } catch (error) {
        res.status(500).json({
            message: 'something went wrong',
            success: false,
        });
    }
};


module.exports.forgotPassword = async function (req, res) {

    try {
        const email = (req.body.email);
        let user = await User.findOne({ email });
        const confirmationCode = randString();

        if (user) {

            user.randString = confirmationCode;
            await user.save();
            transporter.sendMail({
                from: 'AgriVision4U <sprajapati14012002@gmail.com>',
                to: req.body.email,
                subject: 'Reset Password',
                html: `<h1>Reset Password</h1>
                  <h2>Hello ${user.name}</h2>
                  <br>
                  <p>Kindly click on the link below to reset your password.</p>
                  <a href='https://agrivision4u.com?forgot=${confirmationCode}'> Click here</a>
                  <p style = "color : rbg(150, 148, 137)">Please do not reply to this e-mail. This address is automated and cannot help with questions or requests.</p>
                  <h4>If you have questions please write to info@agrivision4u.com. You may also call us at <a href="tel:7510545225">7510545225</a></h4>
              </div>`,
            });

            return res.status(200).json({
                message: 'Please check your mail to reset password',
                success: true
            });

        }
        else {
            return res.status(400).json({
                message: 'Email is not registered',
                success: true
            });
        }
    } catch (error) {
        res.status(500).json({
            message: 'something went wrong',
            success: false,
        });
    }
};


module.exports.addReminder = async function(req, res){
    try {
        let user = await User.findById(req.user._id);
        let reminder = {
            task:req.body.task,
            date:req.body.date
        };
        user.reminder.push(reminder);
        await user.save();
        return res.status(200).json({
            success:true,
            message:'reminder added successfully'
        });
    } catch (error) {
        return res.status(400).json({
            success:false,
            message:'something went wrong'
        });
    }
};


module.exports.addToCart = async(req, res)=>{

    let userId = req.params.id;
    let courseId = req.body.courseId;
    let testSeriesId = req.body.testSeriesId;
    try{
        //let user = await User.findById(userId);
        if(courseId){
            // user.cart.courses.push(courseId);
            // await user.save();
            await User.updateOne({ _id : userId }, { '$push' :  { 'cart.courses' : courseId   }});
            res.status(300).json({
                message : 'successfully added course in cart',
                success : true
            });
        }
        else if(testSeriesId){
            user.cart.testSeries.push(courseId);
            await user.save();
            await User.updateOne({ _id : userId }, { '$push' : { 'cart.testSeries' : testSeriesId } });
            res.status(300).json({
                message : 'successfully added testSeries in cart',
                success : true
            });
        }
    }
    catch(error){
        res.status(400).json({
            message : error.message,
            success : false
        });
    }

};


module.exports.getCart = async (req, res)=>{
    let userId = req.params.id;
    try{
        let user = await User.findById(userId).populate({path: 'cart',populate:{path:'courses'}});
        let cart = user.cart;
        let testSeriesItems = [];
        let courseItems = [];
        let totalAmount = 0;
        cart.testSeries.forEach(test=>{
            totalAmount += test.price;
            let itemObj = {};
            itemObj['name'] = test.name;
            itemObj['price'] = test.price;
            itemObj['description'] = test.description;
            itemObj['testSeriesId'] = test._id;
            itemObj['image'] = test.smallImage;
            testSeriesItems.push(itemObj); 
        });
        cart.courses.forEach(course=>{
            totalAmount += course.price;
            let itemObj = {};
            itemObj['name'] = course.name;
            itemObj['price'] = course.price;
            itemObj['description'] = course.description;
            itemObj['courseId'] = course._id;
            itemObj['image'] = course.smallImage;
            courseItems.push(itemObj); 
        });
         
        let totalItems = testSeriesItems.length + courseItems.length;

        res.status(200).json({
            data : { totalItems, courseItems, testSeriesItems, totalAmount },
            message : 'successfully fetched cart data',
            success : true
        });
    }
    catch(error){
        res.status(400).json({
            message : error.message,
            success : false
        });
    }
};


module.exports.deleteProductInCart = async function (req, res) {
    let userId = req.params.id;
    let courseId = req.body.courseId;
    let testSeriesId = req.body.testSeriesId;
    try{
        
        if(courseId){
            await User.updateOne({ _id : userId }, { '$pull' :  { 'cart.courses' : courseId   }});
            res.status(300).json({
                message : 'deleted successfully',
                success : true
            });
        }
        else if(testSeriesId){
            await User.updateOne({ _id : userId },{ '$pull' :  { 'cart.testSeries' : courseId   }});
            res.status(300).json({
                message : 'deleted successfully',
                success : true
            });
        }
    }
    catch(error){
        res.status(400).json({
            error : error.message,
            message : 'something went wrong',
            success : false
        });
    }
};


module.exports.userProgress = async function(req, res){
    try {
        let user = await User.findById(req.user._id);
        const data = {
            readingDuration:user.readingDuration,
            testDuration:user.testDuration,
            minutesGoal:user.minutesGoal,
            readingGoal:user.readingGoal,
            currentStreakDay:user.currentStreakDay,
            longestStreakDay:user.longestStreakDay,
            testsCompleted:user.testsCompleted,
            coursesCompleted:user.coursesCompleted,
            totalTimeSpent:user.totalTimeSpent
        };
        return res.status(200).json({
            data:data,
            success:true
        });
    } catch (error) {
        res.status(400).json({
            message : 'something went wrong',
            success : false
        });
    }
};



module.exports.getReminder = async function(req, res){
    try {
        let user = await User.findById(req.user._id);
        const data = user.reminder;
        return res.status(200).json({
            data:data,
            success:true
        });
    } catch (error) {
        res.status(400).json({
            message : 'something went wrong',
            success : false
        });
    }
};


module.exports.getProfile = async function (req, res){
    try{
        let user = await User.findOne({ _id : req.user._id }, { name : 1, email : 1, image : 1, contactNumber : 1, dob : 1, address : 1, category : 1 });
        res.status(200).json({
            data : user,
            message : 'successfully fetched profile data',
            success : true
        });
    }
    catch(error){
        res.status(400).json({
            message : error.message,
            success : false
        });
    }
};


module.exports.updateProfile = async function (req, res){
    try{
        let data = req.body;
        if(req.file){
            data['image'] = req.file.location;
        }
        await User.findByIdAndUpdate(req.user._id, data);
        res.status(200).json({
            message : 'Profile updated successfully',
            success : true
        });
    }
    catch(error){
        res.status(400).json({
            message : error.message,
            success : false
        });
    }
};
