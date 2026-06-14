import path from "path";
import fs from "fs";
import { StatusCodes } from "http-status-codes";

import {
  listDocumentsForUserService,
  getDocumentMetaService,
  assertOwnedDocument,
} from "../service/rag.service.js";

/**
 * GET /api/rag/documents
 */
export const listDocumentsController = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const documents = await listDocumentsForUserService(userId);

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Documents fetched successfully.",
      data: documents,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/rag/documents/:documentId
 */
export const getDocumentMetaController = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const { documentId } = req.params;

    const document = await getDocumentMetaService(documentId, userId);

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Document fetched successfully.",
      data: document,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/rag/documents/:documentId/file
 */
export const getDocumentFileController = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const { documentId } = req.params;

    const document = await assertOwnedDocument(documentId, userId);

    const uploadDir = process.env.RAG_UPLOAD_DIR || "uploads/rag";
    const absoluteFilePath = path.resolve(process.cwd(), uploadDir, document.storage_path);

    if (!fs.existsSync(absoluteFilePath)) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "File not found on disk",
      });
    }

    res.setHeader("Content-Type", document.mime_type || "application/pdf");
    res.sendFile(absoluteFilePath);
  } catch (error) {
    next(error);
  }
};
