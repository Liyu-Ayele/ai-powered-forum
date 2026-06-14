import { safeExecute } from "../../../../db/config.js";
import { NotFoundError } from "../../../utils/errors/index.js";

/**
 * List all documents owned by the authenticated user.
 */
export const listDocumentsForUserService = async (userId) => {
  const sql = `
    SELECT 
      document_id,
      title,
      mime_type,
      byte_size,
      status,
      error_message,
      created_at,
      updated_at
    FROM documents
    WHERE user_id = ?
    ORDER BY created_at DESC
  `;

  const rows = await safeExecute(sql, [userId]);

  return rows.map((row) => ({
    document_id: row.document_id,
    title: row.title,
    mime_type: row.mime_type,
    byte_size: row.byte_size,
    status: row.status,
    error_message: row.error_message,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }));
};

/**
 * Get document metadata by ID, ensuring it belongs to the authenticated user.
 */
export const getDocumentMetaService = async (documentId, userId) => {
  const sql = `
    SELECT 
      document_id,
      title,
      mime_type,
      byte_size,
      status,
      error_message,
      created_at,
      updated_at,
      user_id,
      storage_path
    FROM documents
    WHERE document_id = ? AND user_id = ?
  `;

  const rows = await safeExecute(sql, [documentId, userId]);

  if (rows.length === 0) {
    throw new NotFoundError("Document not found or you do not have access");
  }

  const row = rows[0];

  return {
    document_id: row.document_id,
    title: row.title,
    mime_type: row.mime_type,
    byte_size: row.byte_size,
    status: row.status,
    error_message: row.error_message,
    created_at: row.created_at,
    updated_at: row.updated_at,
    user_id: row.user_id,
    storage_path: row.storage_path,
  };
};

/**
 * Convenience method: alias for getDocumentMetaService, often used
 * prior to operating on the file to ensure ownership.
 */
export const assertOwnedDocument = async (documentId, userId) => {
  return await getDocumentMetaService(documentId, userId);
};
