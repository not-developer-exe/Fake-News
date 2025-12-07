import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit'; // Security tweak

import connectDB from './config/db.js';
import { notFound, errorHandler } from './middleware/error.js';
import authRoutes from './routes/authRoutes.js';
import analysisRoutes from './routes/analysisRoutes.js';

dotenv.config();

// Connect to Database
connectDB();

const app = express();

// --- Security & Utility Middleware ---
app.use(helmet()); 
app.use(morgan('dev')); // Log requests to console
app.use(express.json());

// Strict CORS (Adjust CLIENT_URL in your .env file)
app.use(cors({ 
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

// Rate Limiting (Prevent AI quota draining)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api', limiter);

// --- Routes ---
app.get('/', (req, res) => {
  res.send('API is running...');
});

app.use('/api/auth', authRoutes);
app.use('/api/analysis', analysisRoutes);

// --- Error Handling ---
// Must be placed AFTER the routes
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`));