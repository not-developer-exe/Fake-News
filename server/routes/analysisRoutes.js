import express from 'express';
import { 
  createAnalysis, 
  getHistory, 
  getTrending 
} from '../controllers/analysisController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public route: Anyone can see what's trending
router.get('/trending', getTrending);

// Protected routes: Must have a valid JWT token
router.post('/', protect, createAnalysis);      // Run a new check
router.get('/history', protect, getHistory);    // Get MY history

export default router;