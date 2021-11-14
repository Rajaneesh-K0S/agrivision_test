const { Magazine } = require('../../../models/index');


module.exports.allMagazine = async function (req, res) {
    try {
        let magazine = await Magazine.find({});
        res.status(200).json({
            message: 'all magazine fetched',
            data: magazine,
            success: true
        });
    } catch (error) {
        res.status(400).json({
            message: error,
            success: false
        });
    }
};