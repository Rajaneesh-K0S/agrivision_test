const { User } = require('../../../models');
const { validateUser } = require('../validators');

module.exports.registerUser = async (req, res) => {
    let validUser = validateUser(req.body);

    if (validUser.error) {
        return res.status(400).json({
            message: validUser.error.details[0].message,
            success: false
        });
    }

    let user = await User.findOne({ email: req.body.email });

    if (user) {
        return res.status(400).json({
            message: 'User already exists',
            success: false
        });
    }

    user = new User({
        name: req.body.name,
        email: req.body.email
    });

    try {
        await user.save();
        res.status(200).json({
            message: 'User created successfully',
            data: user,
            success: true
        });
    }
    catch (err) {
        res.status(500).json({
            message: err.message,
            success: false
        });
    }
};