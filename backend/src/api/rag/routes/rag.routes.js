import express from "express";

import {
  listDocumentsController,
  getDocumentMetaController,
  getDocumentFileController,
} from "../controller/rag.controller.js";

import { documentIdParamValidation } from "../validations/rag.validation.js";
import { authenticateUser } from "../../../middleware/authentication.js";

const router = express.Router();

/**
 * @route GET /api/rag/documents
 * @desc List all PDFs uploaded by the authenticated user
 * @access Protected
 */
router.get(
  "/",
  authenticateUser,
  listDocumentsController
);

/**
 * @route GET /api/rag/documents/:documentId
 * @desc Fetch metadata for a specific document
 * @access Protected
 */
router.get(
  "/:documentId",
  authenticateUser,
  documentIdParamValidation,
  getDocumentMetaController
);

/**
 * @route GET /api/rag/documents/:documentId/file
 * @desc Serve the raw PDF file stream
 * @access Protected
 */
router.get(
  "/:documentId/file",
  authenticateUser,
  documentIdParamValidation,
  getDocumentFileController
);

export default router;
