import { StatusCodes } from "http-status-codes";
import { safeExecute } from "../../../../db/config.js";
import { BadRequestError, NotFoundError } from "../../../utils/errors/index.js";
import {
  toggleBookmarkService,
  getUserBookmarksService,
  checkBookmarkByHashService,
} from "../service/bookmark.service.js";

/**
 * POST /api/bookmarks/toggle
 * Toggle bookmark status for a question.
 * Body: { questionId: number }
 */
export const toggleBookmarkController = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const { questionId } = req.body;

    if (!questionId) {
      throw new BadRequestError("questionId is required.");
    }

    // Verify the question exists
    const questions = await safeExecute(
      "SELECT question_id FROM questions WHERE question_id = ?",
      [questionId]
    );
    if (questions.length === 0) {
      throw new NotFoundError("Question not found.");
    }

    const result = await toggleBookmarkService(userId, questionId);

    res.status(StatusCodes.OK).json({
      success: true,
      message: result.bookmarked
        ? "Question bookmarked successfully."
        : "Bookmark removed successfully.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/bookmarks
 * List bookmarked questions for the authenticated user.
 */
export const getBookmarksController = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;

    const result = await getUserBookmarksService(userId, page, limit);

    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/bookmarks/check/:questionHash
 * Check whether a question is bookmarked by the current user.
 */
export const checkBookmarkController = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const { questionHash } = req.params;

    const result = await checkBookmarkByHashService(userId, questionHash);

    res.status(StatusCodes.OK).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
