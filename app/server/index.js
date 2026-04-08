// temporary code from Claude
// just testing stuff

require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Create a connection pool (reuses connections efficiently)
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
}).promise();  // lets us use async/await

// Test route
app.get('/api/test', async (req, res) => {
  const [rows] = await db.query('SELECT 1 + 1 AS result');
  res.json(rows);
});

app.listen(5000, () => console.log('Server on port 5000'));
