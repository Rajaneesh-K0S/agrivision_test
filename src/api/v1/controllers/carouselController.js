const { Carousel } = require("../../../models");


module.exports.allCarousels = async function (req, res) {
    try {
        // req.query.page should be: magazine or testseries or course
        let carousels = await Carousel.find({ page: req.query.page });
        let data = [];
        carousels.images.slice(0, 5).map((element) => {
        data.push({
            link: element.link,
            order: element.order,
        });
        });

        res.status(200).json({
        message: "carousels fetched",
        data: data,
        success: true,
        });
    } catch (error) {
        res.status(400).json({
        message: error,
        success: false,
        });
    }
};
