import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './routes/api.js';
import mongoose from 'mongoose';

dotenv.config();

const app = express();

// --- Serverless Database Connection (Critical for Vercel) ---
// Vercel functions spin up/down instantly. We must cache the DB connection
// or it will crash with "too many connections" or timeouts.
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn) {
    return cached.conn;
  }

  if (!process.env.MONGODB_URI) {
    throw new Error('FATAL ERROR: MONGODB_URI is not defined in Environment Variables.');
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false, // Disable buffering for serverless
    };

    cached.promise = mongoose.connect(process.env.MONGODB_URI, opts).then((mongoose) => {
      console.log('New MongoDB connection established');
      return mongoose;
    });
  }
  
  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
};

// --- Middleware ---
app.use(cors({
  origin: '*', // Allow all origins (Frontend Vercel URL)
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// --- Database Middleware ---
// Ensure DB connects before processing any request
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error("Database connection failed:", error);
    res.status(500).json({ error: "Service unavailable: Database connection failed." });
  }
});

// --- Routes ---
// 1. Root Route (Health Check) - Useful to see if Vercel is running at all
app.get('/', (req, res) => {
  res.send('<h1>Fake News Detector Backend is Running! 🚀</h1><p>Status: Online</p>');
});

// 2. API Routes
app.use('/api', apiRoutes);

// --- Local Development Logic ---
// This only runs on your machine. Vercel ignores it (as it should).
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => {
    console.log(`Server is running locally on http://localhost:${PORT}`);
  });
}

// Export the app for Vercel
export default app;