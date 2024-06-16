const mysql = require('mysql');

require('dotenv').config()

var connection = mysql.createConnection({
  host: process.env.HOST,
  user: process.env.DB_USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
});
connection.connect()

module.exports = connection;
