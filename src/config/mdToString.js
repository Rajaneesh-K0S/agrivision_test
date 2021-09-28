let axios = require('axios');
let logger = require('../logger');

let mdToStringConverter = async (linkToMdFile) => {
    try {
        let stringData = axios.get(linkToMdFile)
            .then(res => {
                let stringData = res.data;
                return new Promise(resolve => {
                    resolve(stringData);
                });
            })
            .catch(err=>{
                throw new Error( err);
            });
        return stringData;
    }
    catch (err) {
        logger.error(err);
        throw new Error('Conversion Error : ' + err);
    }
};


module.exports = { mdToStringConverter };