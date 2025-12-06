import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './routes/api.js';
import mongoose from 'mongoose';

// Load environment variables from .env file
dotenv.config();

const app = express();

// --- Connect to MongoDB ---
const connectDB = async () => {
    try {
      // Make sure MONGODB_URI is set in your .env file
      // In Vercel, this comes from the Dashboard Environment Variables
      if (!process.env.MONGODB_URI) {
        console.error('FATAL ERROR: MONGODB_URI is not defined');
        // Do not process.exit(1) in serverless, or it might crash the cold start
        return; 
      }
      
      // Prevent connecting if already connected
      if (mongoosevb.connection.readyState >= 1) return;

      await mongoose.connect(process.env.MONGODB_URI);
      console.log('MongoDB connected successfully');
    } catch (error) {
      console.error('MongoDB connection error:', error);
    }
  };
  
connectDB(); 

// --- Middleware ---
// Enable CORS (Cross-Origin Resource Sharing)
app.use(cors());

// Parse incoming JSON requests
app.use(express.json());

// --- Routes ---
// Tell Express to use your new api.js file for any URL starting with /api
app.use('/api', apiRoutes);

// --- Server Startup Logic ---
// Only listen on port if NOT in production (Vercel)
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5001; 
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

// Export the app for Vercel
export default app;