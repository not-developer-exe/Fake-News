import mongoose from "mongoose";

const analysisSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true, // Now every analysis MUST belong to a user
  },
  claim: { type: String, required: true, trim: true, maxlength: 150 },
  fullClaim: { type: String, required: true },
  verdict: {
    type: String,
    required: true,
    enum: ["Real", "Fake", "Disputed", "Uncertain"],
  },
  score: { type: Number, required: true, min: 0, max: 100 },
  explanation: { type: String, required: true },
  sources: [{ title: String, uri: String }],
  isTrending: { type: Boolean, default: false }, // For your "optional" feature
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Analysis", analysisSchema);
