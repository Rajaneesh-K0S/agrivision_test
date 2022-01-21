const mongoose = require("mongoose");

const newsletterSchema = new mongoose.Schema({
    email: String,
    subscribedNewsletter: {
        type: Boolean,
        default:false
    },
    stayUpToDate: {
        type: Boolean,
        default:false
    },
    subscribedJobUpdate: {
        type: Boolean,
        default:false
    }
});

const Newsletter = mongoose.model("Newsletter", newsletterSchema);

module.exports = Newsletter;
