var nodemailer = require('nodemailer');
var sesTransport = require('nodemailer-ses-transport');
var aws= require("aws-sdk");

const SES_AWS_ACCESS_KEY_ID = process.env.sesEmailAccessKeyId ;  
const SES_AWS_SECRET_ACCESS_KEY = process.env.sesEmailSecretAccessKey;

const ses = new aws.SES({
  apiVersion: '2010-12-01',
  region: process.env.sesEmailRegion,  
  credentials: {
      secretAccessKey: SES_AWS_SECRET_ACCESS_KEY,
      accessKeyId: SES_AWS_ACCESS_KEY_ID
  }
});


let transporter = nodemailer.createTransport({
  SES: { ses, aws }
});


module.exports = transporter;
