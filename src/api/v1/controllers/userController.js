const { User, Package, Course } = require("../../../models");
const bcrypt = require("bcrypt");
const { randString, generateToken } = require("../../../utils");
const transporter = require("../../../config/nodemailer");

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
    let user = await User.findOne({ email: req.body.email }).populate(
      "courses"
    );

    if (user) {
      return res.status(400).json({
        message: "User already exists",
        success: false,
      });
    }
    let confirmationCode = randString();
    await transporter.sendMail({
      from: "AgriVision4U <agrivision4u.official@gmail.com>",
      to: req.body.email,
      subject: "Please confirm your Email",
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
      randString: confirmationCode,
    });

    await user.save();

    res.status(200).json({
      message: "Please verify your email to login",
      data: {
        user: user,
      },
      success: true,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      error: err.message,
      message: "something went wrong",
      success: false,
    });
  }
};

module.exports.resendMail = async (req, res) => {
  try {
    const { email } = req.query;
    let user = await User.findOne({ email: email });
    if (user) {
      if (!user.isVerified) {
        user.randString = randString();
        await user.save();
        await transporter.sendMail({
          from: "AgriVision4U <agrivision4u.official@gmail.com>",
          to: email,
          subject: "Please confirm your Email",
          html: `<h1>Email Confirmation</h1>
                              <h2>Hello ${user.name[0]}  ${user.name[1]}</h2>
                              <br>
                              <h3>We welcome you as a part of our <b>AgriVision4U</b> family.</h3>
                              <p>Kindly click on the link below to confirm your e-mail address.</p>
                              <a href='https://www.agrivision4u.com?confirm=${user.randString}'><h3> Click here</h3></a>
                              <p style = "color : rbg(150, 148, 137)">Please do not reply to this e-mail. This address is automated and cannot help with questions or requests.</p>
                              <h4>If you have questions please write to info@agrivision4u.com. You may also call us at <a href="tel:7510545225">7510545225</a></h4>
                              </div>`,
        });
        return res.status(200).json({
          success: true,
          message: "mail resent sucessfully",
        });
      } else {
        return res.status(400).json({
          success: false,
          message: "user is already verified",
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: "create account first",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "something went wrong",
      error: error.message,
    });
  }
};

module.exports.login = async function (req, res) {
  try {
    let user = await User.findOne({ email: req.body.email }).populate(
      "courses"
    );

    if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
      return res.status(400).json({
        message: "invalid email or password",
        success: false,
      });
    }

    if (!user.isVerified) {
      return res.status(200).json({
        message: "Please verify your email",
        success: false,
      });
    }

    let token = generateToken(user);

    res.status(200).json({
      message: "User logged in successfully",
      data: {
        user: {
          name: user.name,
          email: user.email,
          _id: user._id,
          courses: user.courses,
        },
        token,
      },
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      message: "something went wrong",
      success: false,
    });
  }
};

module.exports.googleOauth = async function (req, res) {
  const user = await User.findOne({ email: req.user.email }).populate(
    "courses"
  );
  const token = generateToken(user);
  return res.status(200).send({ token, user });
};

module.exports.googleOneTapLogin = async (req, res) => {
  try {
    const { email_verified, name, email } = req.body;

    let success = false;
    if (email_verified) {
      let user = await User.findOne({ email });
      if (user) {
        //login the user
        let authToken = generateToken(user);
        success = true;
        return res.status(200).json({
          success,
          authToken,
          user: {
            name: user.name,
            email: user.email,
            _id: user._id,
            courses: user.courses,
          },
        });
      } else {
        //Sign up the user
        const password = email + process.env.JWT_SECRET;
        const salt = await bcrypt.genSalt(10);
        const secPass = await bcrypt.hash(password, salt);
        let newUser = new User({ name: name, password: secPass, email: email });
        await newUser.save();
        success = true;
        let authToken = generateToken(newUser);
        res.status(200).json({
          success,
          authToken,
          user: {
            name: newUser.name,
            email: newUser.email,
            _id: newUser._id,
            courses: newUser.courses,
          },
        });
      }
    } else {
      res.status(400).json({
        success: false,
        message: "invalid account",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports.confirmEmail = async function (req, res) {
  const secret = req.query.confirm;
  const user = await User.findOne({ randString: secret });
  try {
    if (user) {
      user.isVerified = true;
      user.randString = null;
      let pya = await Course.findById("61f8f42394a320857a633a4d");

      user.courses.push(pya);

      await user.save();
      let token = generateToken(user);

      return res.status(200).json({
        message: "Email verified. Welcome to AgriVision4u",
        success: true,
        data: {
          user: user,
          token: token,
        },
      });
    } else {
      return res.status(400).json({
        message: "user doesnt exist",
        success: false,
      });
    }
  } catch (err) {
    res.status(500).json({
      message: "something went wrong",
      success: false,
    });
  }
};

module.exports.resetPassword = async function (req, res) {
  try {
    let user = await User.findOne({ randString: req.query.forgot });
    if (!user) {
      return res.status(400).json({
        message: "Bad Request",
        success: false,
      });
    } else {
      const hash = await bcrypt.hash(req.body.password, 10);
      user.password = hash;
      user.randString = null;
      await user.save();
      return res.status(200).json({
        message: "Password updated.Please login using new password",
        success: true,
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "something went wrong",
      success: false,
    });
  }
};

module.exports.forgotPassword = async function (req, res) {
  try {
    const email = req.body.email;
    let user = await User.findOne({ email });
    const confirmationCode = randString();

    if (user) {
      user.randString = confirmationCode;
      await user.save();
      transporter.sendMail({
        from: "AgriVision4U <agrivision4u.official@gmail.com>",
        to: req.body.email,
        subject: "Reset Password",
        html: `<h1>Reset Password</h1>
                  <h2>Hello ${user.name}</h2>
                  <br>
                  <p>Kindly click on the link below to reset your password.</p>
                  <a href='https://www.agrivision4u.com/reset?forgot=${confirmationCode}'> Click here</a>
                  <p style = "color : rbg(150, 148, 137)">Please do not reply to this e-mail. This address is automated and cannot help with questions or requests.</p>
                  <h4>If you have questions please write to info@agrivision4u.com. You may also call us at <a href="tel:7510545225">7510545225</a></h4>
              </div>`,
      });

      return res.status(200).json({
        message: "Please check your mail to reset password",
        success: true,
      });
    } else {
      return res.status(400).json({
        message: "Email is not registered",
        success: true,
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "something went wrong",
      success: false,
    });
  }
};

module.exports.addToCart = async (req, res) => {
  let userId = req.params.id;
  let courseId = req.body.courseId;
  let testSeriesId = req.body.testSeriesId;
  let packageId = req.body.packageId;
  try {
    //let user = await User.findById(userId);
    let user = await User.findOne({ _id: userId }, { cart: 1 });
    if (courseId) {
      // user.cart.courses.push(courseId);
      // await user.save();
      let success = true;
      if (user.cart.courses.includes(courseId)) {
        success = false;
      } else {
        await User.updateOne(
          { _id: userId },
          { $push: { "cart.courses": courseId } }
        );
      }
      res.status(300).json({
        message: "successfully added course in cart",
        success,
      });
    } else if (testSeriesId) {
      let success = true;
      if (user.cart.testSeries.includes(testSeriesId)) {
        success = false;
      } else {
        await User.updateOne(
          { _id: userId },
          { $push: { "cart.testSeries": testSeriesId } }
        );
      }
      res.status(300).json({
        message: "successfully added test series in cart",
        success,
      });
    } else if (packageId) {
      let success = true;
      if (user.cart.packages.includes(packageId)) {
        success = false;
      } else {
        await User.updateOne(
          { _id: userId },
          { $push: { "cart.packages": packageId } }
        );
      }
      res.status(300).json({
        message: "successfully added package in cart",
        success,
      });
    }
  } catch (error) {
    res.status(500).json({
      message: error.message,
      success: false,
    });
  }
};

module.exports.getCart = async (req, res) => {
  let userId = req.params.id;
  try {
    let user = await User.findById(userId).populate({
      path: "cart",
      populate: [
        { path: "courses" },
        { path: "testSeries" },
        { path: "packages" },
      ],
    });
    let cart = user.cart;
    let testSeriesItems = [];
    let courseItems = [];
    let packageItems = [];
    let totalAmount = 0;
    cart.testSeries.forEach((test) => {
      totalAmount += test.price;
      let itemObj = {};
      itemObj["name"] = test.name;
      itemObj["price"] = test.price;
      itemObj["description"] = test.description;
      itemObj["testSeriesId"] = test._id;
      itemObj["image"] = test.smallImage;
      testSeriesItems.push(itemObj);
    });
    cart.courses.forEach((course) => {
      totalAmount += course.price;
      let itemObj = {};
      itemObj["name"] = course.name;
      itemObj["price"] = course.price;
      itemObj["description"] = course.description;
      itemObj["courseId"] = course._id;
      itemObj["image"] = course.smallImage;
      courseItems.push(itemObj);
    });
    cart.packages.forEach((package) => {
      totalAmount += package.price;
      let itemObj = {};
      itemObj["name"] = package.name;
      itemObj["price"] = package.price;
      itemObj["description"] = package.description;
      itemObj["packageId"] = package._id;
      itemObj["image"] = package.smallImage;
      packageItems.push(itemObj);
    });

    let totalItems =
      testSeriesItems.length + courseItems.length + packageItems.length;

    let packageIds = [
      "617c3d185d418b71ade1335d",
      "6182d9388f14300791b25d16",
      "6182dd828f14300791b25d17",
    ];
    let similarPackageData = [];
    for (let i = 0; i < packageIds.length; i++) {
      let pack = await Package.findOne(
        { _id: packageIds[i] },
        {
          name: 1,
          subject: 1,
          rating: 1,
          price: 1,
          originalPrice: 1,
          highlights: 1,
        }
      );
      pack = pack.toJSON();
      pack["image"] = pack.bigImage;
      pack["packageId"] = pack._id;
      similarPackageData.push(pack);
    }

    res.status(200).json({
      data: {
        totalItems,
        courseItems,
        testSeriesItems,
        packageItems,
        totalAmount,
        similarPackageData,
      },
      message: "successfully fetched cart data",
      success: true,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
      success: false,
    });
  }
};

module.exports.deleteProductInCart = async function (req, res) {
  let userId = req.params.id;
  let courseId = req.body.courseId;
  let testSeriesId = req.body.testSeriesId;
  let packageId = req.body.packageId;
  try {
    if (courseId) {
      await User.updateOne(
        { _id: userId },
        { $pull: { "cart.courses": courseId } }
      );
      res.status(300).json({
        message: "deleted successfully",
        success: true,
      });
    } else if (testSeriesId) {
      await User.updateOne(
        { _id: userId },
        { $pull: { "cart.testSeries": testSeriesId } }
      );
      res.status(300).json({
        message: "deleted successfully",
        success: true,
      });
    } else if (packageId) {
      await User.updateOne(
        { _id: userId },
        { $pull: { "cart.packages": packageId } }
      );
      res.status(300).json({
        message: "deleted successfully",
        success: true,
      });
    }
  } catch (error) {
    res.status(400).json({
      error: error.message,
      message: "something went wrong",
      success: false,
    });
  }
};

module.exports.getProfile = async function (req, res) {
  try {
    let user = await User.findOne({ _id: req.user._id }).populate([
      {
        path: "courses",
        select: "name subject chapters duration userEnrolled totalSubTopics",
      },
      { path: "testSeries", select: "name quizzes" },
      { path: "courseProgress" },
      { path: "testSeriesProgress" },
    ]);
    user = user.toJSON();
    let userProgress = user.courseProgress;
    user.courses.forEach((course) => {
      let completedSubTopics = 0;
      let data = userProgress.filter(
        (obj) => obj.courseId == course._id.toString()
      );
      data.forEach((chapter) => {
        completedSubTopics += chapter.subTopics.length;
      });
      course["completedSubTopics"] = completedSubTopics;
      course["totalChapters"] = course.chapters.length;
      delete course.chapters;
    });
    user.testSeries.forEach((test) => {
      test.totalQuizzes = test.quizzes.length;
      delete test.quizzes;
    });

    res.status(200).json({
      data: user,
      message: "successfully fetched profile data",
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      success: false,
    });
  }
};

module.exports.updateProfile = async function (req, res) {
  try {
    let data = req.body;
    if (req.file) {
      data["image"] = req.file.location;
    }
    await User.findByIdAndUpdate(req.user._id, data);
    res.status(200).json({
      message: "Profile updated successfully",
      success: true,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
      success: false,
    });
  }
};
