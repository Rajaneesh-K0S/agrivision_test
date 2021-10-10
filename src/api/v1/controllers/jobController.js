let { Jobs, User } = require('../../../models');


let getJobs = async (req, res) => {
    try{
        let jobs = await Jobs.find();
        res.status(200).json({
            message : 'successfully fetched jobs data',
            data : jobs,
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

// let applyForJobs = async (req, res) => {
//     try{
         
//     }
//     catch(error){
//         res.status(400).json({
//             message : error.message,
//             success : false
//         })
//     }
// }

let postJobs = async (req, res) => {
    try{
        let job = new Jobs(req.body);
        job = await job.save();
        await User.updateOne({ _id : req.user._id }, { '$push' : { 'postedJobs' : job._id } });
        res.status(200).json({
            message : 'successfully posted job',
            success : 'true'
        });
    }
    catch(error){
        res.status(400).json({
            message : error.message,
            success : false
        });
    }
};



module.exports = { getJobs, postJobs };
