import { safeExecute } from "../../../../db/config.js";
import { NotFoundError, BadRequestError } from "../../../utils/errors/index.js";

/**
 * Cast or update a vote
 * @param {Object} params
 * @param {number} params.userId
 * @param {string} params.targetType - 'question' or 'answer'
 * @param {number} params.targetId
 * @param {number} params.voteValue - 1 or -1
 */
export const castVoteService = async ({ userId, targetType, targetId, voteValue }) => {
  // Validate target exists
  const table = targetType === 'question' ? 'questions' : 'answers';
  const idCol = targetType === 'question' ? 'question_id' : 'answer_id';
  
  const targetCheckSql = `SELECT ${idCol} FROM ${table} WHERE ${idCol} = ?`;
  const targets = await safeExecute(targetCheckSql, [targetId]);
  if (targets.length === 0) {
    throw new NotFoundError(`${targetType} not found`);
  }

  // Insert or Update the vote using ON DUPLICATE KEY UPDATE
  const voteSql = `
    INSERT INTO votes (user_id, target_type, target_id, vote)
    VALUES (?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE vote = VALUES(vote)
  `;
  
  await safeExecute(voteSql, [userId, targetType, targetId, voteValue]);
  
  return { success: true };
};

/**
 * Remove a vote
 * @param {Object} params
 * @param {number} params.userId
 * @param {string} params.targetType - 'question' or 'answer'
 * @param {number} params.targetId
 */
export const removeVoteService = async ({ userId, targetType, targetId }) => {
  const deleteSql = `
    DELETE FROM votes
    WHERE user_id = ? AND target_type = ? AND target_id = ?
  `;
  
  const result = await safeExecute(deleteSql, [userId, targetType, targetId]);
  
  if (result.affectedRows === 0) {
    throw new NotFoundError("Vote not found to remove");
  }
  
  return { success: true };
};
