import express from "express";
import cors from "cors";

const mysql = require("mysql2/promise")
const PORT = process.env.PORT || 5050;
const app = express();

app.use(cors());
app.use(express.json());

// start the Express server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
