const mongoose = require('mongoose');
const {Schema} =mongoose;
// const multer = require('multer');
// const path = require('path');
// const ARTICLE_PATH = path.join('/uploads/articles');



const articleCommentsSchema = new Schema({
    comment:{
        type:String,
        required: true
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
    category:{
        type:Number
    },
    likes:{
        type:Number,
        default: 0
    },
    views:{
        type:Number,
        default: 0
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
    isFeatured:{
        type: Boolean,
        default: false
    },
    isSpotlight:{
        type: Boolean,
        default: false
    },
    isApproved:{                     // an article will only appear if it is approved by the editor.
        type : Boolean,
        default: false
    },
    content: String,
    comments:[articleCommentsSchema]

}, {
    timestamps: true
});



// let storage = multer.diskStorage({
//      destination: function (req, file, cb) {
//        cb(null, path.join(__dirname, '..','/..', ARTICLE_PATH));
//      },
//      filename: function (req, file, cb) {
//        cb(null, Date.now() + '-' + file.originalname);
//      }
// });

// articleSchema.statics.upload = multer({storage:storage}).single('article_file');
// articleSchema.statics.avatarPath = ARTICLE_PATH;


const Article = mongoose.model('Article', articleSchema);

module.exports = Article;