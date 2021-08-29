const nodemailer = require("nodemailer");
const path = require('path');


let transporter = nodemailer.createTransport({
    service: 'gmail',
    host: process.env.host,
    port: 465,
    secure: true,
    auth: {

        user: process.env.email,
        pass: process.env.password
    }
}); 

module.exports = transporter;
