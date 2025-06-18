// controllers/db.js
import mysql from 'mysql2/promise';

export const conexion = await mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "ecomerce",
});
