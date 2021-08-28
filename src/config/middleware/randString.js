const randString=()=>{
    var pass = '';
    var str = 'PQRSTUVWXIJKLMNO' + 
            'abcdmnopqrsefghijkltuvwxyz01234YZABCDEFGH56789@$';
      
    for (i = 1; i <= 13; i++) {
        var char = Math.floor(Math.random()
                    * str.length + 1);
          
        pass += str.charAt(char)
    }
      
    return pass;
}
module.exports=randString;