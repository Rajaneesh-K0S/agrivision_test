const nodemailer = require('nodemailer');
const {google} = require('googleapis');
const oAuth2Client = new google.auth.OAuth2(process.env.clientId,process.env.clientSecret,process.env.redirectURI);
oAuth2Client.setCredentials({refresh_token:process.env.refreshToken})
// const path = require('path');

async function getAccessToken(){
    const accessToken = await oAuth2Client.getAccessToken;
    return accessToken;
}

const transporter = nodemailer.createTransport({
    service:'gmail',
    auth: {
        type:'OAuth2',
        user:'sprajapati14012002@gmail.com',
        clientId: process.env.clientId,
        clientSecret: process.env.clientSecret,
        refreshToken: process.env.refreshToken,
        accessToken: getAccessToken()
    }
})

module.exports = transporter;
