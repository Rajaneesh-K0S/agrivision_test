const mongoose = require('mongoose');
//const multer = require('multer');
// const path = require('path');
//const ARTICLE_PATH = path.join('/uploads/articles');

const contentSchema=new mongoose.Schema({
    paragraph:{
        type:String
    },
    image:{
        type:String
    }
})


const articleCommentsSchema = new Schema({
    comment:{
        type:String
    },
    user:{
        type:String
    }
}, {timeStamps : true});

const articleSchema = new mongoose.Schema({
    author: {   
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User' 
        }
    ,
    type:{
        type:String
    },
    likes:{
        type:Number
    },
    viwes:{
        type:Number
    },
    heading: {
        type: String,
    },
    description: {
        type: String
    },
    mainImage:{
        type:String
    },
    highlights:[{
        type:String
    }],
    content:[contentSchema],
    comments:[articleCommentsSchema]

}, {
    timestamps: true
});



// let storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//       cb(null, path.join(__dirname, '..', ARTICLE_PATH));
//     },
//     filename: function (req, file, cb) {
//       cb(null, file.fieldname + '-' + Date.now());
//     }
//   });

// articleSchema.statics.upload = multer({storage:storage}).single('article_file');
// articleSchema.statics.avatarPath = ARTICLE_PATH;


const Article = mongoose.model('Article', articleSchema);

module.exports = Article;