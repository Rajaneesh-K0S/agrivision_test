const Joi = require('joi');

function validateUser(user) {
    const schema = Joi.object({
        name: Joi.array().items(Joi.string().min(1)).min(1).max(2).required(),
        email: Joi.string().email().required()
    });
    return schema.validate(user);
}

module.exports = validateUser;