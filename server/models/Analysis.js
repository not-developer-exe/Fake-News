import mongoose from 'mongoose';

// Define the structure of the analysis document in MongoDB
const analysisSchema = new mongoose.Schema({
  claim: { // Short version of the claim for display in lists
    type: String,
    required: true,
    trim: true,
    maxlength: 150, // Keep it relatively short
  },
  fullClaim: { // The complete original claim text
    type: String,
    required: true,
    trim: true,
  },
  verdict: {
    type: String,
    required: true,
    enum: ['Real', 'Fake', 'Disputed', 'Uncertain'], // Possible values
  },
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  explanation: {
    type: String,
    required: true,
  },
  sources: [{ // Array to store source objects
    title: { type: String },
    uri: { type: String }
  }],
  createdAt: { // Automatically records when the analysis was created
    type: Date,
    default: Date.now,
  },
});

// Create the model from the schema
const Analysis = mongoose.model('Analysis', analysisSchema);

export default Analysis;
