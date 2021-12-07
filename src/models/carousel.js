const mongoose = require('mongoose');

const Schema = mongoose.Schema;

let carouselSchema = new Schema({
    page:String,
    images:[
        {
            link:String,
            order:Number,
        }
    ]
})

let Carousel = mongoose.model('Carousel', carouselSchema);
module.exports=Carousel;