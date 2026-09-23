import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import { testConnection } from './config/db';
import routes from './routes';
import { errorHandler } from './middleware/error.middleware';

const app = express();

// Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, postman) or matching frontend URL
      if (!origin || origin === env.FRONTEND_URL || origin.startsWith('http://localhost:')) {
        callback(null, true);
      } else {
        callback(null, true); // Allow during dev
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging in dev
if (env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.originalUrl}`);
    next();
  });
}

// Mount API Routes
app.use('/api', routes);

// 404 Handler for undefined API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Centralized Error Handling Middleware
app.use(errorHandler);

// Start server
const PORT = env.PORT;

async function startServer() {
  console.log('🚀 Initializing Productivity App Backend Server...');
  await testConnection();

  app.listen(PORT, () => {
    console.log(`✨ Server running in ${env.NODE_ENV} mode on http://localhost:${PORT}`);
    console.log(`📡 API Base URL: http://localhost:${PORT}/api`);
  });
}

startServer();

export default app;
