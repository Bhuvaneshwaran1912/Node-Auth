const mysql = require('mysql2');
require('dotenv').config();

var connection = mysql.createConnection({
    port: process.env.DB_PORT,
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectTimeout: 100000 // Set to 100 seconds (10000ms)
})

connection.connect((err) => {
    if (!err) {
        console.log("Connected Successfully an running in port 8080")
    } else {
        console.log(err)
    }
})

module.exports = connection
