import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './routes/api.js';
import mongoose from 'mongoose';

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001; 

// --- Connect to MongoDB ---
const connectDB = async () => {
    try {
      // Make sure MONGODB_URI is set in your .env file
      if (!process.env.MONGODB_URI) {
        console.error('FATAL ERROR: MONGODB_URI is not defined in .env file');
        process.exit(1);
      }
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('MongoDB connected successfully');
    } catch (error) {
      console.error('MongoDB connection error:', error);
      process.exit(1); // Exit process with failure
    }
  };
  
  connectDB(); // Call the function to connect

// --- Middleware ---
// Enable CORS (Cross-Origin Resource Sharing)
app.use(cors());

// Parse incoming JSON requests
app.use(express.json());

// --- Routes ---
// Tell Express to use your new api.js file for any URL starting with /api
app.use('/api', apiRoutes);

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});