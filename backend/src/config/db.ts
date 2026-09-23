import mysql from 'mysql2/promise';
import { env } from './env';

export const pool = mysql.createPool({
  host: env.DB.HOST,
  port: env.DB.PORT,
  database: env.DB.NAME,
  user: env.DB.USER,
  password: env.DB.PASSWORD,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  timezone: 'Z',
});

// Helper for executing queries
export async function query<T = any>(sql: string, params: any[] = []): Promise<T> {
  const [rows] = await pool.execute(sql, params);
  return rows as T;
}

// Function to test DB connection
export async function testConnection(): Promise<boolean> {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    console.log(`✅ Connected to MySQL database "${env.DB.NAME}" on ${env.DB.HOST}:${env.DB.PORT}`);
    return true;
  } catch (error: any) {
    console.error('❌ Failed to connect to MySQL database:', error.message || error.code || error);
    return false;
  }
}
