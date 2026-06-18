import { safeExecute } from "../../../../db/config.js";
import { ForbiddenError, NotFoundError } from "../../../utils/errors/index.js";

const fetchSql = `
  SELECT
    a.answer_id AS id,
    a.question_id AS questionId,
    a.content,
    a.created_at AS createdAt,
    a.updated_at AS updatedAt,
    u.user_id AS authorId,
    u.first_name AS firstName,
    u.last_name AS lastName
  FROM answers a
  JOIN users u ON a.user_id = u.user_id
  WHERE a.answer_id = ?
`;

const formatAnswer = (row) => ({
  id: row.id,
  questionId: row.questionId,
  content: row.content,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
  author: {
    id: row.authorId,
    firstName: row.firstName,
    lastName: row.lastName,
  },
});

export const createAnswerService = async ({ questionId, content, userId }) => {
  const questionSql =
    "SELECT question_id, user_id FROM questions WHERE question_id = ?";

  const questions = await safeExecute(questionSql, [questionId]);

  if (questions.length === 0) {
    throw new NotFoundError("Question not found");
  }

  if (questions[0].user_id === userId) {
    throw new ForbiddenError("You cannot answer your own question");
  }

  const insertSql =
    "INSERT INTO answers (question_id, user_id, content) VALUES (?, ?, ?)";

  const result = await safeExecute(insertSql, [questionId, userId, content]);

  const rows = await safeExecute(fetchSql, [result.insertId]);

  return formatAnswer(rows[0]);
};

export const updateAnswerService = async ({ answerId, content, userId }) => {
  const existing = await safeExecute(
    "SELECT answer_id, user_id FROM answers WHERE answer_id = ?",
    [answerId],
  );

  if (existing.length === 0) {
    throw new NotFoundError("Answer not found");
  }

  if (existing[0].user_id !== userId) {
    throw new ForbiddenError("You can only edit your own answers");
  }

  await safeExecute("UPDATE answers SET content = ? WHERE answer_id = ?", [
    content,
    answerId,
  ]);

  const rows = await safeExecute(fetchSql, [answerId]);

  return formatAnswer(rows[0]);
};

export const deleteAnswerService = async ({ answerId, userId }) => {
  const existing = await safeExecute(
    "SELECT answer_id, user_id FROM answers WHERE answer_id = ?",
    [answerId],
  );

  if (existing.length === 0) {
    throw new NotFoundError("Answer not found");
  }

  if (existing[0].user_id !== userId) {
    throw new ForbiddenError("You can only delete your own answers");
  }

  await safeExecute("DELETE FROM answers WHERE answer_id = ?", [answerId]);
};
