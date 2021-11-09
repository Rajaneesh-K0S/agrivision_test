const { Article, User } = require('../../../models/index');
const transporter = require('../../../config/nodemailer');

module.exports.allArticle = async function (req, res) {
  try {
    let articles = await Article.find({isApproved : true}, { 'comments': 0 }).populate({ path: 'author', select: 'name' }).sort({ 'updatedAt': -1 });
    if (req.query.category) {
      articles = await Article.find({ category: req.query.category, isApproved : true }, { 'comments': 0 }).populate({ path: 'author', select: 'name' }).sort({ 'updatedAt': -1 });
    }
    res.status(200).json({
      message: 'articles fetched',
      data: articles,
      success: true
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      success: false
    });
  }

};
module.exports.specificArticle = async function (req, res) {
  try {
    let article = await Article.findOne({ _id: req.params.id, isApproved : true }).populate({ path: 'author', select: 'name image email linkedinProfile' });
    article.views++;
    await article.save();
    res.status(200).json({
      data: article,
      message: 'article fetched',
      success: true
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      success: false
    });
  }

};

module.exports.addComment = async function (req, res) {
  try {
    const article = await Article.findById(req.params.id);
    const comment = {
      comment: req.body.comment,
      user: req.user.name
    };
    article.comments.push(comment);
    await article.save();
    res.status(200).json({
      message: 'comment added',
      success: true
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      success: false
    });
  }
}

module.exports.addLike = async function (req, res) {
  try {
    const article = await Article.findById(req.params.id);
    article.likes++;
    await article.save();
    res.status(200).json({
      message: 'Article Liked',
      success: true
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      success: false
    });
  }
}

module.exports.articleSubmission = function (req, res) {

  let userId = req.user._id;
  try {

    Article.upload(req, res, async function (err) {

      if (err) {
        console.log(err);
        return res.status(500).json({
          success: false,
          message: "Something went wrong"
        })
      }
      
      let user = await User.findById(userId);

      if (user.articlesRemaining) {
        let article = new Article({
          author : userId,
          heading : req.body.heading
        })
        await article.save();
        // let html = `Author Name : ${user.name[0]+user.name[1]}<br>Article ID : ${article._id}`
        // let mailOptions = {
        //   from: process.env.SMTP_EMAIL,
        //   to: process.env.EDITOR_EMAIL,
        //   subject: `Article for review`,
        //   html: html,
        //   attachments: [{
        //     filename: req.file.filename,
        //     path: req.file.path
        //   }]
        // };
        // await transporter.sendMail(mailOptions);
        user.articlesRemaining -= 1;
        await user.save();
        return res.status(200).json({
          redirectToPayment : false,
          message : "Successfully uploaded and sent for review.",
          success : true
        })
      }else{
        user.institute = req.body.institute;
        user.department = req.body.department;
        user.designation = req.body.designation;
        user.contactNo = req.body.contactNo;
        user.linkedinProfile = req.body.linkedinProfile;
        user.address = req.body.address;
        await user.save();
      }


      return res.status(200).json({
        redirectToPayment : true,
        message: "redirect for payment",
        data: {
          articleHeading: req.body.heading,
          articleFilePath: req.file.path
        },
        success: true
      })

    })

  } catch (err) {
    res.status(500).json({
      message: err.message,
      success: false
    });
  }

}

