import "dotenv/config";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

(async () => {
  try {
    const r = await pool.query("SELECT COUNT(*)::int AS n FROM companies");
    console.log("OK, companies count =", r.rows[0].n);
  } catch (e) {
    console.error("CONNECTION FAILED:", e);
  } finally {
    await pool.end();
  }
})();
