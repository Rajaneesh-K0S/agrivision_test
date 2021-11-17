let multer = require('multer');
let multerS3 = require('multer-s3');
let aws = require('aws-sdk');

aws.config.update({
    accessKeyId : process.env.awsAccessKeyId,
    secretAccessKey : process.env.awsSecretAccessKey
});

let S3 = new aws.S3();
 
let uploadImg = multer({
    storage: multerS3({
        s3: S3,
        bucket: process.env.bucketName,
        acl : 'public-read',
        metadata: function (req, file, cb) {
            cb(null, { fieldName: file.fieldname });
        },
        key : function (req, file, cb) {
            cb(null,  'user_dp/' + req.user._id  );
        }
    })
});


let articleUpload = multer({
    storage: multerS3({
        s3: S3,
        bucket: process.env.bucketName,
        acl : 'public-read',
        metadata: function (req, file, cb) {
            cb(null, { fieldName: file.fieldname });
        },
        key : function (req, file, cb) {
            cb(null,  'tmp_articles/' + Date.now() + file.originalname);
        }
    })
});


module.exports = { uploadImg, articleUpload };
