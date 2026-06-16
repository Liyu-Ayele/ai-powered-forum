import { safeExecute } from "../../../../db/config.js";
import { NotFoundError } from "../../../utils/errors/index.js";

/**
 * Toggle a bookmark for a question.
 * If the bookmark exists it is removed; otherwise it is created.
 *
 * @param {number} userId
 * @param {number} questionId
 * @returns {Promise<{ bookmarked: boolean }>}
 */
export const toggleBookmarkService = async (userId, questionId) => {
  // Check if already bookmarked
  const existing = await safeExecute(
    "SELECT bookmark_id FROM bookmarks WHERE user_id = ? AND question_id = ?",
    [userId, questionId]
  );

  if (existing.length > 0) {
    await safeExecute(
      "DELETE FROM bookmarks WHERE user_id = ? AND question_id = ?",
      [userId, questionId]
    );
    return { bookmarked: false };
  }

  await safeExecute(
    "INSERT INTO bookmarks (user_id, question_id) VALUES (?, ?)",
    [userId, questionId]
  );
  return { bookmarked: true };
};

/**
 * Get paginated bookmarked questions for a user.
 *
 * @param {number} userId
 * @param {number} page
 * @param {number} limit
 * @returns {Promise<{ data: object[], meta: object }>}
 */
export const getUserBookmarksService = async (userId, page = 1, limit = 20) => {
  const offset = (page - 1) * limit;

  const sql = `
    SELECT
      q.question_id AS id,
      q.question_hash AS questionHash,
      q.title,
      q.content,
      q.created_at AS createdAt,
      q.updated_at AS updatedAt,
      u.user_id AS authorId,
      u.first_name AS firstName,
      u.last_name AS lastName,
      COUNT(DISTINCT a.answer_id) AS answerCount,
      COALESCE((SELECT SUM(vote) FROM votes WHERE target_type = 'question' AND target_id = q.question_id), 0) AS likes,
      b.created_at AS bookmarkedAt
    FROM bookmarks b
    JOIN questions q ON b.question_id = q.question_id
    JOIN users u ON q.user_id = u.user_id
    LEFT JOIN answers a ON q.question_id = a.question_id
    WHERE b.user_id = ?
    GROUP BY
      q.question_id, q.question_hash, q.title, q.content,
      q.created_at, q.updated_at, u.user_id, u.first_name, u.last_name,
      b.created_at
    ORDER BY b.created_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `;

  const rows = await safeExecute(sql, [userId]);

  const data = rows.map((row) => ({
    id: row.id,
    questionHash: row.questionHash,
    title: row.title,
    content: row.content,
    answerCount: row.answerCount,
    likes: parseInt(row.likes, 10) || 0,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    bookmarkedAt: row.bookmarkedAt,
    author: {
      id: row.authorId,
      firstName: row.firstName,
      lastName: row.lastName,
    },
  }));

  return {
    success: true,
    message: "Bookmarks fetched successfully.",
    data,
    meta: {
      currentPage: page,
      limit,
      hasMore: data.length === limit,
      totalReturned: data.length,
    },
  };
};

/**
 * Check whether a question is bookmarked by a user (looked up by questionHash).
 *
 * @param {number} userId
 * @param {string} questionHash
 * @returns {Promise<{ bookmarked: boolean }>}
 */
export const checkBookmarkByHashService = async (userId, questionHash) => {
  const rows = await safeExecute(
    `SELECT b.bookmark_id
     FROM bookmarks b
     JOIN questions q ON b.question_id = q.question_id
     WHERE b.user_id = ? AND q.question_hash = ?`,
    [userId, questionHash]
  );

  return { bookmarked: rows.length > 0 };
};
