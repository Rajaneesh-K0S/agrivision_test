const { Newsletter } = require("../../../models/index");

module.exports.addSubscription = async function (req, res) {
    try {
        // check if email id exist
        const emailExists = await Newsletter.exists({ email: req.body.email });
        if (emailExists) {
            // if job subscription
            if (req.body.type == "jobUpdate") {
                subscription = await Newsletter.findOneAndUpdate(
                    { email: email },
                    { $set: { subscribedJobUpdate: true } }
                );
                res.status(200).json({
                    message: "job subscription added successfully",
                    success: true,
                });
            }
            //   if newsletter subscription
            else if (req.body.type == "newsLetter") {
                const stayUptoDate = req.body.stayUptoDate;
                subscription = await Newsletter.findOneAndUpdate(
                    { email: email },
                    {
                        $set: {
                            subscribedNewsletter: true,
                            stayUptoDate: stayUptoDate,
                        },
                    }
                );
                res.status(200).json({
                    data: subscription,
                    message: "newsletter subscription added successfully",
                    success: true,
                });
            } else {
                res.status(400).json({
                    message: "type feild error",
                    success: false,
                });
            }
        }
        // email doesn't exist
        else {
            // if job update
            if (req.body.type == "jobUpdate") {
                let subscription = new Newsletter({
                    email: req.body.email,
                    subscribedJobUpdate: true,
                });
                await subscription.save();
                res.status(200).json({
                    message: "job subscription added",
                    success: true,
                });
            } else if (req.body.type == "newsLetter") {
                let subscription = new Newsletter({
                    email: req.body.email,
                    subscribedNewsletter: true,
                    stayUpToDate: req.body.stayUptoDate,
                });

                await subscription.save();
                res.status(200).json({
                    message: "job subscription added",
                    success: true,
                });
            } else {
                res.status(400).json({
                    message: "type query error",
                    success: false,
                });
            }
        }
    } catch (error) {
        res.status(400).json({
            message: error.message,
            success: false,
        });
    }
};

// get request
// module.exports.getAllSubscription = async function (req, res) {
//   try {
//     const subscriptions = await Newsletter.find({});
//     res.status(200).json({
//       data: subscriptions,
//       message: "success",
//       success: true,
//     });
//   } catch {
//     res.status(400).json({
//       message: error.message,
//       success: false,
//     });
//   }
// };
