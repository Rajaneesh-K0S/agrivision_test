const jwt = require('jsonwebtoken');


module.exports.randString = () => {
    let pass = '';
    let str = 'PQRSTUVWXIJKLMNO' +
        'abcdmnopqrsefghijkltuvwxyz01234YZABCDEFGH56789@$';

    for (let i = 1; i <= 13; i++) {
        let char = Math.floor(Math.random()
            * str.length + 1);
        pass += str.charAt(char);
    }

    return pass;
};


module.exports.generateToken = (user) => {
    const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, {
        expiresIn: '12h'
    });
    return token;

};

module.exports.generateRandomToken = (str) => {
    const token = jwt.sign({ article: str }, process.env.JWT_SECRET);
    return token;
};


module.exports.getLocalTimeString = (Date)=>{
    let dateString = Date.toLocaleString(undefined, { timeZone: 'Asia/Kolkata' }).split(',')[0];
    return dateString;
}



module.exports.findDiscount = (discount) => {
    if(discount.includes('%')){
        return {discountType : 0, discount : parseInt(discount.split('%')[0])};
    }else{
        return {discountType : 1, discount : parseInt(discount)};
    }
}

module.exports.generateOTP = ()=>{
    let otp="";
    for(var i=0;i<6;i++){
        otp=otp+Math.floor(Math.random()*10);
    }
    return otp;
}


module.exports.generatePromoCode 