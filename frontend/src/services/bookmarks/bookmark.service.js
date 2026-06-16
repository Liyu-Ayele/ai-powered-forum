import { apiClient } from "../core/api.client.js";

/**
 * Toggle bookmark for a question
 * @param {number} questionId
 */
export async function toggleBookmark(questionId) {
  try {
    const response = await apiClient.post("/api/bookmarks/toggle", {
      questionId,
    });
    return response.data;
  } catch (error) {
    throw handleBookmarkError(error);
  }
}

/**
 * Get user's bookmarked questions
 * @param {object} params - { page, limit }
 */
export async function getBookmarks({ page = 1, limit = 20 } = {}) {
  try {
    const response = await apiClient.get("/api/bookmarks", {
      params: { page, limit },
    });
    return response.data;
  } catch (error) {
    throw handleBookmarkError(error);
  }
}

/**
 * Check if a question is bookmarked
 * @param {string} questionHash
 */
export async function checkBookmark(questionHash) {
  try {
    const response = await apiClient.get(`/api/bookmarks/check/${questionHash}`);
    return response.data;
  } catch (error) {
    throw handleBookmarkError(error);
  }
}

function handleBookmarkError(error) {
  if (!error.response) {
    return new Error("Unable to connect to server.");
  }
  const backendMessage =
    error.response.data?.msg ||
    error.response.data?.message ||
    error.response.data?.error;
  return new Error(backendMessage || "Failed to process bookmark request.");
}

export const bookmarkService = {
  toggleBookmark,
  getBookmarks,
  checkBookmark,
};
