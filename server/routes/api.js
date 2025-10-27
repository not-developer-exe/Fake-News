import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';


dotenv.config();


const router = express.Router();

// --- Initialize Gemini Client ---
// Check if the API key is loaded
if (!process.env.GEMINI_API_KEY) {
  console.error("GEMINI_API_KEY is not set. Please check your .env file.");
}
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// --- Define the System Prompt ---
const systemPrompt = `You are an expert fact-checker. Your goal is to analyze a news claim provided by the user.
You must use the provided Google Search tool to find real-time, high-quality, and diverse sources (e.g., reputable news organizations, academic institutions, fact-checking organizations) to verify the information.

In your response, you MUST provide a clear and concise summary of your findings. Start by stating whether the claim is:
- **Well-supported:** Corroborated by multiple reliable sources.
- **Disputed:** Reliable sources offer conflicting information.
- **Unsupported:** No reliable sources could be found to support the claim.
- **Misleading:** Contains some truth but is presented out of context or with missing details.
- **False:** Refuted by multiple reliable sources.

After the one-sentence summary, explain your reasoning in a few clear bullet points, referencing the information you found.
Do not state your own opinion. Base your entire analysis on the search results.
Format your output as clean HTML that can be injected into a <div>. Use <h3> for the main finding (e.g., "Finding: False"), <p> for the summary, and a <ul> with <li> for the bullet points.`;


// --- Define the API Endpoint ---
// This creates the http://localhost:5001/api/check-claim endpoint
router.post('/check-claim', async (req, res) => {
  const { claim } = req.body;

  if (!claim) {
    return res.status(400).json({ error: 'Claim is required.' });
  }

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-preview-09-2025",
      systemInstruction: systemPrompt,
      tools: [{ "google_search": {} }],
    });

    const result = await model.generateContent(`Please fact-check the following news claim: "${claim}"`);
    const response = result.response;
    const candidate = response.candidates?.[0];

    if (candidate && candidate.content?.parts?.[0]?.text) {
      const analysisText = candidate.content.parts[0].text;
      
      // Extract sources
      let sources = [];
      const groundingMetadata = candidate.groundingMetadata;
      if (groundingMetadata && groundingMetadata.groundingAttributions) {
          sources = groundingMetadata.groundingAttributions
              .map(attribution => ({
                  uri: attribution.web?.uri,
                  title: attribution.web?.title,
              }))
              .filter(source => source.uri && source.title); // Ensure sources are valid
      }
      const uniqueSources = new Map(sources.map(s => [s.uri, s]));
      
      // Send the analysis and sources back to the frontend
      res.json({ 
        analysis: analysisText, 
        sources: Array.from(uniqueSources.values()) 
      });

    } else {
      console.error("Unexpected API response structure:", response);
      res.status(500).json({ error: 'Could not get a valid analysis from the API.' });
    }

  } catch (error) {
    console.error('Error calling Gemini API:', error);
    res.status(500).json({ error: 'An internal server error occurred.' });
  }
});

export default router;

