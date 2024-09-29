import mysql from "mysql2";
import dotenv from "dotenv";

dotenv.config();

export const connection = mysql.createConnection({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  port: process.env.DATABASE_PORT,
  database: process.env.DATABASE_NAME,
});

connection.connect((err) => {
  if (err) {
    console.error("Không thể kết nối đến cơ sở dữ liệu:", err);
    return;
  }
  console.log("Đã kết nối đến cơ sở dữ liệu MySQL");
});
