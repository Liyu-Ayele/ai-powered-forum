import { body, param } from "express-validator";
import { validationErrorHandler } from "../../../middleware/validation-handler.js";

export const castVoteValidation = [
  body("targetType")
    .isIn(["question", "answer"])
    .withMessage("targetType must be either 'question' or 'answer'"),
  body("targetId")
    .isInt({ min: 1 })
    .withMessage("targetId must be a positive integer"),
  body("voteValue")
    .isIn([1])
    .withMessage("voteValue must be 1 (Like)"),
  validationErrorHandler,
];

export const removeVoteValidation = [
  param("targetType")
    .isIn(["question", "answer"])
    .withMessage("targetType must be either 'question' or 'answer'"),
  param("targetId")
    .isInt({ min: 1 })
    .withMessage("targetId must be a positive integer"),
  validationErrorHandler,
];
