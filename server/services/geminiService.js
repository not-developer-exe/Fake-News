import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const systemPrompt = `
You are FactCheck AI, a helpful, objective, and user-friendly assistant. 
Your goal is to verify news claims while being easy to understand.

1. **Tone:** Professional but conversational. Avoid overly robotic language. 
2. **Task:** Use Google Search to find sources.
3. **Format:** Return ONLY a JSON object.

JSON Structure:
{
  "verdict": "Real" | "Fake" | "Disputed" | "Uncertain",
  "score": 0-100,
  "explanation": "A clear, human-readable summary. Cite sources like [1], [2].",
}
`;

export const analyzeClaimWithGemini = async (text) => {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash-preview-09-2025", 
    systemInstruction: { parts: [{ text: systemPrompt }] },
    tools: [{ "google_search": {} }],
  });

  const chat = model.startChat();
  const result = await chat.sendMessage(text);
  const response = result.response;
  
  // Logic to parse JSON (reused from your previous code, but encapsulated)
  const textResponse = response.text();
  const jsonMatch = textResponse.match(/```json\s*([\s\S]*?)\s*```|({[\s\S]*})/);
  if (!jsonMatch) throw new Error("AI response format error");
  
  const data = JSON.parse(jsonMatch[1] || jsonMatch[2]);
  
  // Extract Sources
  const sources = response.candidates?.[0]?.groundingMetadata?.groundingAttributions
    ?.map(attr => ({ title: attr.web?.title, uri: attr.web?.uri }))
    .filter(s => s.uri) || [];

  return { ...data, sources };
};