import dotenv from "dotenv";
dotenv.config();

import mysql from "mysql2";
import fs from "fs";

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    ca: fs.readFileSync(process.env.CA)
  }
});


// Check connection properly
pool.getConnection((err, connection) => {
  if (err) {
    console.error("Database connection failed:", err);
  } else {
    console.log("MySQL Connected Successfully");
    connection.release();
  }
});


export default pool.promise();