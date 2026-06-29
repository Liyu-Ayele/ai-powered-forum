import { StatusCodes } from "http-status-codes";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  listDocumentsForUserService,
  getDocumentMetaService,
  assertOwnedDocument,
  createDocumentFromUploadService,
  searchInDocumentService,
  queryDocumentService,
  deleteDocumentService,
} from "../service/rag.service.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEBUG_LOG = path.resolve(__dirname, "../../../../../debug-ec5947.log");

function agentDebugLog(payload) {
  // #region agent log
  try {
    fs.appendFileSync(
      DEBUG_LOG,
      `${JSON.stringify({ sessionId: "ec5947", timestamp: Date.now(), ...payload })}\n`,
    );
  } catch {
    // ignore logging failures
  }
  // #endregion
}

async function fetchCloudinaryPdf(storagePath) {
  const initialResponse = await fetch(storagePath);

  // #region agent log
  agentDebugLog({
    hypothesisId: "A",
    location: "rag.controller.js:fetchCloudinaryPdf:initial",
    message: "Initial Cloudinary fetch result",
    data: {
      storagePathSuffix: storagePath?.slice?.(-60) ?? null,
      hasPdfExtension: /\.pdf$/i.test(storagePath ?? ""),
      status: initialResponse.status,
      ok: initialResponse.ok,
    },
  });
  // #endregion

  if (initialResponse.ok) return initialResponse;

  if (!/\.pdf$/i.test(storagePath)) {
    const retryUrl = `${storagePath}.pdf`;
    const retryResponse = await fetch(retryUrl);

    // #region agent log
    agentDebugLog({
      hypothesisId: "A",
      location: "rag.controller.js:fetchCloudinaryPdf:retry",
      message: "Retried Cloudinary fetch with .pdf suffix",
      data: {
        retryUrlSuffix: retryUrl.slice(-60),
        status: retryResponse.status,
        ok: retryResponse.ok,
      },
    });
    // #endregion

    if (retryResponse.ok) return retryResponse;
  }

  return initialResponse;
}

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
    const { documentId } = req.params;
    const userId = req.user?.id;
    const data = await getDocumentMetaService(documentId, userId);
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Document fetched successfully.",
      data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/rag/documents
 */
export const createDocumentController = async (req, res, next) => {
  try {
    const result = await createDocumentFromUploadService({
      file: req.file,
      userId: req.user.id,
    });
    res.status(StatusCodes.CREATED).json({
      success: true,
      message: "Document uploaded and processed.",
      data: result,
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

    if (!document.storage_path) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "No file URL found for this document",
      });
    }

    // #region agent log
    agentDebugLog({
      hypothesisId: "B,C",
      location: "rag.controller.js:getDocumentFileController:entry",
      message: "Serving document file",
      data: {
        documentId,
        hasStoragePath: Boolean(document.storage_path),
        storagePathSuffix: document.storage_path?.slice?.(-60) ?? null,
        byteSize: document.byte_size ?? null,
      },
    });
    // #endregion

    const cloudResponse = await fetchCloudinaryPdf(document.storage_path);
    if (!cloudResponse.ok) {
      // #region agent log
      agentDebugLog({
        hypothesisId: "A,D,E",
        location: "rag.controller.js:getDocumentFileController:cloudinaryFailed",
        message: "Cloudinary fetch failed after retries",
        data: {
          documentId,
          status: cloudResponse.status,
          statusText: cloudResponse.statusText,
        },
      });
      // #endregion
      return res.status(StatusCodes.BAD_GATEWAY).json({
        success: false,
        message: "Failed to retrieve PDF from storage",
      });
    }

    const pdfBuffer = Buffer.from(await cloudResponse.arrayBuffer());

    // #region agent log
    agentDebugLog({
      hypothesisId: "A",
      location: "rag.controller.js:getDocumentFileController:success",
      message: "PDF fetched from Cloudinary",
      data: {
        documentId,
        pdfBytes: pdfBuffer.length,
        pdfMagic: pdfBuffer.slice(0, 5).toString("ascii"),
      },
    });
    // #endregion
    const filename = (document.title || "document.pdf").replace(/[^\w\s.-]/g, "_");

    res.setHeader("Content-Type", document.mime_type || "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${filename}"`);
    res.setHeader("Content-Length", pdfBuffer.length);
    return res.send(pdfBuffer);
  } catch (error) {
    console.error("Error serving PDF:", error);
    next(error);
  }
};

/**
 * POST /api/rag/documents/:documentId/query
 */
export const queryDocumentController = async (req, res, next) => {
  try {
    const { documentId } = req.params;
    const { query } = req.body;
    const userId = req.user?.id;
    const data = await queryDocumentService(documentId, userId, query);
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Answer and citations",
      data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/rag/documents/:documentId/search
 */
export const searchInDocumentController = async (req, res, next) => {
  try {
    const result = await searchInDocumentService({
      documentId: req.params.documentId,
      query: req.query.query,
      k: req.query.k,
      userId: req.user.id,
    });
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Ranked chunk excerpts",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/rag/documents/:documentId
 */
export const deleteDocumentController = async (req, res, next) => {
  try {
    const { documentId } = req.params;
    const userId = req.user.id;
    const result = await deleteDocumentService(Number(documentId), userId);
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Document deleted successfully.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};