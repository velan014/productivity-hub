import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const env = {
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DB: {
    HOST: process.env.DB_HOST || 'localhost',
    PORT: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
    NAME: process.env.DB_NAME || 'productivity_app',
    USER: process.env.DB_USER || 'root',
    PASSWORD: process.env.DB_PASSWORD || '',
  },
  JWT: {
    SECRET: process.env.JWT_SECRET || 'fallback_secret_key_prod_app_2026',
    EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  },
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
};
