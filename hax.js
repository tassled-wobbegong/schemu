const fetch = require('node-fetch');

/*const bruteForce(length){

}*/

fetch('http://localhost:3000/id=?A')
.then(response => console.log(response));

const indexTable = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","Y","Z","a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z","1","2","3","4","5","6","7","8","9","+","/"];
const initial = indexTable[0];
const final = indexTable[indexTable.length - 1];
const bruteForce = () => {
    console.log(indexTable);
}

bruteForce();