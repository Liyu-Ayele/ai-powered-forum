import { GoogleGenAI } from '@google/genai';

let aiInstance = null;

export const getGeminiClient = () => {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('Warning: GEMINI_API_KEY environment variable is not set.');
    }
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
};

export const embedQuery = async (queryText) => {
  const ai = getGeminiClient();
  const response = await ai.models.embedContent({
    model: 'text-embedding-004',
    contents: queryText,
    config: {
      taskType: 'RETRIEVAL_QUERY',
    },
  });
  
  if (!response.embeddings || response.embeddings.length === 0) {
    throw new Error('Failed to generate embedding: No embeddings returned from Gemini API');
  }

  return response.embeddings[0].values;
};
