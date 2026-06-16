import express from "express";
import { authenticateUser } from "../../../middleware/authentication.js";
import {
  toggleBookmarkController,
  getBookmarksController,
  checkBookmarkController,
} from "../controller/bookmark.controller.js";

const router = express.Router();

/**
 * @route POST /api/bookmarks/toggle
 * @desc Toggle bookmark on a question (add or remove)
 * @access Private
 * @body { questionId: number }
 */
router.post("/toggle", authenticateUser, toggleBookmarkController);

/**
 * @route GET /api/bookmarks
 * @desc Get all bookmarked questions for the current user
 * @access Private
 * @query page, limit
 */
router.get("/", authenticateUser, getBookmarksController);

/**
 * @route GET /api/bookmarks/check/:questionHash
 * @desc Check if a question is bookmarked by the current user
 * @access Private
 */
router.get("/check/:questionHash", authenticateUser, checkBookmarkController);

export default router;
