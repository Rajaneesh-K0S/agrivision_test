const mongoose = require("mongoose");
const {Package,Course} = require("../../../models");

module.exports.getAllPackages = async(req,res)=>{
    try {
        let packages;
        if(req.query.exam){
            packages = await Package.find({ 'exam':req.query.exam }).populate([{path: 'courses',select:'name'}, {path: 'testSeries',select:'name'}]);
        }
        else if (req.query.subject) {
            packages = await Package.find({ 'subject':req.query.subject }).populate([{path: 'courses',select:'name'}, {path: 'testSeries',select:'name'}]);
        } else {
            packages = await Package.find({}).populate([{path: 'courses',select:'name'}, {path: 'testSeries',select:'name'}]);
        }
        let data = [];
        packages.forEach(element => {
            data.push({
                packageId: element._id,
                name: element.name,
                image: element.bigImage,
                type: element.type,
                duration: element.duration,
                testNumber: element.testNumber,
                videosNumber: element.videosNumber,
                courses: element.courses,
                testSeries: element.testSeries,
                includes: element.includes,
                description: element.description,
                highlights: element.highlights,
                price: element.price
            });
        });

        res.status(200).json({
            message: 'packages fetched',
            data: data,
            success: true
        });
    } catch (error) {
        res.status(400).json({
            message: error,
            success: false
        });
    }

}

module.exports.packageById = async(req,res)=>{
    try {
       
            let packageId = req.params.id;
            let package = await Package.findById(packageId).populate([{path:'courses'},{path : 'testSeries'},{ path : 'feedbacks', populate : { path : 'user', select : 'name image' } }, { path : 'similarCourses', select : 'name userEnrolled image chapters fullTests' }]);
            let ratingsCount = [0, 0, 0, 0, 0];
            let totalRatings = package.feedbacks.length;
            package.feedbacks.forEach(feedback=>{
                ratingsCount[5 - feedback.rating]++;
            });
            for(let i = 0;i < ratingsCount.length ; i++){
                ratingsCount[i] = ratingsCount[i] * 100 / totalRatings;
            }
            let similarCourseData = [];
            package.similarCourses.forEach(course=>{
                let obj = {};
                obj['courseId'] = course._id;
                obj['name'] = course.name;
                obj['image'] = course.bigImage;
                obj['userEnrolled'] = course.userEnrolled;
                obj['chapterCount'] = course.chapters.length;
                obj['fullTestCount'] = course.fullTests.length;
                similarCourseData.push(obj);
            });
            let packageData = {};
            packageData['packageId'] = package._id;
            packageData['name'] = package.name;
            packageData['type'] = package.type;
            packageData['price'] = package.price;
            packageData['courses'] = package.courses;
            packageData['testSeries'] = package.testSeries;
            packageData['fullTestCount'] = package.testNumber;
            packageData['includes'] = package.includes;
            packageData['description'] = package.description;
            packageData['rating'] = package.rating;
            packageData['highlights'] = package.highlights;
            packageData['feedbacks'] = package.feedbacks;
            packageData['ratingPercentages'] = ratingsCount;
            packageData['similarCourses'] = similarCourseData;
            res.status(200).json({
                data : packageData,
                message : 'payment page data fetched successfully',
                success : true
            });
        
    } catch (error) {
        res.status(400).json({
            message: error,
            success: false
        });
    }
}

//package cart
//package enrolled
//
