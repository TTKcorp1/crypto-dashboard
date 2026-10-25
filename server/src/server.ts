import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db';
import mongoose from 'mongoose';

dotenv.config();

const app = express();

const allowedOrigins = new Set(
  (process.env.CORS_ORIGINS || 'http://localhost:3000,https://crypto-dashboard-wc3h.vercel.app')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.has(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error(`Origin ${origin} is not allowed by CORS.`));
  },
}));
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Investment Dashboard API is running! 🚀' });
});

app.get('/test', (req, res) => {
  res.json({ message: 'Backend is working! No DB needed.' });
});

const startServer = async () => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is required.');
  }

  await connectDB();

  mongoose.connection.once('connected', () => {
    console.log("MongoDB fully ready");
  });

  const { default: authRoutes } = await import('./routes/authRoutes');
  const { default: investmentRoutes } = await import('./routes/investmentRoutes');
  
  app.use('/api/auth', authRoutes);
  app.use('/api/investments', investmentRoutes);

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
  });
};

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});