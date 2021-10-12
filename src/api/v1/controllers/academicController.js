const {College} = require('../../../models/index');




module.exports.showAllColleges = async(req,res)=>{
    try{
        let colleges = await College.find({});
        const domain = req.query.domain;
        if(domain){
            colleges = await College.find({domain:domain});
        };
        res.status(200).json({
            data: colleges,
            message:'colleges sent according to query',
            success: true
        })

    }
    catch(error){
        res.status(400).json({
            error: error.message,
            message: 'Something went wrong',
            success: false
        });
    }
}

module.exports.collegeDetails = async(req,res)=>{
    try{
        const {id} = req.params;
        const college = await College.findById(id).populate('feedbacks');
        res.status(200).json({
            data: college,
            message:'colleges detais sent',
            success: true
        })

    }
    catch(error){
        res.status(400).json({
            error: error.message,
            message: 'Something went wrong',
            success: false
        });
    }
}