import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db';
import mongoose from 'mongoose';

dotenv.config();

const app = express();

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Investment Dashboard API is running! 🚀' });
});

app.get('/test', (req, res) => {
  res.json({ message: 'Backend is working! No DB needed.' });
});

const startServer = async () => {
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