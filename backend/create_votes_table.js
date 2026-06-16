import { db, safeExecute } from "./db/config.js";

const run = async () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS \`votes\` (
      \`vote_id\` INT AUTO_INCREMENT PRIMARY KEY,
      \`user_id\` INT NOT NULL,
      \`target_type\` ENUM('question', 'answer') NOT NULL,
      \`target_id\` INT NOT NULL,
      \`vote\` TINYINT NOT NULL CHECK (\`vote\` IN (1, -1)),
      \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY \`uniq_user_target\` (\`user_id\`, \`target_type\`, \`target_id\`),
      FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`user_id\`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;

  try {
    console.log("Creating votes table...");
    await safeExecute(sql, []);
    console.log("Votes table created successfully.");
  } catch (error) {
    console.error("Failed to create table:", error);
  } finally {
    process.exit(0);
  }
};

run();
