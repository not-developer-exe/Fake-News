import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Analysis from '../models/Analysis.js'; // Import our model
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();


const router = express.Router();

// --- API Key Validation Middleware ---
const validateApiKey = (req, res, next) => {
  if (!process.env.GEMINI_API_KEY) {
    console.error('FATAL ERROR: GEMINI_API_KEY is not defined in .env file');
    return res.status(500).json({ message: 'Internal server configuration error.' });
  }
  next();
};
router.use(validateApiKey);

// --- Initialize Gemini ---
let genAI;
try {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
} catch (error) {
  console.error("Error initializing GoogleGenerativeAI:", error);
  // If initialization fails, subsequent requests will error out naturally
}


// --- System Prompt ---
// Updated to ask for JSON within the text, not forcing it via API config
const systemPrompt = `
You are a professional, unbiased fact-checking assistant. Your goal is to analyze a user-provided news claim, find relevant information from the web using the provided Google Search tool, and provide a structured analysis.
- Use Google Search to find multiple reputable, independent sources to evaluate the claim.
- Base your verdict and explanation ONLY on the information found in the search results.
- Provide a clear verdict: 'Real', 'Fake', 'Disputed', or 'Uncertain' (if confidence is very low or sources conflict heavily).
- Provide a confidence score between 0 and 100.
- Write a neutral, objective explanation summarizing the findings from the search results. If citing, use source numbers like [1], [2].
- **IMPORTANT: Format your final response ONLY as a single, valid JSON object enclosed in triple backticks (\`\`\`) containing the keys "verdict", "score", and "explanation". Example:**
\`\`\`json
{
  "verdict": "Disputed",
  "score": 65,
  "explanation": "Sources provide conflicting information regarding the claim [1]. Some sources support parts of it [2], while others contradict it [3]."
}
\`\`\`
- Do not include any text before or after the JSON block.
`;


// --- GET Route to fetch history ---
router.get('/history', async (req, res) => {
  try {
    const history = await Analysis.find().sort({ createdAt: -1 }).limit(50);
    res.json(history);
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ message: "Error fetching analysis history." });
  }
});


// --- POST Route to check a claim ---
router.post('/check-claim', async (req, res) => {
  const { claimText } = req.body;

  if (!claimText || typeof claimText !== 'string' || claimText.trim().length === 0) {
    return res.status(400).json({ message: 'claimText (string) is required and cannot be empty' });
  }
  if (claimText.length > 5000) {
      return res.status(400).json({ message: 'Input text exceeds maximum length of 5000 characters.' });
  }

  try {
     if (!genAI) {
        throw new Error("GoogleGenerativeAI not initialized. Check API Key.");
     }

    // *** MODIFIED: Removed generationConfig for JSON, kept tools ***
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-preview-09-2025",
      systemInstruction: {
        parts: [{ text: systemPrompt }]
      },
      tools: [{ "google_search": {} }], // Keep the search tool
      // REMOVED: generationConfig forcing JSON output
      // generationConfig: {
      //   responseMimeType: "application/json",
      //   responseSchema: responseSchema, // Removed this schema definition as well
      // },
    });

    const chat = model.startChat();
    const result = await chat.sendMessage(claimText.trim());
    const response = result.response;

    if (!response || !response.text) {
        throw new Error("Received an empty response from the AI model.");
    }

    const responseText = response.text();
    let analysisData;

    try {
        // *** MODIFIED: Extract JSON from the text response ***
        // Attempt to find the JSON block within potential backticks or surrounding text
        const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```|({[\s\S]*})/); // Look for ```json ... ``` or just { ... }
        if (!jsonMatch || (!jsonMatch[1] && !jsonMatch[2])) {
            console.error("Could not find JSON block in AI response:", responseText);
            throw new Error("AI response did not contain the expected JSON format.");
        }
        const jsonString = jsonMatch[1] || jsonMatch[2]; // Get the captured JSON string
        analysisData = JSON.parse(jsonString);

        // Basic validation of parsed data
        if (!analysisData.verdict || typeof analysisData.score !== 'number' || !analysisData.explanation) {
             throw new Error("Parsed JSON is missing required fields (verdict, score, explanation).");
        }

    } catch (parseError) {
        console.error("Error parsing AI response JSON:", parseError);
        console.error("Raw AI response:", responseText);
        // Rethrow a more specific error or handle it by setting default data
        // For now, let's rethrow to indicate a failure in processing
         throw new Error(`Failed to parse the analysis result from the AI: ${parseError.message}`);
    }


    // --- Extract Sources from Grounding Metadata ---
    let sources = [];
    try {
      const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
      if (groundingMetadata?.groundingAttributions) {
        sources = groundingMetadata.groundingAttributions
          .map(attribution => ({
            uri: attribution.web?.uri,
            title: attribution.web?.title,
          }))
          .filter(source => source.uri);
      }
    } catch (sourceError) {
        console.error("Error processing grounding metadata:", sourceError);
        // Continue without sources
    }


    // --- Save to MongoDB using the Analysis model ---
    const newAnalysis = new Analysis({
      claim: claimText.trim().substring(0, 150) + (claimText.trim().length > 150 ? "..." : ""),
      fullClaim: claimText.trim(),
      // Use parsed data, with defaults as fallback (though parsing error should catch issues earlier)
      verdict: analysisData.verdict || 'Uncertain',
      score: analysisData.score ?? 50,
      explanation: analysisData.explanation || 'No explanation provided.',
      sources: sources,
    });

    const savedAnalysis = await newAnalysis.save();
    res.status(201).json(savedAnalysis);

  } catch (error) {
    console.error('Error in /check-claim route:', error);
    let statusCode = 500;
    let message = 'An unexpected error occurred while processing your request.';

    // Keep existing detailed error handling
    if (error.message.includes("API key not valid")) { statusCode = 401; message = "Invalid API Key provided."; }
    else if (error.message.includes("GoogleGenerativeAI not initialized")) { statusCode = 503; message = "AI service initialization failed. Check server configuration."; }
    else if (error.message.includes("Received an empty response")) { message = "The AI model returned an empty response. Please try again or rephrase your claim."; }
    else if (error.message.includes("Failed to parse") || error.message.includes("expected JSON format")) {
        statusCode = 502; // Bad Gateway - upstream error format issue
        message = "There was an issue processing the AI's response format.";
    }
    else if (error.status && error.statusText) { statusCode = error.status; message = `Error calling AI service: ${error.statusText}. Check API key and quota.`; console.error("Google AI Error Details:", error.errorDetails); }
    else if (error.name === 'ValidationError') { statusCode = 400; message = `Data validation failed: ${error.message}`; }
    else if (error.message.includes("Tool use with a response mime type")) { // Catch the original specific error just in case
        statusCode = 400;
        message = "Configuration error: Cannot use tools with forced JSON output.";
    }

    res.status(statusCode).json({ message: message, details: error.message });
  }
});


// --- DELETE Route to remove history item ---
router.delete('/history/:id', async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid history item ID format.' });
  }
  try {
    const deletedAnalysis = await Analysis.findByIdAndDelete(id);
    if (!deletedAnalysis) {
      return res.status(404).json({ message: 'History item not found.' });
    }
    res.status(200).json({ message: 'History item deleted successfully.', id: id });
  } catch (error) {
    console.error('Error deleting history item:', error);
    res.status(500).json({ message: 'Error deleting history item.', details: error.message });
  }
});

export default router;

