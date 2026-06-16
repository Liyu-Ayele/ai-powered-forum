import dotenv from "dotenv";
dotenv.config();
import mysql from "mysql2/promise";

/**
 * Migration: Create the bookmarks table if it doesn't exist.
 * Run: node create_bookmarks_table.js
 */
const run = async () => {
  const db = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASS || "",
    database: process.env.DB_NAME || "evangadi_forum",
    port: Number(process.env.DB_PORT) || 3306,
  });

  const sql = `
    CREATE TABLE IF NOT EXISTS bookmarks (
      bookmark_id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      question_id INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uniq_user_question_bookmark (user_id, question_id),
      FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
      FOREIGN KEY (question_id) REFERENCES questions(question_id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;

  try {
    await db.execute(sql);
    console.log("✅ bookmarks table created (or already exists).");
  } catch (err) {
    console.error("❌ Failed to create bookmarks table:", err.message);
  } finally {
    await db.end();
  }
};

run();
