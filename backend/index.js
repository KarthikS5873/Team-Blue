import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './server/routes/auth.js';
import activityRoutes from './server/routes/activities.js';
import taskRoutes from './server/routes/tasks.js';
import aiRoutes from './server/routes/ai.js';
import reportRoutes from './server/routes/reports.js';
import { startScheduler } from './server/cron/scheduler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://localhost:5173').split(',');

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/reports', reportRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

startScheduler();

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Business Advisor API] running on http://localhost:${PORT}`);
  console.log(`[CORS] Allowed origins: ${ALLOWED_ORIGINS.join(', ')}`);
});
