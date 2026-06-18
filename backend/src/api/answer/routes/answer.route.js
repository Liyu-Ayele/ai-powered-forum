import express from "express";
import {
  createAnswerController,
  updateAnswerController,
  deleteAnswerController,
} from "../controller/answer.controller.js";
import {
  createAnswerValidation,
  updateAnswerValidation,
  deleteAnswerValidation,
} from "../validations/answer.validation.js";
import { authenticateUser } from "../../../middleware/authentication.js";
const router = express.Router();

router.post(
  "/",
  authenticateUser,
  createAnswerValidation,
  createAnswerController,
);

router.put(
  "/:answerId",
  authenticateUser,
  updateAnswerValidation,
  updateAnswerController,
);

router.delete(
  "/:answerId",
  authenticateUser,
  deleteAnswerValidation,
  deleteAnswerController,
);

export default router;
