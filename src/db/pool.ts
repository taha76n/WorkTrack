import "dotenv/config";
import { Pool } from "pg";

console.log('DATABASE_URL:', process.env.DATABASE_URL);

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export default pool;
