import { GoogleGenAI } from "@google/genai";
import { safeExecute } from "./db/config.js";
import dotenv from "dotenv";

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_EMBEDDING_MODEL = process.env.GEMINI_EMBEDDING_MODEL || "gemini-embedding-001";

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

async function generateEmbedding(text) {
  const response = await ai.models.embedContent({
    model: GEMINI_EMBEDDING_MODEL,
    contents: [text],
  });
  const embedding = response.embeddings?.[0]?.values;
  if (!embedding || !Array.isArray(embedding)) {
    throw new Error("Embedding response did not contain values");
  }
  return embedding;
}

async function fixVectors() {
  try {
    const failedVectors = await safeExecute("SELECT vector_id, question_id, source_text FROM question_vectors WHERE status = 'failed'", []);
    
    console.log(`Found ${failedVectors.length} failed vectors. Attempting to fix...`);
    
    for (const vector of failedVectors) {
      try {
        console.log(`Generating embedding for question ID ${vector.question_id}...`);
        const embeddingValues = await generateEmbedding(vector.source_text);
        
        await safeExecute(
          "UPDATE question_vectors SET embedding = ?, status = 'ready' WHERE vector_id = ?",
          [JSON.stringify(embeddingValues), vector.vector_id]
        );
        console.log(`Successfully fixed vector for question ID ${vector.question_id}.`);
      } catch (err) {
        console.error(`Failed to fix vector for question ID ${vector.question_id}:`, err.message);
      }
    }
    
    console.log("Done fixing vectors.");
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

fixVectors();
