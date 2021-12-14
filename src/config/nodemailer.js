const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const oAuth2Client = new google.auth.OAuth2(process.env.prod_clientId, process.env.prod_clientSecret, process.env.redirectURI);
oAuth2Client.setCredentials({ refresh_token:process.env.prod_refreshToken });
// const path = require('path');

async function getAccessToken(){
    const accessToken = await oAuth2Client.getAccessToken;
    return accessToken;
}

const transporter = nodemailer.createTransport({
    service:'gmail',
    auth: {
        type:'OAuth2',
        user:'agrivision4u.official@gmail.com',
        clientId: process.env.prod_clientId,
        clientSecret: process.env.prod_clientSecret,
        refreshToken: process.env.prod_refreshToken,
        accessToken: getAccessToken()
    }
});

module.exports = transporter;
module.exports.oAuth2Client = oAuth2Client;
