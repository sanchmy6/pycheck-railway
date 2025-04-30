import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const connection = async () => {
  return await mysql.createConnection({
    host: process.env.MYSQL_HOST,
    port: parseInt(process.env.MYSQL_PORT || "3306"),
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  });
};

export async function query({ query, values = [] }: { query: string; values?: any[] }) {
  const db = await connection();
  try {
    const [results] = await db.execute(query, values);
    await db.end();
    return results;
  } catch (error) {
    await db.end();
    throw error;
  }
}

export default { query }; 