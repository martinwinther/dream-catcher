import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import helmet from 'helmet'
import { initDatabase } from './config/database-init.js';
import pool from './config/database.js';
import dreamsRouter from './routes/dreams.js';
import { apiLimiter } from './utils/rateLimit.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


const app = express();


if (process.env.NODE_ENV === 'production'){
  app.use(helmet());
  // Behind a hosting proxy (e.g. Render), so rate limiting sees the real client IP
  app.set('trust proxy', 1);
}

const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(express.static(join(__dirname, 'public')));

// health endpoint
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({
      status: 'ok',
      db: 'connected',
      uptime: process.uptime()
    });
  } catch (err) {
    res.status(503).json({
      status: 'error',
      db: 'disconnected',
      message: err.message,
      uptime: process.uptime()
    })
  }
})

// API Routes
app.use('/api', apiLimiter);
app.use('/api/dreams', dreamsRouter);

// Initialize database then start server
let server;

initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}).catch(error => {
  console.error('Failed to initialize database:', error);
  process.exit(1)
});

process.on('SIGTERM', gracefulShutdown);

async function gracefulShutdown() {
 console.log('SIGTERM received, shutting down gracefully');
  // Close the server first (stop accepting new connections)
 server.close(() => {
   console.log('HTTP server closed');
 });
  // Then close database pool
 try {
   await pool.end();
   console.log('Database pool closed');
   process.exit(0)
 } catch (error) {
   console.error('Error closing database pool:', error);
   process.exit(1)
 }
}
