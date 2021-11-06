const { Article,User } = require('../../../models/index');


module.exports.allArticle = async function (req, res) {
    try {
      let articles = await Article.find({},{'comments': 0}).populate({path:'author',select:'name'}).sort({'updatedAt': -1});
     if(req.query.category){
        articles = await Article.find({category:req.query.category},{'comments': 0}).populate({path:'author',select:'name'}).sort({'updatedAt': -1});
      }
        res.status(200).json({
            message: 'articles fetched',
            data: articles,
            success: true
        });
    } catch (error) {
        res.status(400).json({  
            message: error,
            success: false
        });
    }

};
module.exports.specificArticle = async function (req, res) {
    try {
          article = await Article.findOne({ _id: req.params.id }).populate({path:'author',select:'name image email linkedinProfile'});
          article.views++;
          await article.save();
        res.status(200).json({
            data: article,
            message: 'article fetched',
            success: true
        });
    } catch (error) {
        res.status(400).json({
            message: error,
            success: false
        });
    }

};

module.exports.addComment=async function(req,res){
  try {
    const article=await Article.findById(req.params.id);
    const comment={
      comment:req.body.comment,
      user:req.user.name
    };
    article.comments.push(comment);
    await article.save();
    res.status(200).json({
      message: 'comment added',
      success: true
  });
  } catch (error) {
    res.status(400).json({
      message: error,
      success: false
     });
  }
}

module.exports.addLike=async function(req,res){
  try {
    const article=await Article.findById(req.params.id);
    article.likes++;
    await article.save();
    res.status(200).json({
      message: 'comment added',
      success: true
  });
  } catch (error) {
    res.status(400).json({
      message: error,
      success: false
     });
  }
}

module.exports.articleSubmission = function (req, res) {

    try {

      Article.upload(req, res, async function (err) {

        if (err) {
           return res.status(400).json({
                success:false,
                message:"Something went wrong"
            })
        }

        let user=await User.findById(req.user._id);

        user.institute=req.body.institute;
        user.department=req.body.department;
        user.designation=req.body.designation;
        user.contactNo=req.body.contactNo;
        user.linkedinProfile=req.body.linkedinProfile;
        user.address=req.body.address;
        await user.save();

        return res.status(200).json({
          message:"redirect for payment",
          data:{
            filename:req.file.filename,
            filepath:req.file.path
          },
          success:true
        })

      })

    } catch (err) {
      res.status(400).json({
        message: error,
        success: false
       });
    }

  }


  module.exports.articlePaymentSuccess = function (req, res){

//after payment success we have to send the file to the editor 

    // let mailOptions = {
    //        from: process.env.SMTP_EMAIL,
    //        to: process.env.editorMail,
    //        subject: Magazine,
    //        text: 'hello',
    //        attachments: [{
    //          filename: req.file.filename,
    //          path: req.file.path
    //        }]
    //      };
    // transporter.sendMail(mailOptions, function (err, info) {
    //            if (err) {
    //              return res.status(400).json({
    //                message:"something went wrong",
    //                success:false
    //              })
    //            }
    // });
  return req.status(200).json({
    message:'article submitted',
    success:true
  })
  }