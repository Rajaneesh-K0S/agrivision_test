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
        const college = await College.findById(id).populate({path:'degree',populate:{path:'feedbacks'}});
        res.status(200).json({
            data: college,
            message:'colleges details sent',
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

module.exports.customSearch = async (req, res) => {
    const { c_name, state } = req.body;
    //other search parameters can be added
    //location: state, courseFeesCategory: { $lt: money },
    try {
        let colleges = await College.find({ name: new RegExp('.*' + c_name + '.*'), location: new RegExp('.*' + state + '.*') });
        //console.log('colleges : ');
        //console.log(colleges);
        //console.log(c_name);
        const domain = req.query.domain;
        if (domain) {
            colleges = await College.find({ domain: domain });
        }
        res.status(200).json({
            data: colleges,
            message: 'colleges sent according to query',
            success: true
        });

    }
    catch (error) {
        res.status(400).json({
            error: error.message,
            message: 'Something went wrong',
            success: false
        });
    }
};
