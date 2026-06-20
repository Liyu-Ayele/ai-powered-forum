import { body, param } from "express-validator";
import { validationErrorHandler } from "../../../middleware/validation-handler.js";

export const createAnswerValidation = [
  body("questionId")
    .notEmpty()
    .withMessage("Question ID is required")
    .isInt()
    .withMessage("Question ID must be an integer"),

  body("content")
    .notEmpty()
    .withMessage("Content is required")
    .isLength({ min: 20 })
    .withMessage("Content must be at least 20 characters"),

  validationErrorHandler,
];

export const updateAnswerValidation = [
  param("answerId")
    .notEmpty()
    .withMessage("Answer ID is required")
    .isInt()
    .withMessage("Answer ID must be an integer"),

  body("content")
    .notEmpty()
    .withMessage("Content is required")
    .isLength({ min: 20 })
    .withMessage("Content must be at least 20 characters"),

  validationErrorHandler,
];

export const deleteAnswerValidation = [
  param("answerId")
    .notEmpty()
    .withMessage("Answer ID is required")
    .isInt()
    .withMessage("Answer ID must be an integer"),

  validationErrorHandler,
];
