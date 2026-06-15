import { safeExecute } from "./db/config.js";

async function checkVectors() {
  try {
    const rows = await safeExecute("SELECT vector_id, question_id, status FROM question_vectors", []);
    console.log("Vectors:", rows);
    const questions = await safeExecute("SELECT question_id, question_hash FROM questions", []);
    console.log("Questions:", questions);
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

checkVectors();
