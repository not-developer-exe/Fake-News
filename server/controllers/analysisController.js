import Analysis from '../models/Analysis.js';
import { analyzeClaimWithGemini } from '../services/geminiService.js';

// @desc    Analyze a new claim
// @route   POST /api/analysis
// @access  Private (User must be logged in)
export const createAnalysis = async (req, res) => {
  const { claimText } = req.body;
  
  try {
    const aiResult = await analyzeClaimWithGemini(claimText);

    const analysis = await Analysis.create({
      user: req.user._id, // Link to the logged-in user
      claim: claimText.substring(0, 150),
      fullClaim: claimText,
      ...aiResult
    });

    res.status(201).json(analysis);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'AI Analysis failed' });
  }
};

// @desc    Get logged-in user's history
// @route   GET /api/analysis/history
// @access  Private
export const getHistory = async (req, res) => {
  try {
    // Only fetch analysis belonging to req.user._id
    const history = await Analysis.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get Trending/Most Asked Claims
// @route   GET /api/analysis/trending
// @access  Public
export const getTrending = async (req, res) => {
    try {
    const trending = await Analysis.aggregate([
      {
        $group: {
          _id: "$claim", // Group by the short claim text
          count: { $sum: 1 },
          verdict: { $first: "$verdict" },
          score: { $first: "$score" }
        }
      },
      { $match: { count: { $gt: 1 } } }, // Must appear more than once
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    res.json(trending);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};