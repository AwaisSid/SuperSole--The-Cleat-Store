const mysql = require('mysql2');
var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "awaisCr7",
    database: "product",
    port : "3306"
});

con.connect(function(err){
    if(err){
        throw err;
    }
    console.log("CONNECTED TO DATABASE...");
})

module.exports = con;