
let multer = require('multer');
let multerS3 = require('multer-s3');
let aws = require('aws-sdk');

aws.config.update({
    accessKeyId : 'AKIASBBPW5NCHGGTADUH',
    secretAccessKey : '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'
});

let S3 = new aws.S3();
 
let uploadImg = multer({
    storage: multerS3({
        s3: S3,
        bucket: 'agrivision4u',
        acl : 'public-read',
        metadata: function (req, file, cb) {
            cb(null, { fieldName: file.fieldname });
        },
        key : function (req, file, cb) {
            cb(null,  'user_dp/' + req.user._id  );
        }
    })
});



module.exports = { uploadImg };
