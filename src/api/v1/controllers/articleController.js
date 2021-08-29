const {Article}=require('../../../models/index');


module.exports.allArticle=await function(req,res){
    try {
        let article=await Article.find({});
    res.status(200).json({
        message:"all magazine fetched",
        data:article,
        success:true
    })
    } catch (error) {
        res.status(400).json({
            message:error,
            success:false
        })
    }
    
}
module.exports.specificArticle=await function(req,res){
    try {
        let article=await Article.findOne({_id:req.params.id});
        res.status(200).json({
            data:article,
            message:"article fetched",
            success:true
    })
    } catch (error) {
        res.status(400).json({
            message:error,
            success:false
        })
    }
    
}

// module.exports.articleSubmit = function (req, res) {
 
//     try {
  
//       Article.upload(req, res, async function (err) {
       
//         if (err) { 
//            return res.status(400).json({
//                 success:false,
//                 message:"Something went wrong"
//             })
//         }
        
//         if (req.user.articlesRemaining) {
          
//           let mailOptions = {
//             from: process.env.email,
//             to: process.env.editorMail,
//             subject: Magazine,
//             text: 'hello',
//             html: Html,
//             attachments: [{
//               filename: req.file.filename,
//               path: req.file.path
//             }]
//           };
  
//           transporter.sendMail(mailOptions, function (err, info) {
//             if (err) {
//               return res.status(400).json({
//                 message:"something went wrong",
//                 success:false
//               })
//             } 
//           });
//           let user = await User.findOne({ _id: req.user._id });
//           user.articlesRemaining = user.articlesRemaining - 1;
//           await user.save();
//           return res.status(200).json({
//             message
//           })
//         }
//         else {
  
//           // send to payment link
//           // after payment,set articles=15;
//           // store payment in db
//           // send article to editor
  
//           let user = await User.findOne({ _id: req.user._id });
//           user.profession = req.body.profession;
//           await user.save();
//           let profession = req.body.profession
//           let subscription = req.body.subscription
//           let url = profession + "&" + subscription + "&" + 2 + 2 + "&" + 1
//           res.redirect(`/payment/magazine/${url}`)
  
  
//         }
  
  
//       })
  
//     } catch (err) {
  
//       console.log(err);
//     }
  
//   }
  