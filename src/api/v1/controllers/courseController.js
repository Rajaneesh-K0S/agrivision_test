const { Course } = require('../../../models');

module.exports.allCourse = async function(req, res){
    try {
        let courses;
        if(req.query){
            courses = await Course.find(req.query);
        }else{
            courses = await Course.find({});
        }
        let data = [];
        courses.forEach(element => {
            data.push({
                name:element.name,
                image:element.image,
                duration:element.duration,
                chapters:element.chapters,
                fullTests:element.fullTests
            });
        });

        res.status(200).json({
            message:'courses fetched',
            data:data,
            success:true
        });
    } catch (error) {
        res.status(400).json({
            message:error,
            success:false
        });
    }
};

module.exports.courseById = async function(req, res){
    try {
        let course = await Course.findById(req.params.id).populate('Chapter');
        res.status(200).json({
            message:'course fetched',
            data:course,
            success:true
        });
    } catch (error) {
        res.status(400).json({
            message:error,
            success:false
        });
    }
};


