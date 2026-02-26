import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pkg;

export const db = new Pool({
  connectionString: process.env.DATABASE_URL,
});

db.connect()
  .then(() => console.log("✅ Database Connected"))
  .catch(err => console.error("Database Error:", err));