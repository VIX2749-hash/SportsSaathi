import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import partnersRoutes from './routes/partners';
import connectionsRoutes from './routes/connections';
import activitiesRoutes from './routes/activities';
import messagesRoutes from './routes/messages';
import facilitiesRoutes from './routes/facilities';
import equipmentRoutes from './routes/equipment';
import miscRoutes from './routes/misc';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS setup
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
    credentials: true,
  })
);

app.use(express.json());

// 1. Health check endpoint (always priority)
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    platform: 'Sports Saathi Full Stack API (Sports Partners + Spaces + Equipment — Bharat 🇮🇳)',
    timestamp: new Date().toISOString(),
  });
});

// 2. Specific routes
app.use('/api/auth', authRoutes);
app.use('/api/partners', partnersRoutes);
app.use('/api/connections', connectionsRoutes);
app.use('/api/activities', activitiesRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/facilities', facilitiesRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api', miscRoutes); // /api/notifications, /api/safety, /api/sports, /api/blocks

// 3. User bookings and reservations bridge routes
app.get('/api/my/facility-bookings', (req, res, next) => {
  req.url = '/my/facility-bookings';
  facilitiesRoutes(req, res, next);
});
app.get('/api/my/equipment-reservations', (req, res, next) => {
  req.url = '/my/equipment-reservations';
  equipmentRoutes(req, res, next);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Sports Saathi Server running on http://localhost:${PORT}`);
});
