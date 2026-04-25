require('dotenv').config({ path: __dirname + '/../.env' });
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10, //maybe change later
});

module.exports = pool;


//delete comment when done project

//FOR migrations , if u add smth or chanage an already exisiting db.
// delete the database manually
//and then run npm run migrate. 
//if you add a new sql file under migrations then run npm run migrate aswell.
