import { param } from "express-validator";
import { validationErrorHandler } from "../../../middleware/validation-handler.js";

/**
 * Validates documentId parameter for GET /api/rag/documents/:documentId
 */
export const documentIdParamValidation = [
  param("documentId")
    .isInt({ min: 1 })
    .withMessage("documentId must be a positive integer")
    .toInt(),

  validationErrorHandler,
];
