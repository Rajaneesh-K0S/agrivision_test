const randString = () => {
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

module.exports = randString;